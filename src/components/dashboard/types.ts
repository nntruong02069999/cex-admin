// API Response Types
export interface ApiDashboardResponse {
  code: number;
  message: string;
  data: {
    summaryDeposit: {
      pending: number;
      success: number;
      failed: number;
    };
    summaryWithdraw: {
      pending: number;
      success: number;
      rejected: number;
    };
    chartData: {
      name: string;
      revenue: number;
      expense: number;
      profit: number;
    }[];
    newsDeposit: {
      data: {
        id: number;
        time: string;
        userId: string;
        amount: string;
        type: string;
      }[];
      total: number;
    };
    newsWithdraw: {
      data: {
        id: number;
        time: string;
        userId: string;
        amount: string;
        type: string;
      }[];
      total: number;
    };
    topUserDeposit: {
      id: number;
      userId: string;
      totalDeposit: string;
    }[];
    summaryCustomer: {
      userAccounts: number;
      revenue: number;
      expenses: number;
      profit: number;
    };
    topUserWithdraw: {
      id: number;
      userId: string;
      totalWithdraw: string;
    }[];
  };
}

// Common dashboard types
export interface SummaryData {
  userAccounts: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ChartDataType {
  name: string;
  revenue: number;
  expense: number;
  profit?: number;
}

export interface RequestData {
  pending: number;
  completed: number;
  failed: number;
}

export interface TransactionItem {
  id: number;
  time: string;
  userId: string;
  amount: string;
  type: string;
}

export interface TopUserItem {
  id: number;
  userId: string;
  totalDeposit: string;
}

// Dashboard state interface
export interface DashboardState {
  dateRange: string[];
  summaryData: SummaryData;
  chartData: ChartDataType[];
  depositRequests: RequestData;
  withdrawalRequests: RequestData;
  revenueData: TransactionItem[];
  expenseData: TransactionItem[];
  topUsersData: TopUserItem[];
  topUsersWithdrawData: TopUserItem[];
  totalRevenue: number;
  totalExpense: number;
  totalTopUsers: number;
  loading: boolean;
  error: string | null;
} 