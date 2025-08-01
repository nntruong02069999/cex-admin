import React, { useEffect, useState } from 'react'
import { Col, Row, Input, Tabs } from 'antd'
import collections from '@iconify/json/collections.json'
import { listIcons } from '@iconify/react'
import pick from 'lodash/pick'
import { ArrayIconType } from '..'
import IconifyIcon from './components/IconifyIcon'
import { IS_DEBUG } from '@src/constants/constants'

const ICON_SETS = pick(collections, [
  'akar-icons',
  'ant-design',
  'fa-regular',
  'fa-solid',
])
const Icons: React.FC<{
  onChange?: (iconIdentity: string, iconType: string) => void
}> = (props) => {
  const [search, setSearch] = useState<string>('')
  const [iconSets] = useState<{
    prefixs: string[]
    sets: any
  }>({
    prefixs: Object.keys(ICON_SETS),
    sets: ICON_SETS,
  })
  const [iconArray, setIconArray] = useState<string[]>([])
  const [activeKey, setActiveKey] = useState<string>('')

  const onChange = (key: string) => {
    props?.onChange?.(key, ArrayIconType.iconify)
  }

  /* const getIconsSet = async () => {
    const { lookupCollections } = require('@iconify/json/dist/index.js')
    const iiconSets = await lookupCollections()
    const prefixes = Object.keys(iiconSets)
    setIconSets({
      prefixs: prefixes,
      sets: iiconSets,
    })
  } */

  const getIconArrays = (iconSet: string) => {
    if (IS_DEBUG) {
      console.log(`🚀 ~ file: Icons.tsx ~ line 37 ~ getIconArrays ~ iconSet`)
    }
    /* const { locate, loadCollection } = require('@iconify/json/dist/index.js')
    const pathSet = locate(iconSet)
    const cols = await loadCollection(`${pathSet}`)
    setIconArray(Object.keys(get(icons, 'icons', {}) || {})) */
    const icons = listIcons('', iconSet)
    if (IS_DEBUG) {
      console.log(`🚀 ~ file: Icons.tsx ~ line 42 ~ getIconArrays ~ icons`)
    }
    setIconArray(icons)
  }

  const onTabChange = (key: string) => {
    setActiveKey(key)
    getIconArrays(key)
  }

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
      getIconArrays(activeKey)
    }
  }

  useEffect(() => {
    // getIconsSet()
  }, [])

  return (
    <>
      <Row className="gx-mb-2">
        <Col span={24}>
          <Tabs activeKey={activeKey} onChange={onTabChange}>
            {(iconSets.prefixs || []).map((prefix) => {
              const item = iconSets.sets[prefix]
              return (
                <Tabs.TabPane
                  tab={item.name}
                  key={prefix}
                  style={{ padding: '20px' }}
                >
                  <>
                    <Row className="gx-mb-2">
                      <Col span={24}>
                        <Input
                          style={{ width: '100%' }}
                          value={search}
                          onChange={onSearchChange}
                        />
                      </Col>
                    </Row>
                    <Row className="glyphs css-mapping">
                      {iconArray.map((iconIdentity: string) => (
                        <Col
                          key={`${prefix}-${iconIdentity}`}
                          xl={4}
                          lg={6}
                          md={6}
                          sm={8}
                          xs={12}
                        >
                          <div
                            className="gx-icon-views"
                            onClick={() => {
                              onChange(`${iconIdentity}`)
                            }}
                          >
                            <IconifyIcon name={`${iconIdentity}`} />
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </>
                </Tabs.TabPane>
              )
            })}
          </Tabs>
        </Col>
      </Row>
    </>
  )
}

export default Icons
