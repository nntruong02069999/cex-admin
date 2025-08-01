import React from "react";
import { Button, Form, Input, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { connect } from "dva";
import IntlMessages from "@src/util/IntlMessages";
import CircularProgress from "@src/components/CircularProgress/index";
import { StoreState } from "@src/interfaces";
import logoBackground from "../assets/images/91appl.png";
import TwoFactorFlow from "../components/auth/TwoFactorFlow";
const FormItem = Form.Item;
const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

class SignIn extends React.Component<
  {
    dispatch?: any;
    showMessage?: any;
    history?: any;
    authUser?: any;
    loader?: any;
    alertMessage?: any;
    twoFARedirect?: {
      shouldRedirect: boolean;
      nextStep: string | null;
    };
  },
  {
    tokenCapcha?: string;
    captcha: string;
    accountKitToken?: string;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      captcha: "",
      accountKitToken: "",
    };
  }

  form = React.createRef<any>();

  handleSubmit = (values: Record<string, any>) => {
    const { dispatch } = this.props;
    dispatch({
      type: "auth/showAuthLoader",
    });
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(SITE_KEY, { action: "submit" })
        .then((token: any) => {
          console.log("@@token", token);
          dispatch({
            type: "auth/userSignIn",
            payload: {
              ...values,
              tokenCapcha: token,
            },
          });
        });
    });
    console.log("!!@@ready", window);
  };

  handleTwoFactorComplete = () => {
    const { dispatch, history, authUser } = this.props;
    // Get the user data that would be available after 2FA completion
    const userInfo =
      authUser || JSON.parse(localStorage.getItem("user_id") || "{}");

    // Similar to the commented code in auth.ts
    if (userInfo) {
      const userData = {
        userInfo: userInfo,
        token: localStorage.getItem("token"),
      };
      dispatch({
        type: "menu/getMenuData",
        payload: {
          role: userData.userInfo.role,
        },
      });

      dispatch({
        type: "auth/userSignInSuccess",
        payload: userData,
      });
    }
    // Clear 2FA redirect state
    dispatch({ type: "auth/clear2FARedirect" });
    // After successful 2FA, redirect to dashboard
    history.push("/");
  };

  handleTwoFactorCancel = () => {
    const { dispatch } = this.props;
    dispatch({ type: "auth/clear2FARedirect" });
    // Clear temporary token
    localStorage.removeItem("token_temp_2fa");
  };

  loadScriptByURL = (id: any, url: any, callback: any) => {
    const isScriptExist = document.getElementById(id);

    if (!isScriptExist) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.id = id;
      script.onload = function () {
        if (callback) callback();
      };
      document.body.appendChild(script);
    }

    if (isScriptExist && callback) callback();
  };

  componentDidMount() {
    this.loadScriptByURL(
      "recaptcha-key",
      `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`,
      function () {
        console.log("Script loaded!");
      }
    );
  }

  componentDidUpdate() {
    const { dispatch, twoFARedirect } = this.props;
    if (this.props.showMessage) {
      setTimeout(() => {
        dispatch({
          type: "auth/hideMessage",
        });
      }, 100);
    }

    // Only redirect to home if authenticated and not in 2FA flow
    if (this.props.authUser !== null && !twoFARedirect?.shouldRedirect) {
      this.props.history.push("/");
    }
  }

  renderLoginForm() {
    return (
      <Form
        ref={this.form}
        onFinish={this.handleSubmit}
        style={{ width: "60%" }}
        className="gx-signin-form gx-form-row0"
      >
        <FormItem
          name="username"
          initialValue=""
          rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
        >
          <Input placeholder="Tên đăng nhập" prefix={<UserOutlined />} />
        </FormItem>
        <FormItem
          name="password"
          initialValue=""
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input
            type="password"
            placeholder="Mật khẩu"
            prefix={<LockOutlined />}
          />
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            className="gx-mb-0"
            htmlType="submit"
            style={{ width: "100%" }}
          >
            <IntlMessages id="app.userAuth.login" />
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const { showMessage, loader, alertMessage, twoFARedirect } = this.props;

    return (
      <div className="gx-app-login-wrap">
        <div
          className="gx-app-login-container"
          style={{
            maxWidth: "900px",
            width: "100%",
          }}
        >
          <div className="gx-app-login-main-content">
            <div className="gx-app-logo-content" style={{ width: "30%" }}>
              <div
                className="gx-app-logo-content-bg"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={logoBackground}
                  alt="MediaOne"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
              <div className="gx-app-logo">
                <span
                  style={{ margin: "0 auto", verticalAlign: "center" }}
                >{` `}</span>
              </div>
            </div>
            <div className="gx-app-login-content">
              {twoFARedirect?.shouldRedirect && twoFARedirect.nextStep ? (
                <TwoFactorFlow
                  nextStep={twoFARedirect.nextStep}
                  onComplete={this.handleTwoFactorComplete}
                  onCancel={this.handleTwoFactorCancel}
                />
              ) : (
                <>
                  <h1 className="title-login">
                    <IntlMessages id="app.userAuth.signIn" />
                  </h1>
                  {this.renderLoginForm()}
                </>
              )}
            </div>

            {loader ? (
              <div className="gx-loader-view">
                <CircularProgress />
              </div>
            ) : null}
            {showMessage && alertMessage
              ? message.error(alertMessage.toString(), 10)
              : null}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ auth }: StoreState) => {
  const { loader, alertMessage, showMessage, authUser, twoFARedirect } = auth;
  return { loader, alertMessage, showMessage, authUser, twoFARedirect };
};

export default connect(mapStateToProps)(SignIn);
