import request from '@src/util/request'
import { stringify } from 'qs'
import omit from 'lodash/omit'

export async function getList(params: { queryInput?: Record<string, any> }) {
  let queryInput
  const query = omit(params, 'queryInput')
  if (params.queryInput) {
    queryInput = JSON.stringify(params.queryInput)
  }
  if (queryInput) {
    return request({
      url: `/user?queryInput=${queryInput}&${stringify(query)}`,
    })
  }
  return request({
    url: `/user?${stringify(query)}`,
  })
}

export async function get(params = {}) {
  if (params !== null && Object.keys(params).length > 0) {
    return request({ url: `/user`, options: { params } })
  }
  return request({ url: `/user` })
}

export async function create(data: any) {
  return request({
    url: `/user/create-user`,
    options: {
      method: 'post',
      data,
    },
  })
}

export async function update(id: string | number, data: any) {
  return request({
    url: `admin/user/update-info`,
    options: {
      method: 'post',
      data: {
        id,
        info: data,
      },
    },
  })
}

export async function changePass(data: any) {
  return request({
    url: `/admin/user/set-password`,
    options: {
      method: 'patch',
      data,
    },
  })
}
export async function approveUser(data: any) {
  return request({
    url: `/admin/user/approve-user`,
    options: {
      method: 'post',
      data,
    },
  })
}
export async function setUserRole(data: any) {
  return request({
    url: `/admin/user/set-user-role`,
    options: {
      method: 'post',
      data,
    },
  })
}
