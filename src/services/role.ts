import request from '@src/util/request'

export async function getList(params = {}) {
  return request({
    url: `/role`,
    options: {
      params,
    },
  })
}

export async function get(id: number | string, params = {}) {
  if (params !== null && Object.keys(params).length > 0) {
    return request({
      url: `/role/${id}`,
      options: { params },
    })
  }
  return request({
    url: `/role/${id}`,
  })
}

export async function create(data: any) {
  return request({
    url: `/role`,
    options: {
      method: 'post',
      data,
    },
  })
}

export async function update(id: string | number, data: any) {
  return request({
    url: `/role/${id}`,
    options: {
      method: 'patch',
      data,
    },
  })
}

export async function getRoleMenu(params = {}) {
  if (params !== null && Object.keys(params).length > 0) {
    return request({ url: `/admin/menu/get-role-menu`, options: { params } })
  }
  return request({ url: `/admin/menu/get-role-menu` })
}
