import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants';
import HttpStatusCode from '@src/constants/HttpStatusCode';
import request from '@src/util/request';
import {
    CommissionRateListResponse,
    CommissionRateUpdateRequest,
    CommissionRateUpdateResponse,
    ApiError
} from '../components/ComissionRate/types';

/**
 * Get commission rates list
 */
export const getCommissionRates = async (): Promise<CommissionRateListResponse | ApiError> => {
    const token = localStorage.getItem('token');

    try {
        const res: any = await request({
            url: '/admin/comission-rate/get-list',
            options: {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
            return res.data;
        } else {
            return {
                errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
                message: res.data?.message || DEFAULT_ERROR_MESSAGE,
            };
        }
    } catch (error) {
        return {
            errorCode: HttpStatusCode.UNKNOW_ERROR,
            message: DEFAULT_ERROR_MESSAGE,
        };
    }
};

/**
 * Update commission rates for a specific game type
 */
export const updateCommissionRates = async (
    data: CommissionRateUpdateRequest
): Promise<CommissionRateUpdateResponse | ApiError> => {
    const token = localStorage.getItem('token');

    try {
        const res: any = await request({
            url: '/admin/comission-rate/update',
            options: {
                method: 'PUT',
                data,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
            return res.data;
        } else {
            return {
                errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
                message: res.data?.message || DEFAULT_ERROR_MESSAGE,
            };
        }
    } catch (error) {
        return {
            errorCode: HttpStatusCode.UNKNOW_ERROR,
            message: DEFAULT_ERROR_MESSAGE,
        };
    }
}; 