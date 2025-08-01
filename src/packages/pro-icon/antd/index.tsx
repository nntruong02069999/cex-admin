import React, { FC } from 'react'
import * as allIconDefs from '@ant-design/icons-svg'
import Icon from './components/AntdIcon'
import { IconDefinitionRender } from './Icons'
import type { IconDefinition } from '@ant-design/icons-svg/lib/types'

export interface AntdIconProps {
  name: string
  [x: string]: any
}

const AntdIcon: FC<AntdIconProps> = (props: AntdIconProps) => {
  const { name, ...restProps } = props

  const render = ({ ...icon }: IconDefinitionRender) => {
    return <Icon key={icon.svgIdentifier} icon={icon} {...restProps} />
  }

  const walk = (name: string) =>
    Object.keys(allIconDefs).map((svgIdentifier) => {
      if (svgIdentifier == name) {
        const iconDef = (allIconDefs as { [id: string]: IconDefinition })[
          svgIdentifier
        ]

        return render({ svgIdentifier, ...iconDef })
      }
      return null
    })
  return <React.Fragment>{walk(name)}</React.Fragment>
}

export default AntdIcon
