import React, { useEffect, useState } from 'react'
import { Dropdown, Tag } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import intersectionBy from 'lodash/intersectionBy'
import get from 'lodash/get'
import isObject from 'lodash/isObject'
import ListUser from './ListUser'
import * as userServices from 'services/user'
import { IS_DEBUG } from '@src/constants/constants'

const resolveData = (origin, value) => {
  if (isObject(value) && !Array.isArray(value)) {
    value = [value]
  }
  if (isObject(origin) && !Array.isArray(origin)) {
    origin = [origin]
  }
  if (!origin) {
    origin = []
  }
  if (!value) {
    value = []
  }
  let interIds = intersectionBy(origin, value || [], 'id')
  if (interIds.length === 0 && value && value.length > 0) {
    // interIds = cloneDeep(value);
    interIds = [...origin, ...value]
  }
  const filValue = (value || []).filter(
    (i) => !interIds.map((j) => j.id).includes(i.id)
  )
  const filOrigin = (origin || []).filter(
    (i) => !interIds.map((j) => j.id).includes(i.id)
  )
  return [...filOrigin, ...filValue, ...interIds]
}

const ListUserSelect = ({
  value,
  onChange,
  limit,
  modeChoose = 'radio',
  agencyId,
  paramsList = {},
  ...rest
}) => {
  const [visible, setVisible] = useState(false)
  const [dataValue, setDataValue] = useState(() => {
    if (modeChoose === 'checkbox') {
      return []
    } else {
      return {}
    }
  })

  useEffect(() => {
    ;(async function anyNameFunction() {
      let user = []
      if (value && value !== '') {
        try {
          const resData = await userServices.getList(
            {
              queryInput: {
                id: Array.isArray(value) ? value : [value],
              },
            },
            false
          )
          if (resData && resData.data && resData.data.data) {
            user = get(resData, 'data.data', [])
          }
        } catch (error) {
          if (IS_DEBUG) {
            console.log(
              '🚀 ~ file: index.js ~ line 38 ~ anyNameFunction ~ error',
              error
            )
          }
        }
      }
      if (modeChoose === 'checkbox') {
        setDataValue(user)
      } else if (user.length > 0) {
        setDataValue(user[0] || {})
      }
    })()
  }, [])

  useEffect(() => {
    try {
      if (value && typeof value === 'object') {
        if (modeChoose === 'checkbox') {
          setDataValue((origin) => {
            return resolveData(origin, value)
          })
        } else {
          setDataValue(value || {})
        }
      }
    } catch (error) {
      if (IS_DEBUG) {
        console.log('🚀 ~ file: index.js ~ line 63 ~ useEffect ~ error', error)
      }
    }
  }, [value, modeChoose])

  const handleClick = (e) => {
    return e.preventDefault()
  }

  const handleVisibleChange = (flag) => {
    setVisible(flag)
  }

  const handleChange = ({ data }) => {
    if (modeChoose === 'radio') {
      setDataValue(data || {})
      if (onChange) {
        onChange(data)
      }
    } else {
      const newDataValue = resolveData(dataValue, data)
      setDataValue(newDataValue)
      if (onChange) {
        onChange(newDataValue)
      }
    }
  }
  const menu = (
    <ListUser
      agencyId={agencyId}
      modeChoose={modeChoose}
      onChange={handleChange}
      limit={limit || 5}
      paramsList={paramsList}
    />
  )

  const getUserIdentity = (r) => {
    // const id = get(r, "id", "");
    const name = get(r, 'name', '')

    return (
      <Tag
        key={r.id}
        closable={!rest.disabled}
        onClose={() => {
          setDataValue((origin) => {
            let newValue
            if (modeChoose === 'radio') {
              newValue = null
            } else {
              newValue = origin.filter((i) => i.id !== r.id)
            }
            if (onChange) {
              onChange(newValue)
            }
            return newValue
          })
        }}
      >
        {name}
      </Tag>
    )
  }

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      placement="bottomCenter"
      onVisibleChange={handleVisibleChange}
      visible={visible}
      {...rest}
    >
      <div
        style={{
          border: '1px solid #cfcfcf',
          padding: '5px',
          borderRadius: '6px',
        }}
      >
        {modeChoose === 'checkbox'
          ? dataValue && dataValue.length > 0
            ? dataValue.map((i) => getUserIdentity(i))
            : 'Chọn người dùng'
          : (dataValue &&
              Object.keys(dataValue).length > 0 &&
              getUserIdentity(dataValue)) ||
            'Chọn người dùng'}
        &nbsp;
        <a className="ant-dropdown-link" onClick={handleClick}>
          <DownOutlined color="#1DA57A" />
        </a>
      </div>
    </Dropdown>
  )
}

export default ListUserSelect
