export enum WithdrawStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS", 
  REJECTED = "REJECTED"
}

export enum BankType {
  BANK = "bank",
  USDT = "usdt"
}

export interface CustomerInfo {
  id: number;
  name: string;
  phone?: string;
  nickname?: string;
  email?: string;
  uuid?: string;
  inviteCode?: string;
  inviterCustomerId?: number;
  isBlocked?: boolean;
  userLoginDate?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface WithdrawRecord {
  createdAt: number | null;
  updatedAt: number | null;
  id: number;
  withdrawCode: string;
  customerId: number;
  Customer: CustomerInfo;
  amount: number;
  feeWithdraw: number;
  status: string;
  type: string;
  
  // Admin fields
  adminIdApproved: number | null;
  adminIdRejected: number | null;
  reasonRejected: string | null;
  
  // Transfer info
  txHash: string | null;
  fromAddress: string | null;
  toAddress: string | null;

  // Legacy fields for backward compatibility
  bankAccountId?: number;
  bankAccount?: any;
}

export interface WithdrawListParams {
  skip?: number;
  limit?: number;
  nickname?: string;
  customerId?: number;
  withdrawCode?: string;
  status?: WithdrawStatus;
  sort?: "createdAt" | "id" | "amount" | "feeWithdraw";
  order?: "asc" | "desc";
  startDate?: number;
  endDate?: number;
}

export interface WithdrawListResponse {
  code: number;
  message: string;
  data: WithdrawRecord[];
  count: number;
}

export interface WithdrawStats {
  PENDING: number;
  SUCCESS: number;
  REJECTED: number;
}

export interface WithdrawStatsResponse {
  code: number;
  message: string;
  data: WithdrawStats;
} 