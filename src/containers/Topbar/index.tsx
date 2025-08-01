import React from 'react'
import { Layout, Popover } from 'antd'
import { router } from 'dva'

import CustomScrollbars from '@src/util/CustomScrollbars'
import languageData from './languageData'
import SearchBox from '@src/components/SearchBox'
import UserInfo from '@src/components/UserInfo'
import AppNotification from '@src/components/AppNotification'
import MailNotification from '@src/components/MailNotification'
import Auxiliary from '@src/util/Auxiliary'

import {
  NAV_STYLE_DRAWER,
  NAV_STYLE_FIXED,
  NAV_STYLE_MINI_SIDEBAR,
  TAB_SIZE,
} from '../../constants/ThemeSetting'
import { connect } from 'dva'
import { StoreState } from '@src/interfaces'

interface TopbarProps {
  dispatch?: any
  locale?: any
  width?: any
  navCollapsed?: any
  navStyle?: any
}
const { Link } = router
const { Header } = Layout

class Topbar extends React.Component<TopbarProps> {
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
    // const { locale, width, navCollapsed, navStyle } = this.props
    const { width, navCollapsed, navStyle } = this.props
    return (
      <Auxiliary>
        <Header>
          {navStyle === NAV_STYLE_DRAWER ||
          ((navStyle === NAV_STYLE_FIXED ||
            navStyle === NAV_STYLE_MINI_SIDEBAR) &&
            width < TAB_SIZE) ? (
            <div className="gx-linebar gx-mr-3">
              <i
                className="gx-icon-btn icon icon-menu"
                onClick={() => {
                  this.props.dispatch({
                    type: 'settings/toggleCollapsedNav',
                    payload: !navCollapsed,
                  })
                }}
              />
            </div>
          ) : null}
          <Link to="/" className="gx-d-block gx-d-lg-none gx-pointer">
            <img alt="" src={require('@src/assets/images/logo2.svg')} />
          </Link>

          {/* <SearchBox
            styleName="gx-d-none gx-d-lg-block gx-lt-icon-search-bar-lg"
            placeholder="Search in app..."
            onChange={this.updateSearchChatUser.bind(this)}
            value={this.state.searchText}
          /> */}
          <ul className="gx-header-notifications gx-ml-auto">
            <li className="gx-notify gx-notify-search gx-d-inline-block gx-d-lg-none">
              <Popover
                overlayClassName="gx-popover-horizantal"
                placement="bottomRight"
                content={
                  <SearchBox
                    styleName="gx-popover-search-bar"
                    placeholder="Search in app..."
                    onChange={this.updateSearchChatUser.bind(this)}
                    value={this.state.searchText}
                  />
                }
                trigger="click"
              >
                <span className="gx-pointer gx-d-block">
                  <i className="icon icon-search-new" />
                </span>
              </Popover>
            </li>
            {width >= TAB_SIZE ? null : (
              <Auxiliary>
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

                <li className="gx-msg">
                  <Popover
                    overlayClassName="gx-popover-horizantal"
                    placement="bottomRight"
                    content={<MailNotification />}
                    trigger="click"
                  >
                    <span className="gx-pointer gx-status-pos gx-d-block">
                      <i className="icon icon-chat-new" />
                      <span className="gx-status gx-status-rtl gx-small gx-orange" />
                    </span>
                  </Popover>
                </li>
              </Auxiliary>
            )}
            {/* <li className="gx-language">
              <Popover
                overlayClassName="gx-popover-horizantal"
                placement="bottomRight"
                content={this.languageMenu()}
                trigger="click"
              >
                <span className="gx-pointer gx-flex-row gx-align-items-center">
                  <i className={`flag flag-24 flag-${locale.icon}`} />
                  <span className="gx-pl-2 gx-language-name">
                    {locale.name}
                  </span>
                  <i className="icon icon-chevron-down gx-pl-2" />
                </span>
              </Popover>
            </li> */}
            {width >= TAB_SIZE ? null : (
              <Auxiliary>
                <li className="gx-user-nav">
                  <UserInfo />
                </li>
              </Auxiliary>
            )}
          </ul>
        </Header>
      </Auxiliary>
    )
  }
}

const mapStateToProps = ({ settings }: StoreState) => {
  const { locale, navStyle, navCollapsed, width } = settings
  return { locale, navStyle, navCollapsed, width }
}

export default connect(mapStateToProps)(Topbar)
