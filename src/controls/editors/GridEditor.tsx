import { Component } from "react";
import { Button, Col, Input, Row, Select, Tooltip } from "antd";
import { DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import clone from "lodash/clone";
import Widgets from "@src/packages/pro-component/widget";
import OrderableList from "./OrderableList";
import ArrayEditor from "./ArrayEditor";
import { DATA_TYPES } from "@src/constants/constants";
import { DATA_TYPE, GRID_EDITOR_FIELD } from "@src/constants/enums";
import { IGridSetting } from "@src/routes/default/pageManager/PageEditor";
import GridSetting from "../settings/GridSetting";
import * as detailTemplateArray from "../layouts/detailTemplate";
export const DEFAULT_VIEW_DETAIL = "DetailCtrl";

interface GridEditorProps {
  name?: string;
  data?: any;
  apis?: any;
  settings: IGridSetting;
  onChange?: (val: any) => void;
  onSettingChange: (settingGrid: IGridSetting) => void;
}

export interface IGridEditorColumn {
  name: string;
  field: string;
  type: DATA_TYPE & "integer";
  fieldType?: string;
  width?: number;
  /**
   * @property {color}
   * @description thuoc tinh mau cho modeSelectApi chua trien khai
   */
  color?: string;
  enumable?: string;
  items?: Array<any>;
  modelSelect?: string;
  modelSelectApi?: string;
  display?: string;
  filterable?: boolean;
  bindButton?: string;
  filterRange?: string;
  sorter?: boolean;
  hideInTable?: boolean;
  hideInSetting?: boolean;
  // hideInSearch,
  filters?: boolean; // lọc trên cột
  fixed?: "left" | "right" | "none";
  copyable?: boolean;
  ellipsis?: boolean;
  menuButton?: boolean;
  menuButtonConditon?: number;
  accurate?: string;
  // nhúng chi tiết
  viewDetail?: boolean;
  // chi tiet template
  viewDetailCtrl?: string;
}

export const COLUMN_ACTIONS_FIELD = "--ACTIONS--";
export const COLUMN_ACTIONS_NAME = "Tác vụ";
export const DEFAULT_MENU_BUTTONS = 4;

export interface GridEditorState {
  data: any;
  apis: any;
  currentItem: any;
  currentIndex: any;
  error: any;
  pIndex?: any;
  visibleSetting: boolean;
}

const populateData = (data: Array<any>) => {
  const dataWithActionCol = clone(data || []);
  if (
    dataWithActionCol.length > 0 &&
    !dataWithActionCol.find((col: any) => col.field == COLUMN_ACTIONS_FIELD)
  ) {
    dataWithActionCol.push({
      name: COLUMN_ACTIONS_NAME,
      field: COLUMN_ACTIONS_FIELD,
    });
  }
  return dataWithActionCol;
};
class GridEditor extends Component<GridEditorProps, GridEditorState> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: populateData(props.data),
      apis: this.props.apis || [],
      currentItem: null,
      currentIndex: 0,
      error: null,
      visibleSetting: false,
    };
  }

  static getDerivedStateFromProps(
    nextProps: GridEditorProps,
    prevState: GridEditorState
  ) {
    if (nextProps.data !== prevState.data) {
      return { data: populateData(nextProps.data) };
    }
    if (nextProps.apis !== prevState.apis) {
      return { apis: nextProps.apis };
    } else return null; // Triggers no change in the state
  }

  onPropertyClick(property: any) {
    this.setState({ pIndex: property });
  }

  onChange(dt: IGridEditorColumn[]) {
    if (this.props.onChange) {
      this.props.onChange(dt);
    }
  }

  toogleSetting = () => {
    this.setState({ visibleSetting: !this.state.visibleSetting });
  };

  addItem = () => {
    const dt = this.state.data.splice(0);
    dt.push({});
    this.onChange(dt);
  };

  onItemDataChanged = (name: GRID_EDITOR_FIELD, val: any) => {
    const dt = this.state.data.splice(0);
    dt[this.state.currentIndex][name] = val;
    this.onChange(dt);
  };

  onSettingChange = (name: any, val: any) => {
    const settings: any = clone(this.props.settings);
    settings[name] = val;
    if (this.props.onSettingChange) {
      this.props.onSettingChange(settings);
    }
  };

  deleteProperty = () => {
    const dt = this.state.data.splice(0);
    dt.splice(this.state.currentIndex, 1);
    let currentIndex = this.state.currentIndex;
    currentIndex--;
    if (currentIndex < 0) currentIndex = 0;
    this.setState({ currentIndex });
    this.onChange(dt);
  };

  chooseDisplays = (type: DATA_TYPE) => {
    switch (type) {
      case DATA_TYPE.DATE:
        return ["date", "dateRange", "dateTimeRange", "dateTime", "time"];
      case DATA_TYPE.NUMBER:
        return [
          "digit",
          "money",
          "progress",
          "percent",
          "index",
          "indexBorder",
        ];
      case DATA_TYPE.BOOLEAN:
        return ["switch", "radio", "radioGroup"];
      case DATA_TYPE.STRING:
        return ["text", "textarea", "avatar", "code", "image", "html", "password"];
      default:
        return ["option"];
    }
  };

  renderDisplay = ({
    type,
    currentItem,
    rowStyles = {},
    labelCols = {},
    inputCols = {},
  }: {
    // display: ProColumnsValueType
    type: DATA_TYPE;
    currentItem: Record<string, any>;
    rowStyles?: Record<string, any>;
    labelCols?: Record<string, any>;
    inputCols?: Record<string, any>;
  }) => {
    const valueTypes = this.chooseDisplays(type);
    return (
      <Row
        {...rowStyles}
        style={{ marginLeft: 0, marginRight: 0 }}
        align="middle"
        justify="end"
      >
        <Col {...labelCols}>
          <label>Hiển thị</label>
        </Col>
        <Col {...inputCols}>
          <Select
            style={{ minWidth: "150px" }}
            value={currentItem.display || valueTypes[0]}
            onChange={(e) => {
              this.onItemDataChanged(GRID_EDITOR_FIELD.DISPLAY, e);
            }}
          >
            {valueTypes.map((d, index) => (
              <Select.Option key={index} value={d}>
                {d}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    );
  };

  renderActionColumn = ({
    currentItem,
    rowStyles = {},
    labelCols = {},
    inputCols = {},
  }: {
    currentItem: IGridEditorColumn;
    rowStyles?: Record<string, any>;
    labelCols?: Record<string, any>;
    inputCols?: Record<string, any>;
  }) => {
    return (
      <>
        <Row {...rowStyles} className="gx-mt-2" align="middle">
          <Col {...labelCols}>
            <label>Tên</label>
          </Col>
          <Col {...inputCols}>
            <Input
              value={currentItem.name || ""}
              type="text"
              required
              onChange={(e) => {
                this.onItemDataChanged(GRID_EDITOR_FIELD.NAME, e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row {...rowStyles} className="gx-mt-2" align="middle">
          <Col {...labelCols}>
            <label>Trường dữ liệu</label>
          </Col>
          <Col {...inputCols}>
            <Input
              disabled
              value={currentItem.field || ""}
              type="text"
              required
              onChange={(e) => {
                this.onItemDataChanged(GRID_EDITOR_FIELD.FIELD, e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row {...rowStyles} className="gx-mt-2" align="middle">
          <Col {...labelCols}>
            <label>Thuộc tính</label>
          </Col>
          <Col {...inputCols}>
            <Row gutter={[16, 16]} align="middle">
              <Col>
                <Widgets.CheckboxWidget
                  checkedChildren="Menu Button"
                  unCheckedChildren="Menu Button"
                  value={
                    typeof currentItem.menuButton == "boolean"
                      ? currentItem.menuButton
                      : false
                  }
                  onChange={(val: any) => {
                    this.onItemDataChanged(GRID_EDITOR_FIELD.MENU_BUTTON, val);
                  }}
                />
              </Col>
              {currentItem.menuButton && (
                <Col>
                  {`Điều kiện: `}
                  <Input
                    placeholder="Điều kiện"
                    addonBefore=">="
                    value={
                      currentItem.menuButtonConditon || DEFAULT_MENU_BUTTONS
                    }
                    onChange={(e: any) => {
                      this.onItemDataChanged(
                        GRID_EDITOR_FIELD.MENU_BUTTON_CONDITION,
                        e.target.value
                      );
                    }}
                  />
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </>
    );
  };

  OrderableListSideBar = () => {
    return (
      <OrderableList
        name={"Cột"}
        items={this.state.data}
        renderItem={(item, index) => {
          return (
            <div
              className={`gx-editor-properties-item ${
                this.state.currentIndex === index ? "active" : ""
              }`}
              onClick={() => this.setState({ currentIndex: index })}
            >
              <div className="gx-editor-properties-row">
                <div className="gx-editor-avatar">
                  <div className="gx-status-pos">
                    {this.state.currentIndex === index ? (
                      <i className="icon icon-rendaring-calendar gx-pt-1" />
                    ) : (
                      <i className={`icon icon-circle gx-text-teal`} />
                    )}
                  </div>
                </div>
                <div className="gx-editor-orderable-col">
                  <div className="h4 gx-name">
                    {item.name || "Chưa đặt tên"} {item.required ? "*" : ""}
                  </div>
                  <div className="gx-editor-info-des gx-text-truncate">
                    {item.field}
                  </div>
                </div>
              </div>
            </div>
          );
        }}
        activeIndex={this.state.currentIndex}
        onChange={(result) => {
          const dt = result.items.splice(0);
          this.onChange(dt);
          this.setState({ currentIndex: result.activeIndex });
        }}
        headerButtons={() => {
          return (
            <Button
              type="primary"
              className="gx-btn-block"
              onClick={() => {
                this.addItem();
              }}
            >
              {" "}
              Thêm trường{" "}
            </Button>
          );
        }}
      />
    );
  };

  Editor = (currentItem: IGridEditorColumn) => {
    const rowStyles: any = {
      gutter: [16, 16],
    };
    const labelCols = {
      sm: 24,
      md: 6,
    };
    const inputCols = {
      sm: 24,
      md: 18,
    };

    return (
      <div className="gx-form-editor">
        <div className="gx-form-editor-header">
          <Row
            {...rowStyles}
            className="gx-mt-2"
            justify="space-between"
            align="middle"
          >
            <Col>
              <span>Thuộc tính </span>
            </Col>
            <Col>
              <Button
                type="primary"
                danger
                onClick={this.deleteProperty}
                icon={<DeleteOutlined />}
              >
                Xóa
              </Button>
            </Col>
          </Row>
        </div>
        <div className="gx-form-editor-content">
          {currentItem.field == COLUMN_ACTIONS_FIELD ? (
            this.renderActionColumn({
              currentItem,
              rowStyles,
              labelCols,
              inputCols,
            })
          ) : (
            <>
              <Row {...rowStyles} className="gx-mt-2" align="middle">
                <Col {...labelCols}>
                  <label>Tên</label>
                </Col>
                <Col {...inputCols}>
                  <Input
                    value={currentItem.name || ""}
                    type="text"
                    required
                    onChange={(e) => {
                      this.onItemDataChanged(
                        GRID_EDITOR_FIELD.NAME,
                        e.target.value
                      );
                    }}
                  />
                </Col>
              </Row>
              <Row {...rowStyles} className="gx-mt-2" align="middle">
                <Col {...labelCols}>
                  <label>Trường dữ liệu</label>
                </Col>
                <Col {...inputCols}>
                  <Input
                    value={currentItem.field || ""}
                    type="text"
                    required
                    onChange={(e) => {
                      this.onItemDataChanged(
                        GRID_EDITOR_FIELD.FIELD,
                        e.target.value
                      );
                    }}
                  />
                </Col>
              </Row>
              <Row {...rowStyles} className="gx-mt-2" align="middle">
                <Col {...labelCols}>
                  <label>Kiểu dữ liệu</label>
                </Col>
                <Col {...inputCols}>
                  <Row
                    style={{ marginLeft: 0, marginRight: 0 }}
                    justify="space-between"
                    align="middle"
                  >
                    <Col md={12}>
                      <Select
                        style={{ minWidth: "150px" }}
                        value={currentItem.type || "string"}
                        onChange={(e) => {
                          this.onItemDataChanged(GRID_EDITOR_FIELD.TYPE, e);
                        }}
                      >
                        <Select.Option key={-1} value={""}>
                          Chưa chọn
                        </Select.Option>
                        {DATA_TYPES.map((d, index) => (
                          <Select.Option key={index} value={d}>
                            {d}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>
                    <Col md={12}>
                      {this.renderDisplay({
                        type: currentItem[GRID_EDITOR_FIELD.TYPE],
                        currentItem: currentItem,
                        labelCols,
                      })}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row {...rowStyles} className="gx-mt-2" align="middle">
                <Col {...labelCols}>
                  <label>Độ rộng</label>
                </Col>
                <Col {...inputCols}>
                  <Input
                    value={currentItem.width || ""}
                    type="number"
                    required
                    onChange={(e) => {
                      this.onItemDataChanged(
                        GRID_EDITOR_FIELD.WIDTH,
                        e.target.value
                      );
                    }}
                  />
                </Col>
              </Row>
              <Row {...rowStyles} className="gx-mt-2" align="middle">
                <Col {...labelCols}>
                  <label>Danh sách có sẵn</label>
                </Col>
                <Col {...inputCols}>
                  <Widgets.CheckboxWidget
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Vô hiệu hoá"
                    value={
                      typeof currentItem.enumable == "boolean"
                        ? currentItem.enumable
                        : false
                    }
                    onChange={(val: any) => {
                      this.onItemDataChanged(GRID_EDITOR_FIELD.ENUMABLE, val);
                    }}
                  />
                </Col>
              </Row>
              {currentItem.enumable ? (
                <Row {...rowStyles} className="gx-mt-2" align="middle">
                  <Col {...labelCols}>
                    <label>Các lựa chọn</label>
                  </Col>
                  <Col {...inputCols}>
                    <ArrayEditor
                      value={currentItem.items || []}
                      onChange={(val) => {
                        this.onItemDataChanged(GRID_EDITOR_FIELD.ITEMS, val);
                      }}
                    />
                  </Col>
                </Row>
              ) : null}
              <Row {...rowStyles} className="gx-mt-2" align="middle">
                <Col {...labelCols}>
                  {/* <label>Danh sách chọn csdl</label> */}
                </Col>
                <Col {...inputCols}>
                  <Row gutter={[16, 0]}>
                    <Col>
                      <Widgets.CheckboxWidget
                        checkedChildren="Danh sách từ CSDL"
                        unCheckedChildren="Danh sách từ CSDL"
                        value={
                          typeof currentItem.modelSelect == "boolean"
                            ? currentItem.modelSelect
                            : false
                        }
                        onChange={(val: any) => {
                          this.onItemDataChanged(
                            GRID_EDITOR_FIELD.MODE_SELECT,
                            val
                          );
                        }}
                      />
                    </Col>
                    {currentItem.modelSelect ? (
                      <Col>
                        <Select
                          style={{ minWidth: "150px" }}
                          value={currentItem.modelSelectApi || ""}
                          onChange={(e) => {
                            this.onItemDataChanged(
                              GRID_EDITOR_FIELD.MODE_SELECT_API,
                              e
                            );
                          }}
                        >
                          <Select.Option key={-1} value={""}>
                            Chưa chọn
                          </Select.Option>
                          {this.props.apis.map((d: any) => (
                            <Select.Option key={d.name} value={d.name}>
                              {d.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Col>
                    ) : null}
                  </Row>
                </Col>
              </Row>
              <Row {...rowStyles} className="gx-mt-2" align="middle">
                <Col {...labelCols}>{/* <label>Cho phép lọc</label> */}</Col>
                <Col {...inputCols}>
                  <Row gutter={[16, 0]}>
                    <Col>
                      <Widgets.CheckboxWidget
                        checkedChildren="Lọc trên cột"
                        unCheckedChildren="Lọc trên cột"
                        value={
                          typeof currentItem.filters == "boolean"
                            ? currentItem.filters
                            : false
                        }
                        onChange={(val: any) => {
                          this.onItemDataChanged(
                            GRID_EDITOR_FIELD.FILTERS,
                            val
                          );
                        }}
                      />
                    </Col>
                    <Col>
                      <Widgets.CheckboxWidget
                        checkedChildren="Tìm kiếm trên form"
                        unCheckedChildren="Tìm kiếm trên form"
                        value={
                          typeof currentItem.filterable === "boolean"
                            ? currentItem.filterable
                            : false
                        }
                        onChange={(val: any) => {
                          this.onItemDataChanged(
                            GRID_EDITOR_FIELD.FILTERABLE,
                            val
                          );
                        }}
                      />
                    </Col>
                    {currentItem.filterable ? (
                      <Col>
                        <Widgets.CheckboxWidget
                          checkedChildren="Lọc theo khoảng"
                          unCheckedChildren="Lọc theo khoảng"
                          value={
                            typeof currentItem.filterRange == "boolean"
                              ? currentItem.filterRange
                              : false
                          }
                          onChange={(val: any) => {
                            this.onItemDataChanged(
                              GRID_EDITOR_FIELD.FILTER_RANGE,
                              val
                            );
                          }}
                        />
                      </Col>
                    ) : null}
                  </Row>
                </Col>
              </Row>
              <Row {...rowStyles} className="gx-mt-2" align="middle">
                <Col {...labelCols}>
                  <label>Fixed cột</label>
                </Col>
                <Col {...inputCols}>
                  <Widgets.RadioGroupWidget
                    valueEnum={{
                      none: { text: "Không", status: "Custom" },
                      left: { text: "Trái", status: "Custom" },
                      right: { text: "Phải", status: "Custom" },
                    }}
                    value={currentItem[GRID_EDITOR_FIELD.FIXED] || "none"}
                    onChange={(val: any) => {
                      this.onItemDataChanged(GRID_EDITOR_FIELD.FIXED, val);
                    }}
                  />
                </Col>
              </Row>
              <Row {...rowStyles} className="gx-mt-2" align="middle">
                <Col {...labelCols}>
                  <label>Thiết lập khác</label>
                </Col>
                <Col {...inputCols}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col>
                      <Widgets.CheckboxWidget
                        checkedChildren="Nhúng xem chi tiết"
                        unCheckedChildren="Nhúng xem chi tiết"
                        value={
                          typeof currentItem.viewDetail == "boolean"
                            ? currentItem.viewDetail
                            : false
                        }
                        onChange={(val: any) => {
                          this.onItemDataChanged(
                            GRID_EDITOR_FIELD.VIEW_DETAIL,
                            val
                          );
                        }}
                      />
                    </Col>
                    <Col>
                      <Widgets.CheckboxWidget
                        checkedChildren="Sắp xếp"
                        unCheckedChildren="Sắp xếp"
                        value={
                          typeof currentItem.sorter == "boolean"
                            ? currentItem.sorter
                            : true
                        }
                        onChange={(val: any) => {
                          this.onItemDataChanged(GRID_EDITOR_FIELD.SORTER, val);
                        }}
                      />
                    </Col>
                    <Col>
                      <Widgets.CheckboxWidget
                        checkedChildren="Ẩn vào setting table"
                        unCheckedChildren="Ẩn vào setting table"
                        value={
                          typeof currentItem[
                            GRID_EDITOR_FIELD.HIDE_IN_SETTING
                          ] == "boolean"
                            ? currentItem[GRID_EDITOR_FIELD.HIDE_IN_SETTING]
                            : false
                        }
                        onChange={(val: any) => {
                          this.onItemDataChanged(
                            GRID_EDITOR_FIELD.HIDE_IN_SETTING,
                            val
                          );
                        }}
                      />
                    </Col>
                    <Col>
                      <Widgets.CheckboxWidget
                        checkedChildren="Không hiện trên table"
                        unCheckedChildren="Không hiện trên table"
                        value={
                          typeof currentItem[GRID_EDITOR_FIELD.HIDE_IN_TABLE] ==
                          "boolean"
                            ? currentItem[GRID_EDITOR_FIELD.HIDE_IN_TABLE]
                            : false
                        }
                        onChange={(val: any) => {
                          this.onItemDataChanged(
                            GRID_EDITOR_FIELD.HIDE_IN_TABLE,
                            val
                          );
                        }}
                      />
                    </Col>
                    <Col>
                      <Widgets.CheckboxWidget
                        checkedChildren="Nút bấm thay thế"
                        unCheckedChildren="Nút bấm thay thế"
                        value={
                          typeof currentItem.bindButton == "boolean"
                            ? currentItem.bindButton
                            : false
                        }
                        onChange={(val: any) => {
                          this.onItemDataChanged(
                            GRID_EDITOR_FIELD.BIND_BUTTON,
                            val
                          );
                        }}
                      />
                    </Col>
                    <Col>
                      <Widgets.CheckboxWidget
                        checkedChildren="Nút copy"
                        unCheckedChildren="Nút copy"
                        value={
                          typeof currentItem.copyable == "boolean"
                            ? currentItem.copyable
                            : false
                        }
                        onChange={(val: any) => {
                          this.onItemDataChanged(
                            GRID_EDITOR_FIELD.COPYABLE,
                            val
                          );
                        }}
                      />
                    </Col>
                    <Col>
                      <Widgets.CheckboxWidget
                        checkedChildren="Dạng ellipsis"
                        unCheckedChildren="Dạng ellipsis"
                        value={
                          typeof currentItem.ellipsis == "boolean"
                            ? currentItem.ellipsis
                            : false
                        }
                        onChange={(val: any) => {
                          this.onItemDataChanged(
                            GRID_EDITOR_FIELD.ELLIPSIS,
                            val
                          );
                        }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              {currentItem.viewDetail && (
                <Row {...rowStyles} className="gx-mt-2" align="middle">
                  <Col {...labelCols}>
                    <label>Giao diện chi tiết</label>
                  </Col>
                  <Col {...inputCols}>
                    <Select
                      style={{ width: "100%" }}
                      value={currentItem.viewDetailCtrl || DEFAULT_VIEW_DETAIL}
                      onChange={(val: any) => {
                        this.onItemDataChanged(
                          GRID_EDITOR_FIELD.VIEW_DETAIL_CTRL,
                          val
                        );
                      }}
                    >
                      {Object.keys(detailTemplateArray).map((temp) => (
                        <Select.Option key={temp} value={temp}>
                          {temp}
                        </Select.Option>
                      ))}
                    </Select>
                    {/* <Widgets.RadioGroupWidget
                      valueEnum={{
                        none: { text: 'Không', status: 'Custom' },
                        left: { text: 'Trái', status: 'Custom' },
                        right: { text: 'Phải', status: 'Custom' },
                      }}
                      value={currentItem[GRID_EDITOR_FIELD.FIXED] || 'none'}
                      onChange={(val: any) => {
                        this.onItemDataChanged(GRID_EDITOR_FIELD.FIXED, val)
                      }}
                    /> */}
                  </Col>
                </Row>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  render() {
    const currentItem = this.state.data[this.state.currentIndex];
    return (
      <>
        <div className="gx-main-content">
          <div className="gx-editor-module">
            <div className="gx-editor-sidenav gx-d-lg-flex">
              {this.OrderableListSideBar()}
            </div>
            <div className="gx-editor-box">
              <div className="gx-editor-box-header">
                <div className="gx-editor-box-header-info">
                  <h5 className="gx-text-uppercase gx-font-weight-bold">
                    Table
                  </h5>
                  <div className="gx-font-weight-semi-bold">
                    Quản lý hiển thị bảng dữ liệu
                  </div>
                </div>
                <div className="gx-editor-box-header-setting">
                  <Tooltip title="Thiết lập Grid">
                    <SettingOutlined onClick={this.toogleSetting} />
                  </Tooltip>
                </div>
              </div>
              <div className="gx-editor-box-content">
                {currentItem ? this.Editor(currentItem) : null}
              </div>
            </div>
          </div>
        </div>
        <GridSetting
          name={this.props.name}
          drawerVisible={this.state.visibleSetting}
          onClose={() => {
            this.toogleSetting();
          }}
          settings={this.props.settings}
          onChange={this.onSettingChange}
        />
      </>
    );
  }
}

export default GridEditor;
