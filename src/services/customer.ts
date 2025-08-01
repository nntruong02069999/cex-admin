import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants'
import HttpStatusCode from '@src/constants/HttpStatusCode'
import request from '@src/util/request'

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