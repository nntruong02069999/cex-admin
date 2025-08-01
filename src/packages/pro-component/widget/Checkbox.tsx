import { Component } from 'react'
import { Switch } from 'antd'
class CheckboxWidget extends Component<
  {
    value?: any
    onChange?: (val: any) => void
    disabled?: boolean
    checkedChildren?: string
    unCheckedChildren?: string
  },
  {
    checked?: boolean
  }
> {
  constructor(props: any) {
    super(props)
    if (props.value === null || props.value === undefined) {
      if (props.onChange) {
        props.onChange(false)
      }
    }
    this.state = {
      checked:
        props.value === null || props.value === undefined ? false : props.value,
    }
  }
  onChange(val: any) {
    this.setState({ checked: val })
    if (this.props.onChange) {
      this.props.onChange(val)
    }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(next: any) {
    this.setState({ checked: next.value })
  }

  render() {
    let text = {}
    if (this.props?.checkedChildren && this.props?.unCheckedChildren) {
      text = {
        checkedChildren: this.props?.checkedChildren,
        unCheckedChildren: this.props?.unCheckedChildren,
      }
    }
    return (
      <Switch
        disabled={this.props.disabled}
        onChange={() => {
          this.onChange(!this.state.checked)
        }}
        checked={this.state.checked}
        {...text}
      />
    )
  }
}

export default CheckboxWidget
