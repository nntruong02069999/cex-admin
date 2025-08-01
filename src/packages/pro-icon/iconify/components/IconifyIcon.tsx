import React, { FC } from 'react'
import { Icon } from '@iconify/react'

export interface IconifyIconProps {
  name: string
  [x: string]: any
}

const IconifyIcon: FC<IconifyIconProps> = (props: IconifyIconProps) => {
  const { name, ...restProps } = props
  return (
    <React.Fragment>
      <Icon icon={`${name}`} {...restProps} />
    </React.Fragment>
  )
}

export default IconifyIcon
