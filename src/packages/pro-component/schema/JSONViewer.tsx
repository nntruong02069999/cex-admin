import { FC, useEffect, useState } from 'react'
import { JsonEditor as Editor } from 'jsoneditor-react'
import { isDeepEqualReact } from '@src/packages/pro-utils'
import { IS_DEBUG } from '@src/constants/constants'
import ace from 'brace'

import 'brace/mode/json'
import 'brace/theme/solarized_light'

const JSONWidget: FC<{
  value?: any
  onChange?: (val: any) => void
}> = (props) => {
  if (IS_DEBUG) {
    console.log('JSON Editor', props)
  }

  const { value, onChange, ...rest } = props
  const [val, setVal] = useState<string>(value ?? {})

  useEffect(() => {
    if (!isDeepEqualReact(val, value)) {
      setVal(value)
      if (value) {
        onChange?.(value)
      }
    } else {
      setVal('{}')
    }
  }, [value])

  return (
    <Editor
      {...rest}
      value={val}
      onChange={(e: any) => {
        const _value = e.target.value
        setVal(_value)
        props.onChange?.(_value)
      }}
      ace={ace}
      theme="ace/theme/solarized_light"
      mode={Editor.modes.code}
      allowedModes={[Editor.modes.tree, Editor.modes.code]}
    />
  )
}

export default JSONWidget
