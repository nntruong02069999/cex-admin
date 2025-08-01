import dayjs from 'dayjs'
import { message } from 'antd'
import get from 'lodash/get'
import * as roleServices from '@src/services/role'
import { EffectsCommandMap, Model } from 'dva'
import { ReducersMapObject } from 'redux'
import { IS_DEBUG } from '@src/constants/constants'
// export interface ProcessEnv {
//   [key: string]: string | number | any
// }

const RESOURCE = 'role'
const transfromDocument = (record: Record<string, any>) => {
  if (record.createdAt) {
    const createdAt = record.createdAt
    record.createdAt = dayjs(createdAt)
  }
  if (record.updatedAt) {
    const updatedAt = record.updatedAt
    record.updatedAt = dayjs(updatedAt)
  }

  return record
}

const ROLES = {
  CREATE: 'c',
  VIEW: 'r',
  UPDATE: 'u',
  DELETE: 'd',
}

const tranformRoleAction = (action = '') => {
  const role = { c: false, r: false, u: false, d: false }
  if (action.includes(ROLES.VIEW)) {
    role.r = true
  }
  if (action.includes(ROLES.CREATE)) {
    role.c = true
  }
  if (action.includes(ROLES.UPDATE)) {
    role.u = true
  }
  if (action.includes(ROLES.DELETE)) {
    role.d = true
  }
  return role
}

const transfromRoleMenu = (data: Array<Record<string, any>>) => {
  return data.map((item) => {
    Object.assign(item, tranformRoleAction(item.action))
    if (item.children) {
      item.children = transfromRoleMenu(item.children)
    }
    return item
  })
}

const roleModel: Model = {
  namespace: `${RESOURCE}`,

  state: {
    data: {
      list: [],
      pagination: {
        total: 0,
        totalPages: 0,
        page: 1,
        pageSize: parseInt(process.env.REACT_APP_PAGESIZE as string, 10),
      },
    },
    submitting: false,
    formTitle: '',
    formID: '',
    formVisible: false,
    formData: {},
    roleMenu: [],
  },

  effects: {
    *fetch({ payload, callback }, { call, put }: EffectsCommandMap) {
      const pageSize = get(
        payload,
        ['pageSize'],
        parseInt((process.env.REACT_APP_PAGESIZE as string) || '10', 10)
      )
      let payloadRet = {}
      let list = []
      try {
        const { status, data = {} } = yield call(roleServices.getList, payload)
        if (status == 200) {
          list = []
          if (data.data) {
            list = get(data, 'data', []).map((item: any) => {
              transfromDocument(item)
              return item
            })
          }
          payloadRet = {
            list,
            pagination: {
              pageSize,
              total: get(data, 'count', 0),
              totalPages: Math.floor(
                (get(data, 'count', 0) + pageSize - 1) / pageSize
              ),
              page: get(payload, 'page', 1),
              current: get(payload, 'current', 1),
              skip: get(payload, 'skip', 0),
              limit: get(payload, 'limit', pageSize),
            },
          }
          yield put({
            type: 'save',
            payload: payloadRet,
          })
        }
      } catch (error: any) {
        message.error(error.message)
        // throw error;
      }
      if (callback) {
        callback(list)
      }
    },
    *loadForm({ payload, callback }, { put }: EffectsCommandMap) {
      yield put({
        type: 'changeFormVisible',
        payload: true,
      })

      yield [
        put({
          type: 'saveFormType',
          payload: payload.type,
        }),
        put({
          type: 'saveFormID',
          payload: '',
        }),
      ]
      if (payload.type === 'A') {
        yield [
          put({
            type: 'saveFormTitle',
            payload: 'Thêm mới',
          }),
          put({
            type: 'saveFormData',
            payload: {
              status: '1',
            },
          }),
        ]
      } else if (payload.type === 'E') {
        yield [
          put({
            type: 'saveFormTitle',
            payload: `Cập nhật ${payload.id}`,
          }),
          put({
            type: 'saveFormID',
            payload: payload.id,
          }),
          put({
            type: 'fetchForm',
            payload: {
              id: payload.id,
            },
          }),
        ]
      }
      if (callback) {
        callback()
      }
    },
    *fetchForm({ payload, callback }, { call, put }: EffectsCommandMap): any {
      let response
      let record
      try {
        response = yield call(roleServices.get, payload.id, payload)
        if (response && response.status == 200 && response.data) {
          record = transfromDocument(response.data)
        }
        yield [
          put({
            type: 'saveFormData',
            payload: record,
          }),
        ]
      } catch (error: any) {
        if (IS_DEBUG) {
          console.log('*fetch -> error', error)
        }

        message.error(error.message)
        // throw error;
      }
      if (callback) {
        callback(record)
      }
    },
    *submit(
      { payload, callback },
      { call, put, select }: EffectsCommandMap
    ): any {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      })

      const params = { ...payload }
      const formType = yield select(
        (state: any) => state[`${RESOURCE}`].formType
      )

      let success = false
      let response
      try {
        if (formType === 'E') {
          const id = yield select((state: any) => state[`${RESOURCE}`].formID)
          if (!params.id) {
            params.id = id
          }
          response = yield call(roleServices.update, id, params)
          if (response && response.status == 200 && response.data) {
            success = true
          }
        } else {
          response = yield call(roleServices.create, params)
          if (response && response.status == 200 && response.data) {
            success = true
          }
        }
      } catch (error: any) {
        success = false
        message.error(error.message)
      }

      yield put({
        type: 'changeSubmitting',
        payload: false,
      })

      if (success) {
        message.success('Thành công')
        yield put({
          type: 'changeFormVisible',
          payload: false,
        })
        // yield put({
        //   type: 'fetch',
        // });
      }
      if (callback) {
        callback(response)
      }
    },
    *fetchRoleMenu(
      { payload, callback },
      { call, put }: EffectsCommandMap
    ): any {
      let response
      let record
      try {
        response = yield call(roleServices.getRoleMenu, payload)
        if (
          response &&
          response.status == 200 &&
          response.data &&
          response.data.data
        ) {
          record = transfromRoleMenu(response.data.data)
        }
        yield [
          put({
            type: 'saveRoleMenu',
            payload: record,
          }),
        ]
      } catch (error: any) {
        if (IS_DEBUG) {
          console.log('*fetch -> error', error)
        }
        message.error(error.message)
        // throw error;
      }
      if (callback) {
        callback(record)
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: {
          ...state.data,
          list: action.payload.list,
          pagination: action.payload.pagination,
        },
      }
    },
    changeFormVisible(
      state: any,
      {
        payload,
      }: {
        payload: any
      }
    ) {
      return { ...state, formVisible: payload }
    },
    saveFormTitle(
      state: any,
      {
        payload,
      }: {
        payload: any
      }
    ) {
      return { ...state, formTitle: payload }
    },
    saveFormType(
      state: any,
      {
        payload,
      }: {
        payload: any
      }
    ) {
      return { ...state, formType: payload }
    },
    saveFormID(
      state: any,
      {
        payload,
      }: {
        payload: any
      }
    ) {
      return { ...state, formID: payload }
    },
    saveFormData(
      state: any,
      {
        payload,
      }: {
        payload: any
      }
    ) {
      return { ...state, formData: payload }
    },
    saveRoleMenu(
      state: any,
      {
        payload,
      }: {
        payload: any
      }
    ) {
      return { ...state, roleMenu: payload }
    },
    changeSubmitting(
      state: any,
      {
        payload,
      }: {
        payload: any
      }
    ) {
      return { ...state, submitting: payload }
    },
  } as ReducersMapObject<any, any>,
}

export default roleModel
