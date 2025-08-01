import React from 'react'
import { connect, router } from 'dva'
import { Menu } from 'antd'
// import IntlMessages from "../../util/IntlMessages";
import {
  NAV_STYLE_ABOVE_HEADER,
  NAV_STYLE_BELOW_HEADER,
  NAV_STYLE_DEFAULT_HORIZONTAL,
  NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
} from '../../constants/ThemeSetting'
import { StoreState } from '@src/interfaces'
import RenderIcon from '@src/packages/pro-icon/RenderIcon'

interface HorizontalNavProps {
  location?: any
  pathname?: any
  navStyle?: any
  menus?: any
}
const { Link } = router
const SubMenu = Menu.SubMenu
// const MenuItemGroup = Menu.ItemGroup;

class HorizontalNav extends React.Component<HorizontalNavProps> {
  getNavStyleSubMenuClass = (navStyle: string) => {
    switch (navStyle) {
      case NAV_STYLE_DEFAULT_HORIZONTAL:
        return 'gx-menu-horizontal gx-submenu-popup-curve'
      case NAV_STYLE_INSIDE_HEADER_HORIZONTAL:
        return 'gx-menu-horizontal gx-submenu-popup-curve gx-inside-submenu-popup-curve'
      case NAV_STYLE_BELOW_HEADER:
        return 'gx-menu-horizontal gx-submenu-popup-curve gx-below-submenu-popup-curve'
      case NAV_STYLE_ABOVE_HEADER:
        return 'gx-menu-horizontal gx-submenu-popup-curve gx-above-submenu-popup-curve'
      default:
        return 'gx-menu-horizontal'
    }
  }

  renderMenu = (data = [], level = 0, navStyle: string) => {
    return data.map((item: Record<string, any>) => {
      let result
      if (item.isParent && item.children && item.children.length) {
        if (level == 0) {
          result = (
            <SubMenu
              className={this.getNavStyleSubMenuClass(navStyle)}
              key={item.id}
              // title={<IntlMessages id={`${item.alias}`} />}
              title={item.name}
            >
              {this.renderMenu(item.children, 1, navStyle)}
            </SubMenu>
          )
        } else {
          result = (
            <SubMenu
              className="gx-menu-horizontal"
              key={item.id}
              title={
                <span>
                  <RenderIcon icon={item.icon} />{' '}
                  {/* <IntlMessages id={`${item.alias}`} /> */}
                  {item.name}
                </span>
              }
            >
              {this.renderMenu(item.children, 2, navStyle)}
            </SubMenu>
          )
        }
      } else {
        if (level == 0) {
          result = (
            <Menu.Item key={`${item.parent},${item.id}`}>
              <Link to={item.url}>
                {/* <IntlMessages id={`${item.alias}`} /> */}
                <RenderIcon icon={item.icon} /> {item.name}
              </Link>
            </Menu.Item>
          )
        } else {
          result = (
            <Menu.Item key={`${item.parent},${item.id}`}>
              <Link to={item.url}>
                <RenderIcon icon={item.icon} />{' '}
                {/* <IntlMessages id={`${item.alias}`} /> */}
                {item.name}
              </Link>
            </Menu.Item>
          )
        }
      }

      return result
    })
  }

  render() {
    const { /* pathname, */ navStyle, menus } = this.props
    /* const params = new URLSearchParams(this.props?.location?.search)
    const selectedKeys = params.get('page') || ''
    const defaultOpenKeys = selectedKeys || '' */
    /* let selectedKeys = pathname.substr(1)
    let defaultOpenKeys =
      selectedKeys.indexOf('/') !== -1
        ? selectedKeys.split('/')[1]
        : selectedKeys */

    return (
      <Menu
        /* defaultOpenKeys={[defaultOpenKeys]}
        selectedKeys={[selectedKeys]} */
        mode="horizontal"
        disabledOverflow={true}
        onClick={({ key, keyPath }) => {
          console.info(
            `🚀 ~ file: HorizontalNav.js ~ line 106 ~ HorizontalNav ~ render ~ key, keyPath`,
            key,
            keyPath
          )
        }}
      >
        {this.renderMenu(menus, 0, navStyle)}
      </Menu>
    )
  }
}

const mapStateToProps = ({ settings, menu, router }: StoreState) => {
  const { menus } = menu
  const { themeType, navStyle, pathname, locale } = settings
  const { location } = router
  return { themeType, navStyle, pathname, locale, menus, location }
}
export default connect(mapStateToProps)(HorizontalNav)
