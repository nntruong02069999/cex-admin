import React, { Component } from 'react';
import { Modal, Button, Tag, Badge, Image } from 'antd';
import { CloseOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import clone from 'lodash/clone';
import join from 'lodash/join';
import isEqual from 'lodash/isEqual';
import includes from 'lodash/includes';
import ProTable from '@src/packages/pro-table/Table';
import { helper } from '@src/controls/controlHelper';
import { ActionType, RequestData } from '@src/packages/pro-table';
import { COLORS } from '@src/constants/constants';
import { random } from '@src/util/helpers';
import _ from 'lodash';
import { DATA_TYPE } from '@src/constants/enums';

export interface ArraySortProps {
  schema: any;
  disabled?: boolean;
  invalid?: boolean;
  value: any;
  onChange?: (val: any) => void;
  dataForm?: any;
}

export interface ArraySortState {
  names: Array<any>;
  output: any;
  outputShadow: [];
  value?: any;
  modal: boolean;
  data: Array<any>;
  loading: boolean;
  search: string;
  pageId: string;
  embeds: any[];
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

class ArraySort extends Component<ArraySortProps, ArraySortState> {
  form = React.createRef<any>();
  actionRef = React.createRef<ActionType | undefined>();
  constructor(props: any) {
    super(props);
    this.state = {
      modal: false,
      data: [],
      names: [],
      loading: true,
      search: '',
      pageId: props.schema.pageId,
      schema: props.schema,
      embeds: props.embeds,
      count: 0,
      columns: this.calculateColumns(props.schema),
      output: clone(props.value || []),
      outputShadow: clone(props.value || []),
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
    this.init(props.schema.pageId, props.schema, clone(props.value || []));
  }
  itemsPerPage = 10;
  pageInfo: any = null;

  static getDerivedStateFromProps(
    nextProps: ArraySortProps,
    prevState: ArraySortState
  ) {
    if (nextProps.value) {
      if (!isEqual(nextProps.value, prevState.output)) {
        return {
          output: nextProps.value,
        };
      } else return null;
    } else return null;
  }

  componentDidMount() {
    this.setState({
      outputShadow: this.props.value || [],
    });
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (
      prevState.output !== this.state.output ||
      this.state.pageInfo !== prevState.pageInfo
    ) {
      this.fetchItemName(
        this.state.pageInfo,
        this.state.schema,
        this.state.output
      );
    }
    let embed = this.state.schema?.embed || [];
    for (let item of embed) {
      if (item.value && item.value.substr(0, 2) === '--') {
        const k = item.value.substr(2);
        if (
          !['true', 'false'].includes(k) &&
          prevProps.dataForm[k] !== this.props.dataForm[k]
        ) {
          this.start();
          this.actionRef?.current?.reload?.();
        }
      }
    }
  }

  async init(pageId: number, schema: any, output: any) {
    const _pageInfo = await helper.getPage(pageId);
    this.pageInfo = _pageInfo;
    this.setState(
      {
        pageInfo: _pageInfo,
      },
      () => {
        this.fetchItemName(_pageInfo, schema, output);
      }
    );
  }

  start = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      const output: any = [];
      this.setState({
        output,
        names: [],
        loading: false,
      });
      this.onChange(output);
      this.fetchItemName(this.pageInfo, this.state.schema, output);
    }, 1000);
  };

  toggle = (e: any, mode?: 'select' | 'view') => {
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
    try {
      let filter: Record<string, any> = {};
      let sort: Array<any> = [];
      const _filtered = Object.keys(filtered).reduce((obj, key) => {
        const newObj: any = { ...obj };
        if (filtered[key] !== null)
          newObj[key] = helper.getValue(filtered[key]);
        return newObj;
      }, {});
      const _params = _.omit(params, [
        'current',
        'pageSize',
        'showSizeChanger',
        'total',
        'totalPages',
        'position',
        '_timestamp',
      ]);
      filter = { ..._filtered, ..._params };
      if (sorter) {
        sort = Object.keys(sorter).map((key) => {
          return { [key]: sorter[key] === 'descend' ? 'desc' : 'asc' };
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
      filter = this.calculateFilter(filter);
      if (this.state.schema?.embed && this.state.schema.embed.length) {
        this.state.schema.embed.forEach((_embed: any) => {
          if (
            typeof _embed.value == 'string' &&
            _embed.value.substr(0, 2) === '--'
          ) {
            const k = _embed.value.substr(2);
            if (['true', 'false'].includes(k)) {
              filter[_embed.key] = k === 'true';
            } else {
              const _embedValue = this.props.dataForm[k];
              if (_embedValue) filter[_embed.key] = _embedValue;
            }
          } else {
            filter[_embed.key] = _embed.value;
          }
        });
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
      // data.sort((a: any, b: any) => {
      //   if (a.checked === b.checked) return 0;
      //   return a.checked ? -1 : 1;
      // });
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
      console.log(`🚀 ~ file: ArraySort.tsx ~ line 173 ~ error`, error);
      return {
        data: [],
        success: true,
        total: 0,
      } as RequestData<any>;
    }
  };

  transformFied() {
    const selectField: string = this.props.schema.modelSelectField;
    if (!selectField) return 'id,name';
    return selectField
      .split(',')
      .map((item) => {
        const [key] = item.split('$$');
        return key;
      })
      .join(',');
  }

  fetchItemName = async (pageInfo: any, schema: any, output: any) => {
    if (!pageInfo || !schema || !output || !output.length) return;
    const filter: Record<string, any> = {};
    filter.id = output;
    try {
      const rs: any = await helper.callPageApi(pageInfo, schema.api, {
        queryInput: JSON.stringify(filter),
        select: this.transformFied(),
      });
      const display: Array<any> = [];
      rs?.data?.data.map((d: Record<string, any>) => {
        return display.push(d.name);
      });
      this.setState({ names: rs?.data?.data, display: join(display, '-') });
    } catch (err) {
      console.error(
        `🚀 ~ file: ArraySort.tsx ~ line 176 ~ fetchItemName ~ err`,
        err
      );
    }
  };

  calculateCheck(data: any, output: any) {
    data.map((d: any) => {
      if (includes(output, d.id)) return (d.checked = true);
      return (d.checked = false);
    });
    return data;
  }

  onCheckboxChanged = (keys: Array<any>, _rows: Array<any>) => {
    const arrs = [...new Set([...this.state.output, ...keys])];
    const output = [].concat(...arrs);
    this.setState({ output });
    this.onChange(output);
    this.fetchItemName(this.pageInfo, this.state.schema, output);
  };

  calculateColumns(schema: any) {
    const cols: any = [];
    const nameFieldSelectObj: any = helper.transformModelSelectField(
      schema.modelSelectField
    );
    Object.keys(nameFieldSelectObj).map((keyField: string) => {
      switch (keyField) {
        case 'id': {
          cols.push({
            title: nameFieldSelectObj[keyField],
            dataIndex: keyField,
            sorter: true,
            valueType: DATA_TYPE.NUMBER,
          });
          break;
        }
        case 'images': {
          cols.push({
            title: nameFieldSelectObj[keyField],
            dataIndex: keyField,
            sorter: false,
            valueType: DATA_TYPE.STRING,
            render: (value: any) => {
              // return <Image src={value[0]} width={80} />;
              return (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid #d9d9d9',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={value[0]}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'cover',
                    }}
                    preview={{
                      src: value[0],
                      mask: <EyeOutlined style={{ fontSize: '16px' }} />,
                    }}
                  />
                </div>
              );
            },
          });
          break;
        }
        default: {
          cols.push({
            title: nameFieldSelectObj[keyField],
            dataIndex: keyField,
            sorter: true,
            valueType: DATA_TYPE.STRING,
          });
          break;
        }
      }

      return null;
    });
    return cols;
  }

  calculateFilter(filter: { [key: string]: React.ReactText[] }) {
    const obj: any = {};
    Object.keys(filter).map((f: any) => {
      const value: any = filter[f];
      for (let i = 0; i < (this.state.columns || []).length; i++) {
        const gridInfo = (this.state.columns || [])[i];
        if (gridInfo.dataIndex === f) {
          switch (gridInfo.valueType) {
            case DATA_TYPE.STRING: {
              obj[f] = { contains: value };
              break;
            }
            case DATA_TYPE.NUMBER:
            default: {
              obj[f] = value;
              break;
            }
          }
        }
      }
      return 0;
    });
    return obj;
  }

  confirm() {
    this.onChange(this.state.output);
    this.fetchItemName(this.pageInfo, this.state.schema, this.state.output);
    this.toggle(null);
  }

  onChange(dt: any) {
    if (this.props.onChange) {
      this.props.onChange(dt);
    }
  }

  onRemoveClick(id: number) {
    const names = this.state.names.filter((i) => i.id !== id);
    const output = names.map((i) => i.id);
    this.setState({ output, names });
    this.onChange(output);
  }

  renderNames() {
    if (this.state.output.length === 0) return null;
    if (this.state.output.length <= 4) {
      return (
        <React.Fragment>
          {this.state.names.map((item) => {
            return item ? (
              <Tag
                key={item.id}
                closable
                color={COLORS[random(11)]}
                onClose={() => {
                  this.onRemoveClick(item.id);
                }}
              >
                {item.name}
              </Tag>
            ) : null;
          })}
        </React.Fragment>
      );
    }
    return null;
  }

  renderButtonSelect = () => {
    return null;
  };

  render() {
    const { loading, output } = this.state;
    const rowSelection = {
      selectedRowKeys: output,
      // onChange: this.onCheckboxChanged,
      onSelect: (record: any, selected: boolean, selectedRows: any[]) => {
        let newOutput = output;
        if (!selected) {
          newOutput = newOutput.filter((i: any) => i !== record.id);
        } else {
          newOutput.push(record.id);
        }
        newOutput = _.uniq(newOutput);
        this.setState({ output: newOutput });
        this.onChange(newOutput);
        this.fetchItemName(this.pageInfo, this.state.schema, newOutput);
      },
      onSelectAll: (
        selected: boolean,
        selectedRows: any[],
        changeRows: any[]
      ) => {
        let newOutput = output;
        if (selected) {
          newOutput = newOutput.concat(changeRows.map((i) => i.id));
        } else {
          let ids = changeRows.map((i) => i.id);
          newOutput = newOutput.filter((i: any) => !ids.includes(i));
        }
        newOutput = _.uniq(newOutput);
        this.setState({ output: newOutput });
        this.onChange(newOutput);
        this.fetchItemName(this.pageInfo, this.state.schema, newOutput);
      },
    };
    const hasSelected = output.length > 0;
    return (
      <div className='gx-array-model'>
        <div className='gx-array-model-display'>
          {this.renderNames()}
          <Badge
            count={this.state.output.length > 0 ? this.state.output.length : 0}
          >
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
              {` Chọn...`}
            </Tag>
          </Badge>
        </div>
        <Modal
          width={`70vw`}
          visible={this.state.modal}
          title='Chọn'
          onCancel={this.toggle}
          footer={
            this.state.mode === 'select' ? (
              this.renderButtonSelect()
            ) : (
              <Button
                type='default'
                icon={<CloseOutlined />}
                onClick={(e) => {
                  this.onChange(this.state.outputShadow);
                  this.fetchItemName(
                    this.pageInfo,
                    this.state.schema,
                    this.state.outputShadow
                  );
                  this.toggle(e);
                }}
              >
                Đóng
              </Button>
            )
          }
        >
          <div>
            <div style={{ marginBottom: 16 }}>
              <Button
                type='dashed'
                size='small'
                danger
                loading={loading}
                onClick={this.start}
                disabled={!hasSelected}
              >
                Xóa Chọn
              </Button>
              <span style={{ marginLeft: 2 }}>
                {hasSelected
                  ? `${output.length} bản ghi được chọn`
                  : '0 bản ghi được chọn'}
              </span>
            </div>
            <ProTable
              actionRef={this.actionRef as any}
              formRef={this.form}
              tableClassName='gx-table-responsive'
              request={this.fetchData}
              // params={getParams}
              search={true}
              headerTitle={'Danh sách đơn vị'}
              rowKey='id'
              toolBarRender={false}
              tableAlertRender={false}
              pagination={this.state.pagination}
              columns={this.state.columns}
              loading={this.state.loading}
              // rowSelection={{
              //   type: 'checkbox',
              //   selectedRowKeys: this.state.output,
              //   /* renderCell: (checked, record, index, originNode) => {
              //     return <Tooltip title={'Chọn đơn vị'}>{originNode}</Tooltip>
              //   }, */
              //   onChange: this.onCheckboxChanged,
              // }}
              rowSelection={rowSelection}
              dateFormatter='string'
              type='table'
            />
          </div>
        </Modal>
      </div>
    );
  }
}

export default ArraySort;
