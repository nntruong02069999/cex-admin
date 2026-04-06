// Constants for Customer Detail components

// Status Colors
export const STATUS_COLORS = {
  SUCCESS: 'success',
  PENDING: 'warning',
  FAILED: 'error',
  REJECTED: 'error',
  APPROVED: 'success',
  BLOCKED: 'error',
  ACTIVE: 'success',
  INACTIVE: 'default',
  not_submit: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'error'
} as const;

// Status Text Mapping
export const STATUS_TEXT = {
  SUCCESS: 'Thành công',
  PENDING: 'Chờ xử lý',
  FAILED: 'Thất bại',
  REJECTED: 'Từ chối',
  APPROVED: 'Đã duyệt',
  BLOCKED: 'Bị khóa',
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Không hoạt động',
  not_submit: 'Chưa nộp',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối'
} as const;

// VIP Levels
export const VIP_LEVELS = [
  { value: 0, label: 'Cấp 0 (Thường)', color: 'default' },
  { value: 1, label: 'Cấp 1', color: 'blue' },
  { value: 2, label: 'Cấp 2', color: 'cyan' },
  { value: 3, label: 'Cấp 3', color: 'green' },
  { value: 4, label: 'Cấp 4', color: 'lime' },
  { value: 5, label: 'Cấp 5', color: 'orange' },
  { value: 6, label: 'Cấp 6', color: 'red' },
  { value: 7, label: 'Cấp 7', color: 'purple' }
];

// Default pagination
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} của ${total} mục`
};

// Table scroll settings
export const TABLE_SCROLL = {
  x: 'max-content',
  y: 400
};

// Date format constants
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY HH:mm',
  DISPLAY_DATE: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  TIMESTAMP: 'YYYY-MM-DD HH:mm:ss'
} as const;

// Currency settings
export const CURRENCY_SETTINGS = {
  USD: { symbol: '$', precision: 2 },
  USDT: { symbol: 'USDT', precision: 2 },
  VND: { symbol: '₫', precision: 0 }
} as const;

// Network hierarchy levels
export const NETWORK_LEVELS = [
  { level: 1, label: 'Cấp 1 (F1)', color: '#1890ff', marginLeft: 0 },
  { level: 2, label: 'Cấp 2 (F2)', color: '#52c41a', marginLeft: 20 },
  { level: 3, label: 'Cấp 3 (F3)', color: '#fa8c16', marginLeft: 40 },
  { level: 4, label: 'Cấp 4 (F4)', color: '#eb2f96', marginLeft: 60 },
  { level: 5, label: 'Cấp 5 (F5)', color: '#722ed1', marginLeft: 80 },
  { level: 6, label: 'Cấp 6 (F6)', color: '#13c2c2', marginLeft: 100 },
  { level: 7, label: 'Cấp 7 (F7)', color: '#a0d911', marginLeft: 120 }
] as const;