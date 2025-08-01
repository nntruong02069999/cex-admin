import React, { Component } from "react";
import { Button, Input, Select, Row, Col, Tooltip, Checkbox } from "antd";
import { DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import clone from "lodash/clone";
import Widgets from "@src/packages/pro-component/widget";
import ArrayEditor from "./ArrayEditor";
import OrderableList from "./OrderableList";
import SchemaSetting from "../settings/SchemaSetting";
import { ISchemaSetting } from "@src/routes/default/pageManager/PageEditor";
import IntroConfigEditor from "../settings/IntroConfigEditor";

const widgets = {
  string: [
    "Enum",
    "EnumByUser",
    "Text",
    "TextArea",
    "Image",
    "Location",
    "SuggestLocation",
    "RichText",
    "ArrayImage",
    "InputTag",
    "ColorPicker",
    "Password",
    "Captcha",
    "Explain",
    "Icon",
    "Json",
  ],
  boolean: ["Checkbox"],
  number: [
    "Text",
    "DateTime",
    "Date",
    "Time",
    "Enum",
    "SingleModel",
    "ArrayModel",
    "ArrayModelSort",
    "ArraySelect",
    "SingleSelect",
    "Upload",
    "NumberMask",
  ],
};
const dataTypes = ["string", "number", "boolean"];

export interface ISchemaEditorProperties {
  name: string;
  field: string;
  disabled?: boolean;
  required?: boolean;
  modeSelectField?: string;
  pageId?: number;
  type: string;
  widget: string;
  imageWidth?: number;
  imageHeight?: number;
  items?: Array<Record<string, any>>;
  intro?: string | {
    content: string;
    type: 'text' | 'html';
    collapsible?: boolean;
    defaultExpanded?: boolean;
    maxLines?: number;
    showToggle?: boolean;
  };
  api?: string;
  modelSelectMultiple?: boolean;
  modelSelectField?: string;
  hideExpression?: any;
  default?: any;
  embed?: any;
  flex?: string;
  maxWidth?: string;
  minDate?: boolean;
  showMap?: boolean;
}

class SchemaEditor extends Component<
  {
    apis?: any;
    schema: ISchemaEditorProperties[] | Array<Record<string, any>>;
    settings: ISchemaSetting;
    onChange?: (val: any) => void;
    onSettingChange: (settingSchema: ISchemaSetting) => void;
  },
  {
    currentIndex: any;
    schema?: any;
    visibleSetting: boolean;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentIndex: 0,
      visibleSetting: false,
    };
  }

  onPropertyClick = (property: any) => {
    this.setState({ currentIndex: property });
  };

  onPropertyDataChange = (name: any, val: any) => {
    const schema: any = this.props.schema.splice(0);
    schema[this.state.currentIndex][name] = val;
    this.onChange(schema);
  };

  onSettingChange = (name: string, val: any) => {
    const settings: any = clone(this.props.settings);
    settings[name] = val;
    if (this.props.onSettingChange) {
      this.props.onSettingChange(settings);
    }
  };

  addItem = () => {
    const dt: any = this.props.schema.splice(0);
    dt.push({});
    this.onChange(dt);
  };

  deleteProperty = () => {
    const dt = this.props.schema.splice(0);
    dt.splice(this.state.currentIndex, 1);
    this.onChange(dt);
  };

  onChange = (dt: any) => {
    if (this.props.onChange) {
      this.props.onChange(dt);
    }
  };

  toogleSetting = () => {
    this.setState({ visibleSetting: !this.state.visibleSetting });
  };

  OrderableListSideBar = () => {
    return (
      <OrderableList
        name={"Thuộc tính"}
        items={this.props.schema}
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
          const dt = clone(result.items);
          this.onChange(dt);
          this.setState({
            schema: dt,
            currentIndex: result.activeIndex,
          });
        }}
        headerButtons={() => {
          // return <PlusOutlined onClick={this.addItem.bind(this)} />
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


  Editor = (currentProperty: ISchemaEditorProperties) => {
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
          <Row {...rowStyles} className="gx-mt-2" justify="space-between">
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
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Tên</label>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentProperty.name || ""}
                type="text"
                placeholder="Tên"
                required
                onChange={(e) => {
                  this.onPropertyDataChange("name", e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Trường dữ liệu</label>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentProperty.field || ""}
                type="text"
                placeholder="Trường dữ liệu"
                required
                onChange={(e) => {
                  this.onPropertyDataChange("field", e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Kiểu dữ liệu</label>
            </Col>
            <Col {...inputCols}>
              <Select
                value={currentProperty.type || ""}
                onChange={(val) => {
                  this.onPropertyDataChange("type", val);
                }}
              >
                <Select.Option key={-1} value={""}>
                  Chưa chọn
                </Select.Option>
                {dataTypes.map((d, index) => (
                  <Select.Option key={index} value={d}>
                    {d}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Hướng dẫn</label>
            </Col>
            <Col {...inputCols}>
              <IntroConfigEditor
                value={currentProperty.intro}
                onChange={(value) => {
                  this.onPropertyDataChange("intro", value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Trường bắt buộc</label>
            </Col>
            <Col {...inputCols}>
              <Widgets.CheckboxWidget
                value={currentProperty.required || false}
                onChange={(val: any) => {
                  this.onPropertyDataChange("required", val);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Vô hiệu hóa</label>
            </Col>
            <Col {...inputCols}>
              <Widgets.CheckboxWidget
                value={currentProperty.disabled || false}
                onChange={(val: any) => {
                  this.onPropertyDataChange("disabled", val);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Kiểu giao diện</label>
            </Col>
            <Col>
              <Select
                style={{ minWidth: "150px" }}
                value={currentProperty.widget || ""}
                onChange={(e) => {
                  this.onPropertyDataChange("widget", e);
                }}
              >
                <Select.Option key={-1} value={""}>
                  Chưa chọn
                </Select.Option>
                {((widgets as any)[currentProperty.type] || []).map(
                  (u: any, schemaIndex: number) => (
                    <Select.Option key={schemaIndex} value={u}>
                      {u}
                    </Select.Option>
                  )
                )}
              </Select>
            </Col>
            {["DateTime", "Date"].includes(currentProperty.widget) && (
              <Col>
                <Checkbox
                  checked={currentProperty.minDate ?? false}
                  onChange={(e) => this.onPropertyDataChange("minDate", e.target.checked)}
                >
                  {">= ngày hiện tại"}
                </Checkbox>
              </Col>
            )}
            {["SuggestLocation"].includes(currentProperty.widget) && (
              <Col>
                <Checkbox
                  checked={currentProperty.showMap ?? false}
                  onChange={(e) => this.onPropertyDataChange("showMap", e.target.checked)}
                >
                  Hiện thị bản đồ
                </Checkbox>
              </Col>
            )}
          </Row>
          {currentProperty.widget === "Image" ||
          currentProperty.widget === "ArrayImage" ? (
            <React.Fragment>
              <Row {...rowStyles} className="gx-mt-2">
                <Col {...labelCols}>
                  <label>Chiều rộng (width)</label>
                </Col>
                <Col {...inputCols}>
                  <Input
                    value={currentProperty.imageWidth}
                    type="text"
                    required
                    onChange={(e) => {
                      this.onPropertyDataChange("imageWidth", e.target.value);
                    }}
                  />
                </Col>
              </Row>
              <Row {...rowStyles} className="gx-mt-2">
                <Col {...labelCols}>
                  <label>Chiều cao (height)</label>
                </Col>
                <Col {...inputCols}>
                  <Input
                    value={currentProperty.imageHeight}
                    type="text"
                    required
                    onChange={(e) => {
                      this.onPropertyDataChange("imageHeight", e.target.value);
                    }}
                  />
                </Col>
              </Row>
            </React.Fragment>
          ) : null}
          {currentProperty.widget === "Enum" ? (
            <React.Fragment>
              <Row {...rowStyles} className="gx-mt-2">
                <Col {...labelCols}>
                  <label>Các lựa chọn</label>
                </Col>
                <Col {...inputCols}>
                  <ArrayEditor
                    value={currentProperty.items}
                    onChange={(val) => {
                      this.onPropertyDataChange("items", val);
                    }}
                  />
                </Col>
              </Row>
            </React.Fragment>
          ) : null}
          {[
            "SingleModel",
            "ArrayModel",
            "ArrayModelSort",
            "ArraySelect",
            "SingleSelect",
          ].includes(currentProperty.widget) ? (
            <React.Fragment>
              <Row {...rowStyles} className="gx-mt-2">
                <Col {...labelCols}>
                  <label>Hàm lấy dữ liệu chọn</label>
                </Col>
                <Col {...inputCols}>
                  <Select
                    style={{ minWidth: "100px" }}
                    value={currentProperty.api}
                    onChange={(e) => {
                      this.onPropertyDataChange("api", e);
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
              {/* <Row {...rowStyles} className="gx-mt-2">
                <Col {...labelCols}>
                  <label>Chọn nhiều giá trị</label>
                </Col>
                <Col {...inputCols}>
                  <Widgets.CheckboxWidget
                    value={currentProperty.modelSelectMultiple}
                    onChange={(val: any) => {
                      this.onPropertyDataChange('modelSelectMultiple', val)
                    }}
                  />
                </Col>
              </Row> */}
              <Row {...rowStyles} className="gx-mt-2">
                <Col {...labelCols}>
                  <label>Hiển thị các trường dữ liệu</label>
                </Col>
                <Col {...inputCols}>
                  <Input
                    value={currentProperty.modelSelectField}
                    type="text"
                    placeholder="Tiêu đề"
                    required
                    onChange={(e) => {
                      this.onPropertyDataChange(
                        "modelSelectField",
                        e.target.value
                      );
                    }}
                  />
                </Col>
              </Row>
            </React.Fragment>
          ) : null}
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Điều kiện ẩn</label>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentProperty.hideExpression}
                type="text"
                placeholder="Điều kiện ẩn"
                required
                onChange={(e) => {
                  this.onPropertyDataChange("hideExpression", e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Mặc định</label>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentProperty.default || ""}
                type="text"
                placeholder="Giá trị mặc định"
                required
                onChange={(e) => {
                  this.onPropertyDataChange("default", e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Dữ liệu nhúng</label>
            </Col>
            <Col {...inputCols}>
              <ArrayEditor
                value={currentProperty.embed || []}
                onChange={(val) => {
                  this.onPropertyDataChange("embed", val);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className="gx-mt-2">
            <Col {...labelCols}>
              <label>Thuộc tính cột</label>
            </Col>
            <Col {...inputCols}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Input
                    value={currentProperty.flex || ""}
                    type="text"
                    placeholder="Flex"
                    required
                    onChange={(e) => {
                      this.onPropertyDataChange("flex", e.target.value);
                    }}
                  />
                  <span className="gx-text-light">0 0 100%</span>
                </Col>
                <Col span={12}>
                  <Input
                    value={currentProperty.maxWidth || ""}
                    type="text"
                    placeholder="Độ rộng"
                    required
                    onChange={(e) => {
                      this.onPropertyDataChange("maxWidth", e.target.value);
                    }}
                  />
                  <span className="gx-text-light">% or px</span>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  render() {
    const currentProperty = (this.props?.schema ?? {})[this.state.currentIndex];
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
                    Form
                  </h5>
                  <div className="gx-font-weight-semi-bold">Quản lý form</div>
                </div>
                <div className="gx-editor-box-header-setting">
                  <Tooltip title="Thiết lập Form">
                    <SettingOutlined onClick={this.toogleSetting} />
                  </Tooltip>
                </div>
              </div>
              <div className="gx-editor-box-content">
                {currentProperty
                  ? this.Editor(currentProperty as ISchemaEditorProperties)
                  : null}
              </div>
            </div>
          </div>
        </div>
        <SchemaSetting
          drawerVisible={this.state.visibleSetting}
          onClose={() => {
            this.toogleSetting();
          }}
          settings={this.props.settings}
          schema={this.props.schema as ISchemaEditorProperties[]}
          onChange={this.onSettingChange}
        />
      </>
    );
  }
}

export default SchemaEditor;
