import dayjs from 'dayjs'
import { message } from 'antd'
import get from 'lodash/get'
import * as userServices from '@src/services/user'
import { EffectsCommandMap, Model } from 'dva'
import { ReducersMapObject } from 'redux'
import { IS_DEBUG } from '@src/constants/constants'

const RESOURCE = 'user'
const transfromDocument = (record: Record<string, any>) => {
  if (record.createdAt) {
    const createdAt = record.createdAt
    record.createdAt = dayjs(createdAt)
  }
  if (record.updatedAt) {
    const updatedAt = record.updatedAt
    record.updatedAt = dayjs(updatedAt)
  }
  if (record.birth) {
    const birth = record.birth
    record.birth = dayjs(birth)
  }
  if (record.cmnd_issue_date) {
    const cmnd_issue_date = record.cmnd_issue_date
    record.cmnd_issue_date = dayjs(cmnd_issue_date)
  }
  if (record.avatar && Array.isArray(record.avatar)) {
    record.avatar =
      record.avatar && record.avatar.length > 0
        ? record.avatar
            .filter((i) => i && i !== '')
            .map((i, idx) => ({
              uid: `${record.id}${idx + 1}`,
              name: `${record.name}-${idx}` || '',
              status: 'done',
              url: i,
            }))
        : []
  } else if (record.avatar && typeof record.avatar === 'string') {
    record.avatar = [
      {
        uid: `${record.id}`,
        name: `${record.name}` || '',
        status: 'done',
        url: record.avatar,
      },
    ]
  }
  if (record.isApprove) {
    record.isApprove = `${record.isApprove}`
  }

  return record
}

const userModel: Model = {
  namespace: `${RESOURCE}`,

  state: {
    data: {
      list: [],
      pagination: {
        total: 0,
        totalPages: 0,
        page: 1,
        pageSize: parseInt(process.env.PAGE_SIZE as string, 10),
      },
    },
    submitting: false,
    formTitle: '',
    formID: '',
    formVisible: false,
    formData: {},
  },

  effects: {
    *fetch({ payload, callback }, { call, put }: EffectsCommandMap) {
      const pageSize = get(
        payload,
        ['pageSize'],
        parseInt((process.env.PAGE_SIZE as string) || '10', 10)
      )
      let payloadRet = {}
      let list = []
      try {
        const { status, data = {} } = yield call(userServices.getList, payload)
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
              gender: 'Nam',
              experienceYear: 0,
              soldSuccessCount: 0,
              projectJoin: '',
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
        response = yield call(
          userServices.get,
          {
            queryInput: {
              id: payload.id,
            },
          },
          payload
        )

        if (response && response.status == 200 && response.data) {
          record = transfromDocument(response.data.data[0])
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
      let errorObj: any = {}
      try {
        if (formType === 'E') {
          const id = yield select((state: any) => state[`${RESOURCE}`].formID)
          if (!params.id) {
            params.id = id
          }
          response = yield call(userServices.update, id, params)
          if (response && response.status == 200 && response.data) {
            success = true
          }
        } else {
          response = yield call(userServices.create, params)
          if (response && response.status == 200 && response.data) {
            success = true
          }
        }
      } catch (error: any) {
        success = false
        errorObj = {
          message: error.message,
        }
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
        if (callback) {
          callback(response)
        }
      } else {
        message.error(errorObj.message, 10)
        if (callback) {
          callback({ error: errorObj })
        }
      }
    },
    *updateState({ payload, callback }, { call }: EffectsCommandMap): any {
      const params = { ...payload }
      try {
        const response = yield call(userServices.approveUser, params)
        if (response.status === 200) {
          message.success(response.data.message)
        } else {
          message.error(response.data.message)
        }
      } catch (error: any) {
        //
      }

      callback()
    },
    *changePass({ payload }, { call }: EffectsCommandMap): any {
      const params = { ...payload }
      try {
        const response = yield call(userServices.changePass, params)
        if (response.status === 200) {
          message.success('Đổi mật khẩu người dùng thành công')
        } else {
          message.error('Đổi mật khẩu người dùng thất bại')
        }
      } catch (error) {
        //
      }
    },
  },

  reducers: {
    save(state: any, action: any) {
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

export default userModel
