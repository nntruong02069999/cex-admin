import React, { Component } from 'react';
import { Modal, Button, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import ProTable from '@src/packages/pro-table/Table';
import { helper } from '@src/controls/controlHelper';
// import Checkbox from './Checkbox'
import { RequestData } from '@src/packages/pro-table';
// import CheckboxWidget from './Checkbox'
import _ from 'lodash';
class ModelSelectWidget extends Component<
  {
    schema: Record<string, any>;
    disabled?: boolean;
    invalid?: boolean;
    value: any;
    onChange?: (val: any) => void;
  },
  {
    modal: boolean;
    data: Array<any>;
    loading: boolean;
    search: string;
    pageId: string;
    schema: any;
    count: number;
    columns: Array<any>;
    nPage: number;
    display: any;
    mode: 'select' | 'view';
    output?: any;
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
      modal: false,
      data: [],
      loading: true,
      search: '',
      pageId: props.schema.pageId,
      schema: props.schema,
      count: 0,
      columns: this.calculateColumns(props.schema),
      output: _.clone(props.value) || '',
      nPage: 0,
      display: null,
      mode: 'select',
      pagination: {
        pageSize: this.itemsPerPage,
        total: 0,
        totalPages: 0,
        current: 1,
      },
    };
    this.init(props.schema.pageId, props);
  }
  itemsPerPage = 10;
  pageInfo = null;
  searchInput: any;
  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(next: any) {
    //check different
    let updated = false;
    const output = this.state.output || [];
    let val = next.value || [];
    if (!_.isArray(val)) val = [val];
    if (next.schema.modelSelectMultiple) {
      updated = !_.isEqual(output.sort(), val.sort());
    } else {
      updated = output !== val;
    }
    if (updated) {
      this.setState({ output: _.clone(val) });
      this.fetchItemName(this.pageInfo, this.state.schema, _.clone(val));
    }
  }

  async init(pageId: number, props: any) {
    this.pageInfo = await helper.getPage(pageId);
    this.fetchItemName(this.pageInfo, props.schema, _.clone(props.value));
  }

  toggle = (mode?: 'select' | 'view') => {
    if (mode) {
      this.setState({
        mode,
        modal: !this.state.modal,
      });
    } else {
      this.setState({
        modal: !this.state.modal,
      });
    }
  };

  fetchData = async (
    params: any,
    sorter: {
      [key: string]: 'ascend' | 'descend';
    },
    filtered: { [key: string]: React.ReactText[] }
  ) => {
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
    if (this.state.mode === 'view') {
      if (filter.id) {
        if (this.state.schema.modelSelectMultiple) {
          if (!_.includes(this.state.output, filter.id)) {
            filter.id = 0;
          }
        } else {
          if (filter.id !== this.state.output) {
            filter.id = 0;
          }
        }
      } else {
        filter.id = this.state.output;
      }
    }
    const rs: any = await helper.callPageApi(
      this.pageInfo,
      this.state.schema?.api,
      {
        sort,
        queryInput: JSON.stringify(filter),
        limit: params.pageSize,
        skip: params.pageSize * params.current,
      }
    );
    rs.data = this.calculateCheck(
      rs?.data ?? [],
      this.state.schema,
      this.state.output
    );
    this.setState({
      data: rs.data,
      count: rs.count,
      loading: false,
      nPage: Math.ceil(rs.count / params.pageSize),
      pagination: {
        pageSize: params.pageSize,
        total: rs.count,
        totalPages: Math.floor(
          (get(rs, 'count', 0) + params.pageSize - 1) / params.pageSize
        ),
        current: params.current,
      },
    });
    return {
      data: rs.data,
      success: true,
      total: rs.count,
    } as RequestData<any>;
  };

  async fetchItemName(pageInfo: any, schema: any, output: any) {
    if (!pageInfo || !schema || !output) return;
    const filter: Record<string, any> = {};
    if (schema.modelSelectMultiple) {
      filter.id = output;
    } else {
      filter.id = output;
    }
    const rs: any = await helper.callPageApi(pageInfo, schema.api, {
      queryInput: JSON.stringify(filter),
    });
    if (schema.modelSelectMultiple) {
      const display: Array<any> = [];
      rs.data.map((d: any) => {
        return display.push(d.name);
      });
      this.setState({ display: _.join(display, '-') });
    } else {
      this.setState({ display: rs.data[0] ? rs.data[0].name : '' });
    }
  }

  calculateCheck(data: any, schema: any, output: any) {
    let input: Array<any> = [];
    if (schema.type === 'array') {
      input = [output];
    } else {
      input = output;
    }
    data.map((d: any) => {
      if (_.includes(input, d.id)) return (d.checked = true);
      return (d.checked = false);
    });
    return data;
  }

  onCheckboxChanged(row: any, e: any) {
    let output = this.state.output;
    if (this.state.schema.modelSelectMultiple) {
      if (!Array.isArray(output)) output = [];
      if (e) {
        if (!_.includes(output, row.row.id)) output.push(row.row.id);
      } else {
        const tmp: Array<any> = [];
        output.map((o: any) => {
          if (o !== row.row.id) {
            tmp.push(o);
          }
          return null;
        });
        output = tmp;
      }
    } else {
      if (e) {
        output = row.row.id;
      } else {
        output = null;
      }
    }
    const data = this.calculateCheck(
      this.state.data,
      this.state.schema,
      output
    );
    this.setState({ data, output });
  }

  calculateColumns(schema: any) {
    const cols: Array<any> = [];
    const nameFieldSelectObj = helper.transformModelSelectField(
      schema.modelSelectField
    );
    Object.keys(nameFieldSelectObj).map((keyField: string) => {
      if (keyField === 'name') {
        cols.push({
          title: nameFieldSelectObj[keyField],
          dataIndex: keyField,
          sorter: true,
          ...this.getColumnSearchProps(keyField, nameFieldSelectObj[keyField]),
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
    return cols;
  }
  confirm() {
    if (this.props.onChange) {
      this.props.onChange(this.state.output);
    }
    this.toggle();
  }
  handleSearchFilter = (
    _selectedKeys: (number | string)[],
    confirm: any,
    _dataIndex: string
  ) => {
    confirm();
  };
  handleReset = (clearFilters: any, confirm: any, _dataIndex: string) => {
    clearFilters();
    confirm();
  };
  getColumnSearchProps = (dataIndex: string, title: string) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(ref) => (this.searchInput = ref)}
          placeholder={`Tìm kiếm ${title}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearchFilter(selectedKeys, confirm, dataIndex)
          }
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
  });
  render() {
    return (
      <div>
        <Input.Search
          placeholder='Chọn...'
          allowClear={false}
          enterButton='Chọn...'
          size='large'
          disabled={this.props.disabled}
          value={this.state.display || this.state.output}
          onSearch={() => {
            if (!this.props.disabled) this.toggle('select');
          }}
        />
        <Modal
          visible={this.state.modal}
          title='Chọn'
          footer={
            this.state.mode === 'select' ? (
              <React.Fragment>
                <Button color='primary mr-1' onClick={() => this.confirm()}>
                  Xác nhận
                </Button>
                <Button color='secondary' onClick={() => this.toggle()}>
                  Hủy bỏ
                </Button>
              </React.Fragment>
            ) : (
              <Button color='secondary' onClick={() => this.toggle()}>
                Đóng
              </Button>
            )
          }
        >
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
            /* rowSelection={{
              type: props.modeChoose || 'checkbox',
              renderCell: (checked, record, index, originNode) => {
                return <Tooltip title={'Chọn đơn vị'}>{originNode}</Tooltip>
              },
              onChange: handleSelectRows,
            }} */
            dateFormatter='string'
            type='table'
          />
        </Modal>
      </div>
    );
  }
}

export default ModelSelectWidget;
