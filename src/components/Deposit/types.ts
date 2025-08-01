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
  createdAt: number;
  updatedAt: number;
  id: number;
  customerId: number;
  paymentGatewayId: number;
  paymentGatewayCode: string;
  paymentChannelId: number;
  paymentChannelCode: string;
  providerPaymentCode: ProviderPaymentCode;
  orderId: string;
  gatewayOrderId: string;
  usdtAmount: number | null;
  amount: number;
  bonusAmount: number;
  status: PaymentStatus;
  paymentAt: number | null;
  failMessage: string | null;
  merchantTransactionId: string;
  customerInfo: CustomerInfo;
  inviteCustomer: CustomerInfo | null;
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
  phone?: string;
  customerId?: number;
  orderId?: string;
  gatewayOrderId?: string;
  status?: PaymentStatus;
  providerPaymentCode?: ProviderPaymentCode;
  sort?: 'createdAt' | 'id' | 'amount' | 'bonusAmount';
  order?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface TabConfig {
  key: PaymentStatus | 'all';
  label: string;
  count?: number;
} 