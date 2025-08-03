import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants';
import HttpStatusCode from '@src/constants/HttpStatusCode';
import request from '@src/util/request';
import {
  DepositListParams,
  DepositRecord,
  DepositStats
} from '@src/components/Deposit/types';

export interface ApiError {
  errorCode: number;
  message: string;
}

export interface DepositListResult {
  data: DepositRecord[];
  total: number;
}

/**
 * Get deposits list with filtering and pagination
 */
export const getDepositList = async (
  params: DepositListParams = {}
): Promise<DepositListResult | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const url = `/admin/deposit/get-list`;

    const res: any = await request({
      url,
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: params,
      },
    });

    if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
      return {
        data: res.data.data,
        total: res.data.count
      };
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
 * Get deposit statistics by status
 */
export const getDepositStats = async (): Promise<DepositStats | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/deposit/get-status-count',
      options: {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
      return res.data.data;
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
 * Export deposit data (placeholder for future implementation)
 */
export const exportDepositData = async (
  params: DepositListParams = {}
): Promise<boolean | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/deposit/export',
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: params,
      },
    });

    if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
      return true;
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

export const confirmDeposit = async (id: number) => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/deposit/confirm',
    options: {
      method: 'post',
      data: {
        id: id
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

export const cancelDeposit = async (id: number) => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/deposit/cancel',
    options: {
      method: 'post',
      data: {
        id: id
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

// Legacy class-based service for backward compatibility
class DepositService {

  /**
   * Get deposits list with filtering and pagination
   */
  static async getDepositList(params: DepositListParams = {}): Promise<{
    data: DepositRecord[];
    total: number;
  }> {
    const result = await getDepositList(params);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  /**
   * Get deposit statistics by status
   */
  static async getDepositStats(): Promise<DepositStats> {
    const result = await getDepositStats();
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  /**
   * Export deposit data
   */
  static async exportDepositData(params: DepositListParams = {}): Promise<boolean> {
    const result = await exportDepositData(params);
    if (typeof result === 'object' && 'errorCode' in result) {
      throw new Error(result.message);
    }
    return true;
  }

  static async confirmDeposit(id: number) {
    const result = await confirmDeposit(id);
    if (typeof result === 'object' && 'errorCode' in result) {
      throw new Error(result.message);
    }
  }

  static async cancelDeposit(id: number) {
    const result = await cancelDeposit(id);
    if (typeof result === 'object' && 'errorCode' in result) {
      throw new Error(result.message);
    }
  }
}

export default DepositService; 