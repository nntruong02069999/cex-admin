import { Component } from 'react'
import { Select } from 'antd'
class EnumWidget extends Component<{
  value?: any
  schema?: any
  onChange?: (val: any) => void
}> {
  render() {
    return (
      <Select
        value={this.props.value}
        onChange={(e) => {
          if (this.props.onChange) {
            this.props.onChange(e.target.value)
          }
        }}
      >
        <Select.Option key={-1} value={''}>
          Chưa chọn
        </Select.Option>
        {this.props.schema.items.map((d: any) => (
          <Select.Option key={d.value} value={d.value}>
            {d.key}
          </Select.Option>
        ))}
      </Select>
    )
  }
}

export default EnumWidget
