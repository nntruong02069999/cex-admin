import { Component } from 'react'
import { InputNumber } from 'antd'
class NumberMask extends Component<{
  value?: any
  onChange?: (value: any) => void
  mask?: string
  min?: number
  max?: number
  precision?: number
  placeholder?: string
  style?: any
  type?: 'digit' | 'percent' | 'money' | 'process'
  formatter?: (
    value: number | string,
    info: { userTyping: boolean; input: string }
  ) => string
  parser?: (val: string) => number | string
}> {
  static defaultProps = {
    type: 'digit',
    mask: 'đ',
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    precision: 0,
    placeholder: `nhập giá trị`,
    style: {
      width: '100%',
    },
  }

  formatter: any = null
  parser: any = null
  min: number = Number.MIN_SAFE_INTEGER
  max: number = Number.MAX_SAFE_INTEGER
  precision = 0

  constructor(props: any) {
    super(props)
    this.min = props.min
    this.max = props.max
    this.precision = props.precision
    switch (props.type) {
      case 'percent':
        {
          this.formatter = (value: string) => {
            if (value) {
              return `${value}%`
            }
            return ''
          }
          this.parser = (value: string) => (value ? value.replace('%', '') : '')
          this.min = 0
          this.max = 100
          this.precision = 2
        }
        break
      case 'money':
        {
          this.formatter = (value: string) => {
            if (value) {
              return `${props.mask} ${value}`.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                ','
              )
            }
            return ''
          }
          this.parser = (value: string) =>
            value
              ? value.replace(new RegExp(`\\${props.mask}\\s?|(,*)`, 'g'), '')
              : ''
        }
        break
      case 'process':
      default:
        {
          this.formatter = (value: string) => {
            if (value) {
              return `${props.mask} ${value}`.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                ','
              )
            }
            return ''
          }
          this.parser = (value: string) =>
            value
              ? value.replace(new RegExp(`\\${props.mask}\\s?|(,*)`, 'g'), '')
              : ''
        }
        break
    }
    // override
    if (props.formatter) {
      this.formatter = props.formatter
    }
    // override
    if (props.parser) {
      this.parser = props.parser
    }
  }

  render() {
    const { mask, min, max, precision, placeholder, style } = this.props
    const _defaultProps = {
      value: this.props.value,
      onChange: (e: any) => {
        if (this.props.onChange) {
          this.props.onChange(e)
        }
      },
      min,
      max,
      precision,
      placeholder,
      style,
    }
    if (mask && mask != '') {
      return (
        <InputNumber
          {..._defaultProps}
          formatter={this.formatter}
          parser={this.parser}
        />
      )
    }
    return <InputNumber {..._defaultProps} />
  }
}

export default NumberMask
