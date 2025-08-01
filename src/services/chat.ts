import { instance } from '@src/util/request'

export async function getConversationById(params: any, token: string) {
  return instance(process.env.REACT_APP_CHAT_URL || 'http://localhost:5000', {
    url: `/api/chat/conversation`,
    options: {
      method: 'get',
      params,
      headers: {
        'x-access-token': token,
      },
    },
  })
}

export async function chatLogin(username: string, password: string) {
  return instance(process.env.REACT_APP_CHAT_URL || 'http://localhost:5000', {
    url: `/api/login`,
    options: {
      method: 'post',
      data: {
        username,
        password,
      },
    },
  })
}
