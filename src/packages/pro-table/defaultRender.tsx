import React from 'react'
import { Progress, Avatar, Image } from 'antd'
import dayjs from 'dayjs'
import Percent from './component/percent'
import IndexColumn from './component/indexColumn'
import { getProgressStatus } from './component/util'
import { ColumnEmptyText } from './Table'

/**
 * money
 * option
 * date YYYY-MM-DD
 * dateRange YYYY-MM-DD[]
 * dateTime YYYY-MM-DD HH:mm:ss
 * dateTimeRange YYYY-MM-DD HH:mm:ss[]
 * time: HH:mm:ss
 * index：
 * progress:
 * percent:
 */
export type ProColumnsValueType =
  | 'money'
  | 'textarea'
  | 'option'
  | 'date'
  | 'dateRange'
  | 'dateTimeRange'
  | 'dateTime'
  | 'time'
  | 'text'
  | 'index'
  | 'indexBorder'
  | 'progress'
  | 'percent'
  | 'digit'
  | 'avatar'
  | 'code'
  | 'switch'
  | 'radio'
  | 'radioGroup'
  | 'image'

// function return type
export type ProColumnsValueObjectType = {
  type: 'progress' | 'money' | 'percent'
  status?: 'normal' | 'active' | 'success' | 'exception' | undefined
  locale?: string
  /** percent */
  showSymbol?: boolean
  precision?: number
}

/**
 * value type by function
 */
export type ProColumnsValueTypeFunction<T> = (
  item: T
) => ProColumnsValueType | ProColumnsValueObjectType

const moneyIntl = new Intl.NumberFormat('vi-VN', {
  currency: 'VND',
  style: 'currency',
  minimumFractionDigits: 2,
})

const enMoneyIntl = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})
const ruMoneyIntl = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
})
const msMoneyIntl = new Intl.NumberFormat('ms-MY', {
  style: 'currency',
  currency: 'MYR',
})

/**
 * render valueType object
 * @param text string | number
 * @param value ProColumnsValueObjectType
 */
const defaultRenderTextByObject = (
  text: string | number,
  value: ProColumnsValueObjectType
) => {
  if (value.type === 'progress') {
    return (
      <Progress
        size="small"
        percent={text as number}
        status={value.status || getProgressStatus(text as number)}
      />
    )
  }
  if (value.type === 'money') {
    // english
    if (value.locale === 'en_US') {
      return enMoneyIntl.format(text as number)
    }
    // russian
    if (value.locale === 'ru_RU') {
      return ruMoneyIntl.format(text as number)
    }
    // malay
    if (value.locale === 'ms_MY') {
      return msMoneyIntl.format(text as number)
    }
    return moneyIntl.format(text as number)
  }
  if (value.type === 'percent') {
    return (
      <Percent
        value={text}
        showSymbol={value.showSymbol}
        precision={value.precision}
      />
    )
  }
  return text
}

/**
 * 根据不同的类型来转化数值
 * @param text
 * @param valueType
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultRenderText = <T, U>(
  text: string | number | React.ReactText[],
  valueType: ProColumnsValueType | ProColumnsValueTypeFunction<T>,
  index: number,
  item?: T,
  columnEmptyText?: ColumnEmptyText
): React.ReactNode => {
  // when valueType == function
  // item always not null
  if (typeof valueType === 'function' && item) {
    const value = valueType(item)
    if (typeof value === 'string') {
      return defaultRenderText(text, value, index)
    }
    if (typeof value === 'object') {
      return defaultRenderTextByObject(text as string, value)
    }
  }

  /**
   *
   */
  if (valueType === 'money' && (text || text === 0)) {
    /**
     * api
     */
    if (typeof text === 'string') {
      return moneyIntl.format(parseFloat(text))
    }
    return moneyIntl.format(text as number)
  }

  /**
   * If it is a date value
   */
  if (valueType === 'date' && text) {
    return dayjs(text as any).format('DD-MM-YYYY')
  }

  /**
   * If it is a date range value
   */
  if (valueType === 'dateRange' && text) {
    if (Array.isArray(text) && text.length === 2) {
      // Display "-" when the value does not exist
      const [startText, endText] = text
      return (
        <div>
          <div>{startText ? dayjs(startText).format('DD-MM-YYYY') : '-'}</div>
          <div>{endText ? dayjs(endText).format('DD-MM-YYYY') : '-'}</div>
        </div>
      )
    } else {
      return dayjs(text as any).format('DD-MM-YYYY HH:mm:ss')
    }
  }

  /**
   *If it is a date and time type value
   */
  if (valueType === 'dateTime' && text) {
    return dayjs(text as any).format('DD-MM-YYYY HH:mm:ss')
  }

  /**
   *如果是日期加时间类型的值的值
   */
  if (valueType === 'dateTimeRange' && text) {
    if (Array.isArray(text) && text.length === 2) {
      // 值不存在的时候显示 "-"
      const [startText, endText] = text
      return (
        <div>
          <div>
            {startText ? dayjs(startText).format('DD-MM-YYYY HH:mm:ss') : '-'}
          </div>
          <div>
            {endText ? dayjs(endText).format('DD-MM-YYYY HH:mm:ss') : '-'}
          </div>
        </div>
      )
    } else {
      return dayjs(text as any).format('DD-MM-YYYY HH:mm:ss')
    }
  }

  /**
   *如果是时间类型的值
   */
  if (valueType === 'time' && text) {
    return dayjs(text as any).format('HH:mm:ss')
  }

  if (valueType === 'index') {
    return <IndexColumn>{index + 1}</IndexColumn>
  }

  if (valueType === 'indexBorder') {
    return <IndexColumn border>{index + 1}</IndexColumn>
  }

  if (valueType === 'progress') {
    return (
      <Progress
        size="small"
        percent={text as number}
        status={getProgressStatus(text as number)}
      />
    )
  }
  /** 百分比, 默认展示符号, 不展示小数位 */
  if (valueType === 'percent') {
    return <Percent value={text as number} />
  }

  if (valueType === 'avatar' && typeof text === 'string') {
    return <Avatar src={text as string} size={22} shape="circle" />
  }

  if (valueType === 'image') {
    if (typeof text === 'string') {
      return <Image src={text as string} width={100} height={70} />
    } else if (Array.isArray(text) && text.length >= 1) {
      return <Image src={text[0] as string} width={100} height={70} />
    }
  }

  if (valueType === 'code' && text) {
    return (
      <pre
        style={{
          padding: 16,
          overflow: 'auto',
          fontSize: '85%',
          lineHeight: 1.45,
          backgroundColor: '#f6f8fa',
          borderRadius: 3,
        }}
      >
        <code>{text}</code>
      </pre>
    )
  }

  if (columnEmptyText) {
    if (typeof text !== 'boolean' && typeof text !== 'number' && !text) {
      return typeof columnEmptyText === 'string' ? columnEmptyText : '-'
    }
  }

  return text
}

export default defaultRenderText
