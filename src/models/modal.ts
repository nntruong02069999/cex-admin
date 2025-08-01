import { ReducersMapObject } from 'redux'
import uniqueId from 'lodash/uniqueId'
import clone from 'lodash/clone'

export default {
  namespace: 'modals',

  state: [],

  effects: {},

  reducers: {
    pushModal(state, { data }) {
      data.show = true
      data.id = uniqueId()
      state.push(data)
      return state
    },
    popModal(state, { data }) {
      const tmp = clone(state)
      for (let i = 0; i < state.length; i++) {
        if (tmp[i].id === data.id) {
          tmp[i].show = false
          tmp.splice(i, 1)
        }
      }
      return tmp
    },
    hideModal(state, { data }) {
      const tmp = clone(state)
      for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].id === data.id) {
          tmp[i].show = false
        }
      }
      return tmp
    },
  } as ReducersMapObject<any, any>,

  subscriptions: {},
}
