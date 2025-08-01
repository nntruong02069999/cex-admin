import { FC, useEffect, useState } from 'react'
import { Radio } from 'antd'
import {
  ObjToMap,
  parsingValueEnumToArray,
} from '@src/packages/pro-table/component/util'
import { ValueEnumObj } from '@src/packages/pro-table/Table'
import { isDeepEqualReact } from '@src/packages/pro-utils'

const RadioGroupWidget: FC<{
  value?: any
  onChange?: (val: any) => void
  valueEnum: ValueEnumObj
}> = (props) => {
  const { value, onChange, valueEnum, ...rest } = props
  const [val, setVal] = useState<string>(value ?? '')

  useEffect(() => {
    if (!isDeepEqualReact(val, value)) {
      setVal(value)
      if (value) {
        onChange?.(value)
      }
    }
  }, [value])

  return (
    <Radio.Group
      {...rest}
      value={val}
      onChange={(e: any) => {
        const _value = e.target.value
        props.onChange?.(_value)
      }}
    >
      {parsingValueEnumToArray(ObjToMap(valueEnum)).map(
        ({ value, text }, idx: number) => (
          <Radio.Button key={idx} value={value}>
            {text}
          </Radio.Button>
        )
      )}
    </Radio.Group>
  )
}

export default RadioGroupWidget
