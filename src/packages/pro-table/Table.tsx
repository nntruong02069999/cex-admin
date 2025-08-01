/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import './index.less';

import React, {
  useEffect,
  CSSProperties,
  useRef,
  useState,
  ReactNode,
} from 'react';
import {
  Table,
  ConfigProvider,
  Card,
  Space,
  Typography,
  Empty,
  Tooltip,
  Badge,
} from 'antd';
// import { RocketOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import useMergeValue from 'use-merge-value';
import { stringify } from 'use-json-comparison';
import {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
  ColumnType,
} from 'antd/es/table';
import { ColumnFilterItem } from 'antd/es/table/interface';
import { FormItemProps, FormProps, FormInstance } from 'antd/es/form';
import { TableCurrentDataSource, SorterResult } from 'antd/lib/table/interface';
import { ConfigConsumer, ConfigConsumerProps } from 'antd/lib/config-provider';

import { noteOnce } from 'rc-util/lib/warning';
import {
  IntlProvider,
  IntlConsumer,
  IntlType,
  useIntl,
} from './component/intlContext';
import useFetchData, { UseFetchDataAction, RequestData } from './useFetchData';
import Container, { useCounter } from './container';
import Toolbar, { OptionConfig, ToolBarProps } from './component/toolBar';
import Alert from './component/alert';
import FormSearch, { SearchConfig, TableFormItem } from './form';
// import AdvancedForm from './advancedForm';
import { StatusType } from './component/status';
import get, {
  parsingText,
  parsingValueEnumToArray,
  checkUndefinedOrNull,
  useDeepCompareEffect,
  genColumnKey,
  removeObjectNull,
  ObjToMap,
  reduceWidth,
} from './component/util';
import defaultRenderText, {
  ProColumnsValueType,
  ProColumnsValueTypeFunction,
} from './defaultRender';
import { DensitySize } from './component/toolBar/DensityIcon';
import ErrorBoundary from './component/ErrorBoundary';
import _ from 'lodash';

type TableRowSelection = TableProps<any>['rowSelection'];

export interface ActionType {
  reload: (resetPageIndex?: boolean) => void;
  reloadAndRest: () => void;
  fetchMore: () => void;
  reset: () => void;
  clearSelected: () => void;
}

export interface ColumnsState {
  show?: boolean;
  fixed?: 'right' | 'left' | undefined;
}

export type ValueEnumObj = {
  [key: string]:
    | {
        text: ReactNode;
        status: StatusType;
      }
    | ReactNode;
};

export type ValueEnumMap = Map<
  React.ReactText,
  | {
      text: ReactNode;
      status: StatusType;
      isText: boolean;
    }
  | ReactNode
>;

export interface ProColumnType<T = unknown>
  extends Omit<ColumnType<T>, 'render' | 'children' | 'title' | 'filters'>,
    Partial<Omit<FormItemProps, 'children'>> {
  total?: number;
  index?: number;
  title?:
    | ReactNode
    | ((config: ProColumnType<T>, type: ProTableTypes) => ReactNode);
  /**
   * 自定义 render
   */
  render?: (
    text: React.ReactNode,
    record?: T,
    index?: number,
    action?: UseFetchDataAction<RequestData<T>>
  ) => React.ReactNode | React.ReactNode[];

  /**
   * 自定义 render，但是需要返回 string
   */
  renderText?: (
    text: any,
    record: T,
    index: number,
    action: UseFetchDataAction<RequestData<T>>
  ) => any;

  /**
   * 自定义搜索 form 的输入
   */
  renderFormItem?: (
    item: ProColumns<T>,
    config: {
      value?: any;
      onChange?: (value: any) => void;
      onSelect?: (value: any) => void;
      type: ProTableTypes;
      defaultRender: (newItem: ProColumns<any>) => JSX.Element | null;
    },
    form: FormInstance
  ) => JSX.Element | false | null;

  /**
   * 搜索表单的 props
   */
  formItemProps?: { [prop: string]: any };

  /**
   * 搜索表单的默认值
   */
  initialValue?: any;

  /**
   * 是否缩略
   */
  ellipsis?: boolean;
  /**
   * 是否拷贝
   */
  copyable?: boolean;

  /**
   * 值的类型
   */
  valueType?: ProColumnsValueType | ProColumnsValueTypeFunction<T>;

  /**
   * 值的枚举，如果存在枚举，Search 中会生成 select
   */
  valueEnum?: ValueEnumMap | ValueEnumObj;

  /**
   * 在查询表单中隐藏
   */
  hideInSearch?: boolean;

  /**
   * 在 table 中隐藏
   */
  hideInTable?: boolean;

  /**
   * 在新建表单中删除
   */
  hideInForm?: boolean;

  /**
   * 表头的筛选菜单项
   */
  filters?: boolean | ColumnFilterItem[];

  /**
   * form 的排序
   */
  order?: number;

  needTotal?: boolean;
}

export interface ProColumnGroupType<RecordType>
  extends ProColumnType<RecordType> {
  children: ProColumns<RecordType> | ProColumns<RecordType>[];
}

export type ProColumns<T = Record<string, unknown>> =
  | ProColumnGroupType<T>
  | ProColumnType<T>;

// table 支持的变形，还未完全支持完毕
export type ProTableTypes =
  | 'form'
  | 'list'
  | 'table'
  | 'cardList'
  | 'advancedform'
  | undefined;

export interface ProTableProps<T, U extends { [key: string]: any }>
  extends Omit<TableProps<T>, 'columns' | 'rowSelection'> {
  columns?: ProColumns<T>[];

  params?: U;

  columnsStateMap?: {
    [key: string]: ColumnsState;
  };

  onColumnsStateChange?: (map: { [key: string]: ColumnsState }) => void;

  onSizeChange?: (size: DensitySize) => void;

  /**
   * 一个获得 dataSource 的方法
   */
  request?: (
    params: U & {
      pageSize?: number;
      current?: number;
    },
    sort: {
      [key: string]: 'ascend' | 'descend';
    },
    filter: { [key: string]: React.ReactText[] }
  ) => Promise<RequestData<T>>;

  /**
   * 对数据进行一些处理
   */
  postData?: (data: any[]) => any[];
  /**
   * 默认的数据
   */
  defaultData?: T[];

  /**
   * 初始化的参数，可以操作 table
   */
  actionRef?:
    | React.MutableRefObject<ActionType | undefined>
    | ((actionRef: ActionType) => void);

  /**
   * 操作自带的 form
   */
  formRef?: TableFormItem<T>['formRef'];
  /**
   * 渲染操作栏
   */
  toolBarRender?: ToolBarProps<T>['toolBarRender'] | false;

  /**
   * 数据加载完成后触发
   */
  onLoad?: (dataSource: T[]) => void;

  /**
   * 数据加载失败时触发
   */
  onRequestError?: (e: Error) => void;

  /**
   * 给封装的 table 的 className
   */
  tableClassName?: string;

  /**
   * 给封装的 table 的 style
   */
  tableStyle?: CSSProperties;

  /**
   * 左上角的 title
   */
  headerTitle?: React.ReactNode;

  /**
   * 默认的操作栏配置
   */
  options?: OptionConfig<T> | false;
  /**
   * 是否显示搜索表单
   */
  search?: boolean | SearchConfig;

  /**
   * type="form" 和 搜索表单 的 Form 配置
   * 基本配置与 antd Form 相同
   *  但是劫持了 form 的配置
   */
  form?: Omit<FormProps, 'form'>;
  /**
   * 如何格式化日期
   * 暂时只支持 moment
   * string 会格式化为 YYYY-DD-MM
   * number 代表时间戳
   */
  dateFormatter?: 'string' | 'number' | false;
  /**
   * 格式化搜索表单提交数据
   */
  beforeSearchSubmit?: (params: Partial<T>) => Partial<T>;
  /**
   * 自定义 table 的 alert
   * 设置或者返回false 即可关闭
   */
  tableAlertRender?:
    | ((props: {
        intl: IntlType;
        selectedRowKeys: (string | number)[];
        selectedRows: T[];
      }) => React.ReactNode)
    | false;
  /**
   * 自定义 table 的 alert 的操作
   * 设置或者返回false 即可关闭
   */
  tableAlertOptionRender?:
    | ((props: {
        intl: IntlType;
        onCleanSelected: () => void;
      }) => React.ReactNode)
    | false;

  rowSelection?: TableProps<T>['rowSelection'] | false;

  style?: React.CSSProperties;

  /**
   * 支持 ProTable 的类型
   */
  type?: ProTableTypes;

  /**
   * 提交表单时触发
   */
  onSubmit?: (params: U) => void;

  /**
   * 重置表单时触发
   */
  onReset?: () => void;

  /**
   * 空值时显示
   */
  columnEmptyText?: ColumnEmptyText;

  scrollTop?: boolean;
}

interface IProps {
  children: ReactNode;
}
const refTable = React.createRef<HTMLTableElement>();
const WrapperTableComponent = ({ children, ...restProps }: IProps): any => (
  <table id='mywrapper' {...restProps} ref={refTable}>
    {children}
  </table>
);

const mergePagination = <T extends any[], U>(
  pagination: TablePaginationConfig | boolean | undefined = {},
  action: UseFetchDataAction<RequestData<T>>,
  intl: IntlType
): TablePaginationConfig | false | undefined => {
  if (pagination === false) {
    return {};
  }
  let defaultPagination: TablePaginationConfig | Record<string, any> | boolean =
    pagination || {};
  const { current, pageSize } = action;

  if (pagination === true) {
    defaultPagination = {};
  }
  return {
    showTotal: (all, range) =>
      `${intl.getMessage('pagination.total.range', '第')} ${range[0]}-${
        range[1]
      } ${intl.getMessage(
        'pagination.total.total',
        '条/总共'
      )} ${all} ${intl.getMessage('pagination.total.item', '条')}`,
    showSizeChanger: true,
    total: action.total,
    ...(defaultPagination as TablePaginationConfig),
    current,
    pageSize,
    // ...(defaultPagination as TablePaginationConfig),
    onChange: (page: number, newPageSize?: number) => {
      // pageSize 改变之后就没必要切换页码
      if (newPageSize !== pageSize && current !== page) {
        action.setPageInfo({ pageSize, page });
      } else {
        if (newPageSize !== pageSize) {
          action.setPageInfo({ pageSize });
        }
        if (current !== page) {
          action.setPageInfo({ page });
        }
      }

      const { onChange } = pagination as TablePaginationConfig;
      if (onChange) {
        onChange(page, newPageSize || 10);
      }
    },

    onShowSizeChange: (page: number, showPageSize: number) => {
      action.setPageInfo({
        pageSize: showPageSize,
        page,
      });
      const { onShowSizeChange } = pagination as TablePaginationConfig;
      if (onShowSizeChange) {
        onShowSizeChange(page, showPageSize || 10);
      }
    },
  };
};

export type ColumnEmptyText = string | false;

interface ColumnRenderInterface<T> {
  item: ProColumns<T>;
  text: any;
  row: T;
  index: number;
  columnEmptyText?: ColumnEmptyText;
  counter: ReturnType<typeof useCounter>;
}

/**
 * 生成 Ellipsis 的 tooltip
 * @param dom
 * @param item
 * @param text
 */
const genEllipsis = (
  dom: React.ReactNode,
  item: ProColumns<any>,
  text: string
) => {
  if (!item.ellipsis) {
    return dom;
  }
  return (
    <Tooltip title={text}>
      <span>{dom}</span>
    </Tooltip>
  );
};

const genCopyable = (dom: React.ReactNode, item: ProColumns<any>) => {
  if (item.copyable || item.ellipsis) {
    return (
      <Typography.Paragraph
        style={{
          width: reduceWidth(item.width),
          margin: 0,
          padding: 0,
        }}
        copyable={item.copyable}
        ellipsis={item.ellipsis}
      >
        {dom}
      </Typography.Paragraph>
    );
  }
  return dom;
};

/**
 * 这个组件负责单元格的具体渲染
 * @param param0
 */
const columnRender = <T, U = any>({
  item,
  text,
  row,
  index,
  columnEmptyText,
  counter,
}: ColumnRenderInterface<T>): any => {
  const { action } = counter;
  const { renderText = (val: any) => val, valueEnum = {} } = item;
  if (!action.current) {
    return null;
  }

  const renderTextStr = renderText(
    parsingText(text, ObjToMap(valueEnum)),
    row,
    index,
    action.current
  );
  const textDom = defaultRenderText<T, Record<string, unknown>>(
    renderTextStr,
    item.valueType || 'text',
    index,
    row,
    columnEmptyText
  );
  const dom: React.ReactNode = genEllipsis(
    genCopyable(textDom, item),
    item,
    renderText(
      parsingText(text, ObjToMap(valueEnum), true),
      row,
      index,
      action.current
    )
  );

  if (item.render) {
    const renderDom = item.render(dom, row, index, action.current);

    // 如果是合并单元格的，直接返回对象
    if (
      renderDom &&
      typeof renderDom === 'object' &&
      (renderDom as { props: { colSpan: number } }).props &&
      (renderDom as { props: { colSpan: number } }).props.colSpan
    ) {
      return renderDom;
    }

    if (renderDom && item.valueType === 'option' && Array.isArray(renderDom)) {
      return <Space>{renderDom}</Space>;
    }
    return renderDom as React.ReactNode;
  }
  return checkUndefinedOrNull(dom) ? dom : null;
};

/**
 * 转化 columns 到 pro 的格式
 * 主要是 render 方法的自行实现
 * @param columns
 * @param map
 * @param columnEmptyText
 */
const genColumnList = <T, U = Record<string, unknown>>(
  columns: ProColumns<T>[],
  map: {
    [key: string]: ColumnsState;
  },
  counter: ReturnType<typeof useCounter>,
  columnEmptyText?: ColumnEmptyText
): (ColumnsType<T>[number] & { index?: number })[] =>
  columns
    .map((item) => {
      const { title } = item;
      return {
        ...item,
        title:
          title && typeof title === 'function' ? title(item, 'table') : title,
        valueEnum: ObjToMap(item.valueEnum),
      };
    })
    .map((item: any, columnsIndex) => {
      const { key, dataIndex, filters = [] } = item;
      const columnKey = genColumnKey(key, dataIndex, columnsIndex);
      const config = columnKey
        ? map[columnKey as any] || { fixed: item.fixed }
        : { fixed: item.fixed };
      const tempColumns = {
        onFilter: (value: string, record: T) => {
          let recordElement = get(record, (item.dataIndex || '') as any);
          if (typeof recordElement === 'number') {
            recordElement = recordElement.toString();
          }
          const itemValue = String(recordElement || '') as string;
          return String(itemValue) === String(value);
        },
        index: columnsIndex,
        ...item,
        filters:
          filters === true
            ? parsingValueEnumToArray(item.valueEnum).filter(
                (valueItem) => valueItem && valueItem.value !== 'all'
              )
            : filters,
        ellipsis: false,
        fixed: config.fixed,
        width: item.width || (item.fixed ? 200 : undefined),
        children: item.children
          ? genColumnList(
              item.children as ProColumns<T>[],
              map,
              counter,
              columnEmptyText
            )
          : undefined,
        render: (text: any, row: T, index: number) =>
          columnRender<T>({ item, text, row, index, columnEmptyText, counter }),
      };
      if (!tempColumns.children || !tempColumns.children.length) {
        delete tempColumns.children;
      }
      if (!tempColumns.dataIndex) {
        delete tempColumns.dataIndex;
      }
      if (!tempColumns.filters || !tempColumns.filters.length) {
        delete (tempColumns || {}).filters;
      }
      return tempColumns;
    })
    .filter((item) => !item.hideInTable) as unknown as ColumnsType<T>[number] &
    {
      index?: number;
    }[];

/* type ColumnNeedTotal<T> = (ProColumns<T>[] & {
  total?: number;
}); */

/**
 * 转化 columns 到 pro 的格式
 * 主要是 render 方法的自行实现
 * @param columns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initTotalList = <T, U = Record<string, any>>(
  columns: ProColumns<T>[]
): ProColumns<T>[] => {
  const totalList: ProColumns<T>[] = [];
  columns.forEach((column) => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });

  return totalList as ProColumns<T>[];
};

/**
 * 🏆 Use Ant Design Table like a Pro!
 * 更快 更好 更方便
 * @param props
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const ProTable = <T extends Record<string, any>, U extends object>(
  props: ProTableProps<T, U> & {
    defaultClassName: string;
  }
) => {
  const {
    request,
    className: propsClassName,
    params = {},
    defaultData = [],
    headerTitle,
    postData,
    pagination: propsPagination,
    actionRef,
    columns: propsColumns = [],
    toolBarRender = () => [],
    onLoad,
    onRequestError,
    style,
    tableStyle,
    tableClassName,
    columnsStateMap,
    onColumnsStateChange,
    options,
    search = true,
    rowSelection: propsRowSelection = false,
    beforeSearchSubmit = (searchParams: Partial<U>) => searchParams,
    tableAlertRender,
    defaultClassName,
    formRef,
    type = 'table',
    onReset = () => {},
    columnEmptyText = '-',
    components: customComponents = {},
    scrollTop = false,
    ...rest
  } = props;
  const refScroll = useRef<HTMLDivElement>(null);
  const components = Object.assign(customComponents, {
    table: WrapperTableComponent,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useMergeValue<
    React.ReactText[]
  >([], {
    value: propsRowSelection ? propsRowSelection.selectedRowKeys : undefined,
  });
  const [formSearch, setFormSearch] = useState<Record<string, any>>(
    () => (rest.form || {}).initialValues
  );
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [dataSource, setDataSource] = useState<T[]>([]);
  // @ts-ignore
  const [proFilter, setProFilter] = useState<{
    [key: string]: React.ReactText[];
  }>({});
  // @ts-ignore
  const [proSort, setProSort] = useState<{
    [key: string]: 'ascend' | 'descend';
  }>({});
  const [needTotalList, setNeedTotalList] = useState<ProColumns<T>[]>([]);
  const rootRef = useRef<HTMLDivElement | any>(null);
  const fullScreen = useRef<() => void>();

  /**
   * 需要初始化 不然默认可能报错
   * 这里取了 defaultCurrent 和 current
   * 为了保证不会重复刷新
   */
  const fetchPagination =
    typeof propsPagination === 'object'
      ? (propsPagination as TablePaginationConfig)
      : { defaultCurrent: 1, defaultPageSize: 10, pageSize: 10, current: 1 };

  const action = useFetchData(
    async ({ pageSize, current }) => {
      if (!request) {
        return {
          data: props.dataSource || [],
          success: true,
        } as RequestData<T>;
      }
      const msg = await request(
        {
          current,
          pageSize,
          ...formSearch,

          ...params,
        } as U,
        proSort,
        proFilter
      );
      if (postData) {
        return { ...msg, data: postData(msg.data) };
      }
      return msg;
    },
    defaultData,
    {
      defaultCurrent: fetchPagination.current || fetchPagination.defaultCurrent,
      defaultPageSize:
        fetchPagination.pageSize || fetchPagination.defaultPageSize,
      onLoad,
      onRequestError,
      effects: [
        stringify(params),
        stringify(formSearch),
        stringify(proFilter),
        stringify(proSort),
      ],
    }
  );

  // @ts-ignore
  useEffect(() => {
    if (scrollTop) {
      const scrollHeight = '14px';
      let childWrapper: any;
      if (refTable.current && refScroll.current) {
        const outerDiv = refScroll.current as any;
        childWrapper = refTable.current.parentElement;

        outerDiv.firstElementChild.style.width = `${refTable.current.offsetWidth}px`;
        outerDiv.firstElementChild.style.height = scrollHeight;

        outerDiv.onscroll = function () {
          childWrapper.scrollLeft = outerDiv.scrollLeft;
        };

        childWrapper.onscroll = function () {
          outerDiv.scrollLeft = childWrapper.scrollLeft;
        };

        const handleScroll = function () {
          const scrollPhone = window.scrollY;
          if (scrollPhone > 20) {
            outerDiv.style.width = `${childWrapper.offsetWidth}px`;
            // outerDiv.style.position = 'fixed';
            // outerDiv.style.top = 0;
            // outerDiv.style.left = 250;
            // outerDiv.style.zIndex = '400';
            outerDiv.style.overflow = 'auto hidden';
            outerDiv.style.height = scrollHeight;
            outerDiv.style.visibility = 'visible';
          } else {
            outerDiv.style.width = `${childWrapper.offsetWidth}px`;
            // outerDiv.style.position = 'relative';
            // outerDiv.style.top = 'inherit';
            // outerDiv.style.left = 'inherit';
            outerDiv.style.overflow = 'auto hidden';
            outerDiv.style.height = scrollHeight;
            outerDiv.style.visibility = 'visible';
          }
        };

        window.addEventListener('scroll', handleScroll);
        return function cleanup() {
          window.removeEventListener('scroll', handleScroll);
        };
      }
    }
  });

  useEffect(() => {
    fullScreen.current = () => {
      // if(!rootRef.current || !document.fullscreenEnabled) {
      //   return;
      // }
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (rootRef.current.requestFullscreen) {
        rootRef.current.requestFullscreen();
      } else if (rootRef.current.webkitRequestFullscreen) {
        /* Safari */
        rootRef.current.webkitRequestFullscreen();
      } else if (rootRef.current.msRequestFullscreen) {
        /* IE11 */
        rootRef.current.msRequestFullscreen();
      } else {
        return;
      }
    };
  }, [rootRef.current]);

  action.fullScreen = fullScreen.current;

  const intl = useIntl();

  const pagination =
    propsPagination !== false &&
    mergePagination<T[], Record<string, unknown>>(
      propsPagination,
      action,
      intl
    );

  const counter = Container.useContainer();

  const onCleanSelected = () => {
    if (propsRowSelection && propsRowSelection.onChange) {
      propsRowSelection.onChange([], []);
    }
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  useEffect(() => {
    // onCleanSelected();
    setDataSource(
      request ? (action.dataSource as T[]) : ((props.dataSource || []) as T[])
    );
  }, [props.dataSource, action.dataSource]);

  /**
   *  保存一下 propsColumns
   *  生成 form 需要用
   */
  useDeepCompareEffect(() => {
    counter.setProColumns(propsColumns);
  }, [propsColumns]);

  counter.setAction(action);

  /**
   * 这里生成action的映射，保证 action 总是使用的最新
   * 只需要渲染一次即可
   */
  useEffect(() => {
    const userAction: ActionType = {
      reload: async (resetPageIndex?: boolean) => {
        const {
          action: { current },
        } = counter;
        if (!current) {
          return;
        }
        noteOnce(
          !!resetPageIndex,
          ' reload 的 resetPageIndex 将会失效，建议使用 reloadAndRest。'
        );
        noteOnce(
          !!resetPageIndex,
          'reload resetPageIndex will remove and reloadAndRest is recommended.'
        );

        // 如果为 true，回到第一页
        if (resetPageIndex) {
          await current.resetPageIndex();
        }
        await current.reload();
      },
      reloadAndRest: async () => {
        const {
          action: { current },
        } = counter;
        if (!current) {
          return;
        }
        // reload 之后大概率会切换数据，清空一下选择。
        onCleanSelected();
        // 如果为 true，回到第一页
        await current.resetPageIndex();
        await current.reload();
      },
      fetchMore: async () => {
        const {
          action: { current },
        } = counter;
        if (!current) {
          return;
        }
        await current.fetchMore();
      },
      reset: () => {
        const {
          action: { current },
        } = counter;
        if (!current) {
          return;
        }
        current.reset();
      },
      clearSelected: () => onCleanSelected(),
    };
    if (actionRef && typeof actionRef === 'function') {
      actionRef(userAction);
    }
    if (actionRef && typeof actionRef !== 'function') {
      actionRef.current = userAction;
    }
    const needTotalList1 = initTotalList(propsColumns as ProColumns<T>[]);
    setNeedTotalList(needTotalList1);
  }, []);

  /**
   * Table Column 变化的时候更新一下，这个参数将会用于渲染
   */
  useDeepCompareEffect(() => {
    const tableColumn = genColumnList<T>(
      propsColumns,
      counter.columnsMap,
      counter,
      columnEmptyText
    );
    if (tableColumn && tableColumn.length > 0) {
      counter.setColumns(tableColumn);
      // key
      counter.setSortKeyColumns(
        tableColumn.map((item, index) => {
          const key =
            genColumnKey(item.key, (item as ProColumnType).dataIndex, index) ||
            `${index}`;
          return `${key}_${item.index}`;
        })
      );
    }
  }, [propsColumns]);

  /**
   * 这里主要是为了排序，为了保证更新及时，每次都重新计算
   */
  useDeepCompareEffect(() => {
    const keys = counter.sortKeyColumns.join(',');
    let tableColumn = genColumnList<T>(
      propsColumns,
      counter.columnsMap,
      counter,
      columnEmptyText
    );
    if (keys.length > 0) {
      // 用于可视化的排序
      tableColumn = tableColumn.sort((a, b) => {
        const { fixed: aFixed, index: aIndex } = a;
        const { fixed: bFixed, index: bIndex } = b;
        if (
          (aFixed === 'left' && bFixed !== 'left') ||
          (bFixed === 'right' && aFixed !== 'right')
        ) {
          return -2;
        }
        if (
          (bFixed === 'left' && aFixed !== 'left') ||
          (aFixed === 'right' && bFixed !== 'right')
        ) {
          return 2;
        }
        // 如果没有index，在 dataIndex 或者 key 不存在的时候他会报错
        const aKey = `${genColumnKey(
          a.key,
          (a as ProColumnType).dataIndex,
          aIndex
        )}_${aIndex}`;
        const bKey = `${genColumnKey(
          b.key,
          (b as ProColumnType).dataIndex,
          bIndex
        )}_${bIndex}`;
        return keys.indexOf(aKey) - keys.indexOf(bKey);
      });
    }
    if (tableColumn && tableColumn.length > 0) {
      counter.setColumns(tableColumn);
    }
  }, [counter.columnsMap, counter.sortKeyColumns.join('-')]);

  /**
   * 同步 Pagination，支持受控的 页码 和 pageSize
   */
  useDeepCompareEffect(() => {
    if (
      propsPagination &&
      propsPagination.current &&
      propsPagination.pageSize
    ) {
      action.setPageInfo({
        pageSize: propsPagination.pageSize,
        page: propsPagination.current,
      });
    }
  }, [propsPagination]);

  // 映射 selectedRowKeys 与 selectedRow
  useEffect(() => {
    if (action.loading !== false || propsRowSelection === false) {
      return;
    }
    const tableKey = rest.rowKey;

    // dataSource maybe is a null
    // eg: api has 404 error
    const duplicateRemoveMap = new Map();
    if (Array.isArray(dataSource)) {
      // 根据当前选中和当前的所有数据计算选中的行
      // 因为防止翻页以后丢失，所有还增加了当前选择选中的
      const rows = [...dataSource, ...selectedRows].filter((item, index) => {
        let rowKey = tableKey;
        if (!tableKey) {
          return (selectedRowKeys as any).includes(index);
        }
        if (typeof tableKey === 'function') {
          rowKey = tableKey(item, index) as string;
        } else {
          rowKey = item[tableKey];
        }
        if (duplicateRemoveMap.has(rowKey)) {
          return false;
        }
        duplicateRemoveMap.set(rowKey, true);
        return (selectedRowKeys as any).includes(rowKey);
      });
      setSelectedRows(rows);
      return;
    }
    setSelectedRows([]);
  }, [selectedRowKeys.join('-'), action.loading, propsRowSelection === false]);

  /* useEffect(() => {
    const needTotalList1 = initTotalList(propsColumns as ProColumns<T>[]);
    setNeedTotalList(needTotalList1);
  }, []); */

  const rowSelection: TableRowSelection = {
    selectedRowKeys,
    ...propsRowSelection,
    onChange: (keys, rows) => {
      if (propsRowSelection && propsRowSelection.onChange) {
        propsRowSelection.onChange(keys, rows);
      }
      setSelectedRowKeys([...keys]);
      setNeedTotalList(
        needTotalList.map((item) => ({
          ...item,
          total: rows.reduce((sum, val) => {
            return sum + parseFloat(val[item.dataIndex as string]);
          }, 0),
        }))
      );
    },
  };

  useEffect(() => {
    counter.setTableSize(rest.size || 'middle');
  }, [rest.size]);

  if (counter.columns.length < 1) {
    return (
      <Card bordered={false} bodyStyle={{ padding: 50 }}>
        <Empty />
      </Card>
    );
  }

  const className = classNames(defaultClassName, propsClassName);
  return (
    <ConfigProvider
      getPopupContainer={() =>
        (rootRef.current || document.body) as any as HTMLElement
      }
    >
      <div
        className={className}
        id='ant-design-pro-table'
        style={style}
        ref={rootRef}
      >
        {(search || type === 'form') && (
          <FormSearch<U>
            {...rest}
            type={props.type}
            formRef={formRef}
            onSubmit={(value) => {
              let convert: any = _.omitBy(value, _.isNull);
              if (type !== 'form') {
                setFormSearch(
                  beforeSearchSubmit({
                    ...convert,
                    _timestamp: Date.now(),
                  })
                );
                // back first page
                action.resetPageIndex();
              }

              if (props.onSubmit) {
                props.onSubmit(convert);
              }
            }}
            onReset={() => {
              setFormSearch(beforeSearchSubmit({}));
              // back first page
              action.resetPageIndex();
              onReset();
            }}
            dateFormatter={rest.dateFormatter}
            search={search}
          />
        )}

        {/* {(type === 'advancedform') && (
          <AdvancedForm<U>
            {...rest}
            type={props.type}
            formRef={formRef}
            onSubmit={(value) => {
              if(type !== 'advancedform') {
                setFormSearch(
                  beforeSearchSubmit({
                    ...value,
                    _timestamp: Date.now(),
                  }),
                );
                // back first page
                action.resetPageIndex();
              }

              if(props.onSubmit) {
                props.onSubmit(value);
              }
            }}
            onReset={() => {
              setFormSearch(beforeSearchSubmit({}));
              // back first page
              action.resetPageIndex();
              onReset();
            }}
            dateFormatter={rest.dateFormatter}
            search={search}
          />
        )} */}

        {type !== 'form' && type !== 'advancedform' && (
          <Card
            bordered={false}
            style={{
              height: '100%',
            }}
            bodyStyle={{
              padding: 0,
            }}
          >
            {toolBarRender !== false && (options !== false || headerTitle) && (
              // if options= false & headerTitle=== false, hide Toolbar
              <Toolbar<T>
                options={options}
                headerTitle={
                  <>
                    <Badge
                      showZero
                      offset={[15, -5]}
                      overflowCount={1000000000}
                      count={
                        propsPagination && propsPagination.total
                          ? propsPagination.total
                          : 0
                      }
                    >
                      <span>{headerTitle}</span>
                    </Badge>
                  </>
                }
                action={action}
                onSearch={(keyword) => {
                  if (options && options.search) {
                    const { name = 'keyword' } =
                      options.search === true
                        ? {
                            name: 'keyword',
                          }
                        : options.search;
                    setFormSearch({
                      [name]: keyword,
                      ...formSearch,
                    });
                  }
                }}
                selectedRows={selectedRows}
                selectedRowKeys={selectedRowKeys}
                toolBarRender={toolBarRender}
              />
            )}
            {propsRowSelection !== false && (
              <Alert<T>
                selectedRowKeys={selectedRowKeys}
                selectedRows={selectedRows}
                onCleanSelected={onCleanSelected}
                alertOptionRender={rest.tableAlertOptionRender}
                alertInfoRender={tableAlertRender}
                needTotalList={needTotalList}
              />
            )}
            {scrollTop && (
              <div ref={refScroll} className='wrapper1'>
                <div className='div1' />
              </div>
            )}
            <Table<T>
              {...rest}
              components={components}
              size={counter.tableSize}
              rowSelection={
                propsRowSelection === false ? undefined : rowSelection
              }
              className={tableClassName}
              style={tableStyle}
              columns={counter.columns.filter((item) => {
                const { key, dataIndex } = item;
                const columnKey = genColumnKey(key, dataIndex);
                if (!columnKey) {
                  return true;
                }
                const config = counter.columnsMap[columnKey as any];
                if (config && config.show === false) {
                  return false;
                }
                return true;
              })}
              loading={action.loading || props.loading}
              dataSource={dataSource}
              pagination={pagination}
              onChange={(
                changePagination: TablePaginationConfig,
                filters: {
                  // [string: string]: React.ReactText[] | null;
                  [string: string]: any;
                },
                sorter: SorterResult<T> | SorterResult<T>[],
                extra: TableCurrentDataSource<T>
              ) => {
                if (rest.onChange) {
                  rest.onChange(changePagination, filters, sorter, extra);
                }

                // 制造筛选的数据
                setProFilter(removeObjectNull(filters));

                // 制造一个排序的数据
                if (Array.isArray(sorter)) {
                  const data = sorter.reduce<{
                    [key: string]: any;
                  }>((pre, value) => {
                    if (!value.order) {
                      return pre;
                    }
                    return {
                      ...pre,
                      [`${value.field}`]: value.order,
                    };
                  }, {});
                  setProSort(data);
                } else if (sorter.order) {
                  setProSort({ [`${sorter.field}`]: sorter.order });
                }
              }}
            />
          </Card>
        )}
      </div>
    </ConfigProvider>
  );
};

/**
 * 🏆 Use Ant Design Table like a Pro!
 * 更快 更好 更方便
 * @param props
 */
const ProviderWarp = <
  T,
  U extends { [key: string]: any } = Record<string, any>
>(
  props: ProTableProps<T, U>
) => (
  <Container.Provider initialState={props}>
    <ConfigConsumer>
      {({ getPrefixCls }: ConfigConsumerProps) => (
        <IntlConsumer>
          {(value) => (
            <IntlProvider value={value}>
              <ErrorBoundary>
                <ProTable
                  defaultClassName={getPrefixCls('pro-table')}
                  {...props}
                />
              </ErrorBoundary>
            </IntlProvider>
          )}
        </IntlConsumer>
      )}
    </ConfigConsumer>
  </Container.Provider>
);

export default ProviderWarp;
