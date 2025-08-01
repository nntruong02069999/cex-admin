import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants'
import HttpStatusCode from '@src/constants/HttpStatusCode'
import request from '@src/util/request'
import {
  CreateWheelSpinRewardRequest,
  UpdateWheelSpinRewardRequest,
} from '@src/interfaces/WheelSpinReward'

/**
 * Get list of wheel spin rewards
 */
export const getWheelSpinRewards = async () => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/wheel-spin/get-list-reward',
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
      message: res.data?.message || DEFAULT_ERROR_MESSAGE,
    }
  }
}

/**
 * Create new wheel spin reward
 */
export const createWheelSpinReward = async (data: CreateWheelSpinRewardRequest) => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/wheel-spin/create-reward',
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
      message: res.data?.message || DEFAULT_ERROR_MESSAGE,
    }
  }
}

/**
 * Update wheel spin reward
 */
export const updateWheelSpinReward = async (data: UpdateWheelSpinRewardRequest) => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/wheel-spin/update-reward',
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
      message: res.data?.message || DEFAULT_ERROR_MESSAGE,
    }
  }
} 