import { Component } from 'react'
import { Input } from 'antd'
class Text extends Component<{
  schema: Record<string, any>
  disabled?: boolean
  invalid?: boolean
  value: any
  onChange?: (val: any) => void
}> {
  render() {
    let type = ''
    switch (this.props.schema.type) {
      case 'number':
        type = 'number'
        break
      default:
        type = 'text'
    }
    if (this.props.schema.hideValue) type = 'password'
    return (
      <Input
        disabled={this.props.disabled}
        type={type}
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

export default Text
