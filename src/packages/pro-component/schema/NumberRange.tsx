import React, { useState } from 'react'
import { Space } from 'antd'
import isEqual from 'lodash/isEqual'
import NumberMask from './NumberMask'

const NumberRange: React.FC<{
  value?: Array<number | string>
  onChange?: (value: any) => void
  mask?: string
  min?: number
  precision?: number
  placeholder?: string[]
  style?: any
  type?: 'digit' | 'percent' | 'money' | 'process'
}> = (props) => {
  const {
    value: initValue = [0, 0],
    onChange: superChange,
    placeholder = ['Từ', 'Đến'],
    ...rest
  } = props
  const [value, setValue] = useState(initValue ?? [0, 0])
  const [startNumber, endNumber] = value

  React.useEffect(() => {
    if (!isEqual(initValue,value)) {
      setValue(initValue)
    }
  }, [initValue])

  const onChange = (idx: number, val: any) => {
    const arr = value
    arr[idx] = val
    setValue(arr)
    superChange?.(arr)
  }

  return (
    <Space>
      <NumberMask
        value={Number(startNumber)}
        placeholder={placeholder[0]}
        onChange={(val) => {
          onChange(0, val)
        }}
        {...rest}
      />
      <NumberMask
        value={Number(endNumber)}
        placeholder={placeholder[1]}
        onChange={(val) => {
          onChange(1, val)
        }}
        {...rest}
      />
    </Space>
  )
}

export default NumberRange
