import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants';
import HttpStatusCode from '@src/constants/HttpStatusCode';
import request from '@src/util/request';

export interface ApiError {
  errorCode: number;
  message: string;
}

// VIP Summary Types
export interface VipSummaryResponse {
  totalVipCustomers: number;
  activeCustomers: number;
  monthlyRevenue: number;
  upgradeRate: number;
  topRankCustomer: {
    id: number;
    name: string;
    rank: number;
    vipLevel: number;
  };
  previousMonth: {
    totalVipCustomers: number;
    activeCustomers: number;
    monthlyRevenue: number;
    upgradeRate: number;
  };
}

// VIP Distribution Types
export interface VipLevelDistribution {
  level: number;
  count: number;
  percentage: number;
}

export interface VipDistributionResponse {
  distribution: VipLevelDistribution[];
}

// VIP Commission Types
export interface VipCommissionData {
  totalCommission: number;
  commissionByType: {
    trading: number;
    upgrade: number;
    referral: number;
    bonus: number;
  };
  dailyTrend: Array<{
    date: string;
    amount: number;
  }>;
  topEarners: Array<{
    customerId: number;
    name: string;
    amount: number;
  }>;
}

export interface VipCommissionParams {
  period?: 'daily' | 'weekly' | 'monthly';
  days?: number;
}

// VIP Ranking Types
export interface VipRankedCustomer {
  rank: number;
  customerId: number;
  name: string;
  vipLevel: number;
  f1Count: number;
  tradingVolume: number;
  totalScore: number;
  rankChange: number;
}

export interface VipRankingResponse {
  topRanked: VipRankedCustomer[];
  competitionStats: {
    totalParticipants: number;
    averageScore: number;
    topPercentileThreshold: number;
  };
}

// VIP Activity Types
export interface VipActivity {
  id: number;
  type: 'upgrade' | 'f1_joined' | 'commission' | 'ranking';
  customerId: number;
  customerName: string;
  description: string;
  amount?: number;
  f1CustomerName?: string;
  timestamp: string;
}

export interface VipActivityParams {
  limit?: number;
  type?: 'all' | 'upgrade' | 'f1' | 'commission' | 'ranking';
}

export interface VipActivityResponse {
  activities: VipActivity[];
}

/**
 * Get VIP overview summary metrics
 */
export const getVipSummary = async (): Promise<VipSummaryResponse | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/vip/overview/summary',
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
 * Get VIP level distribution
 */
export const getVipDistribution = async (): Promise<VipDistributionResponse | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/vip/overview/distribution',
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
 * Get VIP commission analytics
 */
export const getVipCommissions = async (
  params: VipCommissionParams = {}
): Promise<VipCommissionData | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.days) queryParams.append('days', params.days.toString());

    const url = `/admin/vip/overview/commissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const res: any = await request({
      url,
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
 * Get VIP ranking overview
 */
export const getVipRankings = async (): Promise<VipRankingResponse | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/vip/overview/rankings',
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
 * Get VIP activities
 */
export const getVipActivities = async (
  params: VipActivityParams = {}
): Promise<VipActivityResponse | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.type) queryParams.append('type', params.type);

    const url = `/admin/vip/overview/activities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const res: any = await request({
      url,
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

// Legacy class-based service for backward compatibility
class VipService {
  /**
   * Get VIP overview summary
   */
  static async getVipSummary(): Promise<VipSummaryResponse> {
    const result = await getVipSummary();
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  /**
   * Get VIP level distribution
   */
  static async getVipDistribution(): Promise<VipDistributionResponse> {
    const result = await getVipDistribution();
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  /**
   * Get VIP commission analytics
   */
  static async getVipCommissions(params: VipCommissionParams = {}): Promise<VipCommissionData> {
    const result = await getVipCommissions(params);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  /**
   * Get VIP ranking overview
   */
  static async getVipRankings(): Promise<VipRankingResponse> {
    const result = await getVipRankings();
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  /**
   * Get VIP activities
   */
  static async getVipActivities(params: VipActivityParams = {}): Promise<VipActivityResponse> {
    const result = await getVipActivities(params);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }
}

export default VipService;