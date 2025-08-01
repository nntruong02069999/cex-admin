import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants';
import HttpStatusCode from '@src/constants/HttpStatusCode';
import request from '@src/util/request';
import {
  InvitationListParams,
  InvitationRecord,
  InvitationStats
} from '@src/components/InvitationReward/types';

export interface ApiError {
  errorCode: number;
  message: string;
}

export interface InvitationListResult {
  data: InvitationRecord[];
  total: number;
}

/**
 * Get invitation rewards list with filtering and pagination
 */
export const getInvitationList = async (
  params: InvitationListParams = {}
): Promise<InvitationListResult | ApiError> => {
  const token = localStorage.getItem('token');

  try {

    const url = `/admin/invitation-reward/get-list`;

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
 * Get invitation rewards statistics by status
 */
export const getInvitationStats = async (): Promise<InvitationStats | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/invitation-reward/get-stats-count',
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
 * Update invitation reward status (approve)
 */
export const approveInvitationReward = async (id: number): Promise<boolean | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: `/admin/invitation-reward/approve/${id}`,
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
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

/**
 * Update invitation reward status (reject)
 */
export const rejectInvitationReward = async (id: number): Promise<boolean | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: `/admin/invitation-reward/reject/${id}`,
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
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

// Legacy class-based service for backward compatibility
class InvitationRewardService {
  private static baseUrl = '/admin/invitation-reward';

  /**
   * Get invitation rewards list with filtering and pagination
   */
  static async getInvitationList(params: InvitationListParams = {}): Promise<{
    data: InvitationRecord[];
    total: number;
  }> {
    const result = await getInvitationList(params);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  /**
   * Get invitation rewards statistics by status
   */
  static async getInvitationStats(): Promise<InvitationStats> {
    const result = await getInvitationStats();
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  /**
   * Update invitation reward status (for admin actions)
   */
  static async updateInvitationStatus(
    id: number,
    action: 'approve' | 'reject'
  ): Promise<boolean> {
    let result;
    if (action === 'approve') {
      result = await approveInvitationReward(id);
    } else {
      result = await rejectInvitationReward(id);
    }

    if (typeof result === 'object' && 'errorCode' in result) {
      throw new Error(result.message);
    }

    return true;
  }
}

export default InvitationRewardService; 