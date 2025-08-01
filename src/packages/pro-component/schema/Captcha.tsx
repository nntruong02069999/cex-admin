import { Component } from 'react'
import { Input, Col, Row } from 'antd'
import request from '@src/util/request'
import { SyncOutlined } from '@ant-design/icons'

class Captcha extends Component<
  {
    onChange: (val?: any) => void
  },
  {
    captchaText: any
    loading?: boolean
    captchaId: any
    captcha: any
  }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      captchaText: '',
      captchaId: '',
      captcha: null,
    }
    this.loadCaptcha()
  }

  async loadCaptcha() {
    const captInfo: any = await request({
      url: '/user/create-captcha',
    })
    console.log(`captchaInfo`, captInfo)
    this.setState({
      loading: false,
      captchaId: captInfo.data.tokenCapcha,
      captcha: captInfo.data.data,
    })
    this.onChange(this.state.captchaId, this.state.captchaText)
  }

  onChange(id: any, text: any) {
    let rs = null
    if (id && text) {
      rs = `${id},${text}`
    }
    if (this.props.onChange) {
      this.props.onChange(rs)
    }
  }

  render() {
    if (!this.state.captcha) return <p>Đang xử lý...</p>
    return (
      <Row>
        <Col xs={12}>
          <div
            className="captcha"
            dangerouslySetInnerHTML={{ __html: this.state.captcha }}
          ></div>
          <div className="captcha">
            <Input
              type="text"
              placeholder="Nhập mã captcha"
              value={this.state.captchaText}
              onChange={(evt) => {
                this.setState({ captchaText: evt.target.value })
                this.onChange(this.state.captchaId, evt.target.value)
              }}
              addonAfter={
                <SyncOutlined
                  onClick={() => {
                    this.loadCaptcha()
                  }}
                />
              }
            />
          </div>
        </Col>
      </Row>
    )
  }
}

export default Captcha
