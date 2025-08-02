import { Component } from "react";
// import { connect, router } from 'dva'
import { connect, router } from "dva";
import { StoreState } from "@src/interfaces";

import {
  NAV_STYLE_DRAWER,
  NAV_STYLE_FIXED,
  NAV_STYLE_MINI_SIDEBAR,
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
  TAB_SIZE,
  THEME_TYPE_LITE,
} from "../../constants/ThemeSetting";
import wLogoImage from "@src/assets/images/91appl.png";
import logoWhiteImage from "@src/assets/images/91appl.png";
import logoImage from "@src/assets/images/91appl.png";
import { TAppConfig } from "../Customizer";

const { Link } = router;
interface SidebarProps {
  dispatch?: any;
  width: number;
  themeType: string;
  navCollapsed?: boolean;
  navStyle: string;
  appConfig?: TAppConfig;
}
class SidebarLogo extends Component<SidebarProps> {
  render() {
    const { width, themeType, appConfig } = this.props;
    // const { width, themeType, navCollapsed, appConfig } = this.props
    const logo = appConfig && appConfig.logo ? appConfig.logo : null;
    const wLogo = appConfig && appConfig.logoShort ? appConfig.logoShort : null;
    const logoWhite =
      appConfig && appConfig.logoWhite ? appConfig.logoWhite : null;
    let { navStyle } = this.props;
    if (width < TAB_SIZE && navStyle === NAV_STYLE_FIXED) {
      navStyle = NAV_STYLE_DRAWER;
    }
    return (
      <div className="gx-layout-sider-header">
        {navStyle === NAV_STYLE_FIXED || navStyle === NAV_STYLE_MINI_SIDEBAR ? (
          <div className="gx-linebar">
            <i
              className={`gx-icon-btn icon icon-${
                navStyle === NAV_STYLE_MINI_SIDEBAR
                  ? "menu-unfold"
                  : "menu-fold"
              } ${themeType !== THEME_TYPE_LITE ? "gx-text-white" : ""}`}
              onClick={() => {
                if (navStyle === NAV_STYLE_MINI_SIDEBAR) {
                  this.props.dispatch({
                    type: "settings/navStyle",
                    payload: NAV_STYLE_FIXED,
                  });
                } else {
                  this.props.dispatch({
                    type: "settings/navStyle",
                    payload: NAV_STYLE_MINI_SIDEBAR,
                  });
                }
              }}
            />
          </div>
        ) : null}

        <Link to="/" className="gx-site-logo">
          {navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR &&
          width >= TAB_SIZE ? (
            <img
              alt=""
              src={wLogo ? wLogo : wLogoImage}
              width="130"
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: "40px",
                objectFit: "contain",
                filter: "invert(50%) sepia(87%) saturate(1841%) hue-rotate(341deg) brightness(101%) contrast(105%)",
              }}
            />
          ) : themeType === THEME_TYPE_LITE ? (
            <img
              alt=""
              src={logoWhite ? logoWhite : logoWhiteImage}
              width="120"
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: "40px",
                objectFit: "contain",
                 filter: "invert(50%) sepia(87%) saturate(1841%) hue-rotate(341deg) brightness(101%) contrast(105%)",
              }}
            />
          ) : (
            <img
              alt=""
              src={logo ? logo : logoImage}
              width="130"
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: "40px",
                objectFit: "contain",
                 filter: "invert(50%) sepia(87%) saturate(1841%) hue-rotate(341deg) brightness(101%) contrast(105%)",
              }}
            />
          )}
        </Link>
      </div>
    );
  }
}

const mapStateToProps = ({ settings }: StoreState) => {
  const { navStyle, themeType, width, navCollapsed, appConfig } = settings;
  return { navStyle, themeType, width, navCollapsed, appConfig };
};

export default connect(mapStateToProps)(SidebarLogo);
