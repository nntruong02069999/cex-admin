import React, { FC, useState } from 'react'
import { Row, Col, Input } from 'antd'
import * as allIconDefs from '@ant-design/icons-svg'
import { IconDefinition } from '@ant-design/icons-svg/es/types'
import IconBase from './components/IconBase'
import { ArrayIconType } from '..'

export interface IconsProps {
  onChange?: (iconIdentity: string, iconType: string) => void
}

export interface IconDefinitionRender extends IconDefinition {
  svgIdentifier: string
}

const Icons: FC<IconsProps> = (props: IconsProps) => {
  const {} = props
  const [search, setSearch] = useState<string>('')
  const [iconArray, setIconArray] = useState(Object.keys(allIconDefs))
  const onChange = (key: string) => {
    props?.onChange?.(key, ArrayIconType.antd)
  }

  const render = ({ svgIdentifier, ...icon }: IconDefinitionRender) => {
    return (
      <Col key={svgIdentifier} xl={4} lg={6} md={6} sm={8} xs={12}>
        <div
          className="gx-icon-views"
          onClick={() => {
            onChange(svgIdentifier)
          }}
        >
          <IconBase icon={icon} style={{ fontSize: '18px' }} />
          <span className="gx-icon-text">{svgIdentifier}</span>
        </div>
      </Col>
    )
  }

  const walk = () =>
    iconArray.map((svgIdentifier) => {
      const iconDef = (allIconDefs as { [id: string]: IconDefinition })[
        svgIdentifier
      ]

      return render({ svgIdentifier, ...iconDef })
    })

  const onSearchChange = (e: any) => {
    const val = e.target.value
    setSearch(val)
    if (val && val != '')
      setIconArray((prev) =>
        prev.filter((svgIdentifier) =>
          svgIdentifier.toLocaleLowerCase().includes(val.toLocaleLowerCase())
        )
      )
    else {
      setIconArray(Object.keys(allIconDefs))
    }
  }

  React.useEffect(() => {
    // walk()
  }, [])

  return (
    <>
      <Row className="gx-mb-2">
        <Col span={24}>
          <Input style={{ width: '100%' }} value={search} onChange={onSearchChange} />
        </Col>
      </Row>
      <Row className="glyphs css-mapping">{walk()}</Row>
    </>
  )
}

export default Icons
