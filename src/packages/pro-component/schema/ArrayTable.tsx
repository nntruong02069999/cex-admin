import React, { Component } from 'react';
import { Input, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import clone from 'lodash/clone';
import includes from 'lodash/includes';
import ProTable from '@src/packages/pro-table/Table';
import { helper } from '@src/controls/controlHelper';
import { RequestData } from '@src/packages/pro-table';
import unionBy from 'lodash/unionBy';
import { IS_DEBUG } from '@src/constants/constants';

class ArrayTable extends Component<
  {
    itemsPerPage?: number;
    selectedRows?: Array<any>;
    pageInfo: any;
    schema: any;
    disabled?: boolean;
    invalid?: boolean;
    type?: 'radio' | 'checkbox';
    value: any;
    onChange?: (keys: any, rows?: any) => void;
  },
  {
    key: string;
    output: any;
    selectedRows?: Array<any>;
    value?: any;
    data: Array<any>;
    loading: boolean;
    search: string;
    pageId: string;
    schema: any;
    count: number;
    columns: Array<any>;
    nPage: number;
    mode: 'select' | 'view';
    pagination: {
      pageSize: number;
      total: number;
      totalPages: number;
      current: number;
    };
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      key: 'id',
      data: [],
      loading: true,
      search: '',
      pageId: props.schema.pageId,
      schema: props.schema,
      count: 0,
      columns: this.calculateColumns(props.schema),
      output: clone(props.value || []),
      selectedRows: props.selectedRows || [],
      nPage: 0,
      mode: 'select',
      pagination: {
        pageSize: props.itemsPerPage ?? this.itemsPerPage,
        total: 0,
        totalPages: 0,
        current: 1,
      },
    };
    this.pageInfo = props.pageInfo;
  }

  searchInput: any;
  itemsPerPage = 10;
  pageInfo: any = null;

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    if (nextProps.value !== prevState.output) {
      return { output: nextProps.value };
    }
    return null; // Triggers no change in the state
  }

  fetchData = async (
    params: any,
    sorter: {
      [key: string]: 'ascend' | 'descend';
    },
    filtered: { [key: string]: React.ReactText[] }
  ) => {
    if (IS_DEBUG) {
      console.log(`🚀 ~ file: ArrayTable.tsx ~ line 108 ~ params`, params);
      console.log(`🚀 ~ file: ArrayTable.tsx ~ line 108 ~ sorter`, sorter);
      console.log(`🚀 ~ file: ArrayTable.tsx ~ line 107 ~ filtered`, filtered);
    }

    try {
      let filter: Record<string, any> = {};
      let sort: Array<any> = [];
      filter = Object.keys(filtered).reduce((obj, key) => {
        const newObj: any = { ...obj };
        if (filtered[key] !== null) {
          if (key == 'id') {
            newObj[key] = Number(helper.getValue(filtered[key]));
          } else {
            newObj[key] = { contains: helper.getValue(filtered[key]) };
          }
        }
        return newObj;
      }, {});
      if (sorter) {
        sort = Object.keys(sorter).map((key) => {
          return { [key]: sorter[key] == 'descend' ? 'desc' : 'asc' };
        });
      }
      if (sort.length === 0) sort = [{ id: 'desc' }];
      if (this.state.mode === 'view') {
        if (filter.id) {
          if (includes(this.state.output, filter.id)) {
            filter.id = 0;
          }
        } else {
          filter.id = this.state.output;
        }
      }
      const nameFieldSelectObj = helper.transformModelSelectField(
        this.state.schema.modelSelectField
      );
      const rs: any = await helper.callPageApi(
        this.pageInfo,
        this.state.schema?.api,
        {
          select: Object.keys(nameFieldSelectObj).join(',').toString(),
          sort,
          queryInput: JSON.stringify(filter),
          limit: params.pageSize,
          skip: params.pageSize * (params.current - 1),
        }
      );
      const data = this.calculateCheck(rs?.data?.data ?? [], this.state.output);
      this.setState({
        data,
        count: rs?.data.count,
        loading: false,
        nPage: Math.ceil(rs?.data.count / params.pageSize),
        pagination: {
          pageSize: params.pageSize,
          total: rs?.data.count,
          totalPages: Math.floor(
            (get(rs, 'data.count', 0) + params.pageSize - 1) / params.pageSize
          ),
          current: params.current,
        },
      });
      return {
        data,
        success: true,
        total: rs?.data.count,
      } as RequestData<any>;
    } catch (error) {
      console.log(`🚀 ~ file: ArrayTable.tsx ~ line 173 ~ error`, error);
      return {
        data: [],
        success: true,
        total: 0,
      } as RequestData<any>;
    }
  };

  calculateCheck(data: any, output: any) {
    data.map((d: any) => {
      if (includes(output, d.id)) return (d.checked = true);
      return (d.checked = false);
    });
    return data;
  }

  onCheckboxChanged = (keys: Array<any>, rows: Array<any>) => {
    const type = this.props.type || 'checkbox';
    if (type == 'checkbox') {
      let _outputs = clone(this.state.output);
      let _rows = clone(this.state.selectedRows);
      _outputs = unionBy(_outputs, keys);
      _rows = unionBy(_rows, rows, this.state.key);
      this.setState({ output: _outputs, selectedRows: _rows });
      this.props.onChange?.(_outputs, _rows);
    } else {
      this.setState({ output: keys, selectedRows: rows });
      this.props.onChange?.(keys, rows);
    }
  };

  handleSearchFilter = (
    _selectedKeys: (number | string)[],
    confirm: any,
    _dataIndex: string
  ) => {
    /* setListSearch({
      ...listSearch,
      [`search_${dataIndex}`]: selectedKeys[0],
    }) */
    confirm();
  };

  handleReset = (clearFilters: any, confirm: any, _dataIndex: string) => {
    clearFilters();
    /* setListSearch({
      ...listSearch,
      [`search_${dataIndex}`]: '',
    }) */
    confirm();
  };

  getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(ref) => (this.searchInput = ref)}
          placeholder={`Tìm kiếm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearchFilter(selectedKeys, confirm, dataIndex)
          }
          /* onKeyDown={e => {
						if (e.key === 'Enter') {
							onChange(e.target.value)
						}
					}} */
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() =>
              this.handleSearchFilter(selectedKeys, confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => this.handleReset(clearFilters, confirm, dataIndex)}
            size='small'
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => {
          if (this.searchInput && this.searchInput.current) {
            this.searchInput.current.select();
          } else if (this.searchInput) {
            this.searchInput.select();
          }
        });
      }
    },
    onFilter: (value: any, record: Record<string, any>) => record,
    /* onFilter: (value, record) =>
			record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
		render: text =>
			this.state.searchedColumn === dataIndex ? (
				<Highlighter
					highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
					searchWords={[this.state.searchText]}
					autoEscape
					textToHighlight={text.toString()}
				/>
			) : (
					text
				), */
  });

  calculateColumns(schema: any) {
    const cols: any = [];
    const nameFieldSelectObj = helper.transformModelSelectField(
      schema.modelSelectField
    );
    Object.keys(nameFieldSelectObj).map((keyField: string) => {
      if (['name', 'id'].includes(keyField)) {
        cols.push({
          title: nameFieldSelectObj[keyField],
          dataIndex: keyField,
          sorter: true,
          ...this.getColumnSearchProps(keyField),
        });
      } else {
        cols.push({
          title: nameFieldSelectObj[keyField],
          dataIndex: keyField,
          sorter: true,
        });
      }
      return null;
    });
    /* cols.push({
      Header: 'Chọn',
      accessor: 'checked',
      filterable: false,
      Cell: (row) => {
        let val = false
        for (var i = 0; i < this.state.data.length; i++) {
          if (this.state.data[i].id === row.row.id) {
            val = this.state.data[i].checked || false
          }
        }
        return (
          <div>
            {this.state.mode === 'select' ? (
              <Checkbox
                value={val}
                onChange={(e) => {
                  this.onCheckboxChanged(row, e)
                }}
              />
            ) : null}
          </div>
        )
      },
    }) */
    return cols;
  }

  render() {
    return (
      <div className='gx-wrapper-select-table'>
        <ProTable
          tableClassName='gx-table-responsive'
          request={this.fetchData}
          // params={getParams}
          search={false}
          headerTitle={'Danh sách đơn vị'}
          rowKey='id'
          toolBarRender={false}
          tableAlertRender={false}
          pagination={this.state.pagination}
          columns={this.state.columns}
          loading={this.state.loading}
          rowSelection={{
            type: this.props.type || 'checkbox',
            selectedRowKeys: this.state.output,
            /* renderCell: (checked, record, index, originNode) => {
                return <Tooltip title={'Chọn đơn vị'}>{originNode}</Tooltip>
              }, */
            onChange: this.onCheckboxChanged,
          }}
          dateFormatter='string'
          type='table'
        />
      </div>
    );
  }
}

export default ArrayTable;
