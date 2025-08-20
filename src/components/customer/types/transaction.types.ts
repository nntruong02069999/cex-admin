// Transaction-related TypeScript type definitions

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Deposits & Withdrawals
export interface Deposit {
  id: number;
  usdtAmount: number;
  bonusAmount: number;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  asset: string;
  status: string;
  chain: string;
  createdAt: number;
}

export interface DepositSummary {
  totalSuccess: number;
  totalPending: number;
  totalFailed: number;
}

export interface DepositsResponse {
  deposits: Deposit[];
  pagination: PaginationInfo;
  summary: DepositSummary;
}

export interface Withdrawal {
  id: number;
  withdrawCode: string;
  amount: number;
  feeWithdraw: number;
  status: string;
  type: string;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  reasonRejected?: string;
  createdAt: number;
}

export interface WithdrawalSummary {
  totalSuccess: number;
  totalPending: number;
  totalRejected: number;
}

export interface WithdrawalsResponse {
  withdrawals: Withdrawal[];
  pagination: PaginationInfo;
  summary: WithdrawalSummary;
}

// USDT Transactions
export interface USDTTransaction {
  id: number;
  type: string;
  amount: number;
  balanceUSDT: number;
  status: string;
  note?: string;
  txHash?: string;
  description?: string;
  fromAddress?: string;
  toAddress?: string;
  toCustomerId?: number;
  toNickname?: string;
  referenceId?: string;
  createdAt: number;
}

export interface USDTTransactionsResponse {
  transactions: USDTTransaction[];
  pagination: PaginationInfo;
}

// Wallet Transactions
export interface WalletTransaction {
  id: number;
  email: string;
  nickname: string;
  amount: number;
  balanceUSDT: number;
  balance: number;
  status: string;
  type: string;
  createdAt: number;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  pagination: PaginationInfo;
}

// Trading History
export interface TradingOrder {
  id: number;
  symbol: string;
  direction: 'BUY' | 'SELL';
  amount: number;
  result: 'WIN' | 'LOSE' | 'DRAW';
  profitLoss: number;
  createdAt: number;
  status: string;
}

export interface TradingMetrics {
  totalOrders: number;
  winRate: number;
  totalVolume: number;
  currentStreak: number;
  totalProfit: number;
  totalLoss: number;
}

// Commission
export interface Commission {
  id: number;
  fromCustomerId: number;
  fromCustomerNickname: string;
  levelReferral: number;
  commissionType: string;
  amount: number;
  type: string;
  value: number;
  vipLevel: number;
  sourceAmount: number;
  sourceOrderId?: number;
  sourceTransactionId?: number;
  sourceDepositId?: number;
  status: string;
  paidAt?: number;
  period?: string;
  description?: string;
  createdAt: number;
}

export interface CommissionSummary {
  totalCommission: number;
  thisMonthCommission: number;
  lastMonthCommission: number;
  pendingCommission: number;
}

export interface VipCommissionsResponse {
  commissions: Commission[];
  pagination: PaginationInfo;
  summary: CommissionSummary;
}

// API Request/Response types
export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  fromDate?: string;
  toDate?: string;
}

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REJECTED' | 'APPROVED';
export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'PAYMENT' | 'INTERNAL' | 'TRANSFER' | 'RECEIVE';