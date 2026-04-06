// Customer List — Type definitions for API, filters, and column config

export enum CustomerDocumentStatus {
  NOT_SUBMIT = 'not_submit',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Query params cho API get-list-v2
export interface CustomerListParams {
  search?: string;
  isVerifyEmail?: boolean;
  statusDocument?: CustomerDocumentStatus;
  isVip?: boolean;
  isAccountMarketing?: boolean;
  vipLevel?: number;
  minBalance?: number;
  maxBalance?: number;
  minTotalDeposit?: number;
  maxTotalDeposit?: number;
  inviterEmail?: string;
  inviterUuid?: string;
  createdFrom?: number; // Unix timestamp ms
  createdTo?: number;
  sortBy?: 'id' | 'createdAt' | 'balance' | 'totalDeposit';
  sortOrder?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}

// Inviter info nested object from API response
export interface InviterInfo {
  id: number;
  nickname: string;
  email: string;
}

// Money nested object from API response
export interface CustomerListMoney {
  balance: number;
  balanceUSDT: number;
  total: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalTradeAmount: number;
  totalTradeAmountWin: number;
}

// Single customer item from API response
export interface CustomerListItem {
  id: number;
  nickname: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  uuid: string;
  password: string;
  avatar: string | null;
  isVerifyEmail: boolean;
  statusDocument: string;
  isVip: boolean | null;
  isAccountMarketing: boolean | null;
  createdAt: number | null;
  userLoginDate: number | null;
  inviteCode: string;
  inviterCustomerId: number | null;
  inviterInfo: InviterInfo | null;
  money: CustomerListMoney | null;
  vipLevel: number;
}

// API response shape
export interface CustomerListResponse {
  code: number;
  message: string;
  data: CustomerListItem[];
  total: number;
  skip: number;
  limit: number;
}

// Column visibility config
export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  fixed?: boolean; // Can't be toggled off
}

// Default column configuration
export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'id', label: 'ID', visible: true, fixed: true },
  { key: 'user', label: 'User', visible: true, fixed: true },
  { key: 'password', label: 'Password', visible: true },
  { key: 'isVerifyEmail', label: 'Email ✓', visible: true },
  { key: 'statusDocument', label: 'KYC', visible: true },
  { key: 'isAccountMarketing', label: 'MKT', visible: true },
  { key: 'vipLevel', label: 'VIP', visible: true },
  { key: 'balance', label: 'Balance', visible: true },
  { key: 'totalDeposit', label: 'Total Deposit', visible: true },
  { key: 'inviterInfo', label: 'Inviter', visible: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: true },
  { key: 'actions', label: 'Thao tác', visible: true, fixed: true },
  // Optional columns (default hidden)
  { key: 'uuid', label: 'UUID', visible: false },
  { key: 'userLoginDate', label: 'Last Login', visible: false },
  { key: 'totalWithdraw', label: 'Total Withdraw', visible: false },
  { key: 'totalTradeAmount', label: 'Total Trade', visible: false },
  { key: 'fullName', label: 'Họ tên', visible: false },
];

// Default filter state
export const DEFAULT_FILTERS: CustomerListParams = {
  sortBy: 'id',
  sortOrder: 'desc',
  skip: 0,
  limit: 20,
};

// LocalStorage key for column preferences
export const COLUMN_STORAGE_KEY = 'customer-list-columns';
