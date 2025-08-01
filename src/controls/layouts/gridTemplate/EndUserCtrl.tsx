import React, { Component } from 'react';
import { Modal, Col, Row, Avatar, Tag, Dropdown, Menu, Space } from 'antd';
import { helper } from '@src/controls/controlHelper';
import ProTable from '@src/packages/pro-table/Table';
import _ from 'lodash';
import dayjs from 'dayjs';
import Widgets from '@src/packages/pro-component/schema/Widgets';
import FormCtrl from '@src/controls/layouts/schemaTemplate/FormCtrl';
import Loader from '@src/components/Loading';
import * as request from '@src/util/request';
import { ColumnsState, RequestData, ActionType } from '@src/packages/pro-table';
import {
  DATA_TYPE,
  DISPLAY_TYPE,
  GRID_EDITOR_FIELD,
} from '@src/constants/enums';
import NumberRange from '@src/packages/pro-component/schema/NumberRange';
import { COLORS } from '@src/constants/constants';
import { IButtonEditor } from '../../editors/ButtonEditor';
import {
  COLUMN_ACTIONS_FIELD,
  COLUMN_ACTIONS_NAME,
  DEFAULT_MENU_BUTTONS,
  IGridEditorColumn,
} from '../../editors/GridEditor';
import defaultRenderButton from '../../defaultRenderButton';
import { TablePaginationConfig } from 'antd/es/table';
import { SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';
import clone from 'lodash/clone';
import { ResizableHeaderTitle } from '@src/packages/pro-utils';
import {
  defaultGridSetting,
  IPageEditorProps,
} from '@src/routes/default/pageManager/PageEditor';
import HttpStatusCode from '@src/constants/HttpStatusCode';
import Widget from '@src/components/Widget';
import { IS_DEBUG } from '@src/constants/constants';

export interface EndUserCtrlProps {
  query: any;
  pageInfo: any;
}

export interface EndUserCtrlState {
  key: string;
  data: Array<any>;
  info: Record<string, any>;
  pageInfo: IPageEditorProps | null;
  error: any;
  columns: Array<any>;
  modelSelect: Record<string, any>;
  modelSelectIds: Record<string, any>;
  currentFilter: Record<string, any>;
  tbl: any;
  modalQuery: Record<string, any>;
  isShowModal: boolean;
  tblFilter: Array<any>;
  currentModal: any;
  collapse?: boolean;
  filter?: any;
  mode?: any;
  loading?: boolean;
  count?: number;
  nPage?: number;
  pagination: Record<string, any>;
  fadeIn?: boolean;
  columnsStateMap: {
    [key: string]: ColumnsState;
  };
}

class EndUserCtrl extends Component<EndUserCtrlProps, EndUserCtrlState> {
  form = React.createRef<any>();
  actionRef = React.createRef<ActionType | undefined>();

  constructor(props: EndUserCtrlProps) {
    super(props);
    this.state = {
      key: 'id',
      data: [],
      info: {},
      pageInfo: null,
      error: null,
      columns: [],
      modelSelect: {},
      modelSelectIds: {},
      currentFilter: {},
      tbl: null,
      modalQuery: {},
      isShowModal: false,
      tblFilter: [],
      currentModal: null,
      columnsStateMap: {},
      pagination: {
        pageSize: this.itemsPerPage,
        total: 0,
        totalPages: 0,
        current: 1,
        position: [
          defaultGridSetting.paginationTop,
          defaultGridSetting.paginationBottom,
        ],
        paginationShowQuickJumper: defaultGridSetting.paginationShowQuickJumper,
        paginationShowSizeChanger: defaultGridSetting.paginationShowSizeChanger,
        paginationSimple: defaultGridSetting.paginationSimple,
        paginationShowTitle: defaultGridSetting.paginationShowTitle,
        paginationShowLessItems: defaultGridSetting.paginationShowLessItems,
        paginationResponsive: defaultGridSetting.paginationResponsive,
        paginationSize: defaultGridSetting.paginationSize,
      },
    };
  }

  currentPage: any;
  itemsPerPage = 10;
  pageInfo: IPageEditorProps | null = null;

  componentDidMount() {
    this.init(this.props);
  }

  componentDidUpdate(prevProps: EndUserCtrlProps) {
    if (
      prevProps.query !== this.props.query &&
      prevProps.pageInfo != this.props.pageInfo
    ) {
      this.init(this.props);
    }
  }

  async loadInfo(pageInfo: IPageEditorProps, query: Record<string, any>) {
    if (IS_DEBUG) {
      console.log(
        `🚀 ~ file: EndUserCtrl.tsx ~ line 134 ~ loadInfo ~ pageInfo`,
        pageInfo
      );
    }

    if (query.mode === 'enduser') {
      if (!query.id) {
        helper.alert('Thiếu id', 'warning');
        return {};
      }
      const rs: any = await helper.callPageApi(pageInfo, 'getUserInfo', {
        queryInput: JSON.stringify({ id: query.id }),
      });
      let data = {};
      if (rs.status == HttpStatusCode.OK) {
        data = { ...rs };
      }
      if (query.embed) {
        Object.assign(data, JSON.parse(query.embed));
      }
      return data;
    }
    helper.alert('Thiếu mode: enduser', 'warning');
    return {};
  }

  init = async (props: any) => {
    this.setState({ pageInfo: null });
    const pageInfo = props.pageInfo;
    if (!pageInfo) return helper.alert('Không tìm được trang');
    this.pageInfo = pageInfo;
    if (!Array.isArray(pageInfo.buttons)) pageInfo.buttons = [];
    if (!Array.isArray(pageInfo.grid)) pageInfo.grid = [];
    this.setState({
      pageInfo,
      mode: this.props.query.mode,
      loading: false,
    });
    if (!this.pageInfo) return;
    // await this.fetchData(this.state.pagination, {}, {})
    const info: any = await this.loadInfo(this.pageInfo, this.props.query);
    const columns = this.createColumnsData(this.pageInfo);
    const columnsStateMap = this.calculateColMap(this.pageInfo);
    this.setState({
      info: info['data'],
      columns,
      columnsStateMap,
    });
  };

  search() {
    this.currentPage = 1;
    this.setState({ data: [], count: 0 });
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  handleFilterChange(name: any, val: any) {
    this.setState({ filter: { ...this.state.filter, [name]: val } });
  }

  toggleFade() {
    this.setState((prevState: any) => {
      return { fadeIn: !prevState.fadeIn };
    });
  }

  checkRequire(filter: any) {
    let rs = true;
    this.props.pageInfo.grid.map((i: any) => {
      if (i.required && !filter[i.field]) {
        rs = false;
      }
    });
    return rs;
  }

  onResize =
    (index: number) =>
    (e: any, { size }: any) => {
      const nextColumns = clone(this.state.columns);
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      this.setState({ columns: nextColumns });
    };

  onTableChange = (
    changePagination: TablePaginationConfig,
    _filters: {
      [string: string]: any;
    },
    _sorter: SorterResult<any> | SorterResult<any>[],
    _extra: TableCurrentDataSource<any>
  ) => {
    const _pagi = clone(this.state.pagination);
    this.setState({
      pagination: {
        ..._pagi,
        ...changePagination,
      },
    });
    /* let _sorter: any
    if (sorter && Array.isArray(sorter)) {
      _sorter = sorter.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.field as string]: cur.order,
        }
      }, {})
    } else if(sorter && typeof sorter == 'object' && Object.keys(sorter).length > 0) {
      _sorter = {
        [sorter.field as string]: sorter.order,
      }
    }
    this.fetchData(changePagination, _sorter, _filters) */
  };

  fetchData = async (
    params: any,
    sorter: {
      [key: string]: 'ascend' | 'descend';
    },
    filtered: { [key: string]: React.ReactText[] }
  ): Promise<RequestData<any>> => {
    const _filtered = Object.keys(filtered).reduce((obj, key) => {
      const newObj: any = { ...obj };
      if (filtered[key] !== null) newObj[key] = helper.getValue(filtered[key]);
      return newObj;
    }, {});
    const _params = _.omit(params, [
      'current',
      'pageSize',
      'showSizeChanger',
      'total',
      'totalPages',
      'position',
    ]);
    const tbl = {
      params,
      sorter,
      filtered: {
        ..._params,
        ..._filtered,
      },
    };
    if (tbl) {
      this.setState({ tbl });
    }
    if (this.state.loading || !this.pageInfo) {
      return {
        data: [],
        success: true,
        total: 0,
      } as RequestData<any>;
    }
    this.setState({ loading: true });
    let filter = {},
      skip = 0,
      limit = this.itemsPerPage,
      sort: Array<any> = [];

    if (tbl && tbl.filtered) {
      filter = this.calculateFilter(tbl.filtered);
      skip = tbl.params.pageSize * (tbl.params.current - 1);
      limit = tbl.params.pageSize;
    }

    if (!this.checkRequire(filter)) {
      this.setState({ loading: false, data: [] });
      return {
        data: [],
        success: true,
        total: 0,
      } as RequestData<any>;
    }
    if (tbl && tbl.sorter) {
      sort = Object.keys(tbl.sorter).map((key) => {
        return { [key]: tbl.sorter[key] == 'descend' ? 'desc' : 'asc' };
      });
    }
    if (sort.length === 0) sort = [{ id: 'desc' }];
    if (this.props.query.filter) {
      filter = Object.assign(filter, JSON.parse(this.props.query.filter));
    }

    const input: Record<string, any> = {
      queryInput: JSON.stringify(filter),
      limit,
      skip,
    };
    if (sort) {
      input.sort = JSON.stringify(sort);
    }
    const rs: any = await helper.callPageApi(
      this.pageInfo,
      this.pageInfo.read,
      input
    );
    const data = rs?.data?.data ?? [];
    const modelSelect: any = {};
    const modelSelectIds: any = {};
    data.map((d: any) => {
      this?.pageInfo?.grid.map((g: any) => {
        if (g.modelSelect) {
          if (!modelSelectIds[g.field]) modelSelectIds[g.field] = [];
          if (d[g.field] && !_.includes(modelSelectIds[g.field], d[g.field]))
            modelSelectIds[g.field].push(d[g.field]);
        }
        return null;
      });
      return null;
    });
    const promises = [];
    const gInfos = [];
    for (let i = 0; i < this.pageInfo.grid.length; i++) {
      if (!this.pageInfo.grid[i].modelSelect) continue;
      const gInfo = this.pageInfo.grid[i];
      if (
        !(modelSelectIds[gInfo.field] && modelSelectIds[gInfo.field].length > 0)
      )
        continue;
      gInfos.push(gInfo);
      promises.push(
        helper.callPageApi(this.pageInfo, gInfo.modelSelectApi as string, {
          queryInput: JSON.stringify({ id: modelSelectIds[gInfo.field] }),
        })
      );
    }
    const fieldNameRs: Array<any> = await Promise.all(promises);
    for (let i = 0; i < gInfos.length; i++) {
      const gInfo = gInfos[i];
      modelSelect[gInfo.field] = fieldNameRs[i].data;
    }

    await this.setState({
      data,
      modelSelect,
      count: rs?.data.count,
      loading: false,
      nPage: Math.ceil(rs?.data.count / limit),
      currentFilter: input,
      pagination: {
        ...this.state.pagination,
        position: [
          this?.pageInfo?.settings?.grid?.paginationTop ??
            defaultGridSetting.paginationTop,
          this?.pageInfo?.settings?.grid?.paginationBottom ??
            defaultGridSetting.paginationBottom,
        ],
        pageSize: params.pageSize,
        total: rs?.data.count,
        totalPages: Math.floor(
          (_.get(rs, 'data.count', 0) + tbl?.params?.pageSize - 1) /
            tbl?.params?.pageSize
        ),
        current: tbl?.params?.current,
      },
    });
    return {
      data,
      success: true,
      total: rs?.data.count,
    } as RequestData<any>;
  };

  calculateFilter(filter: { [key: string]: React.ReactText[] }) {
    const obj: any = {};
    Object.keys(filter).map((f: any) => {
      const value: any = filter[f];
      for (let i = 0; i < ((this.pageInfo || {}).grid || []).length; i++) {
        const gridInfo = ((this.pageInfo || {}).grid || [])[i];
        if (gridInfo.field === f) {
          if (gridInfo.modelSelect) {
            if (_.isArray(value) && value.length > 0) {
              obj[f] = value;
            }
          } else {
            switch (gridInfo.type) {
              case DATA_TYPE.STRING:
                if (gridInfo.accurate) {
                  obj[f] = value;
                } else {
                  obj[f] = { contains: value };
                }
                break;
              case 'integer':
              case DATA_TYPE.NUMBER:
              case DATA_TYPE.BOOLEAN:
                if (gridInfo.filterRange) {
                  if (_.isArray(value)) {
                    if (value[0]) {
                      if (!obj[f]) obj[f] = {};
                      obj[f]['gte'] = Number(value[0]);
                    }
                    if (value[1]) {
                      if (!obj[f]) obj[f] = {};
                      obj[f]['lte'] = Number(value[1]);
                    }
                  }
                } else {
                  obj[f] = Number(value);
                }
                break;
              case DATA_TYPE.DATE:
                if (
                  gridInfo.filterRange ||
                  gridInfo[GRID_EDITOR_FIELD.DISPLAY] ==
                    DISPLAY_TYPE.DATE_RANGE ||
                  gridInfo[GRID_EDITOR_FIELD.DISPLAY] ==
                    DISPLAY_TYPE.DATE_TIME_RANGE
                ) {
                  if (Array.isArray(value) && value.length === 2) {
                    const [startText, endText] = value;
                    if (startText) {
                      if (!obj[f]) obj[f] = {};
                      obj[f]['gte'] = dayjs(startText).startOf('day').valueOf();
                    }
                    if (endText) {
                      if (!obj[f]) obj[f] = {};
                      obj[f]['lte'] = dayjs(endText).endOf('day').valueOf();
                    }
                  }
                } else {
                  if (value) {
                    obj[f] = {
                      gte: dayjs(value).startOf('day').valueOf(),
                      lte: dayjs(value).endOf('day').valueOf(),
                    };
                  }
                }
                break;
              default:
                obj[f] = { contains: value };
                break;
            }
          }
        }
      }
      return 0;
    });
    return obj;
  }

  onChange(data: any) {
    this.setState({ data });
  }

  onButtonClick = async (btnInfo: IButtonEditor, data: any) => {
    try {
      let i;
      switch (btnInfo.action) {
        case 'api': {
          if (!data) data = {};
          /* if (btnInfo.confirm) {
            let confirmText = btnInfo.confirm
            for (i in data) {
              confirmText = helper.replaceAll(
                confirmText,
                '#' + i + '#',
                data[i]
              )
            }
            const rs = await helper.confirm(confirmText)
            if (!rs) return
          } */
          if (this.props.query.embed && btnInfo.embedUrl) {
            Object.assign(data, JSON.parse(this.props.query.embed));
          }
          if (!btnInfo?.api) {
            helper.alert('Thiếu api', 'warning');
          } else {
            const rs: any = await helper.callPageApi(
              this.pageInfo,
              btnInfo.api,
              data
            );
            helper.alert(rs.message || 'Thành công');
          }
          this.reloadTable();
          break;
        }
        case 'formModal': {
          let raw = btnInfo.modalQuery;
          if (!raw) {
            helper.alert('Thiếu modalQuery', 'warning');
          } else {
            for (i in data) {
              raw = helper.replaceAll(raw, '#' + i + '#', data[i]);
            }
            const query = JSON.parse(raw);
            if (!query.modalType) query.modalType = 'form';
            let currentModal: any;
            switch (query.modalType) {
              /* case 'preview':
              currentModal = VoucherPreview
              break
            case 'voucherApprove':
              currentModal = VoucherApproveCtrl
              break
            case 'sync':
              currentModal = SyncVoucherCtrl
              break */
              case 'form':
              default:
                currentModal = FormCtrl;
                break;
            }
            this.setState({
              isShowModal: true,
              modalQuery: query,
              currentModal,
            });
          }
          break;
        }
        default:
          break;
      }
    } catch (err: any) {
      helper.alert(err.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  calculateColMap = (pageInfo: any) => {
    const colsMap: any = {};
    for (let i = 0; i < pageInfo.grid.length; i++) {
      const gridInfo = pageInfo.grid[i];
      // show
      if (typeof gridInfo[GRID_EDITOR_FIELD.HIDE_IN_SETTING] == 'boolean') {
        colsMap[gridInfo[GRID_EDITOR_FIELD.FIELD]] = {
          show: !gridInfo[GRID_EDITOR_FIELD.HIDE_IN_SETTING],
        };
      } else {
        colsMap[gridInfo[GRID_EDITOR_FIELD.FIELD]] = {
          show: true,
        };
      }
      // fixed
      if (
        gridInfo[GRID_EDITOR_FIELD.FIXED] &&
        gridInfo[GRID_EDITOR_FIELD.FIXED] != 'none'
      ) {
        if (colsMap[gridInfo[GRID_EDITOR_FIELD.FIELD]]) {
          Object.assign(colsMap[gridInfo[GRID_EDITOR_FIELD.FIELD]], {
            fixed: gridInfo[GRID_EDITOR_FIELD.FIXED],
          });
        } else {
          colsMap[gridInfo[GRID_EDITOR_FIELD.FIELD]] = {
            fixed: gridInfo[GRID_EDITOR_FIELD.FIXED],
          };
        }
      }
    }
    return colsMap;
  };

  generateDisplay = (item: any, gridInfo: any) => {
    const type = gridInfo.display ? gridInfo.display : item.valueType;
    switch (type) {
      case DISPLAY_TYPE.MONEY:
        if (gridInfo.filterRange) {
          item.renderFormItem = (_: any, { type }: any) => {
            if (type === 'form') {
              return null;
            }
            return <NumberRange type='money' placeholder={['Từ', 'Đến']} />;
          };
        }
        break;
      case DISPLAY_TYPE.TEXTAREA:
        break;
      case DISPLAY_TYPE.OPTION:
        break;
      case DISPLAY_TYPE.DATE:
        break;
      case DISPLAY_TYPE.DATE_RANGE:
        break;
      case DISPLAY_TYPE.DATE_TIME:
        break;
      case DISPLAY_TYPE.DATE_TIME_RANGE:
        break;
      case DISPLAY_TYPE.TIME:
        break;
      case DISPLAY_TYPE.TEXT:
        break;
      case DISPLAY_TYPE.INDEX:
        break;
      case DISPLAY_TYPE.INDEX_BORDER:
        break;
      case DISPLAY_TYPE.PROGRESS:
        if (gridInfo.filterRange) {
          item.renderFormItem = (_: any, { type }: any) => {
            if (type === 'form') {
              return null;
            }
            return (
              <NumberRange
                mask={``}
                type='process'
                placeholder={['Từ', 'Đến']}
              />
            );
          };
        }
        break;
      case DISPLAY_TYPE.PERCENT:
        if (gridInfo.filterRange) {
          item.renderFormItem = (_: any, { type }: any) => {
            if (type === 'form') {
              return null;
            }
            return <NumberRange type={`percent`} placeholder={['Từ', 'Đến']} />;
          };
        }
        break;
      case DISPLAY_TYPE.DIGIT:
        if (gridInfo.filterRange) {
          item.renderFormItem = (_: any, { type }: any) => {
            if (type === 'form') {
              return null;
            }
            return (
              <NumberRange type='digit' mask={``} placeholder={['Từ', 'Đến']} />
            );
          };
        }
        break;
      case DISPLAY_TYPE.AVATAR:
        item.render = (value: any) => {
          if (_.isArray(value)) {
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <div style={{ textTransform: 'uppercase' }}>
                  <Avatar src={_.get(value, '[0]', '')} />
                  {/* <Link to={{
                pathname: `/agency/classroom-detail/${record.id}`,
                state: record.name
              }}>
                <span style={{ marginLeft: '5px' }}>{val}</span>
              </Link> */}
                </div>
                {/* <a style={{ fontSize: '12px', marginLeft: '5px' }}
              onClick={() => {
                setDrawerDetail({
                  visible: true,
                  record
                });
              }}>
              <Tooltip title="Chi tiết">
                <EyeOutlined />
              </Tooltip>
            </a> */}
              </div>
            );
          } else {
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <div style={{ textTransform: 'uppercase' }}>
                  <Avatar src={value} />
                  {/* <Link to={{
                pathname: `/agency/classroom-detail/${record.id}`,
                state: record.name
              }}>
                <span style={{ marginLeft: '5px' }}>{val}</span>
              </Link> */}
                </div>
                {/* <a style={{ fontSize: '12px', marginLeft: '5px' }}
              onClick={() => {
                setDrawerDetail({
                  visible: true,
                  record
                });
              }}>
              <Tooltip title="Chi tiết">
                <EyeOutlined />
              </Tooltip>
            </a> */}
              </div>
            );
          }
        };
        break;
      case DISPLAY_TYPE.CODE:
        break;
      case DISPLAY_TYPE.SWITCH:
        break;
      case DISPLAY_TYPE.RADIO:
        break;
      case DISPLAY_TYPE.RADIO_BUTTON:
        break;
      default:
        break;
    }
    return item;
  };

  hasColumn = (name: string, pageInfo: any) => {
    const findCol = pageInfo.grid.find((item: any) => item.field[name] == name);
    if (findCol) {
      return true;
    }
    return false;
  };

  createColumnsData = (pageInfo: IPageEditorProps) => {
    const columns = [];
    for (
      let i = 0;
      i <
      pageInfo.grid.filter((col) => col.field !== COLUMN_ACTIONS_FIELD).length;
      i++
    ) {
      let gridInfo = pageInfo.grid[i];
      const item: any = {
        title: gridInfo.name,
        dataIndex: gridInfo.field,
        sorter: gridInfo[GRID_EDITOR_FIELD.SORTER] || true, // sorter: sắp xếp
        hideInTable: gridInfo[GRID_EDITOR_FIELD.HIDE_IN_TABLE] || false,
        filters: gridInfo[GRID_EDITOR_FIELD.FILTERS] || false,
        onHeaderCell: (column: any) => ({
          width: column.width,
          onResize: this.onResize(i),
        }),
      };
      // valueType: loại hiển thị
      if (gridInfo[GRID_EDITOR_FIELD.DISPLAY]) {
        item.valueType = gridInfo[GRID_EDITOR_FIELD.DISPLAY];
      }
      // copyable: hiển thị nút copy
      if (typeof gridInfo[GRID_EDITOR_FIELD.COPYABLE] == 'boolean') {
        item.copyable = gridInfo[GRID_EDITOR_FIELD.COPYABLE];
      }
      // ellipsis: hiển thị dang ellipsis
      if (typeof gridInfo[GRID_EDITOR_FIELD.ELLIPSIS] == 'boolean') {
        item.ellipsis = gridInfo[GRID_EDITOR_FIELD.ELLIPSIS];
      }
      if (gridInfo.type === DATA_TYPE.DATE) {
        // độ rộng mặc định nếu là date
        item.width = 150;
      }
      // width: thiết lập độ rộng
      if (gridInfo.width) item.width = Number(gridInfo.width);
      // hideInSearch: search trên form
      if (typeof gridInfo[GRID_EDITOR_FIELD.FILTERABLE] == 'boolean') {
        item.hideInSearch = !gridInfo[GRID_EDITOR_FIELD.FILTERABLE];
      } else if (typeof gridInfo[GRID_EDITOR_FIELD.FILTERABLE] == 'undefined') {
        // item.hideInSearch = false
      }
      switch (gridInfo.type) {
        case DATA_TYPE.BOOLEAN:
          // valueType: loại hiển thị default
          if (!gridInfo[GRID_EDITOR_FIELD.DISPLAY]) {
            item.valueType = DISPLAY_TYPE.SWITCH;
          }
          break;
        case DATA_TYPE.DATE:
          // valueType: loại hiển thị default
          if (!gridInfo[GRID_EDITOR_FIELD.DISPLAY]) {
            item.valueType = DISPLAY_TYPE.DATE;
          }
          this.generateDisplay(item, gridInfo);
          break;
        case DATA_TYPE.NUMBER:
          // valueType: loại hiển thị default
          if (!gridInfo[GRID_EDITOR_FIELD.DISPLAY]) {
            item.valueType = DISPLAY_TYPE.DIGIT;
          }
          this.generateDisplay(item, gridInfo);
          break;
        case DATA_TYPE.STRING:
          // valueType: loại hiển thị default
          if (!gridInfo[GRID_EDITOR_FIELD.DISPLAY]) {
            item.valueType = DISPLAY_TYPE.TEXT;
          }
          gridInfo = this.generateDisplay(item, gridInfo);
          break;
        default:
          /* item.render = (value: any) => (
            <span className={`text-${gridInfo?.color || ''}`}>{value}</span>
          ) */
          break;
      }

      // enumable: Danh sách có sẵn
      if (gridInfo.enumable) {
        if (gridInfo.items && gridInfo.items.length > 0) {
          // bindButton: nút bấm thay thế trên table
          if (gridInfo.bindButton) {
            item.render = (value: any, row: any) => {
              const buttons = [];
              for (let i = 0; i < pageInfo.buttons.length; i++) {
                const btn = pageInfo.buttons[i];
                if (btn.column === gridInfo.field) {
                  if (btn.condition) {
                    if (
                      (btn.condition === '1' && value) ||
                      (btn.condition === '0' && !value)
                    ) {
                      buttons.push(this.renderBtn(btn, i, row));
                    }
                  } else {
                    buttons.push(this.renderBtn(btn, i, row));
                  }
                }
              }
              return buttons;
            };
          } else {
            const hasStatus = gridInfo.items.find((i: any) => i.status);
            if (hasStatus) {
              item.valueEnum = gridInfo.items.reduce((prev: any, cur: any) => {
                return {
                  ...prev,
                  [cur.value]: {
                    text: cur.key,
                    status: cur.status,
                    color: cur.color,
                    isText: cur.isText || false,
                  },
                };
              }, {});
            } else {
              item.valueEnum = gridInfo.items.reduce((prev: any, cur: any) => {
                return {
                  ...prev,
                  [cur.value]: cur.key,
                };
              }, {});
            }
          }
        } else {
          item.render = () => {
            return <span className={`text-danger`}>CHƯA CÓ DANH SÁCH</span>;
          };
        }
        // modelSelect: hiển thị dữ liệu lấy từ api
      } else if (gridInfo.modelSelect) {
        item.renderFormItem = (_: any, { type }: any) => {
          if (type === 'form') {
            return null;
          }
          return (
            <Widgets.ArraySelect
              type='checkbox'
              schema={{
                modelSelectField: 'id,name',
                pageId: (this.pageInfo ?? {}).id,
                api: gridInfo.modelSelectApi,
              }}
            />
          );
        };

        item.render = (value: any): any => {
          const populateObj = this.state.modelSelect[gridInfo.field];
          const populateObjData = populateObj?.data ?? [];
          for (let idx = 0; idx < populateObjData.length; idx++) {
            const populateTarget = populateObjData[idx];
            if (populateTarget[`id`] === value) {
              return (
                <Tag color={`${gridInfo.color || COLORS[3]}`}>
                  {populateTarget[`name`]}
                </Tag>
              );
            }
          }
        };
      }

      columns.push(item);
    }
    const colActions = (pageInfo.grid || []).find(
      (item: IGridEditorColumn) => item.field == COLUMN_ACTIONS_FIELD
    );
    if (pageInfo.buttons && pageInfo.buttons.length > 0) {
      const buttons: Array<IButtonEditor> = [];
      pageInfo.buttons.map((i: IButtonEditor) => {
        if (
          (typeof i.type == 'undefined' || i.type === 'button') &&
          !i.column
        ) {
          return buttons.push(i);
        }
        return null;
      });
      if (buttons.length > 0) {
        columns.push({
          title: colActions?.name || COLUMN_ACTIONS_NAME,
          // width: buttons.length > 1 ? nCha * 10 + 50 : 120,
          fixed: 'right',
          render: (value: any, row: any) => {
            const btnToRender: Array<IButtonEditor> = [];
            buttons.map((item: IButtonEditor) => {
              if (item.column) return null;
              if (item.hideExpression) {
                let str = item.hideExpression;
                for (const i in row.original) {
                  str = helper.replaceAll(str, i, row.original[i]);
                }
                try {
                  if (window.eval(str)) return null;
                } catch (err) {
                  return null;
                }
              }
              btnToRender.push(item);
              return null;
            });

            if (
              colActions &&
              typeof colActions.menuButton == 'boolean' &&
              colActions.menuButton &&
              btnToRender.length >=
                (colActions.menuButtonConditon
                  ? Number(colActions.menuButtonConditon)
                  : DEFAULT_MENU_BUTTONS)
            ) {
              return this.renderMenuButton(btnToRender, row, colActions);
            }
            return (
              <div className='gx-d-flex gx-justify-content-center gx-align-items-center gx-align-self-center'>
                {btnToRender.map((item: IButtonEditor, index: number) => {
                  return this.renderBtn(item, index, row);
                })}
              </div>
            );
          },
        });
      }
    }
    return columns;
  };

  onSwitch = async (btnInfo: any, row: any, val: any) => {
    try {
      await helper.callPageApi(this.pageInfo, btnInfo.api, {
        id: row.id,
        [btnInfo.column]: val,
      });
      this.reloadTable();
    } catch (err) {
      //
    }
  };

  renderBtn = (
    item: IButtonEditor,
    index: number,
    row: { [x: string]: any }
  ) => {
    let disabled = false;
    if (item.disableExpression) {
      let str = item.disableExpression;
      for (const i in row.original) {
        str = helper.replaceAll(str, i, row.original[i]);
      }
      try {
        if (window.eval(str)) disabled = true;
      } catch (err) {
        //
      }
    }

    switch (item.type) {
      case 'switch':
        return (
          <Widgets.Checkbox
            disabled={disabled}
            key={`${item.mode}-action-btn-${index}`}
            value={row[item.column as string]}
            onChange={(evt: any) => {
              this.onSwitch(item, row, evt);
            }}
          />
        );
      default: {
        switch (item.action) {
          case 'url': {
            let url: string = (item?.url ?? '').replace('$', row.id);
            for (const i in row) {
              url = helper.replaceAll(url, '#' + i + '#', row[i]);
            }
            for (const i in this.props.query) {
              url = helper.replaceAll(url, '@' + i + '@', this.props.query[i]);
            }
            return defaultRenderButton(
              {
                ...item,
                url,
              },
              {},
              `${item.mode}-action-btn-${index}`
            );
          }
          case 'api':
          case 'formModal': {
            return defaultRenderButton(
              item,
              {
                disabled,
                onClick: () => {
                  this.onButtonClick(item, row);
                },
              },
              `${item.mode}-action-btn-${index}`
            );
          }
          case 'report': {
            return defaultRenderButton(
              item,
              {
                disabled,
                onClick: () => {
                  this.onReportClick(item, 'excel');
                },
              },
              `${item.mode}-action-btn-${index}`
            );
          }
          default:
            return null;
        }
      }
    }
  };

  renderMenuButton = (
    dataButton: Array<any>,
    row: { [x: string]: any },
    colActions: IGridEditorColumn
  ) => {
    const menu = (
      <Menu
        onClick={() => {
          //
        }}
      >
        {dataButton.map((btnInfo: IButtonEditor, idx: number) => {
          return (
            <Menu.Item
              key={
                btnInfo.mode
                  ? `${btnInfo.mode}-action-btn-${idx}`
                  : `menu-col-btn-${idx}`
              }
            >
              {this.renderBtn(btnInfo, idx, row)}
            </Menu.Item>
          );
        })}
      </Menu>
    );
    return (
      <Dropdown.Button
        overlay={menu}
        title={colActions.name || COLUMN_ACTIONS_NAME}
      >
        {colActions.name || COLUMN_ACTIONS_NAME}
      </Dropdown.Button>
    );
  };

  onReportClick = async (btn: any, type: any) => {
    let url = helper.getReportUrl(
      this.pageInfo,
      btn.api,
      this.state.currentFilter
    );
    url += `&type=${type}`;
    const rs: any = await request.default({
      url,
      options: {
        method: 'get',
      },
    });
    window.location.replace(`/#/taskqueue?id=${rs.data}`);
  };

  onRequestError = (error: any) => {
    console.error(
      `🚀 ~ file: TransactrionHistoryCtrl.tsx ~ onRequestError`,
      error
    );
  };

  toolBarRender = () => {
    const buttons = ((this.pageInfo || {}).buttons || []).map(
      (item: any, index: number) => {
        if (item.type !== 'submit') return null;
        return this.renderBtn(item, index, {});
      }
    );
    return [...buttons];
  };

  reloadTable = (resetPageIndex?: boolean) => {
    if (this.actionRef && this.actionRef.current) {
      this.actionRef.current.reload(resetPageIndex);
    }
  };

  render() {
    const { currentModal: EditModal, info } = this.state;
    if (this.state.error)
      return <p className='text-danger'>{this.state.error}</p>;
    if (!this.state.pageInfo || !this.state.columns.length) return <Loader />;
    return (
      <>
        <Row>
          <Col md={24}>
            <Modal
              width={`80vw`}
              visible={this.state.isShowModal}
              footer={null}
              onCancel={() => {
                this.reloadTable();
                this.setState({ isShowModal: false });
              }}
              title={
                <>
                  {this.props.query.name
                    ? this.props.query.name
                    : (this.pageInfo || {}).name}
                </>
              }
              destroyOnClose={true}
            >
              <>
                {this.state.currentModal ? (
                  <EditModal
                    query={this.state.modalQuery}
                    onClose={() => {
                      this.reloadTable();
                      this.setState({ isShowModal: false });
                    }}
                  />
                ) : (
                  <Loader />
                )}
              </>
            </Modal>
          </Col>
        </Row>
        <Row
          style={{
            background: '#fff',
            marginBottom: '16px',
            padding: '16px',
            borderRadius: '6px',
          }}
        >
          <Col md={24}>
            <p>Thông tin khách hàng</p>
            <Space></Space>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Widget
                  title={
                    <b>
                      Mã thẻ:{' '}
                      {info && info.cardActiveInfo
                        ? info.cardActiveInfo.cardNo
                        : 'Chưa chọn thẻ'}
                    </b>
                  }
                >
                  <div>
                    Họ tên:{' '}
                    <b>
                      {info && info.userInfo
                        ? info.userInfo.name
                        : 'Chưa cập nhật'}
                    </b>
                  </div>
                  <div>
                    Hạng thành viên:{' '}
                    <b>
                      {info && info.cardActiveInfo
                        ? info.cardActiveInfo.cardTypeName
                        : 'Chưa chọn thẻ'}
                    </b>
                  </div>
                </Widget>
              </Col>
              <Col span={18}>
                <Widget title={<b>Thông tin điểm</b>}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingLeft: '10px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingLeft: '10px',
                      }}
                    >
                      <span>TỔNG ĐIỂM TÍCH</span>
                      <span>
                        {info && info.userInfo ? info.userInfo.totalReverse : 0}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderLeft: '1px dotted #ccc',
                        paddingLeft: '10px',
                      }}
                    >
                      <span>ĐIỂM KHẢ DỤNG</span>
                      <span>
                        {info && info.userInfo ? info.userInfo.point : 0}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderLeft: '1px dotted #ccc',
                        paddingLeft: '10px',
                      }}
                    >
                      <span>ĐIỂM ĐÃ SỬ DỤNG</span>
                      <span>
                        {info && info.userInfo ? info.userInfo.totalUsage : 0}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderLeft: '1px dotted #ccc',
                        paddingLeft: '10px',
                      }}
                    >
                      <span>HẠN SỬ DỤNG ĐIỂM</span>
                      <span>
                        {info && info.userInfo
                          ? info.userInfo.pointExpiredTime
                          : 0}
                      </span>
                    </div>
                  </div>
                </Widget>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col md={24}>
            <ProTable
              actionRef={this.actionRef as any}
              bordered={
                this?.pageInfo?.settings?.grid?.bordered ||
                defaultGridSetting.bordered
              }
              type='table'
              tableClassName='gx-table-responsive'
              dateFormatter='string'
              components={{
                header: {
                  cell: ResizableHeaderTitle,
                },
              }}
              headerTitle={
                this.props.query.name
                  ? this.props.query.name
                  : (this.pageInfo || {}).name
              }
              rowKey={this.state.key || 'id'}
              formRef={this.form}
              // form={{ initialValues: {} }}
              scroll={{
                scrollToFirstRowOnChange: true,
                x: true,
              }}
              search={true}
              tableAlertRender={false}
              loading={this.state.loading}
              onChange={this.onTableChange}
              request={this.fetchData}
              onRequestError={this.onRequestError}
              // params={getParams}
              pagination={this.state.pagination}
              columns={this.state.columns}
              columnsStateMap={this.state.columnsStateMap}
              onColumnsStateChange={(mapCols) => {
                this.setState({
                  columnsStateMap: mapCols,
                });
              }}
              toolBarRender={this.toolBarRender}
            />
          </Col>
        </Row>
      </>
    );
  }
}

export default EndUserCtrl;
