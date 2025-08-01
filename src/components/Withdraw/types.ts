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
  phone: string;
  email?: string;
  uuid: string;
  inviteCode: string;
  inviterCustomerId?: number;
  isBlocked: boolean;
  userLoginDate: number;
  createdAt: number;
  updatedAt: number;
}

export interface BankAccount {
  id: number;
  bankId: number;
  name: string;
  customerId: number;
  bankName: string;
  bankType: string;
  bankAccountNumber: string;
  phoneNumber: string;
  IFSCCode: string;
  usdtAddress?: string;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WithdrawRecord {
  id: number;
  withdrawCode: string;
  customerId: number;
  amount: number;
  feeWithdraw: number;
  status: WithdrawStatus;
  bankAccountId: number;
  createdAt: number;
  updatedAt: number;
  Customer: CustomerInfo;
  bankAccount: BankAccount;
}

export interface WithdrawListParams {
  skip?: number;
  limit?: number;
  phone?: string;
  customerId?: number;
  withdrawCode?: string;
  status?: WithdrawStatus;
  bankType?: BankType;
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