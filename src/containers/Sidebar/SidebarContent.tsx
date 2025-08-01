import { Component } from 'react'
import { Menu, MenuTheme } from 'antd'
import { router, connect } from 'dva'

import CustomScrollbars from '@src/util/CustomScrollbars'
import SidebarLogo from './SidebarLogo'

import Auxiliary from '@src/util/Auxiliary'
import UserProfile from './UserProfile'
import AppsNavigation from './AppsNavigation'
import {
  NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
  THEME_TYPE_LITE,
} from '../../constants/ThemeSetting'
// import IntlMessages from "../../util/IntlMessages";
import RenderIcon from '@src/packages/pro-icon/RenderIcon'
import { StoreState } from '@src/interfaces'
import { IS_DEBUG } from '@src/constants/constants'

const SubMenu = Menu.SubMenu
// const MenuItemGroup = Menu.ItemGroup
const { Link } = router

class SidebarContent extends Component<{
  location?: any
  themeType: string
  navStyle: string
  pathname: string
  menus: any
}> {
  getNoHeaderClass = (navStyle: string) => {
    if (
      navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR ||
      navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR
    ) {
      return 'gx-no-header-notifications'
    }
    return ''
  }

  getNavStyleSubMenuClass = (navStyle: string) => {
    if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR) {
      return 'gx-no-header-submenu-popup'
    }
    return ''
  }

  renderMenu = (data = [], level = 0, navStyle: string) => {
    return (
      <>
        {data.map((item: any) => {
          let result
          if (item.isParent && item.children && item.children.length) {
            if (level == 0) {
              result = (
                <SubMenu
                  key={item.id}
                  className={this.getNavStyleSubMenuClass(navStyle)}
                  // title={<IntlMessages id={`${item.alias}`} />}
                  title={
                    <>
                      <RenderIcon icon={item.icon} />{' '}
                      {/* <IntlMessages id={`${item.alias}`} /> */}
                      <span>{item.name}</span>
                    </>
                  }
                >
                  {this.renderMenu(item.children, 1, navStyle)}
                </SubMenu>
              )
            } else {
              result = (
                <SubMenu
                  key={item.id}
                  className={this.getNavStyleSubMenuClass(navStyle)}
                  title={
                    <>
                      <RenderIcon icon={item.icon} />{' '}
                      {/* <IntlMessages id={`${item.alias}`} /> */}
                      <span>{item.name}</span>
                    </>
                  }
                >
                  {this.renderMenu(item.children, 2, navStyle)}
                </SubMenu>
              )
            }
          } else {
            if (level == 0) {
              /* result = (
                <SubMenu className="gx-menu-group" key={item.key}
                  title={<>
                    <Link to={item.url} style={{ color: '#ffffff' }}>
                      <IntlMessages id={`${item.alias}`} />
                    </Link></>}>
                </SubMenu>
              ); */
              result = (
                <Menu.Item key={item.id}>
                  <Link to={item.url} >
                    <RenderIcon icon={item.icon} /> <span>{item.name}</span>
                    {/* <IntlMessages id={`${item.alias}`} /> */}
                  </Link>
                </Menu.Item>
              )
            } else {
              result = (
                <Menu.Item key={item.id}>
                  <Link to={item.url}>
                    <RenderIcon icon={item.icon} />{' '}
                    {/* <IntlMessages id={`${item.alias}`} /> */}
                    <span>{item.name}</span>
                  </Link>
                </Menu.Item>
              )
            }
          }

          return result
        })}
      </>
    )
  }

  render() {
    const { themeType, navStyle, /* pathname, */ menus } = this.props
    /* const selectedKeys = pathname.substr(1)
    const defaultOpenKeys = selectedKeys.split('/')[1] */
    /* const params = new URLSearchParams(this.props?.location?.search)
    const selectedKeys = params.get('page') || ''
    const defaultOpenKeys = selectedKeys || '' */
    return (
      <Auxiliary>
        <SidebarLogo />
        <div className="gx-sidebar-content">
          <div
            className={`gx-sidebar-notifications ${this.getNoHeaderClass(
              navStyle
            )}`}
          >
            <UserProfile />
            <AppsNavigation />
          </div>
          <CustomScrollbars className="gx-layout-sider-scrollbar">
            <Menu
              /* defaultOpenKeys={[defaultOpenKeys]}
              selectedKeys={[selectedKeys]} */
              theme={
                (themeType === THEME_TYPE_LITE ? 'lite' : 'dark') as MenuTheme
              }
              mode="inline"
              onClick={({ key, keyPath }) => {
                if (IS_DEBUG) {
                  console.info(
                    `🚀 ~ file: SidebarContent.js ~ SidebarContent ~ render ~ key, keyPath`,
                    key,
                    keyPath
                  )
                }
              }}
            >
              {/* <MenuItemGroup className="gx-menu-group" title="Menu"> */}
              {this.renderMenu(menus, 0, navStyle)}
              {/* </MenuItemGroup> */}
            </Menu>
          </CustomScrollbars>
        </div>
      </Auxiliary>
    )
  }
}

const mapStateToProps = ({ settings, menu, router }: StoreState) => {
  const { menus } = menu
  const { navStyle, themeType, locale, pathname } = settings
  const { location } = router
  return { navStyle, themeType, locale, pathname, menus, location }
}
export default connect(mapStateToProps)(SidebarContent)
