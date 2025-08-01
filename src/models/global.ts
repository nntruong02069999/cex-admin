import { EffectsCommandMap, Model } from 'dva'
import { ReducersMapObject } from 'redux'
import { delay } from 'redux-saga/effects'
import { IS_DEBUG } from '@src/constants/constants'

const globalModel: Model = {
  namespace: 'global',

  state: {
    collapsed: true,
    notices: [],
    clock: {
      lastUpdate: null,
      light: false,
    },
  },

  effects: {
    *fetchNotices() {
      /* const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      const unreadCount = yield select(
        state => state.global.notices.filter(item => !item.read).length
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: data.length,
          unreadCount,
        },
      }); */
    },
    *clearNotices({ payload }, { put, select }: EffectsCommandMap): any {
      yield put({
        type: 'saveClearedNotices',
        payload,
      })
      const count = yield select((state: any) => state.global.notices.length)
      const unreadCount = yield select(
        (state: any) =>
          state.global.notices.filter((item: any) => !item.read).length
      )
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: count,
          unreadCount,
        },
      })
    },
    *changeNoticeReadState(
      { payload },
      { put, select }: EffectsCommandMap
    ): any {
      const notices = yield select((state: any) =>
        state.global.notices.map((item: any) => {
          const notice = { ...item }
          if (notice.id === payload) {
            notice.read = true
          }
          return notice
        })
      )
      yield put({
        type: 'saveNotices',
        payload: notices,
      })
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: notices.length,
          unreadCount: notices.filter((item: any) => !item.read).length,
        },
      })
    },
    *runClockSaga({ payload }, { put }: EffectsCommandMap) {
      while (true) {
        try {
          yield put({
            type: 'tickClock',
            payload: {
              light: !payload.isServer,
              ts: Date.now(),
            },
          })
          yield delay(1000)
        } catch (error) {
          if (IS_DEBUG) {
            console.log(
              `🚀 ~ file: global.js ~ line 92 ~ *runClockSaga ~ error`,
              error
            )
          }
        }
      }
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      }
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      }
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter((item: any) => item.type !== payload),
      }
    },
    tickClock(state, { payload }) {
      if (IS_DEBUG) {
        console.log(
          `🚀 ~ file: global.js ~ line 106 ~ tickClock ~ payload`,
          payload
        )
      }
      return {
        ...state,
        clock: {
          lastUpdate: payload.ts,
          light: !!payload.light,
        },
      }
    },
  } as ReducersMapObject<any, any>,

  subscriptions: {
    // keyEvent({ dispatch }) {
    //   console.log('keyEvent -> dispatch', dispatch);
    // },
    setup({ history }: { history: any }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }: any) => {
        if (IS_DEBUG) {
          console.log(
            `🚀 ~ file: global.ts ~ line 145 ~ returnhistory.listen ~ pathname`,
            pathname
          )
        }
        if (typeof (window as any).ga !== 'undefined')
          (window as any).ga('send', 'pageview', pathname + search)
      })
    },
  },
}

export default globalModel
