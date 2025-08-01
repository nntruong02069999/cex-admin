import React, { useState } from 'react'
import TimePickerComponent from '../components/TimePicker'
import dayjs from 'dayjs'
const Time: React.FC<{
  schema: Record<string, any>
  disabled?: boolean
  invalid?: boolean
  value: any
  onChange?: (val: any) => void
}> = (props) => {
  // const [schema, setSchema] = useState(props.schema)
  const [value, setValue] = useState(
    props.value ? dayjs(props.value) : dayjs()
  )
  // const [focus] = useState(false)

  const onChange = (val: any) => {
    setValue(val)
    if (props.onChange) {
      if (val) {
        props.onChange(val.valueOf())
      } else {
        props.onChange(val)
      }
    }
  }

  /* useEffect(() => {
    if (value !== dayjs(props.value).valueOf()) {
      setValue(props.value ? dayjs(props.value).toDate() : new Date());
    }
  }, [props.value]) */

  return (
    <div>
      <TimePickerComponent
        // value={props.value ? dayjs(props.value) : dayjs()}
        value={value}
        onChange={(e) => {
          onChange(e)
        }}
        secondStep={15}
        format="HH:mm"
        placeholder="Chọn giờ"
      />
    </div>
  )
}

export default Time
