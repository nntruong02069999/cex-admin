import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants'
import HttpStatusCode from '@src/constants/HttpStatusCode'
import request from '@src/util/request'

export interface GetGameThirdPartyHistoryParams {
    customerId: number;
    page?: number;
    limit?: number;
    providerCode?: string;
}

/**
 * Get list of game providers
 */
export const getGameProviders = async () => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/gamethirty/get-list-game-provider',
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
 * Get third-party game history
 */
export const getGameThirdPartyHistory = async (params: GetGameThirdPartyHistoryParams) => {
    const token = localStorage.getItem('token')
    const res: any = await request({
        url: '/admin/gamethirty/get-history-play',
        options: {
            method: 'post',
            data: {
                customerId: params.customerId,
                page: params.page || 1,
                limit: params.limit || 10,
                ...(params.providerCode && { providerCode: params.providerCode }),
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
            data: {
                items: [],
                meta: {
                    totalItems: 0
                }
            }
        }
    }
} 