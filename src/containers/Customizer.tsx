import { Component } from 'react'
import { Button, Drawer, message, Radio } from 'antd'
import { connect } from 'dva'
import ColorPicker from './ColorPicker'
import Auxiliary from '@src/util/Auxiliary'
import CustomScrollbars from '@src/util/CustomScrollbars'
import {
  BLUE,
  BLUE_DARK_TEXT_COLOR,
  BLUE_NAV_DARK_BG,
  BLUE_SEC,
  DARK_BLUE,
  DARK_BLUE_DARK_TEXT_COLOR,
  DARK_BLUE_NAV_DARK_BG,
  DARK_BLUE_SEC,
  DEEP_ORANGE,
  DEEP_ORANGE_DARK_TEXT_COLOR,
  DEEP_ORANGE_NAV_DARK_BG,
  DEEP_ORANGE_SEC,
  LAYOUT_TYPE_BOXED,
  LAYOUT_TYPE_FRAMED,
  LAYOUT_TYPE_FULL,
  LIGHT_BLUE,
  LIGHT_BLUE_DARK_TEXT_COLOR,
  LIGHT_BLUE_NAV_DARK_BG,
  LIGHT_BLUE_SEC,
  LIGHT_PURPLE,
  LIGHT_PURPLE_1,
  LIGHT_PURPLE_1_DARK_TEXT_COLOR,
  LIGHT_PURPLE_1_NAV_DARK_BG,
  LIGHT_PURPLE_1_SEC,
  LIGHT_PURPLE_2,
  LIGHT_PURPLE_2_DARK_TEXT_COLOR,
  LIGHT_PURPLE_2_NAV_DARK_BG,
  LIGHT_PURPLE_2_SEC,
  LIGHT_PURPLE_DARK_TEXT_COLOR,
  LIGHT_PURPLE_NAV_DARK_BG,
  LIGHT_PURPLE_SEC,
  NAV_STYLE_ABOVE_HEADER,
  NAV_STYLE_BELOW_HEADER,
  NAV_STYLE_DARK_HORIZONTAL,
  NAV_STYLE_DEFAULT_HORIZONTAL,
  NAV_STYLE_DRAWER,
  NAV_STYLE_FIXED,
  NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
  NAV_STYLE_MINI_SIDEBAR,
  NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
  ORANGE,
  ORANGE_DARK_TEXT_COLOR,
  ORANGE_NAV_DARK_BG,
  ORANGE_SEC,
  RED,
  RED_DARK_TEXT_COLOR,
  RED_NAV_DARK_BG,
  RED_SEC,
  THEME_COLOR_SELECTION_CUSTOMIZE,
  THEME_COLOR_SELECTION_PRESET,
  THEME_TYPE_DARK,
  THEME_TYPE_LITE,
  THEME_TYPE_SEMI_DARK,
} from '../constants/ThemeSetting'
import { StoreState } from '@src/interfaces'
import fixedImage from '@src/assets/images/layouts/fixed.png'
import miniSidebarImage from '@src/assets/images/layouts/mini sidebar.png'
import drawerNavImage from '@src/assets/images/layouts/drawer nav.png'
import noHeaderMiniSidebarImage from '@src/assets/images/layouts/no header mini sidebar.png'
import verticalNoHeaderImage from '@src/assets/images/layouts/vertical no header.png'
import defaultHorizontalImage from '@src/assets/images/layouts/default horizontal.png'
import darkHorizontalImage from '@src/assets/images/layouts/dark horizontal.png'
import insideHeaderHorizontalImage from '@src/assets/images/layouts/inside header horizontal.png'
import belowHeaderImage from '@src/assets/images/layouts/below header.png'
import topToHeaderImage from '@src/assets/images/layouts/top to header.png'
import framedImage from '@src/assets/images/layouts/framed.png'
import fullWidthImage from '@src/assets/images/layouts/full width.png'
import boxedImage from '@src/assets/images/layouts/boxed.png'
import { IPageEditorProps } from '@src/routes/default/pageManager/PageEditor'
import Widgets from '@src/packages/pro-component/widget'
import { IS_DEBUG } from '@src/constants/constants'

export type TAppConfig = {
  logo?: string
  logoShort?: string
  logoWhite?: string
  name?: string
  [x: string]: any
}

export interface CustomizerProps {
  dispatch?: any
  themeType: string
  layoutType: string
  navStyle: string
  colorSelection: string
  appConfig: TAppConfig
}

export interface CustomizerState {
  initialValue?: any
  isCustomizerOpened?: boolean
  vars?: any
  settings?: {
    theme?: {
      data?: string
    }
    nav?: {
      data?: string
    }
    layout?: {
      data?: string
    }
    appConfig?: TAppConfig
  }
  pageInfo?: IPageEditorProps
}

class Customizer extends Component<CustomizerProps, CustomizerState> {
  onChangeComplete = (varName: string, color: string) => {
    const { vars } = this.state
    vars[varName] = color
    this.setState({ vars })
  }

  handleColorChange = (varname?: string, color?: string) => {
    const { vars } = this.state
    if (varname) vars[varname] = color
    try {
      if (window.less) {
        window.less
          .modifyVars(vars)
          .then(() => {
            message.success(`Theme updated successfully`)
            this.setState({ vars })
            localStorage.setItem('app-theme', JSON.stringify(vars))
          })
          .catch((error: any) => {
            if (IS_DEBUG) {
              console.log(
                `🚀 ~ file: Customizer.js ~ line 86 ~ Customizer ~ error`,
                error
              )
            }

            message.error(`Failed to update theme`)
          })
      }
    } catch (error) {
      message.error(`Failed to update theme`)
      if (IS_DEBUG) {
        console.log(
          `🚀 ~ file: Customizer.js ~ line 86 ~ Customizer ~ error`,
          error
        )
      }
    }
  }

  getColorPicker = (varName: string) => (
    <div key={varName} className="gx-media gx-mb-1">
      <div className="gx-ml-1 gx-mr-4">
        <ColorPicker
          type="sketch"
          small
          color={this.state.vars[varName]}
          position="bottom"
          presetColors={[
            '#038fde',
            '#722ED1',
            '#2F54EB',
            '#1890FF',
            '#13C2C2',
            '#EB2F96',
            '#F5222D',
            '#FA541C',
            '#FA8C16',
            '#FAAD14',
            '#FADB14',
            '#A0D911',
            '#52C41A',
          ]}
          onChangeComplete={(color) => this.handleColorChange(varName, color)}
        >
          <span className="gx-pointer gx-text-capitalize gx-media-body">
            {varName.substr(1, varName.length).replace(/-/g, ' ')}
          </span>
        </ColorPicker>
      </div>
    </div>
  )

  getAppConfig = (_appConfig: TAppConfig) => {
    return (
      <ul className="gx-layout-option gx-list-inline">
        <li>
          <Widgets.ImageWidget
            title="Logo"
            value={_appConfig.logoShort || ''}
            onChange={(val: any) => this.onAppConfigChange('logoShort', val)}
          />
        </li>
        <li>
          <Widgets.ImageWidget
            title="Logo short"
            value={_appConfig.logo || ''}
            onChange={(val: any) => this.onAppConfigChange('logo', val)}
          />
        </li>

        <li>
          <Widgets.ImageWidget
            title="Logo không transparent"
            value={_appConfig.logoWhite || ''}
            onChange={(val: any) => this.onAppConfigChange('logoWhite', val)}
          />
        </li>
      </ul>
    )
  }

  resetTheme = () => {
    localStorage.setItem('app-theme', '{}')
    this.setState({ vars: this.state.initialValue })
    try {
      if (window.less) {
        window.less.modifyVars(this.state.initialValue).catch((_error: any) => {
          message.error(`Failed to reset theme`)
        })
      }
    } catch (error) {
      if (IS_DEBUG) {
        console.log(
          `🚀 ~ file: Customizer.js ~ line 86 ~ Customizer ~ error`,
          error
        )
      }
    }
  }

  toggleCustomizer = () => {
    this.setState((previousState) => ({
      isCustomizerOpened: !previousState.isCustomizerOpened,
    }))
  }

  onAppConfigChange = (name: string, url: string) => {
    this.props.dispatch({
      type: 'settings/appConfig',
      payload: {
        [name]: url,
      },
    })
    this.saveSetting({
      name: 'appConfig',
      settings: {
        ...this.props.appConfig,
        [name]: url,
      },
    })
  }

  onThemeTypeChange = (e: any) => {
    const { value } = e.target
    this.props.dispatch({
      type: 'settings/themeType',
      payload: value,
    })
    this.saveSetting({
      name: 'theme',
      settings: {
        data: value,
      },
    })
  }

  onColorSelectionTypeChange = (e: any) => {
    this.props.dispatch({
      type: 'settings/themeColorSelection',
      payload: e.target.value,
    })
  }

  onNavStyleChange = (navStyle: string) => {
    if (IS_DEBUG) {
      console.log('navstyle', navStyle)
    }

    // this.props.onNavStyleChange(navStyle)
    this.props.dispatch({
      type: 'settings/navStyle',
      payload: navStyle,
    })
    this.saveSetting({
      name: 'nav',
      settings: {
        data: navStyle,
      },
    })
  }

  getCustomizerContent = () => {
    const colorPickers = Object.keys(this.state.vars).map((varName) =>
      this.getColorPicker(varName)
    )
    const { themeType, layoutType, navStyle, appConfig, colorSelection } =
      this.props

    if (themeType === THEME_TYPE_DARK) {
      document.body.classList.add('dark-theme')
    } else if (document.body.classList.contains('dark-theme')) {
      document.body.classList.remove('dark-theme')
    }

    return (
      <CustomScrollbars className="gx-customizer">
        <div className="gx-customizer-item">
          <h6 className="gx-mb-3 gx-text-uppercase">Chủ đề</h6>
          <Radio.Group value={themeType} onChange={this.onThemeTypeChange}>
            <Radio.Button value={THEME_TYPE_LITE}>Lite</Radio.Button>
            <Radio.Button value={THEME_TYPE_SEMI_DARK}>Semi Dark</Radio.Button>
            <Radio.Button value={THEME_TYPE_DARK}>Dark</Radio.Button>
          </Radio.Group>
        </div>
        <div className="gx-customizer-item">
          <h6 className="gx-mb-3 gx-text-uppercase">Màu sắc</h6>
          <Radio.Group
            className="gx-mb-3"
            value={colorSelection}
            onChange={this.onColorSelectionTypeChange}
          >
            <Radio.Button value={THEME_COLOR_SELECTION_PRESET}>
              Bảng màu có sẵn
            </Radio.Button>
            <Radio.Button value={THEME_COLOR_SELECTION_CUSTOMIZE}>
              Tùy biến
            </Radio.Button>
          </Radio.Group>

          {colorSelection === THEME_COLOR_SELECTION_CUSTOMIZE ? (
            <div className="gx-cus-customiz">
              {colorPickers}
              <Button
                className="gx-mb-0"
                type="primary"
                onClick={this.resetTheme}
              >
                Đặt về mặc định
              </Button>
            </div>
          ) : (
            this.getPresetColors()
          )}
        </div>

        <h6 className="gx-mb-3 gx-text-uppercase">Định dạng navigation</h6>
        {this.getNavStyles(navStyle)}

        <h6 className="gx-mb-3 gx-text-uppercase">Định dạng màn hình</h6>
        {this.getLayoutsTypes(layoutType)}

        <h6 className="gx-mb-3 gx-text-uppercase">Khác</h6>
        {this.getAppConfig(appConfig)}
      </CustomScrollbars>
    )
  }

  handleThemeColor = (
    primaryColor: string,
    secondaryColor: string,
    navDarkTextColor: string,
    navDarkBg: string
  ) => {
    const modifiedVars = this.state.vars
    modifiedVars['@primary-color'] = primaryColor
    modifiedVars['@secondary-color'] = secondaryColor
    modifiedVars['@nav-dark-bg'] = navDarkBg
    modifiedVars['@nav-dark-text-color'] = navDarkTextColor
    this.setState({ vars: modifiedVars })
    this.handleColorChange()
  }

  handleLayoutTypes = (layoutType: string) => {
    // this.props.dispatch.onLayoutTypeChange(layoutType)
    this.props.dispatch({
      type: 'settings/layoutType',
      payload: layoutType,
    })
    this.saveSetting({
      name: 'layout',
      settings: {
        data: layoutType,
      },
    })
  }

  getPresetColors = () => {
    const themeColor = Object.entries(this.state.vars)[0][1]
    return (
      <ul className="gx-color-option gx-list-inline">
        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              LIGHT_PURPLE,
              LIGHT_PURPLE_SEC,
              LIGHT_PURPLE_DARK_TEXT_COLOR,
              LIGHT_PURPLE_NAV_DARK_BG
            )}
            style={{
              backgroundColor: LIGHT_PURPLE_SEC,
              color: LIGHT_PURPLE_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-light-purple ${
              themeColor === LIGHT_PURPLE && 'active'
            }`}
          />
        </li>
        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              RED,
              RED_SEC,
              RED_DARK_TEXT_COLOR,
              RED_NAV_DARK_BG
            )}
            style={{ backgroundColor: RED_SEC, color: RED_DARK_TEXT_COLOR }}
            className={`gx-link gx-color-red ${themeColor === RED && 'active'}`}
          />
        </li>
        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              BLUE,
              BLUE_SEC,
              BLUE_DARK_TEXT_COLOR,
              BLUE_NAV_DARK_BG
            )}
            style={{ backgroundColor: BLUE_SEC, color: BLUE_DARK_TEXT_COLOR }}
            className={`gx-link gx-color-blue ${
              themeColor === BLUE && 'active'
            }`}
          />
        </li>
        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              DARK_BLUE,
              DARK_BLUE_SEC,
              DARK_BLUE_DARK_TEXT_COLOR,
              DARK_BLUE_NAV_DARK_BG
            )}
            style={{
              backgroundColor: DARK_BLUE_SEC,
              color: DARK_BLUE_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-dark-blue ${
              themeColor === DARK_BLUE && 'active'
            }`}
          />
        </li>

        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              ORANGE,
              ORANGE_SEC,
              ORANGE_DARK_TEXT_COLOR,
              ORANGE_NAV_DARK_BG
            )}
            style={{
              backgroundColor: ORANGE_SEC,
              color: ORANGE_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-orange ${
              themeColor === ORANGE && 'active'
            }`}
          />
        </li>

        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              LIGHT_BLUE,
              LIGHT_BLUE_SEC,
              LIGHT_BLUE_DARK_TEXT_COLOR,
              LIGHT_BLUE_NAV_DARK_BG
            )}
            style={{
              backgroundColor: LIGHT_BLUE_SEC,
              color: LIGHT_BLUE_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-light-blue ${
              themeColor === LIGHT_BLUE && 'active'
            }`}
          />
        </li>

        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              DEEP_ORANGE,
              DEEP_ORANGE_SEC,
              DEEP_ORANGE_DARK_TEXT_COLOR,
              DEEP_ORANGE_NAV_DARK_BG
            )}
            style={{
              backgroundColor: DEEP_ORANGE_SEC,
              color: DEEP_ORANGE_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-deep-orange ${
              themeColor === DEEP_ORANGE && 'active'
            }`}
          />
        </li>

        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              LIGHT_PURPLE_1,
              LIGHT_PURPLE_1_SEC,
              LIGHT_PURPLE_1_DARK_TEXT_COLOR,
              LIGHT_PURPLE_1_NAV_DARK_BG
            )}
            style={{
              backgroundColor: LIGHT_PURPLE_1_SEC,
              color: LIGHT_PURPLE_1_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-light-purple1 ${
              themeColor === LIGHT_PURPLE_1 && 'active'
            }`}
          />
        </li>

        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              LIGHT_PURPLE_2,
              LIGHT_PURPLE_2_SEC,
              LIGHT_PURPLE_2_DARK_TEXT_COLOR,
              LIGHT_PURPLE_2_NAV_DARK_BG
            )}
            style={{
              backgroundColor: LIGHT_PURPLE_2_SEC,
              color: LIGHT_PURPLE_2_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-light-purple2 ${
              themeColor === LIGHT_PURPLE_2 && 'active'
            }`}
          />
        </li>
      </ul>
    )
  }

  getLayoutsTypes = (layoutType: string) => {
    return (
      <ul className="gx-layout-option gx-list-inline">
        <li>
          <span
            onClick={this.handleLayoutTypes.bind(this, LAYOUT_TYPE_FRAMED)}
            className={`gx-pointer ${
              layoutType === LAYOUT_TYPE_FRAMED && 'active'
            }`}
          >
            <img src={framedImage} alt="framed" />
          </span>
        </li>
        <li>
          <span
            onClick={this.handleLayoutTypes.bind(this, LAYOUT_TYPE_FULL)}
            className={`gx-pointer ${
              layoutType === LAYOUT_TYPE_FULL && 'active'
            }`}
          >
            <img src={fullWidthImage} alt="full width" />
          </span>
        </li>
        <li>
          <span
            onClick={this.handleLayoutTypes.bind(this, LAYOUT_TYPE_BOXED)}
            className={`gx-pointer ${
              layoutType === LAYOUT_TYPE_BOXED && 'active'
            }`}
          >
            <img src={boxedImage} alt="boxed" />
          </span>
        </li>
      </ul>
    )
  }

  getNavStyles = (navStyle: string) => {
    return (
      <ul className="gx-nav-option gx-list-inline">
        <li>
          <span
            onClick={this.onNavStyleChange.bind(this, NAV_STYLE_FIXED)}
            className={`gx-pointer ${navStyle === NAV_STYLE_FIXED && 'active'}`}
          >
            <img src={fixedImage} alt="fixed" />
          </span>
        </li>
        <li>
          <span
            onClick={this.onNavStyleChange.bind(this, NAV_STYLE_MINI_SIDEBAR)}
            className={`gx-pointer ${
              navStyle === NAV_STYLE_MINI_SIDEBAR && 'active'
            }`}
          >
            <img src={miniSidebarImage} alt="mini sidebar" />
          </span>
        </li>
        <li>
          <span
            onClick={this.onNavStyleChange.bind(this, NAV_STYLE_DRAWER)}
            className={`gx-pointer ${
              navStyle === NAV_STYLE_DRAWER && 'active'
            }`}
          >
            <img src={drawerNavImage} alt="drawer nav" />
          </span>
        </li>
        <li>
          <span
            onClick={this.onNavStyleChange.bind(
              this,
              NAV_STYLE_NO_HEADER_MINI_SIDEBAR
            )}
            className={`gx-pointer ${
              navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR && 'active'
            }`}
          >
            <img src={noHeaderMiniSidebarImage} alt="no hader mini sidebar" />
          </span>
        </li>
        <li>
          <span
            onClick={this.onNavStyleChange.bind(
              this,
              NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR
            )}
            className={`gx-pointer ${
              navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR && 'active'
            }`}
          >
            <img src={verticalNoHeaderImage} alt="vertical no header" />
          </span>
        </li>
        <li>
          <span
            onClick={this.onNavStyleChange.bind(
              this,
              NAV_STYLE_DEFAULT_HORIZONTAL
            )}
            className={`gx-pointer ${
              navStyle === NAV_STYLE_DEFAULT_HORIZONTAL && 'active'
            }`}
          >
            <img src={defaultHorizontalImage} alt="default horizontal" />
          </span>
        </li>
        <li>
          <span
            onClick={this.onNavStyleChange.bind(
              this,
              NAV_STYLE_DARK_HORIZONTAL
            )}
            className={`gx-pointer ${
              navStyle === NAV_STYLE_DARK_HORIZONTAL && 'active'
            }`}
          >
            <img src={darkHorizontalImage} alt="dark horizontal" />
          </span>
        </li>
        <li>
          <span
            onClick={this.onNavStyleChange.bind(
              this,
              NAV_STYLE_INSIDE_HEADER_HORIZONTAL
            )}
            className={`gx-pointer ${
              navStyle === NAV_STYLE_INSIDE_HEADER_HORIZONTAL && 'active'
            }`}
          >
            <img
              src={insideHeaderHorizontalImage}
              alt="inside header horizontal"
            />
          </span>
        </li>
        <li>
          <span
            onClick={this.onNavStyleChange.bind(this, NAV_STYLE_BELOW_HEADER)}
            className={`gx-pointer ${
              navStyle === NAV_STYLE_BELOW_HEADER && 'active'
            }`}
          >
            <img src={belowHeaderImage} alt="below header" />
          </span>
        </li>

        <li>
          <span
            onClick={this.onNavStyleChange.bind(this, NAV_STYLE_ABOVE_HEADER)}
            className={`gx-pointer ${
              navStyle === NAV_STYLE_ABOVE_HEADER && 'active'
            }`}
          >
            <img src={topToHeaderImage} alt="top to header" />
          </span>
        </li>
      </ul>
    )
  }

  saveSetting = async ({
    id,
    name,
    settings,
  }: {
    id?: number
    name: string
    settings: Record<string, any>
  }) => {
    if (IS_DEBUG) {
      console.log('saveSetting', name)
    }

    this.props.dispatch({
      type: 'settings/saveSetting',
      payload: {
        name,
        id,
        settings,
      },
    })
  }

  constructor(props: CustomizerProps) {
    super(props)
    const initialValue = {
      '@primary-color': '#038fde',
      '@secondary-color': '#fa8c16',
      '@text-color': '#545454',
      '@heading-color': '#535353',
      '@nav-dark-bg': '#003366',
      '@nav-dark-text-color': '#b2e1fb', //#038fdd
      '@header-text-color': '#262626',
      '@layout-header-background': '#fefefe',
      '@layout-footer-background': '#fffffd',
      '@body-background': '#f5f5f5',
      '@hor-nav-text-color': '#fffffd',
    }

    let vars = {}

    try {
      const appThemeLocal = localStorage.getItem('app-theme')
      vars = Object.assign(
        {},
        initialValue,
        JSON.parse(appThemeLocal as string)
      )
    } finally {
      this.state = { vars, initialValue, isCustomizerOpened: false }
      try {
        if (window.less) {
          window.less
            .modifyVars(vars)
            .then(() => {})
            .catch(() => {
              message.error(`Failed to update theme`)
            })
        }
      } catch (error) {
        if (IS_DEBUG) {
          console.log(
            `🚀 ~ file: Customizer.js ~ line 408 ~ Customizer ~ constructor ~ error`,
            error
          )
        }
      }
    }
  }

  render() {
    return (
      <Auxiliary>
        <Drawer
          placement="right"
          closable={false}
          onClose={this.toggleCustomizer}
          visible={this.state.isCustomizerOpened}
        >
          {this.getCustomizerContent()}
        </Drawer>
        <div className="gx-customizer-option">
          <Button type="primary" onClick={this.toggleCustomizer.bind(this)}>
            <i className="icon icon-setting fxicon-hc-spin gx-d-block" />
          </Button>
        </div>
      </Auxiliary>
    )
  }
}

// Customizer = Form.create()(Customizer);

const mapStateToProps = ({ settings }: StoreState) => {
  const { themeType, width, colorSelection, navStyle, layoutType, appConfig } =
    settings
  return { themeType, width, colorSelection, navStyle, layoutType, appConfig }
}
export default connect(mapStateToProps)(Customizer)
