import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants'
import { WINGO_TIME_CONFIG } from '@src/constants/enums'
import HttpStatusCode from '@src/constants/HttpStatusCode'
import { GetListCompletedRoundParams, Set5DGameResultParams } from '@src/interfaces/5DGame'
import request from '@src/util/request'

export async function getListCompletedRounds(data: GetListCompletedRoundParams) {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/d5/get-completed-round',
    options: {
      method: 'post',
      data,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
  if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data
  } else {
    return {
      errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
      message: res.data.message || DEFAULT_ERROR_MESSAGE,
    }
  }
}

export async function getListNextRounds(timeConfig: WINGO_TIME_CONFIG) {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: `/admin/d5/get-next-rounds?timeConfig=${timeConfig}`,
    options: {
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
  if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data
  } else {
    return {
      errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
      message: res.data.message || DEFAULT_ERROR_MESSAGE,
    }
  }
}

export async function set5DGameResult(data: Set5DGameResultParams) {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/d5/set-result',
    options: {
      method: 'post',
      data,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
  if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data
  } else {
    return {
      errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
      message: res.data.message || DEFAULT_ERROR_MESSAGE,
    }
  }
}

export async function getStatisticCurrentRound(timeConfig: WINGO_TIME_CONFIG) {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: `/admin/d5/get-statistic-current-round?timeConfig=${timeConfig}`,
    options: {
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
  if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data
  } else {
    return {
      errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
      message: res.data.message || DEFAULT_ERROR_MESSAGE,
    }
  }
}