import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants';
import HttpStatusCode from '@src/constants/HttpStatusCode';
import request from '@src/util/request';
import {
  WithdrawListParams,
  WithdrawRecord,
  WithdrawStats
} from '@src/components/Withdraw/types';

export interface ApiError {
  errorCode: number;
  message: string;
}

export interface WithdrawListResult {
  data: WithdrawRecord[];
  total: number;
}

/**
 * Get withdraws list with filtering and pagination
 */
export const getWithdrawList = async (
  params: WithdrawListParams = {}
): Promise<WithdrawListResult | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const url = `/admin/withdraw/get-list`;

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
 * Get withdraw statistics by status
 */
export const getWithdrawStats = async (): Promise<WithdrawStats | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/withdraw/get-status-count',
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

export const confirmWithdraw = async (id: number) => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/withdraw/confirm',
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

export const rejectWithdraw = async (id: number, reason?: string) => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/withdraw/reject',
    options: {
      method: 'post',
      data: {
        id: id,
        reason: reason
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
class WithdrawService {

  /**
   * Get withdraws list with filtering and pagination
   */
  static async getWithdrawList(params: WithdrawListParams = {}): Promise<{
    data: WithdrawRecord[];
    total: number;
  }> {
    const result = await getWithdrawList(params);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  /**
   * Get withdraw statistics by status
   */
  static async getWithdrawStats(): Promise<WithdrawStats> {
    const result = await getWithdrawStats();
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async confirmWithdraw(id: number) {
    const result = await confirmWithdraw(id);
    if (typeof result === 'object' && 'errorCode' in result) {
      throw new Error(result.message);
    }
  }

  static async rejectWithdraw(id: number, reason?: string) {
    const result = await rejectWithdraw(id, reason);
    if (typeof result === 'object' && 'errorCode' in result) {
      throw new Error(result.message);
    }
  }
}

export default WithdrawService;

// Export the legacy object-style service for backward compatibility
export const withdrawService = {
  async getWithdrawList(params: WithdrawListParams): Promise<{ code: number; data: WithdrawRecord[]; count: number; message: string }> {
    const result = await getWithdrawList(params);
    if ('errorCode' in result) {
      return {
        code: result.errorCode,
        data: [],
        count: 0,
        message: result.message
      };
    }
    return {
      code: 0,
      data: result.data,
      count: result.total,
      message: 'Success'
    };
  },

  async getWithdrawStats(): Promise<{ code: number; data: WithdrawStats; message: string }> {
    const result = await getWithdrawStats();
    if ('errorCode' in result) {
      return {
        code: result.errorCode,
        data: { PENDING: 0, SUCCESS: 0, REJECTED: 0 },
        message: result.message
      };
    }
    return {
      code: 0,
      data: result,
      message: 'Success'
    };
  },

  async confirmWithdraw(id: number): Promise<{ code: number; message: string }> {
    const result = await confirmWithdraw(id);
    if (typeof result === 'object' && 'errorCode' in result) {
      return {
        code: result.errorCode,
        message: result.message
      };
    }
    return result;
  },

  async rejectWithdraw(id: number, reason?: string): Promise<{ code: number; message: string }> {
    const result = await rejectWithdraw(id, reason);
    if (typeof result === 'object' && 'errorCode' in result) {
      return {
        code: result.errorCode,
        message: result.message
      };
    }
    return result;
  }
}; 