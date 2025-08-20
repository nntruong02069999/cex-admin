// API Response Types

import { CustomerDetailData } from './customer.types';
import { 
  DepositsResponse, 
  WithdrawalsResponse,
  USDTTransactionsResponse,
  WalletTransactionsResponse,
  VipCommissionsResponse
} from './transaction.types';

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Customer Detail API
export interface CustomerDetailResponse extends ApiResponse<CustomerDetailData> {}

// Balance Management API
export interface AddBalanceRequest {
  amount: number;
  note?: string;
}

export interface AddBalanceResponse extends ApiResponse<{
  newBalance: number;
  transactionId: string;
}> {}

export interface SubtractBalanceRequest {
  amount: number;
  note?: string;
}

export interface SubtractBalanceResponse extends ApiResponse<{
  newBalance: number;
  transactionId: string;
}> {}

// VIP Management API
export interface UpdateVipLevelRequest {
  newLevel: number;
  note?: string;
}

export interface UpdateVipLevelResponse extends ApiResponse<{
  oldLevel: number;
  newLevel: number;
  upgradeFee?: number;
}> {}

// Marketing Account API
export interface UpdateMarketingStatusRequest {
  isAccountMarketing: boolean;
}

export interface UpdateMarketingStatusResponse extends ApiResponse<{
  isAccountMarketing: boolean;
}> {}

// Deposits API
export interface DepositsRequest {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  fromDate?: string;
  toDate?: string;
}

export interface DepositsApiResponse extends ApiResponse<DepositsResponse> {}

// Withdrawals API
export interface WithdrawalsRequest {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'SUCCESS' | 'REJECTED';
  type?: 'INTERNAL' | 'EXTERNAL';
  fromDate?: string;
  toDate?: string;
}

export interface WithdrawalsApiResponse extends ApiResponse<WithdrawalsResponse> {}

// USDT Transactions API
export interface USDTTransactionsRequest {
  page?: number;
  limit?: number;
  type?: string;
  fromDate?: string;
  toDate?: string;
}

export interface USDTTransactionsApiResponse extends ApiResponse<USDTTransactionsResponse> {}

// Wallet Transactions API
export interface WalletTransactionsRequest {
  page?: number;
  limit?: number;
  type?: string;
  fromDate?: string;
  toDate?: string;
}

export interface WalletTransactionsApiResponse extends ApiResponse<WalletTransactionsResponse> {}

// VIP Commissions API
export interface VipCommissionsRequest {
  page?: number;
  limit?: number;
  commissionType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface VipCommissionsApiResponse extends ApiResponse<VipCommissionsResponse> {}

// Daily Statistics API
export interface DailyStatistic {
  date: string;
  deposit: number;
  withdraw: number;
  win: number;
  lose: number;
  beforeBalance: number;
  afterBalance: number;
  receive: number;
  transfer: number;
  totalOrder: number;
  totalWin: number;
  totalLose: number;
  totalDraw: number;
  totalBuy: number;
  totalSell: number;
  totalAmountWin: number;
  totalAmountLose: number;
  totalVolume: number;
  commissionBalance: number;
  totalMember: number;
  totalMemberVipF1: number;
  totalOrderF1: number;
  winRate?: number;
  profitLossRatio?: number;
  dailyProfitLoss: number;
}

export interface ChartData {
  dates: string[];
  profitLoss: number[];
  volume: number[];
  orders: number[];
  winRate: number[];
}

export interface DailyStatisticsResponse extends ApiResponse<{
  statistics: DailyStatistic[];
  chartData: ChartData;
}> {}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}