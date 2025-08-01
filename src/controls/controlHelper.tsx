import request from '../util/request'
import local from '../util/local'
import queryString from 'qs'
import _ from 'lodash'
import locations from '@src/constants/locations.json'
import { message } from 'antd'
import { DEFAULT_MODEL_SELECT_FIELD, IS_DEBUG } from '@src/constants/constants'

class Helper {
  safeStr = (str: string) => {
    // eslint-disable-next-line no-useless-escape
    str = str.replace(/\"/g, '')
    str = str.replace(/\//g, '')
    return str
  }

  replaceAll = (str: string, search: string, replacement: string) => {
    if (!str) str = ''
    return str.replace(new RegExp(search, 'g'), replacement)
  }

  reorder = (list: Array<any>, startIndex: number, endIndex: number) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  getLocationName = (type: string, id: number) => {
    const arr = (locations as any)[type]
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === id) return arr[i].name
    }
    return null
  }

  getApiByName = (apis: any, name: string) => {
    for (let i = 0; i < apis.length; i++) {
      if (apis[i].name === name) return apis[i]
    }
    return null
  }
  getTableChange = (resource: any) => {
    const tableChangeStr = sessionStorage.getItem(`${resource}_tableChange`)
    if (tableChangeStr) return JSON.parse(tableChangeStr)
    return JSON.parse('{}')
  }
  setTableChange = (resource: any, obj: any) => {
    sessionStorage.setItem(
      `${resource}_tableChange`,
      JSON.stringify({ ...obj })
    )
  }

  toDot = (money: number) => {
    if (IS_DEBUG) {
      console.log('@@the money', money)
    }
    if (money !== 0 && !money) return '0'
    return `${money}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  }

  showCustomModal = (opts: Record<string, any>) => {
    const { type, props } = opts
    const store = (window as any)._store
    return new Promise((resolve) => {
      store.dispatch({
        type: 'modal/pushModal',
        data: {
          type,
          props,
          cb: (rs: any) => {
            resolve(rs)
          },
        },
      })
    })
  }

  setUserInfo = (info: Record<string, any>) => {
    const store = (window as any)._store
    store.dispatch({
      type: 'SET_USER_INFO',
      data: info,
    })
  }

  alert = (content: any, type?: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        message.success(content, 3)
        break
      case 'warning':
        message.warning(content, 3)
        break
      case 'error':
        message.error(content, 3)
        break
      default:
        message.info(content, 3)
        break
    }
    /* return new Promise((resolve) => {
      const store = (window as any)._store
      store.dispatch({
        type: 'modal/pushModal',
        data: {
          type: 'message',
          content,
          cb: (rs: any) => {
            resolve(rs)
          },
        },
      })
    }) */
  }

  confirm = (content: any) => {
    return new Promise((resolve) => {
      const store = (window as any)._store
      store.dispatch({
        type: 'modal/pushModal',
        data: {
          type: 'confirm',
          content,
          cb: (rs: any) => {
            resolve(rs === 1)
          },
        },
      })
    })
  }

  callPageApi = (page: any, name: string, data: any) => {
    const api: any = this.getApiByName(page.apis, name)
    let input = _.clone(data)
    let url: string = api.url
    // if (new RegExp('^(/api/)[ a-z0-9_@./#&+-]+$').test(url)) {
    //   url = url.substr(4, url.length - 1)
    // }
    if (url.startsWith('/api/')) {
      url = url.substr(4, url.length - 1)
    }
    switch (api.method) {
      case 'GET':
        for (const i in data) {
          if (data[i] === undefined) delete data[i]
        }
        input = Object.assign(
          {},
          {
            page: page.id,
            api: api.name,
          },
          data
        )
        url += `?${queryString.stringify(input)}`
        break
      case 'PATCH':
      case 'DELETE':
        if (api.type === 'update') {
          url += `/${data.id}?${queryString.stringify({
            page: page.id,
            api: api.name,
          })}`
          delete input.id
        }
        break
      default:
        url += `?${queryString.stringify({ page: page.id, api: api.name })}`
        break
    }
    return request({
      url: `${url}`,
      options: {
        method: api.method,
        data,
      },
    })
  }

  callPublicApi = (name: string, apiUrl: string, method: string, data: any) => {
    const api: any = { name, url: apiUrl, method }
    let input = _.clone(data)
    let url: string = api.url
    if (url.startsWith('/api/')) {
      url = url.substr(4, url.length - 1)
    }
    switch (api.method) {
      case 'GET':
        for (const i in data) {
          if (data[i] === undefined) delete data[i]
        }
        input = Object.assign(
          {},
          {
            api: api.name,
          },
          data
        )
        url += `?${queryString.stringify(input)}`
        break
      case 'PATCH':
      case 'DELETE':
        if (api.type === 'update') {
          url += `/${data.id}?${queryString.stringify({
            api: api.name,
          })}`
          delete input.id
        }
        break
      default:
        url += `?${queryString.stringify({ api: api.name })}`
        break
    }
    return request({
      url: `${url}`,
      options: {
        method: api.method,
        data,
      },
    })
  }

  getReportUrl = (page: any, name: string, data: any) => {
    const api: any = this.getApiByName(page.apis, name)
    let input = _.clone(data),
      url = api.url
    switch (api.method) {
      case 'GET':
        for (const i in data) {
          if (data[i] === undefined) delete data[i]
        }
        input = Object.assign(
          {},
          {
            page: page.id,
            api: api.name,
            accesstoken: local.get('token') || 'customer',
          },
          data
        )
        url += `?${queryString.stringify(input)}`
        break
      default:
        break
    }
    if (IS_DEBUG) {
      console.log('report url', url)
    }
    return url
  }

  getApiUrl = (page: any, name: string) => {
    let api = null
    for (let i = 0; i < page.apis.length; i++) {
      if (page.apis[i].name === name) {
        api = page.apis[i]
        break
      }
    }
    switch (api.action) {
      default:
        return `/${api.controller}/${api.action}?page=${page.id}&api=${name}`
    }
  }

  getPage = async (id: number) => {
    id = Number(id)
    const meta = local.get('meta')
    const pages = meta.pages
    for (let i = 0; i < (pages || []).length; i++) {
      if (pages[i].id === id) {
        if (!Array.isArray(pages[i].buttons)) pages[i].buttons = []
        return pages[i]
      }
    }
  }

  getValue = (obj: Record<string, any> | string | number) => {
    if (IS_DEBUG) {
      console.log(`🚀 ~ file: controlHelper.tsx ~ line 233 ~ Helper ~ obj`, obj)
    }
    if (typeof obj === 'object') {
      return Object.keys(obj)
        .map((key) => obj[key])
        .join(',')
    }
    return obj
  }

  transformModelSelectField = (_fields: string) => {
    const _fieldName:any = {}
    const _fieldNameArr = (_fields || DEFAULT_MODEL_SELECT_FIELD).split(',')
    _fieldNameArr.forEach((n: string) => {
      const arr = n.split('$$')
      _fieldName[arr[0]] = arr[1] || arr[0]
    })
    return _fieldName
  }
}

export const helper = new Helper()
