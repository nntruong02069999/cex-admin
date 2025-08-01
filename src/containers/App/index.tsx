import { Component } from 'react'
import { connect } from 'dva'
import URLSearchParams from 'url-search-params'
import { router } from 'dva'
import * as H from 'history'
import { ConfigProvider } from 'antd'
import { IntlProvider } from 'react-intl'

import AppLocale from '@src/lngProvider'
import MainApp from './MainApp'
import SignIn from '../SignIn'
import SignUp from '../SignUp'
import ErrorPage from '../ErrorPages'

import {
  LAYOUT_TYPE_BOXED,
  LAYOUT_TYPE_FRAMED,
  LAYOUT_TYPE_FULL,
  NAV_STYLE_ABOVE_HEADER,
  NAV_STYLE_BELOW_HEADER,
  NAV_STYLE_DARK_HORIZONTAL,
  NAV_STYLE_DEFAULT_HORIZONTAL,
  NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
} from '../../constants/ThemeSetting'
import { StoreState } from '@src/interfaces'

interface RestrictedRouteProps {
  component?: any
  authUser?: any
  [x: string]: any
}

const { Redirect, Route, Switch } = router
function RestrictedRoute({
  component,
  authUser,
  ...rest
}: RestrictedRouteProps) {
  const Component = component
  return (
    <Route
      {...rest}
      render={(props: any) => {
        if (authUser) {
          if (authUser.role /* && authUser.role == 'admin' */)
            return <Component {...props} />
          return (
            <Redirect
              to={{
                pathname: '/signin',
                state: { from: props.location },
              }}
            />
          )
        }
        return (
          <Redirect
            to={{
              pathname: '/signin',
              state: { from: props.location },
            }}
          />
        )
      }}
    />
  )
}

function doScrollHeader() {
  const header = document.getElementsByClassName('gx-header-horizontal')[0]
  if (header) {
    if (window.scrollY > 25) {
      header.classList.add('gx-header-horizontal-header-scrolled')
    } else {
      header.classList.remove('gx-header-horizontal-header-scrolled')
    }
  }
}

class App extends Component<{
  dispatch?: any
  initURL?: string
  history?: any
  location?: any
  match?: any
  layoutType?: any
  navStyle?: any
  locale?: any
  authUser?: any
}> {
  setLayoutType = (layoutType: string) => {
    if (layoutType === LAYOUT_TYPE_FULL) {
      document.body.classList.remove('boxed-layout')
      document.body.classList.remove('framed-layout')
      document.body.classList.add('full-layout')
    } else if (layoutType === LAYOUT_TYPE_BOXED) {
      document.body.classList.remove('full-layout')
      document.body.classList.remove('framed-layout')
      document.body.classList.add('boxed-layout')
    } else if (layoutType === LAYOUT_TYPE_FRAMED) {
      document.body.classList.remove('boxed-layout')
      document.body.classList.remove('full-layout')
      document.body.classList.add('framed-layout')
    }
  }

  setNavStyle = (navStyle: string) => {
    if (
      navStyle === NAV_STYLE_DEFAULT_HORIZONTAL ||
      navStyle === NAV_STYLE_DARK_HORIZONTAL ||
      navStyle === NAV_STYLE_INSIDE_HEADER_HORIZONTAL ||
      navStyle === NAV_STYLE_ABOVE_HEADER ||
      navStyle === NAV_STYLE_BELOW_HEADER
    ) {
      document.body.classList.add('full-scroll')
      document.body.classList.add('horizontal-layout')
    } else {
      document.body.classList.remove('full-scroll')
      document.body.classList.remove('horizontal-layout')
    }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillMount() {
    const { dispatch, authUser } = this.props
    if (this.props.initURL === '') {
      dispatch({
        type: 'auth/setInitUrl',
        payload:
          this.props.history.location.pathname +
          this.props.history.location.search,
      })
    }
    dispatch({
      type: 'settings/initSetting',
      payload: {
        //
      },
    })

    const params = new URLSearchParams(this.props.location.search)
    if (params.has('theme')) {
      dispatch({
        type: 'settings/themeType',
        payload: params.get('theme'),
      })
    }
    if (params.has('nav-style')) {
      dispatch({
        type: 'settings/navStyle',
        payload: params.get('nav-style'),
      })
    }
    if (params.has('layout-type')) {
      dispatch({
        type: 'settings/layoutType',
        payload: params.get('layout-style'),
      })
    }
    if (this.props.authUser) {
      dispatch({
        type: 'menu/getMenuData',
        payload: {
          role: authUser.role,
        },
      })
    }
    window.addEventListener('scroll', doScrollHeader)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', doScrollHeader)
  }

  render() {
    const { match, location, layoutType, navStyle, locale, authUser, initURL } =
      this.props
    if (location.pathname === '/') {
      if (authUser === null) {
        return <Redirect to={'/signin'} />
      } else if (initURL === '' || initURL === '/' || initURL === '/signin') {
        return <Redirect to={'/dashboard'} />
      } else {
        return <Redirect to={initURL as H.LocationDescriptor<string>} />
      }
    }
    this.setLayoutType(layoutType)

    this.setNavStyle(navStyle)

    const currentAppLocale = AppLocale[locale.locale]
    return (
      <ConfigProvider locale={currentAppLocale.antd}>
        <IntlProvider
          locale={currentAppLocale.locale}
          messages={currentAppLocale.messages}
        >
          <Switch>
            <Route path="/error" component={ErrorPage} />
            <Route exact path="/signin" component={SignIn} />
            <Route exact path="/signup" component={SignUp} />
            <RestrictedRoute
              path={`${match.url}`}
              authUser={authUser}
              component={MainApp}
            />
          </Switch>
        </IntlProvider>
      </ConfigProvider>
    )
  }
}

const mapStateToProps = ({ settings, auth }: StoreState) => {
  const { locale, navStyle, layoutType } = settings
  const { authUser, initURL } = auth
  return { locale, navStyle, layoutType, authUser, initURL }
}
export default connect(mapStateToProps)(App)
