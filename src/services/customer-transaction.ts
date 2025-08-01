import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants'
import HttpStatusCode from '@src/constants/HttpStatusCode'
import request from '@src/util/request'

export interface GetTransactionsParams {
    page?: number
    limit?: number
    sort?: string
    order?: 'asc' | 'desc'
    status?: string
    customerId?: number
    fromDate?: string
    toDate?: string
    orderId?: string
}

export async function getDepositTransactions(data: GetTransactionsParams) {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/deposit/get-list-deposit',
        options: {
            method: 'post',
            data: data,
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

export async function getWithdrawTransactions(data: GetTransactionsParams) {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/withdraw/get-list',
        options: {
            method: 'post',
            data: data,
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

export async function approveDeposit(id: number) {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/approve-deposit/${id}`,
        options: {
            method: 'put',
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

export async function rejectDeposit(id: number, reason: string) {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/reject-deposit/${id}`,
        options: {
            method: 'put',
            data: { reason },
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

export async function approveWithdraw(id: number) {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/approve-withdraw/${id}`,
        options: {
            method: 'put',
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

export async function rejectWithdraw(id: number, reason: string) {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/reject-withdraw/${id}`,
        options: {
            method: 'put',
            data: { reason },
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

export interface GetLoginHistoryParams {
    customerId?: number
    page?: number
    limit?: number
}

export async function getLoginHistory(data: GetLoginHistoryParams) {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/get-login-history',
        options: {
            method: 'post',
            data: data,
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

export interface GetBettingHistoryParams {
    customerId?: number
    page?: number
    limit?: number
    gameType: string
    gamePlayStyle?: string
    issueNumber?: string
    state?: string
    sort?: string
    order?: 'asc' | 'desc'
}

export async function getBettingHistory(data: GetBettingHistoryParams) {
    const token = localStorage.getItem('token')
    
    // Choose the appropriate endpoint based on game type
    let url = '/admin/customer/get-betting-history';
    if (data.gameType === 'wingo') {
        url = '/admin/customer/wingo/get-history';
    } else if (data.gameType === 'trx_wingo') {
        url = '/admin/customer/trx-wingo/get-history';
    } else if (data.gameType === '5d') {
        url = '/admin/customer/5d/get-history';
    } else if (data.gameType === '3k') {
        url = '/admin/customer/k3/get-history';
    }
    
    const res: any = await request({
        url: url,
        options: {
            method: 'post',
            data: data,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    })
    if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
        const responseData = {
            data: res.data.data || [],
            total: res.data.count || 0,
            message: res.data.message
        };
        return responseData;
    } else {
        return {
            errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
            message: res.data.message || DEFAULT_ERROR_MESSAGE,
            data: [],
            total: 0
        }
    }
}

export async function getBettingStatistics(data: { customerId?: number, gameType: string, gamePlayStyle?: string }) {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/get-lottery-game-statistics',
        options: {
            method: 'post',
            data: data,
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