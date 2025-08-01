import { Component } from 'react'
import { Input, Button, Row, Col } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import clone from 'lodash/clone'
import { IS_DEBUG } from '@src/constants/constants'

class EnumByUser extends Component<
  {
    value?: any
    disabled?: boolean
    onChange?: (val: any) => void
  },
  {
    type?: any
    data?: any
  }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      type: 'string',
      data: props.value || [],
    }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(next: any) {
    const type = 'string'
    this.setState({ data: next.value || [], type })
  }

  fixData = (data: any, type: any) => {
    if (type === 'number') {
      if (data) {
        data.map((d: any) => {
          return (d.value = Number(d.value))
        })
      }
    } else {
      if (data) {
        data.map((d: any) => {
          return (d.value = d.value + '')
        })
      }
    }
    return data
  }

  addItem = () => {
    const data = clone(this.state.data)
    const value = this.state.type === 'number' ? 0 : ''
    data.push({ key: '', value })
    this.setState({ data })
  }

  removeItem = (index: number) => {
    const data = clone(this.state.data)
    data.splice(index, 1)
    this.setState({ data })
    if (this.props.onChange) {
      this.props.onChange(this.fixData(data, this.state.type))
    }
  }

  onItemDataChange = (index: number, name: string, val: any) => {
    const data = clone(this.state.data)
    const item = data[index]
    item[name] = val
    data[index] = item
    this.setState({ data })
    if (this.props.onChange) {
      this.props.onChange(this.fixData(data, this.state.type))
    }
  }

  render() {
    if (IS_DEBUG) {
      console.log(
        `🚀 ~ file: EnumByUser.tsx ~ line 111 ~ this.state`,
        this.state
      )
    }
    return (
      <div className="gx-array-editor">
        <Row gutter={[16, 16]}>
          <Col md={8}>
            <Button
              block
              disabled={this.props.disabled}
              onClick={this.addItem}
              type="dashed"
              icon={<PlusOutlined />}
            >
              {`Thêm`}
            </Button>
          </Col>
        </Row>
        {this.state.data.map((item: any, index: number) => {
          return (
            <Row
              className="gx-mt-1"
              key={index}
              gutter={[16, 16]}
              align="middle"
            >
              <Col xs={8}>
                {`Giá trị:`}
                <Input
                  type="text"
                  disabled={this.props.disabled}
                  value={item.key}
                  placeholder={'Khóa'}
                  onChange={(e) => {
                    this.onItemDataChange(index, 'key', e.target.value)
                  }}
                />
              </Col>
              <Col xs={8}>
                {`Tiêu đề:`}
                <Input
                  type="text"
                  disabled={this.props.disabled}
                  value={item.value}
                  placeholder={'Giá trị'}
                  onChange={(e) => {
                    this.onItemDataChange(index, 'value', e.target.value)
                  }}
                />
              </Col>
              <Col xs={3}>
                {``}
                <Button
                  block
                  danger
                  disabled={this.props.disabled}
                  onClick={() => {
                    this.removeItem(index)
                  }}
                  icon={<DeleteOutlined />}
                >
                  {``}
                </Button>
              </Col>
            </Row>
          )
        })}
      </div>
    )
  }
}

export default EnumByUser
