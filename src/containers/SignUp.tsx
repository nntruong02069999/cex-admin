import React from 'react'
import { Button, Checkbox, Form, Input } from 'antd'
import {
  GoogleOutlined,
  FacebookOutlined,
  GithubOutlined,
  TwitterOutlined,
} from '@ant-design/icons'
import { router, connect } from 'dva'

import IntlMessages from '@src/util/IntlMessages'
import { message } from 'antd/lib/index'
import CircularProgress from '@src/components/CircularProgress/index'
import { StoreState } from '@src/interfaces'
import { IS_DEBUG } from '@src/constants/constants'

const { Link } = router
const FormItem = Form.Item

class SignUp extends React.Component<{
  showMessage?: any
  loader?: any
  alertMessage?: any
  showAuthLoader?: any
  hideMessage?: any
  authUser?: any
  history?: any
}> {
  form = React.createRef<any>()

  handleSubmit = (e: any) => {
    e.preventDefault()
    this.form.current.validateFields((err: any, values: any) => {
      if (!err) {
        this.props.showAuthLoader()
        // this.props.userSignUp(values)
      }
      if (IS_DEBUG) {
        console.log(values)
      }
    })
  }

  constructor(props: any) {
    super(props)
    this.state = {
      email: 'demo@example.com',
      password: 'demo#123',
    }
  }

  componentDidUpdate() {
    if (this.props.showMessage) {
      setTimeout(() => {
        this.props.hideMessage()
      }, 100)
    }
    if (this.props.authUser !== null) {
      this.props.history.push('/')
    }
  }

  render() {
    const { showMessage, loader, alertMessage } = this.props
    return (
      <div className="gx-app-login-wrap">
        <div className="gx-app-login-container">
          <div className="gx-app-login-main-content">
            <div className="gx-app-logo-content">
              <div className="gx-app-logo-content-bg">
                <img src="https://via.placeholder.com/272x395" alt="Neature" />
              </div>
              <div className="gx-app-logo-wid">
                <h1>
                  <IntlMessages id="app.userAuth.signUp" />
                </h1>
                <p>
                  <IntlMessages id="app.userAuth.bySigning" />
                </p>
                <p>
                  <IntlMessages id="app.userAuth.getAccount" />
                </p>
              </div>
              <div className="gx-app-logo">
                <img
                  alt="example"
                  src={require('@src/assets/images/logo.png')}
                />
              </div>
            </div>

            <div className="gx-app-login-content">
              <Form
                ref={this.form}
                onFinish={this.handleSubmit}
                className="gx-signup-form gx-form-row0"
              >
                <FormItem
                  name="userName"
                  rules={[
                    { required: true, message: 'Please input your username!' },
                  ]}
                >
                  <Input placeholder="Username" />
                </FormItem>

                <FormItem
                  name="email"
                  rules={[
                    {
                      required: true,
                      type: 'email',
                      message: 'The input is not valid E-mail!',
                    },
                  ]}
                >
                  <Input placeholder="Email" />
                </FormItem>
                <FormItem
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your Password!' },
                  ]}
                >
                  <Input type="password" placeholder="Password" />
                </FormItem>
                <FormItem
                  name="remember"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Checkbox>
                    <IntlMessages id="appModule.iAccept" />
                  </Checkbox>
                  <span className="gx-link gx-signup-form-forgot">
                    <IntlMessages id="appModule.termAndCondition" />
                  </span>
                </FormItem>
                <FormItem>
                  <Button type="primary" className="gx-mb-0" htmlType="submit">
                    <IntlMessages id="app.userAuth.signUp" />
                  </Button>
                  <span>
                    <IntlMessages id="app.userAuth.or" />
                  </span>{' '}
                  <Link to="/signin">
                    <IntlMessages id="app.userAuth.signIn" />
                  </Link>
                </FormItem>
                <div className="gx-flex-row gx-justify-content-between">
                  <span>or connect with</span>
                  <ul className="gx-social-link">
                    <li>
                      <GoogleOutlined
                        onClick={() => {
                          this.props.showAuthLoader()
                          // this.props.userGoogleSignIn()
                        }}
                      />
                    </li>
                    <li>
                      <FacebookOutlined
                        onClick={() => {
                          this.props.showAuthLoader()
                          // this.props.userFacebookSignIn()
                        }}
                      />
                    </li>
                    <li>
                      <GithubOutlined
                        onClick={() => {
                          this.props.showAuthLoader()
                          // this.props.userGithubSignIn()
                        }}
                      />
                    </li>
                    <li>
                      <TwitterOutlined
                        onClick={() => {
                          this.props.showAuthLoader()
                          // this.props.userTwitterSignIn()
                        }}
                      />
                    </li>
                  </ul>
                </div>
              </Form>
            </div>
            {loader && (
              <div className="gx-loader-view">
                <CircularProgress />
              </div>
            )}
            {showMessage && message.error(alertMessage)}
          </div>
        </div>
      </div>
    )
  }
}

// const WrappedSignUpForm = Form.create()(SignUp);

const mapStateToProps = ({ auth }: StoreState) => {
  const {
    loader,
    alertMessage,
    showMessage,
    authUser,
    showAuthLoader,
    hideMessage,
  } = auth
  return {
    loader,
    alertMessage,
    showMessage,
    authUser,
    showAuthLoader,
    hideMessage,
  }
}

export default connect(mapStateToProps)(SignUp)
