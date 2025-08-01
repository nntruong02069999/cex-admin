import { Component } from 'react'
import { Switch } from 'antd'
class Checkbox extends Component<{
  value?: any
  onChange?: (val: any) => void
  disabled?: boolean
}> {
  constructor(props: any) {
    super(props)
    if (props.value === null || props.value === undefined) {
      if (props.onChange) {
        props.onChange(false)
      }
    }
    this.state = {
      checked: !props.value ? false : true,
    }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(next: any) {
    this.setState({ checked: next.value })
  }
  render() {
    return (
      <div>
        <Switch
          disabled={this.props.disabled}
          onChange={(e: any) => {
            if (this.props.onChange) {
              this.props.onChange(e)
            }
          }}
          checked={this.props.value}
        />
      </div>
    )
  }
}

export default Checkbox
