// Customer-related TypeScript type definitions

export interface Customer {
  id: number;
  nickname: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isVerifyEmail: boolean;
  isBlocked: boolean;
  isVip: boolean;
  twoFAEnabled: boolean;
  statusDocument: 'not_submit' | 'pending' | 'approved' | 'rejected';
  isAccountMarketing: boolean;
  inviteCode: string;
  inviterCustomerId?: number;
  totalMember: number;
  totalMemberVip: number;
  totalMemberVip1: number;
  currentVipLevel: number;
  createdAt: number;
  userLoginDate?: number;
}

export interface CustomerMoney {
  balance: number;
  frozen: number;
  total: number;
  balanceDemo: number;
  balanceUSDT: number;
  usdtAddress?: string;
  totalDeposit: number;
  totalWithdraw: number;
  totalTradeCount: number;
  totalTradeAmount: number;
  totalTradeAmountWin: number;
  totalTradeAmountLose: number;
  totalTradeAmountDraw: number;
  totalTradeWinCount: number;
  totalTradeLoseCount: number;
  totalTradeDrawCount: number;
  totalVolumnTrade: number;
  totalOrderTradeSell: number;
  totalOrderTradeBuy: number;
  totalCommission: number;
  totalRewardFirstDeposit: number;
  totalRewardMembersFirstDeposit: number;
  totalRefundTradeAmount: number;
  totalDailyQuestRewards: number;
}

export interface NetworkHierarchy {
  level1: { count: number; vipCount: number };
  level2: { count: number; vipCount: number };
  level3: { count: number; vipCount: number };
  level4: { count: number; vipCount: number };
  level5: { count: number; vipCount: number };
  level6: { count: number; vipCount: number };
  level7: { count: number; vipCount: number };
}

export interface NetworkSummary {
  totalMembers: number;
  totalVip: number;
  monthlyGrowth: number;
  totalCommission: number;
}

export interface Inviter {
  email: string;
  nickname: string;
}

export interface CustomerSummary {
  totalBalance: number;
  balance: number;
  usdtBalance: number;
  frozenBalance: number;
  winRate: number;
  totalOrders: number;
  totalWins: number;
  totalVolume: number;
  totalMembers: number;
  vipMembers: number;
  monthlyGrowth: number;
  currentLevel: number;
}

export interface CustomerDetailData {
  customer: Customer;
  customerMoney: CustomerMoney;
  hierarchy: NetworkHierarchy;
  networkSummary: NetworkSummary;
  inviter?: Inviter;
}

export interface VipLevel {
  value: number;
  label: string;
  fee?: number;
}

export interface CustomerAction {
  type: 'ADD_BALANCE' | 'SUBTRACT_BALANCE' | 'UPDATE_VIP' | 'UPDATE_MARKETING';
  customerId: number;
  payload: any;
}

export interface DepositTransaction {
  id: number;
  customerId: number;
  customer: Customer;
  usdtAmount: number;
  bonusAmount?: number;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  asset: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  orderId: string;
  chain: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface WithdrawTransaction {
  id: number;
  withdrawCode: string;
  customerId: number;
  customer: Customer;
  amount: number;
  feeWithdraw: number;
  status: WithdrawStatus;
  type: WithdrawType;
  // Admin fields
  adminIdApproved?: number;
  adminIdRejected?: number;
  reasonRejected?: string;
  // Transfer info
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  createdAt?: number;
  updatedAt?: number;
}

export enum WithdrawStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  REJECTED = "REJECTED",
}

export enum WithdrawType {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
}

// New Backend Transaction Models
export interface WalletTransaction {
  id: number;
  email: string;
  nickname: string;
  customerId: number;
  customer: Customer;
  amount: number;
  balanceUSDT: number;
  balance: number;
  status: WalletTransactionStatus;
  type: WalletTranferType;
  createdAt?: number;
  updatedAt?: number;
}

export interface USDTTransaction {
  id: number;
  customerId: number;
  customer: Customer;
  type: USDTTransactionType;
  amount: number;
  balanceUSDT: number;
  status: USDTTransactionStatus;
  note?: string;
  txHash?: string;
  description?: string;
  fromAddress?: string;
  toAddress?: string;
  toCustomerId?: number;
  toNickname?: string;
  referenceId?: string;
  createdAt?: number;
  updatedAt?: number;
}

export enum WalletTransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum WalletTranferType {
  IN = "IN",
  OUT = "OUT",
}

export enum USDTTransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  PAYMENT = "PAYMENT",
  DEPOSIT_INTERNAL = "DEPOSIT_INTERNAL",
  WITHDRAW_INTERNAL = "WITHDRAW_INTERNAL",
}

export enum USDTTransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

// Order/Trading Model and Enums
export interface Order {
  id: number;
  customerId: number;
  customer: Customer;
  
  // Order details
  side: OrderSide;
  amount: number;
  fee: number;
  realAmount: number;
  symbol: string;
  configProfit: number;
  
  // Order state
  status: OrderStatus;
  type: OrderType;
  
  // Chart session integration
  issueNumber: string;
  idChart?: number;
  chartResult?: string;
  
  // Price information
  entryPrice?: number;
  openingPrice: number;
  closingPrice: number;
  
  // Results
  resultProfit: number;
  winAmount: number;
  
  // Trading metadata
  duration?: number;
  expiresAt?: number;
  orderNumber: string;
  notes?: string;
  fromMktAccount?: boolean;
  
  createdAt?: number;
  updatedAt?: number;
}

export enum OrderSide {
  BUY = "BUY",
  SELL = "SELL",
}

export enum OrderStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export enum OrderType {
  LIVE = "LIVE",
  DEMO = "DEMO",
}

// P&L Summary for Trading History
export interface TradingPnLSummary {
  date: string;
  totalTrading: number;
  totalWinAmount: number;
  winRate: number;
}