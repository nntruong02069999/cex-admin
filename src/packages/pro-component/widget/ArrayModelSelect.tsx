import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import ProTable from '@src/packages/pro-table/Table';
import { helper } from '@src/controls/controlHelper';
import _ from 'lodash';
import { RequestData } from '@src/packages/pro-table';
class ArrayModelSelect extends Component<
  {
    schema: Record<string, any>;
    disabled?: boolean;
    invalid?: boolean;
    value: any;
    onChange?: (val: any) => void;
    onItemRemoved?: (val: any) => void;
    onItemAdded?: (val?: any) => void;
    onItemGetValue?: (val: any) => void;
  },
  {
    names: Array<any>;
    output: any;
    value?: any;
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
    mode?: 'select' | 'view';
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
      output: _.clone(props.value || []),
      nPage: 0,
      display: null,
      mode: 'select',
      names: [],
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

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(next: any) {
    //check different
    let updated = false,
      output = this.state.output || [],
      val = next.value || [];
    if (!_.isArray(val)) val = [val];
    output = output.filter(function (el: any) {
      return el != null;
    });
    val = val.filter(function (el: any) {
      return el != null;
    });
    updated = !_.isEqual(output.sort(), val.sort());
    if (updated) {
      this.setState({ output: _.clone(val), modal: false });
      this.fetchItemName(this.pageInfo, this.state.schema, _.clone(val));
    }
  }

  async init(pageId: number, props: any) {
    this.pageInfo = await helper.getPage(pageId);
    this.fetchItemName(this.pageInfo, props.schema, _.clone(props.value));
  }

  toggle = (mode?: 'select' | 'view') => {
    if (this.props.onItemRemoved) {
      this.props.onItemRemoved(undefined);
    }
    this.setState({
      mode,
      modal: !this.state.modal,
    });
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
      if (filter[key] !== null) {
        if (key == 'id') {
          newObj[key] = Number(helper.getValue(filter[key]));
        } else {
          newObj[key] = { contains: helper.getValue(filter[key]) };
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
          (_.get(rs, 'count', 0) + params.pageSize - 1) / params.pageSize
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
    if (output.length > 0) {
      const rs: any = await helper.callPageApi(pageInfo, schema.api, {
        queryInput: JSON.stringify(filter),
      });
      this.setState({ names: rs.data });
    } else {
      this.setState({ names: [] });
    }
  }

  calculateCheck(data: any, schema: any, output: any) {
    let input: Array<any> = [];
    if (schema.modelSelectMultiple) {
      input = output;
    } else {
      input = [output];
    }
    data.map((d: any) => {
      if (_.includes(input, d.id)) return (d.checked = true);
      return (d.checked = false);
    });
    return data;
  }

  onRemoveClick(val: any) {
    if (this.props.onItemRemoved) {
      this.props.onItemRemoved(val);
    }
  }

  onCheckboxChanged(row: any, e: any) {
    let output = this.state.output;
    if (this.state.schema.modelSelectMultiple) {
      if (!Array.isArray(output)) output = [];
      if (e) {
        if (!_.includes(output, row.row.id)) {
          if (this.props.onItemAdded) {
            this.props.onItemAdded(row.row.id);
          }
          output.push(row.row.id);
        }
      } else {
        const tmp: Array<any> = [];
        for (let i = 0; i < output.length; i++) {
          if (output[i] === row.row.id) {
            if (this.props.onItemRemoved) {
              this.props.onItemRemoved(i);
            }
          } else {
            tmp.push(output[i]);
          }
        }
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

  onSelect(val: any) {
    if (this.props.onItemGetValue) {
      this.props.onItemGetValue(val);
    }
  }

  calculateColumns(schema: any) {
    const cols: Array<any> = [];
    const names = schema.modelSelectField.split(',');
    names.map((n: any) => {
      const arr = n.split('$$');
      cols.push({
        title: arr[1] || n,
        dataIndex: arr[0],
      });
      return null;
    });
    /* cols.push({
      title: 'Chọn',
      accessor: 'checked',
      filterable: false,
      Cell: (row) => {
        const val = _.includes(this.state.output, row.row.id)
        return (
          <div>
            {val ? (
              <p className="text-success">Đã chọn</p>
            ) : (
              <Button
                color="primary"
                type="button"
                onClick={() => {
                  this.onSelect(row.row.id)
                }}
              >
                Chọn
              </Button>
            )}
          </div>
        )
      },
    }) */
    return cols;
  }

  onAddClick() {
    if (this.props.onItemAdded) {
      this.props.onItemAdded();
    }
    this.setState({ modal: !this.state.modal, mode: 'select' });
  }

  confirm = () => {
    if (this.props.onChange) {
      this.props.onChange(this.state.output);
    }
    this.toggle();
  };

  render() {
    return (
      <div>
        <div className='form-control select-container'>
          {this.state.names.map((item, index: number) => {
            return item ? (
              <div key={index}>
                <Button
                  type='default'
                  onClick={() => {
                    this.onRemoveClick(item.id);
                  }}
                >
                  <i className='fa fa-remove' />
                </Button>
                <Button type='default'>{item.name}</Button>
              </div>
            ) : null;
          })}
        </div>
        <Button
          disabled={this.props.disabled}
          type='primary'
          onClick={() => {
            this.onAddClick();
          }}
        >
          <i className='fa fa-plus' />
        </Button>
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
            // search={false}
            search={true}
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

export default ArrayModelSelect;
