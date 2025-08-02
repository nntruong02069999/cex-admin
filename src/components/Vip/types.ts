
export interface ApiError {
  errorCode: number;
  message: string;
}

// VIP Summary Types
export interface VipSummaryResponse {
  totalVipCustomers: number;
  activeCustomers: number;
  monthlyRevenue: number;
  upgradeRate: number;
  topRankCustomer: {
    id: number;
    name: string;
    rank: number;
    vipLevel: number;
  };
  previousMonth: {
    totalVipCustomers: number;
    activeCustomers: number;
    monthlyRevenue: number;
    upgradeRate: number;
  };
}

// VIP Distribution Types
export interface VipLevelDistribution {
  level: number;
  count: number;
  percentage: number;
}

export interface VipDistributionResponse {
  distribution: VipLevelDistribution[];
}

// VIP Commission Types
export interface VipCommissionData {
  totalCommission: number;
  commissionByType: {
    trading: number;
    upgrade: number;
    referral: number;
    bonus: number;
  };
  dailyTrend: Array<{
    date: string;
    amount: number;
  }>;
  topEarners: Array<{
    customerId: number;
    name: string;
    amount: number;
  }>;
}

export interface VipCommissionParams {
  period?: 'daily' | 'weekly' | 'monthly';
  days?: number;
}

// VIP Ranking Types
export interface VipRankedCustomer {
  rank: number;
  customerId: number;
  name: string;
  vipLevel: number;
  f1Count: number;
  tradingVolume: number;
  totalScore: number;
  rankChange: number;
}

export interface VipRankingResponse {
  topRanked: VipRankedCustomer[];
  competitionStats: {
    totalParticipants: number;
    averageScore: number;
    topPercentileThreshold: number;
  };
}

// VIP Activity Types
export interface VipActivity {
  id: number;
  type: 'upgrade' | 'f1_joined' | 'commission' | 'ranking';
  customerId: number;
  customerName: string;
  description: string;
  amount?: number;
  f1CustomerName?: string;
  timestamp: string;
}

export interface VipActivityParams {
  limit?: number;
  type?: 'all' | 'upgrade' | 'f1' | 'commission' | 'ranking';
}

export interface VipActivityResponse {
  activities: VipActivity[];
}

// Component-specific types
export interface VipHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  loading?: boolean;
}

export interface VipSummaryCardsProps {
  summaryData?: VipSummaryResponse;
  loading?: boolean;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  prefix?: React.ReactNode;
  suffix?: string;
  loading?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

export interface VipLevelDistributionProps {
  distributionData?: VipDistributionResponse;
  loading?: boolean;
}

export interface VipCommissionAnalyticsProps {
  commissionData?: VipCommissionData;
  loading?: boolean;
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly') => void;
}

export interface VipRankingOverviewProps {
  rankingData?: VipRankingResponse;
  loading?: boolean;
}

export interface VipActivityFeedProps {
  activities?: VipActivity[];
  loading?: boolean;
  onTypeFilter?: (type: string) => void;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface LineChartDataPoint {
  date: string;
  amount: number;
  formatted?: string;
}

// Tab configuration
export interface VipTabConfig {
  key: string;
  title: string;
  icon?: React.ReactNode;
}

// Filter types
export interface VipFilters {
  dateRange?: [string, string];
  vipLevel?: number[];
  activityType?: string;
}

// Loading states
export interface VipLoadingStates {
  summary: boolean;
  distribution: boolean;
  commission: boolean;
  ranking: boolean;
  activities: boolean;
}

// Error states
export interface VipErrorStates {
  summary: string | null;
  distribution: string | null;
  commission: string | null;
  ranking: string | null;
  activities: string | null;
}

// Constants
export const VIP_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const VIP_ACTIVITY_TYPES = {
  ALL: 'all',
  UPGRADE: 'upgrade',
  F1: 'f1',
  COMMISSION: 'commission',
  RANKING: 'ranking'
} as const;

export const COMMISSION_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
} as const;

export const VIP_TABS = {
  DASHBOARD: 'dashboard',
  CUSTOMERS: 'customers',
  COMMISSIONS: 'commissions',
  RANKINGS: 'rankings'
} as const;

// Color scheme constants
export const VIP_COLORS = {
  PRIMARY: '#2563eb',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  NEUTRAL: '#6b7280',
  LEVEL_GRADIENT: [
    '#e6f3ff', // Level 1 - Light blue
    '#cce7ff', // Level 2
    '#99d6ff', // Level 3
    '#66c7ff', // Level 4
    '#33b8ff', // Level 5
    '#00a9ff', // Level 6
    '#0095e6', // Level 7
    '#0081cc', // Level 8
    '#006db3', // Level 9
    '#005999'  // Level 10 - Dark blue
  ]
} as const;

// Utility types
export type VipLevel = typeof VIP_LEVELS[number];
export type VipActivityType = typeof VIP_ACTIVITY_TYPES[keyof typeof VIP_ACTIVITY_TYPES];
export type CommissionPeriod = typeof COMMISSION_PERIODS[keyof typeof COMMISSION_PERIODS];
export type VipTabKey = typeof VIP_TABS[keyof typeof VIP_TABS];