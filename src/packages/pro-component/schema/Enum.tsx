import { Component } from "react";
import { Select } from "antd";
class Enum extends Component<{
  schema?: {
    [x: string]: any;
    items?: Array<any>;
  };
  disabled?: boolean;
  value?: any;
  onChange?: (val: any) => void;
}> {
  render() {
    const isNumber = this.props.schema?.type === "number";
    const convertValue = isNumber
      ? parseInt(this.props.value)
      : this.props.value;
    return (
      <Select
        disabled={this.props.disabled}
        value={convertValue || ""}
        onChange={(val) => {
          if (val === "") val = null;
          if (this.props.onChange) {
            this.props.onChange(val);
          }
        }}
      >
        <Select.Option value="">Không chọn</Select.Option>
        {(this.props.schema?.items ?? []).map((item, index) => {
          let itemValue = isNumber ? parseInt(item.value) : item.value;
          return (
            <Select.Option value={itemValue} key={index}>
              {item.key}
            </Select.Option>
          );
        })}
      </Select>
    );
  }
}

export default Enum;
