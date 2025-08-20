import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants'
import HttpStatusCode from '@src/constants/HttpStatusCode'
import request from '@src/util/request'

// Types for customer detail APIs
export interface CustomerDetailParams {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
}

/**
 * Get all customer information by ID
 */
export const getCustomerInfo = async (customerId: number, tokenCapcha: string) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/get-all-customer-info',
        options: {
            method: 'post',
            data: {
                customerId,
                tokenCapcha
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

/**
 * Admin deposit money to customer account
 */
export const adminDeposit = async (customerId: number, amount: number, tokenCapcha: string, inRevenue: boolean = false) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/admin-deposit',
        options: {
            method: 'post',
            data: {
                customerId,
                amount,
                tokenCapcha,
                inRevenue
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

/**
 * Admin withdraw money from customer account
 */
export const adminWithdraw = async (customerId: number, amount: number, tokenCapcha: string, inRevenue: boolean = false) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/admin-withdraw',
        options: {
            method: 'post',
            data: {
                customerId,
                amount,
                tokenCapcha,
                inRevenue
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

/**
 * Update customer information
 */
export const updateCustomerInfo = async (customerId: number, name: string) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/update-customer-info',
        options: {
            method: 'post',
            data: {
                customerId,
                name
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

/**
 * Lock or unlock customer account
 */
export const lockUnlockCustomer = async (customerId: number, action: 'lock' | 'unlock') => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/action-lock',
        options: {
            method: 'post',
            data: {
                customerId,
                action
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

export const updateAgencyLevel = async (customerId: number, agencyLevelId: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/update-agency-level',
        options: {
            method: 'post',
            data: {
                customerId,
                agencyLevelId
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

export const updateTotalVolumnBet = async (customerId: number, totalVolumnBet: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/update-total-volumn-bet',
        options: {
            method: 'post',
            data: {
                customerId,
                totalVolumnBet
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

export const getListAgencyLevel = async () => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/agencylevel/get-list',
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

export const confirmDeposit = async (paymentTransactionId: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/deposit/confirm',
        options: {
            method: 'post',
            data: {
                id: paymentTransactionId
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

export const cancelDeposit = async (paymentTransactionId: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/deposit/cancel',
        options: {
            method: 'post',
            data: {
                id: paymentTransactionId
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

export const confirmWithdraw = async (withdrawTransactionId: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/withdraw/confirm',
        options: {
            method: 'post',
            data: {
                id: withdrawTransactionId
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

export const cancelWithdraw = async (withdrawTransactionId: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/withdraw/reject',
        options: {
            method: 'post',
            data: {
                id: withdrawTransactionId
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

export const topF1Deposit = async (customerId: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/customer/agency/top-f1-deposit',
        options: {
            method: 'post',
            data: {
                customerId
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

export const addWheelSpin = async (customerId: number, amount: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/wheel-spin/plus-spin',
        options: {
            method: 'post',
            data: {
                customerId,
                amount
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

/**
 * Get detailed customer information for customer detail page
 */
export const getCustomerDetail = async (customerId: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/${customerId}/detail`,
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
 * Add balance to customer account (admin action)
 */
export const addBalance = async (customerId: number, amount: number, note?: string) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/${customerId}/balance/add`,
        options: {
            method: 'post',
            data: {
                amount,
                note
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

/**
 * Subtract balance from customer account (admin action)
 */
export const subtractBalance = async (customerId: number, amount: number, note?: string) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/${customerId}/balance/subtract`,
        options: {
            method: 'post',
            data: {
                amount,
                note
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

/**
 * Update customer VIP level
 */
export const updateVipLevel = async (customerId: number, newLevel: number, note?: string) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/${customerId}/vip-level`,
        options: {
            method: 'put',
            data: {
                newLevel,
                note
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

/**
 * Update customer marketing status
 */
export const updateMarketingStatus = async (customerId: number, isAccountMarketing: boolean) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/${customerId}/marketing-status`,
        options: {
            method: 'put',
            data: {
                isAccountMarketing
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

/**
 * Get customer deposits with pagination and filters
 */
export const getCustomerDeposits = async (customerId: number, params: {
    page?: number;
    limit?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString())
        }
    })

    const res: any = await request({
        url: `/admin/customer/${customerId}/deposits?${queryParams.toString()}`,
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
 * Get customer withdrawals with pagination and filters
 */
export const getCustomerWithdrawals = async (customerId: number, params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString())
        }
    })

    const res: any = await request({
        url: `/admin/customer/${customerId}/withdrawals?${queryParams.toString()}`,
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
 * Get customer USDT transactions
 */
export const getCustomerUSDTTransactions = async (customerId: number, params: {
    page?: number;
    limit?: number;
    type?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString())
        }
    })

    const res: any = await request({
        url: `/admin/customer/${customerId}/usdt-transactions?${queryParams.toString()}`,
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
 * Get customer wallet transactions
 */
export const getCustomerWalletTransactions = async (customerId: number, params: {
    page?: number;
    limit?: number;
    type?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString())
        }
    })

    const res: any = await request({
        url: `/admin/customer/${customerId}/wallet-transactions?${queryParams.toString()}`,
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
 * Get customer VIP commissions with enhanced filtering
 */
export const getCustomerVipCommissions = async (customerId: number, params: {
    page?: number;
    limit?: number;
    commissionType?: string;
    status?: string;
    fromNickname?: string;
    levelReferral?: number;
    fromDate?: number; // timestamp in seconds
    toDate?: number;   // timestamp in seconds
}) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/vip-commissions`,
        options: {
            method: 'post',
            data: {
                customerId,
                ...params
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

/**
 * Get customer daily statistics for charts
 */
export const getCustomerDailyStatistics = async (customerId: number, params: {
    fromDate?: string;
    toDate?: string;
    limit?: number;
}) => {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString())
        }
    })

    const res: any = await request({
        url: `/admin/customer/${customerId}/daily-statistics?${queryParams.toString()}`,
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
 * Get customer VIP daily log for commission charts
 */
export const getCustomerVipDailyLog = async (customerId: number, params: {
    startDate: number; // timestamp in milliseconds
    endDate: number;   // timestamp in milliseconds
}) => {
    const token = localStorage.getItem('token')

    const res: any = await request({
        url: `/admin/customer/vip-daily-log`,
        options: {
            method: 'post',
            data: {
                customerId,
                ...params
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


/**
 * Get VIP commission summary for dashboard cards
 */
export const getVipCommissionSummary = async (customerId: number) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: `/admin/customer/vip-commission-summary`,
        options: {
            method: 'post',
            data: {
                customerId
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