import { FC } from 'react'
import { ArrayIconType } from '.'
import AntdIcon from './antd'
import GaxonIcon from './gaxon'
import IconifyIcon from './iconify'

export interface RenderIconProps {
  icon: {
    name: string
    iconType: 'antd' | 'gaxon' | 'iconify'
  }
  style?: any
}

const RenderIcon: FC<RenderIconProps> = (props) => {
  const { icon, style } = props
  if (icon && typeof icon == 'object') {
    return icon.iconType == ArrayIconType.antd ? (
      <AntdIcon name={icon.name} style={style} />
    ) : icon.iconType == ArrayIconType.iconify ? (
      <IconifyIcon name={icon.name} style={style} />
    ) : (
      <GaxonIcon name={icon.name} style={style} />
    )
  }
  return null
}

export default RenderIcon
