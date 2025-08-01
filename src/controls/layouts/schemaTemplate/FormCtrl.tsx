import React, { Component } from "react";
import { connect } from "dva";
import { StoreState } from "@src/interfaces";
import { helper } from "@src/controls/controlHelper";
import FormSchema, { FieldData } from "@src/packages/pro-component/schema/";
import Local from "@src/util/local";
import Loader from "@src/components/Loading";
import HttpStatusCode from "@src/constants/HttpStatusCode";
import { ISchemaEditorProperties } from "../../editors/SchemaEditor";
import clone from "lodash/clone";
import defaultRenderButton from "../../defaultRenderButton";
import {
  defaultPageInfo,
  defaultSchema,
  defaultSettings,
  IPageEditorProps,
} from "@src/routes/default/pageManager/PageEditor";
import Widget from "@src/components/Widget";

export interface FormCtrlProps {
  query?: any;
  onClose?: () => void;
  pageInfo?: IPageEditorProps;
  isModal?: boolean;
  authUser?: any;
}

export interface FormCtrlState {
  data: any;
  pageInfo: IPageEditorProps;
  error: any;
  loading: boolean;
  mode: any;
  fields: FieldData[];
}

class FormCtrl extends Component<FormCtrlProps, FormCtrlState> {
  constructor(props: FormCtrlProps) {
    super(props);
    this.state = {
      fields: [],
      data: props.query.embed ? JSON.parse(props.query.embed) : null,
      mode: props.query.mode,
      pageInfo: props.pageInfo || defaultPageInfo,
      error: null,
      loading: true,
    };
    this.formRef = React.createRef();
  }

  query: any;
  formRef: any;

  componentDidMount() {
    this.loadData();
  }

  static getDerivedStateFromProps(
    nextProps: FormCtrlProps,
    prevState: FormCtrlState
  ) {
    /* if (nextProps.query && nextProps.query.embed) {
      try {
        if (JSON.parse(nextProps.query.embed) !== prevState.data) {
          return { data: JSON.parse(nextProps.query.embed) }
        }
        return null
      } catch (error) {
        return null
      }
    }  */
    if (
      nextProps.query &&
      nextProps.query.embed &&
      JSON.parse(nextProps.query.embed) !== prevState.data
    ) {
      return { data: JSON.parse(nextProps.query.embed) };
    }
    if (
      nextProps.query &&
      nextProps.query.mode &&
      nextProps.query.mode !== prevState.mode
    ) {
      return { mode: nextProps.query.mode };
    } else return null; // Triggers no change in the state
  }

  getSnapshotBeforeUpdate(prevProps: FormCtrlProps, _prevState: FormCtrlState) {
    if (prevProps?.query?.page !== this.props?.query?.page) {
      return "update";
    }
    return null;
  }

  componentDidUpdate(
    prevProps: FormCtrlProps,
    _prevState: FormCtrlState,
    snapshot: any
  ) {
    if (snapshot !== null) {
      this.loadData(this.props);
    }
  }

  populateFields = (
    data: Record<string, any> = {},
    schemas: ISchemaEditorProperties[] = []
  ): FieldData[] => {
    const _fields: FieldData[] = [];
    schemas.forEach((item) => {
      const _field: FieldData = {
        name: item.field,
      };
      if (data[item.field]) {
        _field.value = data[item.field];
      }
      _fields.push(_field);
    });
    return _fields;
  };

  transformData = (fields: FieldData[] = []) => {
    const _data: Record<string, any> = clone(this.state.data || {});
    fields.forEach((field) => {
      const _value = field.value;
      if (Array.isArray(field.name)) {
        _data[field.name[field.name.length - 1]] = _value;
      } else {
        _data[field.name] = _value;
      }
    });
    return _data;
  };

  async loadData(props?: any) {
    if (!props) props = this.props;
    let pageInfo = clone(props.pageInfo);
    if (!pageInfo) {
      pageInfo = await helper.getPage(props.query.page);
      this.setState({
        pageInfo,
        mode: props.query.mode,
      });
    }
    if (props.query.mode === "create") {
      const { parentId, setId } = props.query;
      if (parentId || setId) {
        const fields = this.populateFields(
          { parentId, setId },
          pageInfo.schema
        );
        this.setState({ data: { parentId, setId }, fields });
      }
    }
    if (props.query.mode === "edit") {
      if (!props.query.id) {
        return this.setState({ error: "Không có thông tin để tải dữ liệu" });
      }
      const rs: any = await helper.callPageApi(pageInfo, pageInfo.read, {
        queryInput: JSON.stringify({ id: props.query.id }),
      });
      let data = {};
      if (rs.status === HttpStatusCode.OK) {
        data = rs?.data?.data[0] ?? {};
      }
      if (props.query.embed) {
        Object.assign(data, JSON.parse(props.query.embed));
      }
      const fields = this.populateFields(data, pageInfo.schema);
      this.setState({ data, fields });
    }
  }

  onSubmit = async () => {
    this.onButtonClick();
  };

  onButtonClick = async (btnInfo?: any) => {
    if (!btnInfo) {
      for (let i = 0; i < this.state.pageInfo.buttons.length; i++) {
        if (this.state.pageInfo.buttons[i].mode === this.props.query.mode) {
          btnInfo = this.state.pageInfo.buttons[i];
          break;
        }
      }
    }
    this.setState({ loading: true });
    if (btnInfo) {
      try {
        /* if (btnInfo.type === 'submit' && btnInfo.action === 'api') {
          if (this.formRef) {
            const error = this.formRef.checkError()
            if (error >= 0)
              return helper.alert(
                `Dữ liệu chưa đúng, kiểm tra lại thông tin ${this.state.pageInfo.schema[error].name}`
              )
          }
        } */
        let data = Object.assign({}, this.state.data);
        if (btnInfo.confirm) {
          let confirmText = btnInfo.confirm;
          for (const f in data) {
            confirmText = helper.replaceAll(
              confirmText,
              "#" + f + "#",
              data[f]
            );
          }
          const rs = await helper.confirm(confirmText);
          if (!rs) return;
        }
        if (this.props.query.embed && btnInfo.embedUrl) {
          data = Object.assign(
            {},
            data,
            JSON.stringify(this.props.query.embed)
          );
        }
        for (const i in data) {
          if (i === `undefined`) {
            delete data[i];
          }
        }
        const response: any = await helper.callPageApi(
          this.state.pageInfo,
          btnInfo.api,
          data
        );
        if (
          response.status === HttpStatusCode.OK &&
          !response?.data?.errorCode
        ) {
          helper.alert(response?.data.message || "Thành công", "success");
        } else {
          if (typeof response?.data?.errorCode == "number") {
            helper.alert(response?.data.message || "Đã có lỗi xảy ra", "error");
          } else {
            helper.alert("Đã có lỗi xảy ra", "error");
          }
        }
        if (btnInfo.backOnDone) {
          if (this.props.onClose) {
            this.props.onClose();
          } else {
            window.history.back();
          }
        }
      } catch (err: any) {
        helper.alert(err.message);
      }
    } else {
      helper.alert("Không có nút bấm");
    }
    this.setState({ loading: false });
  };

  render() {
    if (this.state.mode === "edit" && !this.state.data) return <Loader />;
    if (this.state.error)
      return <p className="text-danger">{this.state.error}</p>;
    if (!this.state.pageInfo) return <Loader />;
    const FormRender = (
      <div>
        <FormSchema
          formRef={this.formRef}
          schema={this.state.pageInfo.schema}
          settings={
            this.state.pageInfo.settings
              ? this.state.pageInfo.settings?.schema ?? defaultSchema
              : defaultSettings.schema
          }
          data={this.state.data || {}}
          fields={this.state.fields}
          onChange={(fields) => {
            this.setState({ fields, data: this.transformData(fields) });
          }}
          onSubmit={this.onSubmit}
        >
          {this.state.pageInfo.buttons.map((item: any, index: number) => {
            if (this.state.mode === item.mode) {
              let url = "";
              let i: any = 0;
              try {
                if (
                  Array.isArray(item.roles) &&
                  item.roles &&
                  item.roles.length > 0 &&
                  !item.roles.includes(this.props.authUser.roleId)
                ) {
                  // eslint-disable-next-line array-callback-return
                  return;
                }
              } catch (error) {
                // eslint-disable-next-line array-callback-return
                return;
              }
              switch (item.action) {
                case "url":
                  url = item.url.replace("$", this.state.data);
                  for (i in this.state.data) {
                    url = helper.replaceAll(
                      url,
                      "#" + i + "#",
                      this.state.data[i]
                    );
                  }
                  for (i in this.query) {
                    url = helper.replaceAll(
                      url,
                      "@" + i + "@",
                      this.props.query[i]
                    );
                  }
                  return defaultRenderButton(
                    {
                      ...item,
                      url,
                    },
                    {},
                    `${item.mode}-form-action-btn-${index}`
                  );
                case "api":
                case "formModal":
                  return defaultRenderButton(
                    item,
                    {
                      onClick: () => {
                        // this.onButtonClick(item)
                        if (this.formRef && this.formRef.current) {
                          // this.formRef.current.submit();
                        }
                      },
                    },
                    `${item.mode}-form-action-btn-${index}`
                  );
                case "report":
                  url = item.url.replace("$", this.state.data);
                  for (i in this.state.data) {
                    url = helper.replaceAll(
                      url,
                      "#" + i + "#",
                      this.state.data[i]
                    );
                  }
                  for (i in this.query) {
                    url = helper.replaceAll(
                      url,
                      "@" + i + "@",
                      this.props.query[i]
                    );
                  }
                  if (Local.get("session")) {
                    url += "&accesstoken=" + Local.get("session");
                  }
                  if (Local.get("token")) {
                    url += "&accesstoken=" + Local.get("token");
                  }

                  return defaultRenderButton(
                    {
                      ...item,
                      url,
                    },
                    {},
                    `${item.mode}-form-action-btn-${index}`
                  );
                default:
                  return null;
              }
            }
            return null;
          })}
        </FormSchema>
      </div>
    );
    if (this.props.isModal) {
      return FormRender;
    }
    return <Widget title={this.state.pageInfo.name}>{FormRender}</Widget>;
  }
}
const mapStateToProps = ({ auth }: StoreState) => {
  const { authUser } = auth;
  return { authUser };
};
export default connect(mapStateToProps)(FormCtrl);
// export default FormCtrl
