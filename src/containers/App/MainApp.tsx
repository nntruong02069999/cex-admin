import { Component } from 'react';
import { Layout } from 'antd';

import Sidebar from '../Sidebar/index';
import HorizontalDefault from '../Topbar/HorizontalDefault/index';
import HorizontalDark from '../Topbar/HorizontalDark/index';
import InsideHeader from '../Topbar/InsideHeader/index';
import AboveHeader from '../Topbar/AboveHeader/index';
import BelowHeader from '../Topbar/BelowHeader/index';

import Topbar from '../Topbar/index';
import { footerText } from '@src/util/config';
import App from '@src/routes/index';

import { connect } from 'dva';
import {
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
  TAB_SIZE,
} from '../../constants/ThemeSetting';
import NoHeaderNotification from '../Topbar/NoHeaderNotification/index';
import { StoreState } from '@src/interfaces';
import Customizer from '../Customizer';

interface MainAppProps {
  match?: any;
  width?: any;
  navStyle?: any;
  authUser?: any;
}

const { Content, Footer } = Layout;

export class MainApp extends Component<MainAppProps> {
  getContainerClass = (navStyle: string) => {
    switch (navStyle) {
      case NAV_STYLE_DARK_HORIZONTAL:
        return 'gx-container-wrap';
      case NAV_STYLE_DEFAULT_HORIZONTAL:
        return 'gx-container-wrap';
      case NAV_STYLE_INSIDE_HEADER_HORIZONTAL:
        return 'gx-container-wrap';
      case NAV_STYLE_BELOW_HEADER:
        return 'gx-container-wrap';
      case NAV_STYLE_ABOVE_HEADER:
        return 'gx-container-wrap';
      case NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR:
        return 'gx-container-wrap';
      default:
        return '';
    }
  };

  getNavStyles = (navStyle: string) => {
    switch (navStyle) {
      case NAV_STYLE_DEFAULT_HORIZONTAL:
        return <HorizontalDefault />;
      case NAV_STYLE_DARK_HORIZONTAL:
        return <HorizontalDark />;
      case NAV_STYLE_INSIDE_HEADER_HORIZONTAL:
        return <InsideHeader />;
      case NAV_STYLE_ABOVE_HEADER:
        return <AboveHeader />;
      case NAV_STYLE_BELOW_HEADER:
        return <BelowHeader />;
      case NAV_STYLE_FIXED:
        return <Topbar />;
      case NAV_STYLE_DRAWER:
        return <Topbar />;
      case NAV_STYLE_MINI_SIDEBAR:
        return <Topbar />;
      case NAV_STYLE_NO_HEADER_MINI_SIDEBAR:
        return <NoHeaderNotification />;
      case NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR:
        return <NoHeaderNotification />;
      default:
        return '';
    }
  };

  getSidebar = (navStyle: string, width: number) => {
    if (width < TAB_SIZE) {
      return <Sidebar />;
    }
    switch (navStyle) {
      case NAV_STYLE_FIXED:
        return <Sidebar />;
      case NAV_STYLE_DRAWER:
        return <Sidebar />;
      case NAV_STYLE_MINI_SIDEBAR:
        return <Sidebar />;
      case NAV_STYLE_NO_HEADER_MINI_SIDEBAR:
        return <Sidebar />;
      case NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR:
        return <Sidebar />;
      default:
        return <Sidebar />;
    }
  };

  render() {
    const { match, width, navStyle, authUser } = this.props;

    return (
      <Layout className='gx-app-layout'>
        {this.getSidebar(navStyle, width)}
        <Layout>
          {this.getNavStyles(navStyle)}
          <Content
            className={`gx-layout-content ${this.getContainerClass(navStyle)} `}
          >
            <App match={match} />
            <Footer>
              <div className='gx-layout-footer-content'>{footerText}</div>
            </Footer>
          </Content>
        </Layout>
        {authUser && authUser.role == 1 && <Customizer />}
      </Layout>
    );
  }
}

const mapStateToProps = ({ settings, auth }: StoreState) => {
  const { width, navStyle } = settings;
  const { authUser } = auth;
  return { width, navStyle, authUser };
};
export default connect(mapStateToProps)(MainApp);
