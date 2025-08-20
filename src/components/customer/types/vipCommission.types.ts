export enum VipCommissionType {
  TRADING = "trading",
  UPGRADE = "upgrade",
  REFERRAL = "referral",
  F1_TRADING = "f1_trading",
  DEPOSIT = "deposit",
}

export enum VipCommissionStatus {
  PENDING = "pending",
  PAID = "paid",
  CANCELLED = "cancelled",
}

export interface VipCommission {
  id: number;
  customerId: number; // Người nhận hoa hồng
  fromCustomerId: number; // Người tạo ra hoa hồng
  levelReferral: number; // Cấp người nhận hoa hồng với người giao dịch (1, 2, 3, 4, 5, 6, 7)
  commissionType: VipCommissionType;
  amount: number; // Số tiền hoa hồng
  type: "fixed" | "percentage";
  value: number; // Tỷ lệ hoa hồng (percentage) hoặc số tiền hoa hồng (fixed)
  vipLevel: number; // Cấp VIP của người nhận
  sourceAmount: number; // Số tiền gốc tạo ra hoa hồng
  sourceOrderId?: number; // ID order gốc (nếu từ trading)
  sourceTransactionId?: number; // ID transaction gốc (nếu từ upgrade)
  sourceDepositId?: number; // ID deposit gốc (nếu từ deposit)
  status: VipCommissionStatus;
  paidAt?: string;
  period?: "daily" | "weekly" | "monthly";
  description?: string;
  metadata?: any;
  createdAt?: number;
  updatedAt?: number;

  // Display fields
  fromNickname?: string; // Converted from fromCustomerId
}

export interface VipCommissionFilter {
  dateRange?: [string, string];
  fromNickname?: string;
  levelReferral?: number;
  commissionType?: VipCommissionType;
  status?: VipCommissionStatus;
}

// Types for VIP Commission Summary API
export interface VipCommissionSummaryParams {
  customerId: number;
}

export interface VipCommissionSummaryResponse {
  totalCommission: number;
  monthlyCommission: number;
  totalF1Vip: number;
  currentVipLevel: number;
  vipActivationDate: number
}