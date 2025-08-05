import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants';
import HttpStatusCode from '@src/constants/HttpStatusCode';
import request from '@src/util/request';

// TypeScript interfaces
export interface WalletConfig {
  id: number;
  walletType: 'HOUSE_MAIN' | 'FEE_PAYMENT' | 'CUSTOMER_PAYOUT';
  address: string;
  privateKey?: string;
  balance?: number;
  balanceUsdt?: number;
  minBalance?: number;
  maxBalance?: number;
  isActive: boolean;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateWalletData {
  walletType: 'HOUSE_MAIN' | 'FEE_PAYMENT' | 'CUSTOMER_PAYOUT';
  address: string;
  privateKey?: string;
  description?: string;
  minBalance?: number;
  maxBalance?: number;
}

export interface UpdateWalletData {
  minBalance?: number;
  maxBalance?: number;
  description?: string;
  isActive?: boolean;
}

export interface WalletRule {
  id: number;
  walletId: number;
  wallet?: WalletConfig;
  triggerType: 'BALANCE_THRESHOLD' | 'TIME_BASED' | 'MANUAL';
  triggerValue?: number;
  actionType: 'TRANSFER_TO_MAIN' | 'ALERT_ADMIN' | 'PAUSE_OPERATIONS';
  targetWalletId?: number;
  targetWallet?: WalletConfig;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateRuleData {
  walletId: number;
  triggerType: 'BALANCE_THRESHOLD' | 'TIME_BASED' | 'MANUAL';
  triggerValue?: number;
  actionType: 'TRANSFER_TO_MAIN' | 'ALERT_ADMIN' | 'PAUSE_OPERATIONS';
  targetWalletId?: number;
}

export interface WithdrawTransaction {
  id: number;
  fromCustomerId: number;
  fromWalletAddress?: string;
  toWalletAddress?: string;
  toWalletId: number;
  toWallet?: WalletConfig;
  amount: number;
  txHash?: string;
  feeAmount?: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  withdrawType: 'MANUAL' | 'AUTOMATED' | 'SCHEDULED';
  initiatedBy: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface PayoutTransaction {
  id: number;
  customerId: number;
  fromWalletId: number;
  fromWallet?: WalletConfig;
  amount: number;
  toAddress: string;
  txHash?: string;
  feeAmount?: number;
  withdrawRequestId?: string;
  orderId?: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'INSUFFICIENT_FUNDS' | 'INVALID_ADDRESS';
  initiatedBy: string;
  processedBy?: string;
  processedAt?: number;
  notes?: string;
  failReason?: string;
  retryCount?: number;
  maxRetries?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardStats {
  totalWallets: number;
  activeWallets: number;
  totalBalance: number;
  totalBalanceUsdt: number;
  pendingTransactions: number;
  failedTransactions: number;
  activeRules: number;
  criticalAlerts: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  walletType?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ApiError {
  errorCode: number;
  message: string;
}

export interface ListResult<T> {
  data: T[];
  total: number;
}

// Dashboard Stats Functions
export const getDashboardStats = async (): Promise<DashboardStats | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/house-wallet/dashboard/stats',
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

// Wallet Config CRUD Operations
export const getWalletConfigs = async (
  params: QueryParams = {}
): Promise<ListResult<WalletConfig> | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/house-wallet/configs/list',
      options: {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: params,
      }
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

export const createWalletConfig = async (
  data: CreateWalletData
): Promise<WalletConfig | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/house-wallet/configs/create',
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data,
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

export const updateWalletConfig = async (
  id: number,
  data: UpdateWalletData
): Promise<WalletConfig | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: `/admin/house-wallet/configs/update`,
      options: {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          id,
          ...data
        },
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

export const deleteWalletConfig = async (id: number): Promise<boolean | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: `/admin/house-wallet/configs/delete`,
      options: {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          id
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

export const syncWalletBalance = async (
  id: number
): Promise<{ balance: number; balanceUsdt: number } | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: `/admin/house-wallet/configs/sync-balance`,
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          id
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

// Wallet Rules CRUD Operations
export const getWalletRules = async (
  params: QueryParams = {}
): Promise<ListResult<WalletRule> | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/house-wallet/rules/list',
      options: {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: params,
      }
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

export const createWalletRule = async (
  data: CreateRuleData
): Promise<WalletRule | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/house-wallet/rules/create',
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data,
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

export const updateWalletRule = async (
  id: number,
  data: Partial<CreateRuleData>
): Promise<WalletRule | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: `/admin/house-wallet/rules/update`,
      options: {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          id,
          ...data
        },
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

export const deleteWalletRule = async (id: number): Promise<boolean | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: `/admin/house-wallet/rules/delete`,
      options: {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          id
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

// Read-only Transaction Lists
export const getWithdrawTransactions = async (
  params: QueryParams = {}
): Promise<ListResult<WithdrawTransaction> | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/house-wallet/withdraws/list',
      options: {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: params,
      }
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

export const getWithdrawTransactionDetails = async (
  id: number
): Promise<WithdrawTransaction | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: `/admin/house-wallet/withdraws/get-details`,
      options: {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          id
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

export const getPayoutTransactions = async (
  params: QueryParams = {}
): Promise<ListResult<PayoutTransaction> | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: '/admin/house-wallet/payouts/list',
      options: {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: params,
      }
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

export const getPayoutTransactionDetails = async (
  id: number
): Promise<PayoutTransaction | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: `/admin/house-wallet/payouts/get-details`,
      options: {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          id
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

export const retryFailedPayout = async (
  id: number
): Promise<PayoutTransaction | ApiError> => {
  const token = localStorage.getItem('token');

  try {
    const res: any = await request({
      url: `/admin/house-wallet/payouts/retry`,
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          id
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

// Legacy class-based service for backward compatibility and consistency
class HouseWalletService {
  // Dashboard Stats
  static async getDashboardStats(): Promise<DashboardStats> {
    const result = await getDashboardStats();
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  // Wallet Config CRUD
  static async getWalletConfigs(params: QueryParams = {}): Promise<ListResult<WalletConfig>> {
    const result = await getWalletConfigs(params);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async createWalletConfig(data: CreateWalletData): Promise<WalletConfig> {
    const result = await createWalletConfig(data);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async updateWalletConfig(id: number, data: UpdateWalletData): Promise<WalletConfig> {
    const result = await updateWalletConfig(id, data);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async deleteWalletConfig(id: number): Promise<void> {
    const result = await deleteWalletConfig(id);
    if (typeof result === 'object' && 'errorCode' in result) {
      throw new Error(result.message);
    }
  }

  static async syncWalletBalance(id: number): Promise<{ balance: number; balanceUsdt: number }> {
    const result = await syncWalletBalance(id);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  // Wallet Rules CRUD
  static async getWalletRules(params: QueryParams = {}): Promise<ListResult<WalletRule>> {
    const result = await getWalletRules(params);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async createWalletRule(data: CreateRuleData): Promise<WalletRule> {
    const result = await createWalletRule(data);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async updateWalletRule(id: number, data: Partial<CreateRuleData>): Promise<WalletRule> {
    const result = await updateWalletRule(id, data);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async deleteWalletRule(id: number): Promise<void> {
    const result = await deleteWalletRule(id);
    if (typeof result === 'object' && 'errorCode' in result) {
      throw new Error(result.message);
    }
  }

  // Transaction Lists
  static async getWithdrawTransactions(params: QueryParams = {}): Promise<ListResult<WithdrawTransaction>> {
    const result = await getWithdrawTransactions(params);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async getWithdrawTransactionDetails(id: number): Promise<WithdrawTransaction> {
    const result = await getWithdrawTransactionDetails(id);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async getPayoutTransactions(params: QueryParams = {}): Promise<ListResult<PayoutTransaction>> {
    const result = await getPayoutTransactions(params);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async getPayoutTransactionDetails(id: number): Promise<PayoutTransaction> {
    const result = await getPayoutTransactionDetails(id);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }

  static async retryFailedPayout(id: number): Promise<PayoutTransaction> {
    const result = await retryFailedPayout(id);
    if ('errorCode' in result) {
      throw new Error(result.message);
    }
    return result;
  }
}

export default HouseWalletService;