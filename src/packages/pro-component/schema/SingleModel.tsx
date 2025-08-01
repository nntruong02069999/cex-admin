import React, { Component } from 'react';
import { Modal, Button, Tag, Space, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import ProTable from '@src/packages/pro-table/Table';
import { helper } from '@src/controls/controlHelper';
// import Checkbox from './Checkbox'
import { ActionType, RequestData } from '@src/packages/pro-table';
import { COLORS, IS_DEBUG } from '@src/constants/constants';
import { random } from '@src/util/helpers';

export interface SingleModelProps {
  schema: Record<string, any>;
  disabled?: boolean;
  invalid?: boolean;
  value: any;
  onChange?: (val: any) => void;
  dataForm?: any;
}

export interface SingleModelState {
  value: any;
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
  pageInfo: any;
  pagination: {
    pageSize: number;
    total: number;
    totalPages: number;
    current: number;
  };
}
class SingleModel extends Component<SingleModelProps, SingleModelState> {
  constructor(props: any) {
    super(props);
    this.state = {
      value: this.props.value
        ? Array.isArray(this.props.value)
          ? this.props.value
          : [this.props.value]
        : undefined,
      modal: false,
      data: [],
      loading: true,
      search: '',
      pageId: props.schema.pageId,
      schema: props.schema,
      count: 0,
      columns: this.calculateColumns(props.schema),
      nPage: 0,
      display: null,
      mode: 'select',
      pageInfo: null,
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
  pageInfo: any = null;
  schema: any = null;
  searchInput: any;
  actionRef = React.createRef<ActionType | undefined>();

  static getDerivedStateFromProps(
    nextProps: SingleModelProps,
    prevState: SingleModelState
  ) {
    const propValue = Array.isArray(nextProps.value)
      ? nextProps.value
      : [nextProps.value];
    if (nextProps.value && !isEqual(propValue, prevState.value)) {
      return {
        value: propValue,
      };
    } else return null; // Triggers no change in the state
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (
      prevState.value != this.state.value ||
      this.state.pageInfo != prevState.pageInfo
    ) {
      this.fetchItemName(
        this.state.pageInfo,
        this.state.schema,
        this.state.value
      );
    }
    let embed = this.state.schema?.embed || [];
    for (let item of embed) {
      if (item.value && item.value.substr(0, 2) == '--') {
        const k = item.value.substr(2);
        if (
          !['true', 'false'].includes(k) &&
          prevProps.dataForm[k] != this.props.dataForm[k]
        ) {
          this.onRemoveClick(0);
          this.actionRef?.current?.reload?.();
        }
      }
    }
  }

  async init(pageId: number, props: any) {
    const _pageInfo = await helper.getPage(pageId);
    this.pageInfo = _pageInfo;
    this.schema = props.schema;
    this.setState(
      {
        pageInfo: _pageInfo,
      },
      () => {
        this.fetchItemName(_pageInfo, this.schema, props.value);
      }
    );

    // this.fetchItemName(this.pageInfo, this.schema, props.value)
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
    console.log(filtered);
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
        if (filter.id !== this.props.value) {
          filter.id = 0;
        }
      } else {
        filter.id = this.props.value;
      }
    }
    const nameFieldSelectObj = helper.transformModelSelectField(
      this.schema.modelSelectField
    );
    console.log('before fetch', filter);
    const rs: any = await helper.callPageApi(this.pageInfo, this.schema?.api, {
      select: Object.keys(nameFieldSelectObj).join(',').toString(),
      sort,
      queryInput: JSON.stringify(filter),
      limit: params.pageSize,
      skip: params.pageSize * (params.current - 1),
    });
    const data = this.calculateCheck(
      rs?.data?.data ?? [],
      this.schema,
      this.state.value
    );
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
  };

  fetchItemName = async (pageInfo: any, schema: any, value: any) => {
    if (!pageInfo || !schema || !value) {
      this.setState({ display: '' });
      return;
    }
    const filter: Record<string, any> = {};
    filter.id = value;
    const rs: any = await helper.callPageApi(pageInfo, schema.api, {
      queryInput: JSON.stringify(filter),
      select: 'name',
    });
    this.setState({ display: rs?.data?.data[0] ? rs?.data?.data[0].name : '' });
  };

  calculateCheck = (data: Array<any>, schema?: any, value?: any) => {
    data.map((d) => {
      if (d.id === value?.[0]) return (d.checked = true);
      return (d.checked = false);
    });
    return data;
  };

  onChange(e: any) {
    if (this.props.onChange) {
      this.props.onChange(e);
    }
  }

  onCheckboxChanged = (keys: Array<any>, _rows: Array<any>) => {
    if (IS_DEBUG) {
      console.log(`🚀 ~ file: SingleModel.tsx ~ line 191 ~ keys`, keys);
    }

    const data = this.calculateCheck(this.state.data, this.schema, keys);
    this.setState({ data, value: keys });
    this.props.onChange?.(keys[0]);
  };

  calculateColumns = (schema: any) => {
    const cols: any = [];
    const nameFieldSelectObj = helper.transformModelSelectField(
      schema.modelSelectField
    );
    Object.keys(nameFieldSelectObj).map((keyField: string) => {
      cols.push({
        title: nameFieldSelectObj[keyField],
        dataIndex: keyField,
        sorter: true,
        ...this.getColumnSearchProps(keyField, nameFieldSelectObj[keyField]),
      });
      return null;
    });
    return cols;
  };

  confirm = () => {
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
    this.toggle();
  };

  onRemoveClick(_id: number) {
    this.setState({ value: undefined, display: '' });
    this.props.onChange?.(null);
  }

  renderNames = () => {
    return (
      <Tag
        // closable
        color={COLORS[random(11)]}
        onClose={() => {
          this.onRemoveClick(this.state.value[0]);
        }}
      >
        {this.state.display || this.state.value || ''}
      </Tag>
    );
  };

  renderButtonSelect = () => {
    return null;
    return (
      <React.Fragment>
        <Button type='default' onClick={() => this.toggle()}>
          Hủy bỏ
        </Button>
        <Button type='primary' onClick={() => this.confirm()}>
          Xác nhận
        </Button>
      </React.Fragment>
    );
  };
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
    if (this.schema && !this.schema.modelSelectField)
      return <p>Thiếu dữ liệu modelSelectField</p>;
    return (
      <div className='gx-array-model'>
        <div className='gx-array-model-display'>
          {this.renderNames()}
          <Tag
            style={{
              background: '#fff',
              borderStyle: 'dashed',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (!this.props.disabled) this.toggle('select');
            }}
          >
            <PlusOutlined />
            {`Chọn...`}
          </Tag>
        </div>

        <Modal
          visible={this.state.modal}
          title='Chọn'
          onCancel={() => this.toggle()}
          footer={
            this.state.mode === 'select' ? (
              this.renderButtonSelect()
            ) : (
              <Button type='default' onClick={() => this.toggle()}>
                Đóng
              </Button>
            )
          }
        >
          <ProTable
            actionRef={this.actionRef as any}
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
              type: 'radio',
              selectedRowKeys: this.state.value || [],
              onChange: this.onCheckboxChanged,
            }}
            dateFormatter='string'
            type='table'
          />
        </Modal>
      </div>
    );
  }
}

export default SingleModel;
