import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants'
import HttpStatusCode from '@src/constants/HttpStatusCode'
import { GetListCompletedRoundParams, SetGameResultParams } from '@src/interfaces/WingoGame'
import request from '@src/util/request'

export async function getListCompletedRoundsWingo(data: GetListCompletedRoundParams) {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/game/get-completed-round',
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

export async function getListNextRoundsWingo() {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/game/get-next-rounds',
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

export async function setWingoGameResult(data: SetGameResultParams) {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/game/set-result',
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

export async function getStatisticCurrentRoundWingo() {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/game/get-statistic-current-round',
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