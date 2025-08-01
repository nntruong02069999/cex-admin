import React from "react";
import Widgets from "./Widgets";
import { Form } from "antd";
import { ISchemaEditorProperties } from "@src/controls/editors/SchemaEditor";
import IntroDisplay from "./IntroDisplay";

const Base: React.FC<{
  itemId?: number | string | null;
  data?: any;
  schema: ISchemaEditorProperties;
  disabled?: boolean;
  invalid?: boolean;
  value?: any;
  onChange?: (val: any) => void;
  labelCol?: Record<string, any>;
  wrapperCol?: Record<string, any>;
}> = (props) => {
  const { labelCol, wrapperCol } = props;
  const error = () => {
    return `${props.schema.name} là trường dữ liệu bắt buộc!`;
  };
  const layoutFormItem = React.useMemo(() => {
    if (labelCol && wrapperCol) {
      return {
        labelCol,
        wrapperCol,
      };
    }
    return {};
  }, [labelCol, wrapperCol]);

  const Widget = Widgets[props.schema.widget];
  if (!Widget) {
    return <p>Invalid type {props.schema.widget}</p>;
  }
  return (
    <Form.Item
      name={props.schema.field}
      label={props.schema.name}
      rules={[{ required: props.schema.required, message: error() }]}
      extra={
        props.schema.intro && (
          <div style={{ marginTop: 8 }}>
            <IntroDisplay intro={props.schema.intro} />
          </div>
        )
      }
      style={{ marginBottom: props.schema.intro ? 24 : 16 }}
      {...layoutFormItem}
    >
      <Widget
        // onChange={props.onChange}
        // value={props.value === undefined ? props.schema.default : props.value}
        schema={props.schema}
        disabled={props.schema.disabled}
        dataForm={props.data}
        // invalid={this.isInvalid()}
      />
    </Form.Item>
  );
};

export default React.memo(Base);
