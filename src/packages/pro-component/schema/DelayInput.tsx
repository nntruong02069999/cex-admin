import { Component } from 'react'
import { Input } from 'antd'
class DelayInput extends Component<{
  disabled?: boolean
  type?: any
  invalid?: any
  placeholder?: string
  value?: any
  defaultValue?: any
  onChange?: (val: any) => void
}> {
  delay = 1000 //ms
  timeout: any = null
  val: any = null
  render() {
    return (
      <Input
        disabled={this.props.disabled}
        type={this.props.type}
        // invalid={this.props.invalid || false}
        placeholder={this.props.placeholder}
        value={this.props.value}
        defaultValue={this.props.defaultValue}
        onChange={(evt) => {
          if (this.props.onChange) {
            if (this.timeout) {
              clearTimeout(this.timeout)
            }
            this.val = evt.target.value
            const { onChange } = this.props
            this.timeout = setTimeout(() => {
              onChange({
                target: {
                  value: this.val,
                },
              })
            }, this.delay)
          }
        }}
      />
    )
  }
}

export default DelayInput
