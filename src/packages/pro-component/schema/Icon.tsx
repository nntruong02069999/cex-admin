import React, { FC, useState } from 'react'
import IconEditor from '@src/controls/editors/IconEditor'
import { ArrayIconType } from '@src/packages/pro-icon'
import AntdIcon from '@src/packages/pro-icon/antd'
import GaxonIcon from '@src/packages/pro-icon/gaxon'
import IconifyIcon from '@src/packages/pro-icon/iconify'

export interface IconProps {
  schema: Record<string, any>
  disabled?: boolean
  invalid?: boolean
  value: any
  onChange?: (val: any) => void
  placeholder?: string
}

const Icon: FC<IconProps> = (props) => {
  // console.log(`🚀 ~ file: Icon.tsx ~ line 17 ~ props`, props)
  const { /* disabled, placeholder, */ value, onChange } = props
  const [visibleIcons, setVisibleIcons] = useState<boolean>(false)

  return (
    <React.Fragment>
      {/* <Input
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(evt) => {
          onChange?.(evt.target.value)
        }}
        // prefix={<UserOutlined className="site-form-item-icon" />}
        suffix={
          <Tooltip title="Chọn icon">
            <SmileOutlined
              style={{ color: '#f58d2d' }}
              onClick={() => setVisibleIcons(true)}
            />
          </Tooltip>
        }
      /> */}
      {value && typeof value == 'object' ? (
        value.iconType == ArrayIconType.antd ? (
          <AntdIcon name={value.name} style={{ fontSize: '24px' }} />
        ) : value.iconType == ArrayIconType.iconify ? (
          <IconifyIcon name={value.name} style={{ fontSize: '24px' }} />
        ) : (
          <GaxonIcon name={value.name} style={{ fontSize: '24px' }} />
        )
      ) : null}
      &nbsp;&nbsp;
      <a onClick={() => setVisibleIcons(true)}>{`Chọn biểu tượng`}</a>
      <IconEditor
        title={`CHỌN ICONS`}
        visible={visibleIcons}
        setVisible={(val: boolean) => {
          setVisibleIcons(val)
        }}
        onChange={(iconIdentity: string, iconType: string) => {
          setVisibleIcons(false)
          onChange?.({
            name: iconIdentity,
            iconType,
          })
        }}
      />
    </React.Fragment>
  )
}

export default Icon
