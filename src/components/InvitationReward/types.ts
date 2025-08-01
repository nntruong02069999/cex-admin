export interface UserInfo {
  id: number;
  phone: string;
  inviteCode: string;
  uuid: string;
}

export interface TierInfo {
  createdAt: string | null;
  updatedAt: string | null;
  id: number;
  minDepositAmount: number;
  maxDepositAmount: number;
  minTurnover: number;
  rewardAmount: number;
  validityDays: number;
  isActive: boolean;
}

export interface InvitationRecord {
  createdAt: number;
  updatedAt: number;
  id: number;
  referrerId: number;
  inviteeId: number;
  tierId: number;
  depositAmount: number;
  turnoverAmount: number;
  rewardAmount: number;
  status: 'pending' | 'qualified' | 'paid' | 'expired';
  invitedAt: number;
  qualifiedAt: number | null;
  paidAt: number | null;
  expiresAt: number;
  referrerInfo: UserInfo;
  inviterInfo: UserInfo;
  tierInfo: TierInfo;
}

export interface InvitationStats {
  pending: number;
  qualified: number;
  paid: number;
  expired: number;
}

export interface InvitationListResponse {
  code: number;
  message: string;
  data: {
    data: InvitationRecord[];
    total: number;
  };
}

export interface InvitationStatsResponse {
  code: number;
  message: string;
  data: InvitationStats;
}

export interface InvitationListParams {
  status?: InvitationStatus;
  skip?: number;
  limit?: number;
  referrerId?: number;
  inviterId?: number;
  sort?: 'createdAt' | 'id' | 'depositAmount' | 'rewardAmount';
  order?: 'asc' | 'desc';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export type InvitationStatus = 'pending' | 'qualified' | 'paid' | 'expired';

export enum InvitationStatusEnum {
  PENDING = 'pending',
  QUALIFIED = 'qualified',
  PAID = 'paid',
  EXPIRED = 'expired',
}


export interface TabConfig {
  key: InvitationStatus | 'all';
  label: string;
  count?: number;
} 