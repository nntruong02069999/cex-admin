import { FC } from 'react'
import ArraySelect from './ArraySelect'

export interface SingleSelectProps {
  schema: any
  disabled?: boolean
  invalid?: boolean
  value?: any
  onChange?: (val: any) => void,
  placeholder?: string
}

const SingleSelect: FC<SingleSelectProps> = (props: SingleSelectProps) => {
  return <ArraySelect type="radio" {...props} />
}

export default SingleSelect
