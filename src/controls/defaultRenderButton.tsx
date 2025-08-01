import React from 'react'
import { IButtonEditor } from '@src/controls/editors/ButtonEditor'
import { Button, Tooltip, Popconfirm } from 'antd'
import AntdIcon from '@src/packages/pro-icon/antd'
import GaxonIcon from '@src/packages/pro-icon/gaxon'
import { ButtonProps, ButtonSize, ButtonShape } from 'antd/es/button'
import { colorUtils } from '@src/packages/pro-utils'
import { v4 as uuid } from 'uuid'
import omit from 'lodash/omit'

const defaultRenderButton = (
  properties: IButtonEditor,
  extra?: ButtonProps,
  key?: string
): React.ReactNode => {
  let htmlType: any
  if (properties.type == 'button' || properties.type == 'submit') {
    htmlType = properties.type
  }
  const restProps: ButtonProps = {
    type: properties.buttonType || 'primary',
    ghost: properties.ghost || false,
    danger: properties.danger || false,
    size: (properties.size as ButtonSize) || 'middle',
    shape: (properties.shape as ButtonShape) || 'default',
  }
  const {
    title,
    buttonType,
    icon,
    url,
    action,
    color,
    isTitle,
    type,
    mode,
    confirm,
  } = properties
  if (type == 'button' || type == 'submit') {
    restProps.htmlType = htmlType
  }
  if (!extra) {
    extra = {}
  }
  const keyBtn = key ? key : `${mode}-action-btn-${uuid()}`
  let style = {}
  if (color) {
    style = {
      background: `${color}`,
      borderColor: `${colorUtils.LightenDarkenColor(color, 20)}`,
      ...(extra.style || {}),
    }
  }
  if (icon && typeof icon == 'object' && icon.show) {
    if (icon.iconType == 'antd') {
      restProps.icon = <AntdIcon name={icon.name} />
    } else {
      restProps.icon = <GaxonIcon name={icon.name} />
    }
  }
  const displayText =
    (typeof isTitle == 'boolean' && isTitle == true) ||
    typeof isTitle == 'undefined'
      ? title || ''
      : ''
  if (type == 'icon' && icon && typeof icon == 'object') {
    if (color) {
      style = {
        color: `${color}`,
        ...(extra.style || {}),
      }
    }
    if (icon.iconType == 'antd') {
      return (
        <Tooltip key={keyBtn} title={title || ''}>
          <AntdIcon key={keyBtn} name={icon.name} {...extra} style={style} />
        </Tooltip>
      )
    } else {
      return (
        <Tooltip key={keyBtn} title={title || ''}>
          <GaxonIcon key={keyBtn} name={icon.name} {...extra} style={style} />
        </Tooltip>
      )
    }
  }

  if (action == 'url' || buttonType == 'link') {
    return (
      <Tooltip key={keyBtn} title={title || ''}>
        <Button
          key={keyBtn}
          type="link"
          href={url}
          {...restProps}
          {...extra}
          style={style}
        >
          {displayText}
        </Button>
      </Tooltip>
    )
  }
  if (typeof confirm !== 'undefined' && confirm !== '') {
    return (
      <Tooltip key={keyBtn} title={title || ''}>
        <Popconfirm
          title={confirm}
          onConfirm={(e: any) => {
            extra?.onClick?.(e)
          }}
          /* onCancel={() => {

          }} */
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Button
            key={keyBtn}
            {...restProps}
            {...omit(extra, 'onClick')}
            style={style}
          >
            {displayText}
          </Button>
        </Popconfirm>
      </Tooltip>
    )
  }
  return (
    <Tooltip key={keyBtn} title={title || ''}>
      <Button key={keyBtn} {...restProps} {...extra} style={style}>
        {displayText}
      </Button>
    </Tooltip>
  )
}

export default defaultRenderButton
