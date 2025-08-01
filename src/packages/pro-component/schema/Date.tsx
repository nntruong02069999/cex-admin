// import { Component } from 'react'
// import DatePickerComponent from '../components/DatePicker'
// import dayjs from 'dayjs'
// class DatePicker extends Component<
//   {
//     value?: any
//     onChange?: (val: any) => void
//     disabled?: boolean
//   },
//   {
//     value?: any
//     schema?: any
//     focus?: boolean
//   }
// > {
//   constructor(props: any) {
//     super(props)
//     this.state = {
//       schema: props.schema,
//       value: props.value ? dayjs(props.value).toDate() : new Date(),
//       focus: false,
//     }
//   }
//   onChange(val: any) {
//     this.setState({ value: val })
//     if (this.props.onChange) {
//       if (val) {
//         this.props.onChange(val.valueOf())
//       } else {
//         this.props.onChange(val)
//       }
//     }
//   }

//   // eslint-disable-next-line react/no-deprecated
//   componentWillReceiveProps(next: any) {
//     if (next.value !== dayjs(this.state.value).valueOf()) {
//       this.setState({
//         value: next.value ? dayjs(next.value) : dayjs(),
//       })
//     }
//   }
//   render() {
//     return (
//       <div>
//         <DatePickerComponent
//           value={this.props.value ? dayjs(this.props.value) : dayjs()}
//           onChange={(e) => {
//             this.onChange(e)
//           }}
//           disabled={this.state.schema.disabled}
//         />
//       </div>
//     )
//   }
// }

// export default DatePicker


import { Component } from "react";
import DatePickerComponent from "../components/DatePicker";
import dayjs from "dayjs";
import moment from "moment";
class DateTimePicker extends Component<
  {
    value?: any;
    onChange?: (val: any) => void;
    disabled?: boolean;
    schema: any;
  },
  {
    value?: any;
    schema?: any;
    focus?: boolean;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      schema: props.schema,
      value: props.value ? dayjs(props.value) : null,
      focus: false,
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(val: any) {
    this.setState({ value: val });
    this.props.onChange?.(val?.valueOf() ?? val);
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(next: any) {
    if (next.value !== dayjs(this.state.value).valueOf()) {
      this.setState({
        value: next.value ? dayjs(next.value) : null,
      });
    }
  }

  render() {
    return (
      <div>
        <DatePickerComponent
          value={this.props.value ? dayjs(this.props.value) : null}
          onChange={(e) => {
            this.onChange(e);
          }}
          onSelect={(e) => {
            this.onChange(e);
          }}
          onClick={(e) => {
            if (!this.state.value) {
              let value: any = "";
              const currentDate = new Date();
              if (this.props.schema.field === "startDate") {
                currentDate.setHours(0, 0, 0, 0);
              } else if (this.props.schema.field === "endDate") {
                currentDate.setHours(23, 59, 59, 0);
              } else {
                currentDate.setHours(23, 59, 59, 0);
              }
              value = currentDate;
              this.onChange(value);
            }
          }}
          disabledDate={
            this.props.schema.minDate
              ? (current: any) => {
                  return current && current < moment().subtract(1,'d').endOf("day");
                }
              : undefined
          }
          disabled={this.state.schema.disabled}
        />
      </div>
    );
  }
}

export default DateTimePicker;