export interface VipDailyLog {
  id: number;
  customerId: number;
  date: string; // DateTime as string
  vipLevel: number;

  // Daily Snapshots
  totalMemberCount: number; // Tổng số thành viên trong ngày
  f1TotalCount: number;
  f1VipCount: number; // Số F1 có VIP

  // Trading Volume (Khối lượng giao dịch)
  dailyF1TradingVolume: number; // Trading volume F1 trong ngày
  dailyTradingVolume: number; // Trading volume trong ngày

  // Commission (Hoa hồng)
  dailyVipCommission: number; // Hoa hồng VIP trong ngày
  dailyTradingCommission: number; // Hoa hồng trading trong ngày

  // Ranking Information
  currentRank?: number; // Xếp hạng cuối ngày
  rankChange?: number; // Thay đổi xếp hạng so với ngày trước

  // Performance Metrics
  f1RetentionRate?: number; // Tỷ lệ giữ chân F1
  conversionRate?: number; // Tỷ lệ chuyển đổi F1 thành VIP
  avgF1TradingVolume?: number; // Trading volume trung bình mỗi F1

  // System fields
  calculatedAt?: number; // Thời điểm tính toán
  dataVersion?: string; // Version của data structure
}

// Chart data interface for processed daily log data
export interface VipDailyChartData {
  date: string;
  totalCommission: number; // dailyVipCommission + dailyTradingCommission
  vipCommission: number;
  tradingCommission: number;
  f1VipCount: number;
  tradingVolume: number;
  rank?: number;
}