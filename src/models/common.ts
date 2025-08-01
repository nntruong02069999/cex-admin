import { ReducersMapObject } from "redux";

export default {
  namespace: 'common',

  state: {
    error: '',
    loading: false,
    message: '',
  },

  effects: {},

  reducers: {
    fetchStart(state) {
      return { ...state, error: '', message: '', loading: true }
    },
    fetchSuccess(state) {
      return { ...state, error: '', message: '', loading: false }
    },
    fetchError(
      state,
      {
        payload,
      }: {
        payload: any
      }
    ) {
      return { ...state, loading: false, error: payload, message: '' }
    },
    showMessage(
      state,
      {
        payload,
      }: {
        payload: any
      }
    ) {
      return { ...state, error: '', message: payload, loading: false }
    },
    hideMessage(state) {
      return { ...state, loading: false, error: '', message: '' }
    },
  } as ReducersMapObject<any, any>,

  subscriptions: {},
}
