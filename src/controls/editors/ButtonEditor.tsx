import React, { Component } from "react";
import { AutoComplete, Button, Col, Input, Row, Select } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Widgets from "@src/packages/pro-component/widget";
import SchemaWidgets from "@src/packages/pro-component/schema/Widgets";
import OrderableList from "./OrderableList";
import IconEditor from "./IconEditor";
import { ArrayIconType } from "@src/packages/pro-icon";
import AntdIcon from "@src/packages/pro-icon/antd";
import GaxonIcon from "@src/packages/pro-icon/gaxon";
import ColorPicker from "@src/containers/ColorPicker";
import defaultRenderButton from "../defaultRenderButton";

const buttonColors = ["default", "primary", "dashed", "text", "link"];

const options = [{ value: "edit" }, { value: "create" }];
export interface IButtonEditor {
  mode: string;
  title: string;
  isTitle?: boolean;
  color?: string;
  buttonType: "default" | "primary" | "dashed" | "text" | "link";
  icon?: {
    name: string;
    iconType: "antd" | "gaxon";
    show: boolean;
  };
  ghost?: boolean;
  danger?: boolean;
  size?: "large" | "middle" | "small";
  shape?: "default" | "circle" | "round";
  column?: string;
  disableExpression?: string;
  hideExpression?: string;
  condition?: string;
  action?: "api" | "url" | "report" | "formModal" | "iframe";
  modalQuery?: string;
  api?: string;
  roles?: string;
  confirm?: string;
  backOnDone?: boolean;
  embedUrl?: string;
  url?: string;
  type?: "button" | "submit" | "switch" | "icon";
}

class ButtonEditor extends Component<
  {
    apis?: any;
    data?: any;
    onChange?: (val: any) => void;
  },
  {
    data?: any;
    apis?: any;
    currentItem: any;
    currentIndex: number;
    pIndex?: number;
    visibleIcons?: boolean;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentItem: null,
      currentIndex: 0,
      visibleIcons: false,
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(next: any) {
    this.setState({ data: next.data || [], apis: next.apis || [] });
  }

  onPropertyClick = (property: any) => {
    this.setState({ pIndex: property });
  };

  addItem = () => {
    const dt = this.props.data.splice(0);
    dt.push({});
    this.onChange(dt);
  };

  onItemDataChanged = (name: string, val: any) => {
    const dt = this.props.data.splice(0);
    dt[this.state.currentIndex][name] = val;
    this.onChange(dt);
  };

  onItemsDataChanged = (
    params: Array<{
      name: string;
      val: any;
    }>
  ) => {
    const dt = this.props.data.splice(0);
    params.forEach(({ name, val }) => {
      dt[this.state.currentIndex][name] = val;
    });
    this.onChange(dt);
  };

  deleteProperty = () => {
    const dt = this.props.data.splice(0);
    dt.splice(this.state.currentIndex, 1);
    let currentIndex = this.state.currentIndex;
    currentIndex--;
    if (currentIndex < 0) currentIndex = 0;
    this.setState({ currentIndex });
    this.onChange(dt);
  };

  onChange(dt: any) {
    if (this.props.onChange) {
      this.props.onChange(dt);
    }
  }

  OrderableListSideBar = () => {
    return (
      <OrderableList
        name={"Thuộc tính"}
        items={this.props.data}
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
                    {item.title ? defaultRenderButton(item) : "Chưa đặt tên"}
                  </div>
                  <div className="gx-editor-info-des gx-text-truncate">
                    {item.mode}
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

  Editor = (currentItem: IButtonEditor) => {
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
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Chế độ</span>
            </Col>
            <Col {...inputCols}>
              {/* <Input
                value={currentItem.mode || ''}
                type="text"
                required
                onChange={(e) => {
                  this.onItemDataChanged('mode', e.target.value)
                }}
              /> */}
              <AutoComplete
                value={currentItem.mode || ""}
                options={options}
                style={{ width: "100%" }}
                onChange={(e) => {
                  this.onItemDataChanged("mode", e);
                }}
                filterOption={(inputValue, option) =>
                  option!.value
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                }
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Tên</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentItem.title || ""}
                type="text"
                required
                onChange={(e) => {
                  this.onItemDataChanged("title", e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Các thuộc tính</span>
            </Col>
            <Col {...inputCols}>
              <Row
                // style={{ marginLeft: '10px', marginRight: '10px' }}
                gutter={[16, 16]}
                align="middle"
              >
                <Col span={6}>
                  <div className="gx-d-inline-flex gx-align-items-center">
                    <span>Nền:{` `}</span>
                    <ColorPicker
                      type="sketch"
                      small
                      color={currentItem.color || "#fff"}
                      position="top"
                      presetColors={[
                        "#038fde",
                        "#722ED1",
                        "#2F54EB",
                        "#1890FF",
                        "#13C2C2",
                        "#EB2F96",
                        "#F5222D",
                        "#FA541C",
                        "#FA8C16",
                        "#FAAD14",
                        "#FADB14",
                        "#A0D911",
                        "#52C41A",
                      ]}
                      onChangeComplete={(color: string) =>
                        this.onItemDataChanged("color", color)
                      }
                    >
                      {currentItem.color
                        ? currentItem.color.replace(/-/g, " ")
                        : ""}
                    </ColorPicker>
                    {currentItem.color != "" && (
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          this.onItemDataChanged("color", "");
                        }}
                      >
                        Reset
                      </a>
                    )}
                  </div>
                </Col>
                <Col span={6}>
                  <span>Loại:{` `}</span>
                  <Select
                    // style={{ minWidth: '100px' }}
                    value={currentItem.buttonType || "primary"}
                    onChange={(e: any) => {
                      this.onItemDataChanged("buttonType", e);
                    }}
                  >
                    {buttonColors.map((d, index) => (
                      <Select.Option key={index} value={d}>
                        {d}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col span={6}>
                  <span>Size:{` `}</span>
                  <Select
                    // style={{ minWidth: '100px' }}
                    value={currentItem.size || "middle"}
                    onChange={(e: any) => {
                      this.onItemDataChanged("size", e);
                    }}
                  >
                    <Select.Option key={"large"} value={"large"}>
                      {"large"}
                    </Select.Option>
                    <Select.Option key={"middle"} value={"middle"}>
                      {"middle"}
                    </Select.Option>
                    <Select.Option key={"small"} value={"small"}>
                      {"small"}
                    </Select.Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <span>Shape:{` `}</span>
                  <Select
                    // style={{ minWidth: '100px' }}
                    value={currentItem.shape || "default"}
                    onChange={(e: any) => {
                      this.onItemDataChanged("shape", e);
                    }}
                  >
                    <Select.Option key={"default"} value={"default"}>
                      {"default"}
                    </Select.Option>
                    <Select.Option key={"circle"} value={"circle"}>
                      {"circle"}
                    </Select.Option>
                    <Select.Option key={"round"} value={"round"}>
                      {"round"}
                    </Select.Option>
                  </Select>
                </Col>
                <Col span={3}>
                  <Widgets.CheckboxWidget
                    checkedChildren="Danger"
                    unCheckedChildren="Danger"
                    value={currentItem.danger || false}
                    onChange={(val: any) => {
                      this.onItemDataChanged("danger", val);
                    }}
                  />
                </Col>
                <Col span={3}>
                  <Widgets.CheckboxWidget
                    checkedChildren="Ghost"
                    unCheckedChildren="Ghost"
                    value={currentItem.ghost || false}
                    onChange={(val: any) => {
                      this.onItemDataChanged("ghost", val);
                    }}
                  />
                </Col>
                <Col span={4}>
                  <Widgets.CheckboxWidget
                    checkedChildren="Hiện icon"
                    unCheckedChildren="Hiện icon"
                    value={currentItem.icon?.show || false}
                    onChange={(val: boolean) => {
                      this.onItemsDataChanged([
                        {
                          name: "icon",
                          val: {
                            ...currentItem.icon,
                            show: val,
                          },
                        },
                      ]);
                    }}
                  />
                </Col>
                <Col span={6}>
                  <Widgets.CheckboxWidget
                    checkedChildren="Hiện tiêu đề"
                    unCheckedChildren="Hiện tiêu đề"
                    value={
                      typeof currentItem.isTitle == "undefined"
                        ? true
                        : currentItem.isTitle
                    }
                    onChange={(val: boolean) => {
                      this.onItemDataChanged("isTitle", val);
                    }}
                  />
                </Col>
                {/* <Col span={4}>a</Col>
                <Col span={4}>ab</Col>
                <Col span={4}>abc</Col> */}
              </Row>
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Biểu tượng</span>
            </Col>
            <Col {...inputCols}>
              {currentItem.icon && typeof currentItem.icon == "object" ? (
                currentItem.icon.iconType == ArrayIconType.antd ? (
                  <AntdIcon
                    name={currentItem.icon.name}
                    style={{ fontSize: "24px" }}
                  />
                ) : (
                  <GaxonIcon
                    name={currentItem.icon.name}
                    style={{ fontSize: "24px" }}
                  />
                )
              ) : null}
              &nbsp;&nbsp;
              <a
                onClick={() => {
                  this.setState({ visibleIcons: true });
                }}
              >{`Chọn biểu tượng`}</a>
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <span>Phân quyền</span>
            </Col>
            <Col {...inputCols}>
              <SchemaWidgets.ArrayModel
                schema={{
                  pageId: 4,
                  modelSelectMultiple: true,
                  modelSelectField: "id,name",
                  api: "find_role",
                }}
                value={currentItem.roles || []}
                onChange={(e: any) => {
                  this.onItemDataChanged("roles", e);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Hiển thị trên cột</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentItem.column || ""}
                type="text"
                required
                onChange={(e) => {
                  this.onItemDataChanged("column", e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Điều kiện vô hiệu hóa</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentItem.disableExpression || ""}
                type="text"
                required
                onChange={(e) => {
                  this.onItemDataChanged("disableExpression", e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Điều kiện ẩn</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentItem.hideExpression || ""}
                type="text"
                required
                onChange={(e) => {
                  this.onItemDataChanged("hideExpression", e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Điều kiện hiển thị</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentItem.condition || ""}
                type="text"
                required
                onChange={(e) => {
                  this.onItemDataChanged("condition", e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Kích hoạt</span>
            </Col>
            <Col {...inputCols}>
              <Select
                style={{ minWidth: "150px" }}
                value={currentItem.action || ""}
                onChange={(e) => {
                  this.onItemDataChanged("action", e);
                }}
              >
                <Select.Option key={1} value={""}>
                  Chưa chọn
                </Select.Option>
                <Select.Option key={2} value={"api"}>
                  Gọi hàm
                </Select.Option>
                <Select.Option key={3} value={"url"}>
                  Chuyển hướng
                </Select.Option>
                <Select.Option key={3} value={"report"}>
                  Báo cáo
                </Select.Option>
                <Select.Option key={3} value={"formModal"}>
                  Popup
                </Select.Option>
                <Select.Option key={3} value={"iframe"}>
                  Mở iframe
                </Select.Option>
              </Select>
            </Col>
          </Row>
          {currentItem.action === "formModal" ? (
            <React.Fragment>
              <Row {...rowStyles} className="gx-mt-2" align="middle">
                <Col {...labelCols}>
                  <span>Dữ liệu nhúng</span>
                </Col>
                <Col {...inputCols}>
                  <Input
                    value={currentItem.modalQuery || ""}
                    type="text"
                    required
                    onChange={(e) => {
                      this.onItemDataChanged("modalQuery", e.target.value);
                    }}
                  />
                  Example:
                  <pre>
                    {JSON.stringify(
                      {
                        page: "id page",
                        mode: "edit",
                        id: "#id#",
                        modalQuery: "form or custom define",
                        embed: "object assgin to edit data from db",
                      },
                      null,
                      2
                    )}
                  </pre>
                </Col>
              </Row>
            </React.Fragment>
          ) : null}
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Gọi hàm</span>
            </Col>
            <Col {...inputCols}>
              <Select
                style={{ minWidth: "150px" }}
                value={currentItem.api || ""}
                onChange={(e) => {
                  this.onItemDataChanged("api", e);
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
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Xác nhận</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentItem.confirm || ""}
                type="text"
                required
                onChange={(e) => {
                  this.onItemDataChanged("confirm", e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Quay lại sau khi submit</span>
            </Col>
            <Col {...inputCols}>
              <Widgets.CheckboxWidget
                value={currentItem.backOnDone || false}
                onChange={(val: any) => {
                  this.onItemDataChanged("backOnDone", val);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Nhúng dữ liệu URL</span>
            </Col>
            <Col {...inputCols}>
              <Widgets.CheckboxWidget
                value={currentItem.embedUrl || false}
                onChange={(val: any) => {
                  this.onItemDataChanged("embedUrl", val);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Chuyển hướng</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentItem.url || ""}
                type="text"
                required
                onChange={(e) => {
                  this.onItemDataChanged("url", e.target.value);
                }}
              />
              Example:
              <pre>#/form?page=id_page&mode=edit&id=#id#</pre>
              <pre>#/form?page=id_page&mode=edit&id=$</pre>
              <pre>
                #/list?page=id_page&mode=report&id=#id#&filter=
                {JSON.stringify({ id: "#id#" })}
              </pre>
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2" align="middle">
            <Col {...labelCols}>
              <span>Kiểu nút</span>
            </Col>
            <Col {...inputCols}>
              <Select
                style={{ minWidth: "150px" }}
                value={currentItem.type || "button"}
                onChange={(e) => {
                  this.onItemDataChanged("type", e);
                }}
              >
                <Select.Option key={"type-button"} value={"button"}>
                  button
                </Select.Option>
                <Select.Option key={"type-submit"} value={"submit"}>
                  submit
                </Select.Option>
                <Select.Option key={"type-icon"} value={"icon"}>
                  icon
                </Select.Option>
                <Select.Option key={"type-switch"} value={"switch"}>
                  switch
                </Select.Option>
              </Select>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  render() {
    const currentItem = this.props.data[this.state.currentIndex];
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
                    Button
                  </h5>
                  <div className="gx-font-weight-semi-bold">
                    Quản lý nút bấm trong form
                  </div>
                </div>
                <div className="gx-editor-box-header-setting">
                  {/* <SettingOutlined /> */}
                </div>
              </div>
              <div className="gx-editor-box-content">
                {currentItem ? this.Editor(currentItem) : null}
              </div>
            </div>
          </div>
        </div>
        <IconEditor
          title={`CHỌN ICONS`}
          visible={this.state.visibleIcons || false}
          setVisible={(val: boolean) => {
            this.setState({ visibleIcons: val });
          }}
          onChange={(iconIdentity: string, iconType: string) => {
            this.onItemsDataChanged([
              {
                name: "icon",
                val: {
                  name: iconIdentity,
                  iconType,
                },
              },
            ]);
            this.setState({ visibleIcons: false });
          }}
        />
      </>
    );
  }
}

export default ButtonEditor;
