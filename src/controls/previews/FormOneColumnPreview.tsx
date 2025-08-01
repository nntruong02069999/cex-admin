import { ISchemaSetting } from '@src/routes/default/pageManager/PageEditor'
import React, { FC } from 'react'
import { Row, Col, Divider, Input } from 'antd'
import clone from 'lodash/clone'
import { ISchemaEditorProperties } from '../editors/SchemaEditor'
import Widgets from '@src/packages/pro-component/widget'
import { IS_DEBUG } from '@src/constants/constants'

export interface FormOneColumnPreviewProps {
  schema: ISchemaEditorProperties[]
  settings: ISchemaSetting
  onChange: (name: string, val: any) => void
}

const FormOneColumnPreview: FC<FormOneColumnPreviewProps> = (
  props: FormOneColumnPreviewProps
) => {
  const { schema, settings, onChange: superChange } = props
  if (IS_DEBUG) {
    console.log(
      `🚀 ~ file: FormOneColumnPreview.tsx ~ line 17 ~ settings`,
      settings
    )
  }
  const spanCol = React.useMemo(() => 24 / settings.columns, [settings.columns])
  return (
    <>
      <Row gutter={[settings.horizontal, settings.vertical]}>
        {schema.map((comp: ISchemaEditorProperties, index: number) => {
          const flexStyleProps: any = {}
          if (comp.flex && comp.flex != '') {
            flexStyleProps.flex = comp.flex
          }
          if (comp.maxWidth && comp.maxWidth != '') {
            flexStyleProps.style = {
              maxWidth: comp.maxWidth,
            }
          }
          return (
            <>
              <Col
                {...flexStyleProps}
                key={comp.field}
                xxl={spanCol}
                xl={spanCol}
                lg={spanCol}
                md={spanCol}
                sm={24}
                xs={24}
              >
                <div
                  style={{
                    textAlign: 'center',
                    height: '60px',
                    fontSize: '14px',
                    // lineHeight: '60px',
                    background: '#0092ff',
                    borderRadius: '4px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    flexDirection: 'column',
                  }}
                >
                  <div>{comp.name}</div>
                  <span className="gx-fs-xs">{comp.field}</span>
                </div>
              </Col>
              {(index + 1) % Number(settings.columns) == 0 && (
                <Divider
                  orientation={
                    settings.divider != 'none' ? settings.divider : undefined
                  }
                >
                  <>
                    {settings.dividerTextItems &&
                      settings.dividerTextItems[
                        (index + 1) / Number(settings.columns) - 1
                      ] &&
                      settings.dividerTextItems[
                        (index + 1) / Number(settings.columns) - 1
                      ].show && (
                        <Input
                          value={
                            settings.dividerTextItems
                              ? settings.dividerTextItems[
                                  (index + 1) / Number(settings.columns) - 1
                                ].title || ''
                              : ''
                          }
                          onChange={(e: any) => {
                            let _dividerTextItems: Array<{
                              title?: string
                              show?: boolean
                            }> = []
                            if (
                              settings.dividerTextItems &&
                              Array.isArray(settings.dividerTextItems)
                            ) {
                              _dividerTextItems = clone(
                                settings.dividerTextItems
                              )
                            }
                            const idxItem =
                              (index + 1) / Number(settings.columns)
                            if (_dividerTextItems?.length < idxItem) {
                              _dividerTextItems.push({
                                title: e.target.value,
                              })
                            } else {
                              _dividerTextItems[idxItem - 1] = {
                                ..._dividerTextItems[idxItem - 1],
                                title: e.target.value,
                              }
                            }
                            superChange('dividerTextItems', _dividerTextItems)
                          }}
                        />
                      )}
                    <Widgets.CheckboxWidget
                      checkedChildren="Hiện divider"
                      unCheckedChildren="Hiện divider"
                      value={
                        settings.dividerTextItems &&
                        settings.dividerTextItems[
                          (index + 1) / Number(settings.columns) - 1
                        ]
                          ? settings.dividerTextItems[
                              (index + 1) / Number(settings.columns) - 1
                            ].show || false
                          : false
                      }
                      onChange={(val: any) => {
                        let _dividerTextItems: Array<{
                          title?: string
                          show?: boolean
                        }> = []
                        if (
                          settings.dividerTextItems &&
                          Array.isArray(settings.dividerTextItems)
                        ) {
                          _dividerTextItems = clone(settings.dividerTextItems)
                        }
                        const idxItem = (index + 1) / Number(settings.columns)
                        if (_dividerTextItems?.length < idxItem) {
                          _dividerTextItems.push({
                            show: val,
                          })
                        } else {
                          _dividerTextItems[idxItem - 1] = {
                            ..._dividerTextItems[idxItem - 1],
                            show: val,
                          }
                        }
                        superChange('dividerTextItems', _dividerTextItems)
                      }}
                    />
                  </>
                </Divider>
              )}
            </>
          )
        })}
      </Row>
    </>
  )
}

export default FormOneColumnPreview
