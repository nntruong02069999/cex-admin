import { EffectsCommandMap, Model } from 'dva'
import { ReducersMapObject } from 'redux'
import omit from 'lodash/omit'
import * as chatServices from '@src/services/chat'
import HttpStatusCode from '@src/constants/HttpStatusCode'

const chatModel: Model = {
  namespace: 'chat',

  state: {
    users: [],
    activedUsers: [],
    conversationList: [],
  },

  effects: {
    *getConversation(
      { payload, callback },
      { put, select, call }: EffectsCommandMap
    ): any {
      try {
        const resConversaction = yield call(
          chatServices.getConversationById,
          omit(payload, ['token']),
          payload.token
        )
        const { receiverId } = payload
        if (
          resConversaction.status == HttpStatusCode.OK &&
          !resConversaction.data.errorCode
        ) {
          const conversaction = resConversaction.data
          const conversationList = yield select(
            ({ chat }: any) => chat.conversationList
          )
          const curConversation = conversationList.find(
            (i: any) => i.id == receiverId
          )
          let newConversationList = []
          if (curConversation) {
            curConversation.conversationData = [
              ...(curConversation.conversationData || []),
              ...conversaction.map((i: any) => ({
                type: i.sender_id == receiverId ? 'received' : 'sent',
                message: i.message_body,
                sentAt: i.created_at,
              })),
            ]
            for (let index = 0; index < conversationList.length; index++) {
              const element = conversationList[index]
              if (element.id == receiverId) {
                element.conversationData = curConversation.conversationData
              }
            }
            newConversationList = [...conversationList]
          } else {
            newConversationList = [
              ...(conversationList || []),
              {
                id: receiverId,
                conversationData: [
                  ...conversaction.map((i: any) => ({
                    type:
                      i.sender_id == receiverId ? 'received' : 'sent',
                    message: i.message_body,
                    sentAt: i.created_at,
                  })),
                ],
              },
            ]
          }
          yield put({
            type: 'setConversationList',
            payload: newConversationList,
          })
          if (callback) {
            callback({
              conversationList: newConversationList,
            })
          }
        } else {
          console.log(
            `🚀 ~ file: chat.ts ~ line 87 ~ resConversaction.status == 0 && !resConversaction.data.errorCode`,
            resConversaction.status == 0 && !resConversaction.data.errorCode
          )
        }
      } catch (err) {
        console.error(`🚀 ~ file: chat.ts ~ line 72 ~ err`, err)
      }
    },
  },

  reducers: {
    setUsers(state, { payload }) {
      const users = (payload.users || []).map((i: any) => ({
        ...i,
        id: i.refId,
        chatSystemId: i.id
      }))
      return {
        ...state,
        users,
        activedUsers: users.filter((u: any) => u.status == 'online'),
      }
    },
    setConversationList(state, { payload }) {
      return {
        ...state,
        conversationList: payload,
      }
    },
  } as ReducersMapObject<any, any>,

  subscriptions: {},
}

export default chatModel
