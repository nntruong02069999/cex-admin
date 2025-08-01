import { Component } from 'react'
import DatePickerComponent from '../components/DatePicker'
import dayjs from 'dayjs'
class DatePicker extends Component<
  {
    onChange?: (val: any) => void
  },
  {
    value: any
    schema: any
    focus: boolean
  }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      schema: props.schema,
      value: props.value ? dayjs(props.value).toDate() : new Date(),
      focus: false,
    }
  }
  onChange(val: any) {
    this.setState({ value: val })
    if (this.props.onChange) {
      if (val) {
        this.props.onChange(val.valueOf())
      } else {
        this.props.onChange(val)
      }
    }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(next: any) {
    if (next.value !== dayjs(this.state.value).valueOf()) {
      this.setState({
        value: next.value ? dayjs(next.value).toDate() : new Date(),
      })
    }
  }

  render() {
    return (
      <div>
        <DatePickerComponent
          value={this.state.value}
          onChange={(e) => {
            this.onChange(e)
          }}
          disabled={this.state.schema.disabled}
        />
      </div>
    )
  }
}

export default DatePicker
