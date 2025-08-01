import React, { Component } from 'react'
import { Button, Dropdown, Layout, Menu, message, Popover } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { connect } from 'dva'
import { injectIntl } from 'react-intl'

import CustomScrollbars from '@src/util/CustomScrollbars'
import languageData from '../languageData'
import SearchBox from '@src/components/SearchBox'
import UserInfo from '@src/components/UserInfo'
import AppNotification from '@src/components/AppNotification'
// import MailNotification from "components/MailNotification";
import HorizontalNav from '../HorizontalNav'
import Clock from '@src/components/Clock'
import { StoreState } from '@src/interfaces'
// import IntlMessages from "../../../util/IntlMessages";
import logoImage from '@src/assets/images/logo2.svg'
import wLogoImage from '@src/assets/images/logo2.svg'
import { TAppConfig } from '@src/containers/Customizer'
import { IS_DEBUG } from '@src/constants/constants'
const { Header } = Layout
// const { Link }= router;

const menu = (
  <Menu onClick={handleMenuClick}>
    <Menu.Item key="1">Products</Menu.Item>
    <Menu.Item key="2">Apps</Menu.Item>
    <Menu.Item key="3">Blogs</Menu.Item>
  </Menu>
)

function handleMenuClick() {
  message.info('Click on menu item.')
}

class InsideHeader extends Component<{
  dispatch?: any
  locale?: any
  navCollapsed?: any
  authUser?: any
  intl?: any
  appConfig?: TAppConfig
}> {
  state = {
    searchText: '',
  }

  languageMenu = () => (
    <CustomScrollbars className="gx-popover-lang-scroll">
      <ul className="gx-sub-popover">
        {languageData.map((language) => (
          <li
            className="gx-media gx-pointer"
            key={JSON.stringify(language)}
            onClick={() =>
              this.props.dispatch({
                type: 'settings/switchLanguage',
                payload: language,
              })
            }
          >
            <i className={`flag flag-24 gx-mr-2 flag-${language.icon}`} />
            <span className="gx-language-text">{language.name}</span>
          </li>
        ))}
      </ul>
    </CustomScrollbars>
  )

  updateSearchChatUser = (evt: any) => {
    this.setState({
      searchText: evt.target.value,
    })
  }

  render() {
    const { navCollapsed, authUser, intl, appConfig } = this.props
    // const { locale, navCollapsed, authUser, intl, appConfig } = this.props
    const logo = appConfig && appConfig.logo ? appConfig.logo : null
    if (IS_DEBUG) {
      console.log(
        `🚀 ~ file: index.tsx ~ line 78 ~ InsideHeader ~ render ~ appConfig`,
        appConfig
      )
      console.log(
        `🚀 ~ file: index.tsx ~ line 80 ~ InsideHeader ~ render ~ logo`,
        logo
      )
    }
    const wLogo = appConfig && appConfig.logoShort ? appConfig.logoShort : null

    return (
      <div className="gx-header-horizontal gx-header-horizontal-dark gx-inside-header-horizontal">
        <div className="gx-header-horizontal-top">
          <div className="gx-container">
            <div className="gx-header-horizontal-top-flex">
              <div className="gx-header-horizontal-top-left">
                <i className="icon icon-alert gx-mr-3" />
                <div className="gx-mb-0 gx-text-truncate">
                  {/* {dayjs().format("DD-MM-YYYY hh:mm a")} */}
                  <Clock />
                </div>
              </div>
              <ul className="gx-login-list">
                <li>
                  {authUser
                    ? `${intl.formatMessage({ id: 'app.announced' })} ${
                        authUser.name
                      }`
                    : ''}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Header className="gx-header-horizontal-main">
          <div className="gx-container">
            <div className="gx-header-horizontal-main-flex">
              <div className="gx-d-block gx-d-lg-none gx-linebar gx-mr-xs-3 6e">
                <i
                  className="gx-icon-btn icon icon-menu"
                  onClick={() => {
                    this.props.dispatch({
                      type: 'settings/toogleCollapsedNav',
                      payload: !navCollapsed,
                    })
                  }}
                />
              </div>
              <a
                href="/"
                className="gx-d-block gx-d-lg-none gx-pointer gx-mr-xs-3 gx-pt-xs-1 gx-w-logo"
              >
                <img alt="" src={logo ? logo : logoImage} width="35" />
              </a>
              <a
                href="/"
                className="gx-d-none gx-d-lg-block gx-pointer gx-mr-xs-5 gx-logo"
              >
                <img
                  src={wLogo ? wLogo : wLogoImage}
                  width="90"
                  alt={process.env.REACT_APP_APP_NAME}
                />
                {` `}
                <span style={{ color: '#fff' }}></span>
              </a>

              <div className="gx-header-horizontal-nav gx-header-horizontal-nav-curve gx-d-none gx-d-lg-block">
                <HorizontalNav />
              </div>
              <ul className="gx-header-notifications gx-ml-auto">
                <li className="gx-notify gx-notify-search">
                  <Popover
                    overlayClassName="gx-popover-horizantal"
                    placement="bottomRight"
                    content={
                      <div className="gx-d-flex">
                        <Dropdown overlay={menu}>
                          <Button>
                            Category <DownOutlined />
                          </Button>
                        </Dropdown>
                        <SearchBox
                          styleName="gx-popover-search-bar"
                          placeholder="Search in app..."
                          onChange={this.updateSearchChatUser.bind(this)}
                          value={this.state.searchText}
                        />
                      </div>
                    }
                    trigger="click"
                  >
                    <span className="gx-pointer gx-d-block">
                      <i className="icon icon-search-new" />
                    </span>
                  </Popover>
                </li>

                <li className="gx-notify">
                  <Popover
                    overlayClassName="gx-popover-horizantal"
                    placement="bottomRight"
                    content={<AppNotification />}
                    trigger="click"
                  >
                    <span className="gx-pointer gx-d-block">
                      <i className="icon icon-notification" />
                    </span>
                  </Popover>
                </li>

                {/* <li className="gx-msg">
                  <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight"
                    content={<MailNotification />} trigger="click">
                    <span className="gx-pointer gx-status-pos gx-d-block">
                      <i className="icon icon-chat-new" />
                      <span className="gx-status gx-status-rtl gx-small gx-orange" />
                    </span>
                  </Popover>
                </li> */}
                {/* <li className="gx-language">
                  <Popover
                    overlayClassName="gx-popover-horizantal"
                    placement="bottomRight"
                    content={this.languageMenu()}
                    trigger="click"
                  >
                    <span className="gx-pointer gx-flex-row gx-align-items-center">
                      <i className={`flag flag-24 flag-${locale.icon}`} />
                    </span>
                  </Popover>
                </li> */}

                {/*header*/}
                <li className="gx-user-nav">
                  <UserInfo />
                </li>
              </ul>
            </div>
          </div>
        </Header>
      </div>
    )
  }
}

const mapStateToProps = ({ settings, auth }: StoreState) => {
  const { locale, navCollapsed, appConfig } = settings
  const { authUser } = auth
  return { locale, navCollapsed, authUser, appConfig }
}
export default connect(mapStateToProps)(
  injectIntl(InsideHeader as React.ComponentType<any>)
)
