import { DEFAULT_PAGE_SETTING_ID, IS_DEBUG } from '@src/constants/constants'
import { helper } from '@src/controls/controlHelper'
import { arrayUtils } from '@src/packages/pro-utils'
import { EffectsCommandMap, Model } from 'dva'
import { ReducersMapObject } from 'redux'
import {
  // LAYOUT_TYPE,
  LAYOUT_TYPE_FULL,
  // NAV_STYLE,
  // NAV_STYLE_FIXED,
  NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
  // THEME_COLOR_SELECTION,
  THEME_COLOR_SELECTION_PRESET,
  // THEME_TYPE,
  NAV_STYLE_MINI_SIDEBAR,
  THEME_TYPE_LITE,
} from '../constants/ThemeSetting'

const initialSettings = {
  navCollapsed: false,
  navStyle: NAV_STYLE_MINI_SIDEBAR,
  layoutType: LAYOUT_TYPE_FULL,
  themeType: THEME_TYPE_LITE,
  colorSelection: THEME_COLOR_SELECTION_PRESET,

  pathname: '',
  width: window.innerWidth,
  isDirectionRTL: false,
  locale: {
    languageId: 'vietnam',
    locale: 'vi',
    name: 'VietNam',
    icon: 'vn',
  },
  query: {},
  pageInfo: {},
  settings: [],
  appConfig: {},
}

const settingsModel: Model = {
  namespace: 'settings',
  state: initialSettings,

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    toogleCollapsedNav(state, { payload }) {
      if (IS_DEBUG) {
        console.log(
          `🚀 ~ file: settings.js ~ line 45 ~ toogleCollapsedNav ~ payload`,
          payload
        )
      }
      return {
        ...state,
        navCollapsed: payload,
      }
    },
    windowWidth(state, { payload }) {
      return {
        ...state,
        width: payload,
      }
    },
    themeType(state, { payload }) {
      return {
        ...state,
        themeType: payload,
      }
    },
    themeColorSelection(state, { payload }) {
      return {
        ...state,
        colorSelection: payload,
      }
    },
    navStyle(state, { payload }) {
      return {
        ...state,
        navStyle: payload,
      }
    },
    layoutType(state, { payload }) {
      return {
        ...state,
        layoutType: payload,
      }
    },
    appConfig(state, { payload }) {
      return {
        ...state,
        appConfig: {
          ...state.appConfig,
          ...payload,
        },
      }
    },
    switchLanguage(state, { payload }) {
      return {
        ...state,
        locale: payload,
      }
    },
    queryAction(state, { payload }) {
      return {
        ...state,
        query: payload,
      }
    },
  } as ReducersMapObject<any, any>,

  subscriptions: {
    setup({ dispatch }: { dispatch: any }) {
      dispatch({ type: 'query' })
    },
    setupHistory({ dispatch, history }: { dispatch: any; history: any }) {
      history.listen((location: any) => {
        dispatch({
          type: 'updateState',
          payload: {
            pathname: location.pathname,
            query: location.query,
            search: location.search,
            navCollapsed: false,
          },
        })
      })
    },
  },

  effects: {
    *query({ payload }, { put }: EffectsCommandMap): any {
      yield put({
        type: 'queryAction',
        payload,
      })
    },
    *initSetting({}, { put, call, all }: EffectsCommandMap): any {
      try {
        const pageInfo = yield call(helper.getPage, DEFAULT_PAGE_SETTING_ID)
        const rs: any = yield call(
          helper.callPageApi,
          pageInfo,
          pageInfo.read,
          {
            // queryInput: JSON.stringify({ id: DEFAULT_PAGE_SETTING_ID }),
          }
        )
        const settings = rs?.data?.data ?? []
        yield all([
          put({
            type: 'updateState',
            payload: {
              pageInfo,
              settings,
            },
          }),
          put({
            type: 'themeType',
            payload:
              arrayUtils.findItemObject('name', 'theme', settings)?.settings
                ?.data || THEME_TYPE_LITE,
          }),
          put({
            type: 'navStyle',
            payload:
              arrayUtils.findItemObject('name', 'nav', settings)?.settings
                ?.data || NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
          }),
          put({
            type: 'layoutType',
            payload:
              arrayUtils.findItemObject('name', 'layout', settings)?.settings
                ?.data || LAYOUT_TYPE_FULL,
          }),
          put({
            type: 'appConfig',
            payload:
              arrayUtils.findItemObject('name', 'appConfig', settings)
                ?.settings || {},
          }),
        ])
      } catch (error) {
        console.error(
          `🚀 ~ file: settings.ts ~ line 174 ~ *initSetting ~ error`,
          error
        )
      }
    },
    *saveSetting({ payload }, { call, select }: EffectsCommandMap): any {
      try {
        const pageInfo = yield select(({ settings }: any) => settings.pageInfo)
        if (IS_DEBUG) {
          console.log(
            `🚀 ~ file: settings.ts ~ line 176 ~ *saveSetting ~ pageInfo`,
            pageInfo
          )
        }
        const currentSettings = yield select(
          ({ settings }: any) => settings.settings
        )
        if (IS_DEBUG) {
          console.log(
            `🚀 ~ file: settings.ts ~ line 178 ~ *saveSetting ~ currentSettings`,
            currentSettings
          )
        }
        const currentObj: any = arrayUtils.findItemObject(
          'name',
          payload.name,
          currentSettings
        )
        if (IS_DEBUG) {
          console.log(
            `🚀 ~ file: settings.ts ~ line 184 ~ *saveSetting ~ currentObj`,
            currentObj
          )
        }
        const input = {
          ...payload,
        }
        if (currentObj && currentObj.id) {
          input.id = currentObj.id
          yield call(helper.callPageApi, pageInfo, 'update', input)
        } else {
          yield call(helper.callPageApi, pageInfo, 'create', input)
        }

        helper.alert('Cập nhật thành công!')
      } catch (error) {
        helper.alert('Cập nhật thất bại!', 'error')
        if (IS_DEBUG) {
          console.error(
            `🚀 ~ file: settings.ts ~ line 183 ~ *saveSetting ~ error`,
            error
          )
        }
      }
    },
  },
}

export default settingsModel
