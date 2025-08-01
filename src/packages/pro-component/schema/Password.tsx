import { Component } from 'react'
import { Input } from 'antd'
class Password extends Component<{
  schema: any
  value: any
  onChange: (val: any) => void
}> {
  render() {
    return (
      <Input.Password
        // invalid={this.props.invalid || false}
        placeholder={this.props.schema.placeholder}
        autoComplete="off"
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

export default Password
