export enum DepositTransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

// Keep PaymentStatus for backward compatibility
export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

export enum ProviderPaymentCode {
  TONGPAY = "TONGPAY",
  FPAY = "FPAY",
  SMILEPAY = "SMILEPAY",
  DAILYZ = "DAILYZ",
  BSDPAY = "BSDPAY",
  CLOUDPAY = "CLOUDPAY",
  CXPAY = "CXPAY",
  USDTPAY = "USDTPAY"
}

export interface CustomerInfo {
  createdAt: number;
  updatedAt: number;
  id: number;
  name: string;
  userLoginDate: number;
  phone: string;
  email: string | null;
  password: string;
  passwordOld: string | null;
  isAllowWithdraw: boolean;
  isAllowUserAddUSDT: boolean;
  avatarId: number;
  isVerifyEmail: boolean;
  isUserFromThirdParty: boolean;
  uuid: string;
  inviteCode: string;
  inviterCustomerId: number | null;
  isFrom91Club: boolean;
  usernameGamePartner: string;
  passwordGamePartner: string;
  isInitWallet: boolean;
  unreadNotificationCount: number;
  isBlocked: boolean;
}

export interface DepositRecord {
  createdAt: number | null;
  updatedAt: number | null;
  id: number;
  customerId: number;
  customer: CustomerInfo;
  usdtAmount: number;
  bonusAmount: number | null;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  asset: string;
  status: DepositTransactionStatus;
  orderId: string;
  chain: string;
  // Legacy fields for backward compatibility
  amount?: number;
  customerInfo?: CustomerInfo;
  inviteCustomer?: CustomerInfo | null;
}

export interface DepositStats {
  PENDING: number;
  SUCCESS: number;
  FAILED: number;
}

export interface DepositListResponse {
  code: number;
  message: string;
  data: DepositRecord[];
  count: number;
}

export interface DepositStatsResponse {
  code: number;
  message: string;
  data: DepositStats;
}

export interface DepositListParams {
  skip?: number;
  limit?: number;
  nickname?: string;
  customerId?: number;
  orderId?: string;
  status?: DepositTransactionStatus;
  sort?: 'createdAt' | 'id' | 'amount' | 'bonusAmount';
  order?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  // Legacy fields for backward compatibility
  phone?: string;
  gatewayOrderId?: string;
  providerPaymentCode?: ProviderPaymentCode;
}

export interface TabConfig {
  key: DepositTransactionStatus | PaymentStatus | 'all';
  label: string;
  count?: number;
} 