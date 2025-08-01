import React, { Component } from "react";
import { Modal, Button, Tag, Badge, Image, Row, Col, Table } from "antd";
import { DoubleRightOutlined, PlusOutlined } from "@ant-design/icons";
import get from "lodash/get";
import clone from "lodash/clone";
import isEqual from "lodash/isEqual";
import includes from "lodash/includes";
import ProTable from "@src/packages/pro-table/Table";
import { helper } from "@src/controls/controlHelper";
import { ActionType, RequestData } from "@src/packages/pro-table";
import { COLORS } from "@src/constants/constants";
import { random } from "@src/util/helpers";
import _ from "lodash";
import {
  SortableContainer,
  SortableContainerProps,
  SortableElement,
  SortableHandle,
  SortEnd,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";
import { DragOutlined } from "@ant-design/icons";
import "../../../controls/layouts/schemaTemplate/flashSale.css";

export interface ArrayModelSortProps {
  schema: any;
  disabled?: boolean;
  invalid?: boolean;
  value: any;
  onChange?: (val: any) => void;
  dataForm?: any;
}

export interface ArrayModelSortState {
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
  columnsSort: Array<any>;
  nPage: number;
  mode: "select" | "view";
  pageInfo: any;
  pagination: {
    pageSize: number;
    total: number;
    totalPages: number;
    current: number;
  };
}

const DragHandle = SortableHandle(() => (
  <DragOutlined style={{ cursor: "grab", color: "#999" }} />
));

const SortableItem = SortableElement(
  (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />
);

const SortableBody = SortableContainer(
  (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />
);

class ArrayModelSort extends Component<
  ArrayModelSortProps,
  ArrayModelSortState
> {
  form = React.createRef<any>();
  actionRef = React.createRef<ActionType | undefined>();
  constructor(props: any) {
    super(props);
    this.state = {
      modal: false,
      data: [],
      names: [],
      loading: true,
      search: "",
      pageId: props.schema.pageId,
      schema: props.schema,
      count: 0,
      columns: this.calculateColumns(props.schema),
      columnsSort: this.calculateColumns(props.schema, true),
      output: clone(props.value || []),
      nPage: 0,
      mode: "select",
      pageInfo: null,
      pagination: {
        pageSize: this.itemsPerPage,
        total: 0,
        totalPages: 0,
        current: 1,
      },
    };
    this.init(props.schema.pageId, props.schema, clone(props.value || []));
    this.transformFied = this.transformFied.bind(this);
  }
  itemsPerPage = 10;
  pageInfo: any = null;

  static getDerivedStateFromProps(
    nextProps: ArrayModelSortProps,
    prevState: ArrayModelSortState
  ) {
    if (nextProps.value) {
      if (!isEqual(nextProps.value, prevState.output)) {
        return {
          output: nextProps.value,
        };
      } else return null;
    } else return null;
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (
      !_.isEqual(prevState.output, this.state.output) ||
      this.state.pageInfo != prevState.pageInfo
    ) {
      this.fetchItemName(
        this.state.pageInfo,
        this.state.schema,
        this.state.output
      );
    }
    let embed = this.state.schema?.embed || [];
    for (let item of embed) {
      if (item.value && item.value.substr(0, 2) == "--") {
        const k = item.value.substr(2);
        if (
          !["true", "false"].includes(k) &&
          prevProps.dataForm[k] != this.props.dataForm[k]
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
      this.fetchItemName(this.pageInfo, this.state.schema, output);
    }, 1000);
  };

  toggle = () => this.setState({ modal: !this.state.modal });

  fetchData = async (
    params: any,
    sorter: {
      [key: string]: "ascend" | "descend";
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
        "current",
        "pageSize",
        "showSizeChanger",
        "total",
        "totalPages",
        "position",
        "_timestamp",
      ]);
      filter = { ..._filtered, ..._params };
      if (sorter) {
        sort = Object.keys(sorter).map((key) => {
          return { [key]: sorter[key] == "descend" ? "desc" : "asc" };
        });
      }
      if (sort.length === 0) sort = [{ id: "desc" }];
      if (this.state.mode === "view") {
        if (filter.id) {
          if (includes(this.state.output, filter.id)) {
            filter.id = 0;
          }
        } else {
          filter.id = this.state.output;
        }
      }
      filter = this.calculateFilter(filter);
      const nameFieldSelectObj = helper.transformModelSelectField(
        this.state.schema.modelSelectField
      );
      const rs: any = await helper.callPageApi(
        this.pageInfo,
        this.state.schema?.api,
        {
          select: Object.keys(nameFieldSelectObj).join(",").toString(),
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
            (get(rs, "data.count", 0) + params.pageSize - 1) / params.pageSize
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
      return {
        data: [],
        success: true,
        total: 0,
      } as RequestData<any>;
    }
  };

  transformFied() {
    const selectField: string = this.props.schema.modelSelectField;
    if (!selectField) return "id,name";
    return selectField
      .split(",")
      .map((item) => {
        const [key] = item.split("$$");
        return key;
      })
      .join(",");
  }

  fetchItemName = async (pageInfo: any, schema: any, output: any) => {
    if (!pageInfo || !schema || !output || !output.length) return;
    const filter: Record<string, any> = {};
    filter.id = output;
    var indexMap: any = {};
    output.forEach((item: any, index: number) => (indexMap[item] = index));
    try {
      const rs: any = await helper.callPageApi(pageInfo, schema.api, {
        queryInput: JSON.stringify(filter),
        select: this.transformFied(),
      });
      let mapData = rs?.data?.data
        ?.sort((a: any, b: any) => indexMap[a.id] - indexMap[b.id])
        .map((item: any, index: number) => {
          return { ...item, index: index + 1 };
        });
      this.props.onChange?.(output);
      this.setState({
        names: mapData,
      });
    } catch (err) {
      console.error(`🚀 ~ file: ArrayModelSort.tsx ~ line 176 ~ err`, err);
    }
  };

  calculateCheck(data: any, output: any) {
    data.map((d: any) => {
      if (includes(output, d.id)) return (d.checked = true);
      return (d.checked = false);
    });
    return data;
  }

  calculateColumns(schema: any, sort?: boolean) {
    const cols: any = [];
    if (sort) {
      cols.push({
        title: "Sort",
        dataIndex: "sort",
        width: 60,
        className: "drag-visible",
        render: () => <DragHandle />,
      });
    }
    const nameFieldSelectObj: any = helper.transformModelSelectField(
      schema.modelSelectField
    );
    const keyFieldsImage = ["images", "image", "avatar", "logo", "icon"];
    Object.keys(nameFieldSelectObj).map((keyField: string) => {
      cols.push({
        title: nameFieldSelectObj[keyField],
        dataIndex: keyField,
        sorter: sort ? false : true,
        render: keyFieldsImage.includes(keyField)
          ? (value: any) => {
              return (
                <Image
                  src={Array.isArray(value) ? value[0] : value}
                  width={70}
                />
              );
            }
          : undefined,
      });
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
          obj[f] = { contains: value };
        }
      }
      return 0;
    });
    return obj;
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

  onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(
        this.state.names.slice(),
        oldIndex,
        newIndex
      )
        .filter((el: any) => !!el)
        .map((item: any, index: number) => {
          return {
            ...item,
            index: index + 1,
          };
        });
      this.setState({ names: newData }, () => {
        this.props.onChange?.(newData.map((i: any) => i.id));
      });
    }
  };

  DraggableContainer = (props: SortableContainerProps) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={this.onSortEnd}
      {...props}
    />
  );

  DraggableBodyRow: React.FC<any> = ({ className, style, ...restProps }) => {
    const index = this.state.names.findIndex(
      (x) => x.index == restProps["data-row-key"]
    );
    return <SortableItem index={index} {...restProps} />;
  };

  render() {
    const { loading, output } = this.state;
    const rowSelection = {
      selectedRowKeys: output,
      onSelect: (record: any, selected: boolean, selectedRows: any[]) => {
        let newOutput = output;
        if (!selected) {
          newOutput = newOutput.filter((i: any) => i != record.id);
        } else {
          newOutput.push(record.id);
        }
        newOutput = _.uniq(newOutput);
        this.setState({ output: newOutput });
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
        this.fetchItemName(this.pageInfo, this.state.schema, newOutput);
      },
    };
    const hasSelected = (this.state.names || []).length > 0;
    return (
      <div className="gx-array-model">
        <div className="gx-array-model-display">
          {this.renderNames()}
          <Badge count={this.state.names?.length ?? 0}>
            <Tag
              style={{
                background: "#fff",
                borderStyle: "dashed",
                cursor: "pointer",
              }}
              onClick={() => {
                if (!this.props.disabled) this.toggle();
              }}
            >
              <PlusOutlined />
              {` Chọn...`}
            </Tag>
          </Badge>
        </div>
        <Modal
          width={`85vw`}
          style={{ top: 20 }}
          visible={this.state.modal}
          title="Chọn"
          onCancel={this.toggle}
          footer={null}
        >
          <Row gutter={16}>
            <Col span={11}>
              <ProTable
                actionRef={this.actionRef as any}
                formRef={this.form}
                tableClassName="gx-table-responsive"
                request={this.fetchData}
                search={true}
                headerTitle={"Danh sách đơn vị"}
                rowKey="id"
                toolBarRender={false}
                tableAlertRender={false}
                pagination={this.state.pagination}
                columns={this.state.columns}
                loading={this.state.loading}
                rowSelection={rowSelection}
                dateFormatter="string"
                type="table"
              />
            </Col>
            <Col span={1}>
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <DoubleRightOutlined />
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  marginBottom: 40,
                  marginTop: 30,
                }}
              >
                <span style={{ marginRight: 12 }}>
                  {" "}
                  {hasSelected
                    ? `${output.length} bản ghi được chọn`
                    : "0 bản ghi được chọn"}
                </span>
                <Button
                  type="dashed"
                  danger
                  loading={loading}
                  onClick={this.start}
                  disabled={!hasSelected}
                >
                  Xóa Chọn
                </Button>
              </div>
              <Table
                scroll={{ y: 600 }}
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 5,
                }}
                pagination={false}
                dataSource={this.state.names}
                columns={this.state.columnsSort}
                rowKey="index"
                components={{
                  body: {
                    wrapper: this.DraggableContainer,
                    row: this.DraggableBodyRow,
                  },
                }}
              />
            </Col>
          </Row>
        </Modal>
      </div>
    );
  }
}

export default ArrayModelSort;
