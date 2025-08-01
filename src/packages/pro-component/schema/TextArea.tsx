import { Component } from 'react'
import { Input } from 'antd'
class TextArea extends Component<{
  schema: Record<string, any>
  disabled?: boolean
  invalid?: boolean
  value: any
  onChange?: (val: any) => void
}> {
  render() {
    return (
      <Input.TextArea
        rows={8}
        // invalid={this.props.invalid || false}
        placeholder={this.props.schema.placeholder}
        value={this.props.value}
        onChange={(evt) => {
          if (this.props.onChange) {
            this.props.onChange(evt.target.value)
          }
        }}
      />
    )
  }
}

export default TextArea
