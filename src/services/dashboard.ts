import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants'
import HttpStatusCode from '@src/constants/HttpStatusCode'
import request from '@src/util/request'

/**
 * Get dashboard data including summary, chart data, and transactions
 */
export const getDashboardData = async (startTime?: number, endTime?: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/dashboard/get-summary-all',
        options: {
            method: 'post',
            data: {
                startTime,
                endTime
            },
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