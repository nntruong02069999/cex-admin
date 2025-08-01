import React, { useState, useEffect } from "react";
import { Row, Col, message, Spin, Alert } from "antd";
import { useHistory } from "react-router-dom";
import {
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import StatisticCard from "./StatisticCard";
import RevenueChart from "./RevenueChart";
import RequestInfoCard from "./RequestInfoCard";
import TransactionTable from "./TransactionTable";
import TopUsers from "./TopUsers";
import { DashboardState, ApiDashboardResponse } from "./types";
import { getDashboardData } from "@src/services/dashboard";

const Dashboard: React.FC = () => {
  const history = useHistory();

  // Calculate default date range (30 days ago to today)
  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return [startDate, endDate];
  };

  const [defaultDates] = useState(getDefaultDateRange());

  const [state, setState] = useState<DashboardState>({
    dateRange: [
      defaultDates[0].toLocaleDateString("en-IN"),
      defaultDates[1].toLocaleDateString("en-IN"),
    ],
    summaryData: {
      userAccounts: 0,
      revenue: 0,
      expenses: 0,
      profit: 0,
    },
    chartData: [],
    depositRequests: {
      pending: 0,
      completed: 0,
      failed: 0,
    },
    withdrawalRequests: {
      pending: 0,
      completed: 0,
      failed: 0,
    },
    revenueData: [],
    expenseData: [],
    topUsersData: [],
    topUsersWithdrawData: [],
    totalRevenue: 0,
    totalExpense: 0,
    totalTopUsers: 0,
    loading: true,
    error: null,
  });

  const [topUsersFilter, setTopUsersFilter] = useState<
    "deposit" | "withdrawal"
  >("deposit");

  // Transform API response to component state
  const transformApiData = (
    apiResponse: ApiDashboardResponse
  ): Partial<DashboardState> => {
    const { data } = apiResponse;

    return {
      summaryData: {
        userAccounts: data.summaryCustomer.userAccounts,
        revenue: data.summaryCustomer.revenue,
        expenses: data.summaryCustomer.expenses,
        profit: data.summaryCustomer.profit,
      },
      chartData: data.chartData.map((item) => ({
        name: item.name,
        revenue: item.revenue,
        expense: item.expense,
        profit: item.profit,
      })),
      depositRequests: {
        pending: data.summaryDeposit.pending,
        completed: data.summaryDeposit.success,
        failed: data.summaryDeposit.failed,
      },
      withdrawalRequests: {
        pending: data.summaryWithdraw.pending,
        completed: data.summaryWithdraw.success,
        failed: data.summaryWithdraw.rejected,
      },
      revenueData: data.newsDeposit.data,
      expenseData: data.newsWithdraw.data,
      topUsersData: data.topUserDeposit,
      topUsersWithdrawData: data.topUserWithdraw.map((item) => ({
        id: item.id,
        userId: item.userId,
        totalDeposit: item.totalWithdraw, // Map totalWithdraw to totalDeposit for component compatibility
      })) as any,
      totalRevenue: data.newsDeposit.total,
      totalExpense: data.newsWithdraw.total,
      totalTopUsers: data.topUserDeposit.length,
      loading: false,
      error: null,
    };
  };

  // Fetch dashboard data
  const fetchDashboardData = async (startTime?: number, endTime?: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // If no dates provided, use default 30-day range
      const defaultStart = startTime || defaultDates[0].getTime();
      const defaultEnd = endTime || defaultDates[1].getTime();

      const response = await getDashboardData(defaultStart, defaultEnd);

      if (response.errorCode) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.message || "Failed to fetch dashboard data",
        }));
        message.error(response.message || "Failed to fetch dashboard data");
        return;
      }

      const transformedData = transformApiData(response);
      setState((prev) => ({ ...prev, ...transformedData }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "An unexpected error occurred",
      }));
      message.error("An unexpected error occurred");
    }
  };

  // Load data on component mount with default date range
  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Event handlers
  const handleDateRangeChange = (dates: any) => {
    const startTime = dates[0].startOf("day").valueOf();
    const endTime = dates[1].endOf("day").valueOf();

    // Validate that the date range doesn't exceed 3 months (90 days)
    const diffInDays = dates[1].diff(dates[0], "days");
    if (diffInDays > 90) {
      message.error("Khoảng thời gian chỉ được phép tối đa 3 tháng");
      return;
    }

    setState((prevState) => ({
      ...prevState,
      dateRange: [dates[0].format("DD/MM/YYYY"), dates[1].format("DD/MM/YYYY")],
    }));

    // Fetch new data based on the date range
    fetchDashboardData(startTime, endTime);
  };

  // These handlers would be connected to API calls in a real application
  const handleRevenuePageChange = (page: number) => {
    console.log("Revenue page changed to", page);
    // TODO: Implement pagination for revenue data
  };

  const handleExpensePageChange = (page: number) => {
    console.log("Expense page changed to", page);
    // TODO: Implement pagination for expense data
  };

  const handleTopUsersPageChange = (page: number) => {
    console.log("Top users page changed to", page);
    // TODO: Implement pagination for top users data
  };

  const handleTopUsersFilterChange = (value: string) => {
    if (value === "deposit" || value === "withdrawal") {
      setTopUsersFilter(value);
    }
  };

  // Navigation handlers for deposit requests
  const handleDepositPendingClick = () => {
    history.push("/list?page=311");
  };

  const handleDepositCompletedClick = () => {
    history.push("/list?page=311");
  };

  const handleDepositFailedClick = () => {
    history.push("/list?page=311");
  };

  // Navigation handlers for withdrawal requests
  const handleWithdrawalPendingClick = () => {
    history.push("/list?page=313");
  };

  const handleWithdrawalCompletedClick = () => {
    history.push("/list?page=313");
  };

  const handleWithdrawalFailedClick = () => {
    history.push("/list?page=313");
  };

  return (
    <div style={{ padding: "20px" }}>
      <Spin spinning={state.loading} tip="Loading dashboard data...">
        {state.error && (
          <Alert
            message="Error"
            description={state.error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {/* Header section with summary cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <StatisticCard
              icon={
                <UserOutlined style={{ fontSize: "24px", color: "white" }} />
              }
              backgroundColor="#5bc0de"
              value={state.summaryData.userAccounts}
              title="Tài khoản thành viên"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticCard
              icon={
                <DollarOutlined style={{ fontSize: "24px", color: "white" }} />
              }
              backgroundColor="#5cb85c"
              value={`${new Intl.NumberFormat("en-US").format(
                state.summaryData.revenue
              )} ₹`}
              title="Doanh thu"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticCard
              icon={
                <FileTextOutlined
                  style={{ fontSize: "24px", color: "white" }}
                />
              }
              backgroundColor="#d9534f"
              value={`${new Intl.NumberFormat("en-US").format(
                state.summaryData.expenses
              )} ₹`}
              title="Chi phí"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticCard
              icon={
                <ArrowUpOutlined style={{ fontSize: "24px", color: "white" }} />
              }
              backgroundColor="#5cb85c"
              value={`${new Intl.NumberFormat("en-US").format(
                state.summaryData.profit
              )} ₹`}
              title="Lợi nhuận"
            />
          </Col>
        </Row>

        {/* Chart section */}
        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          <Col span={24}>
            <RevenueChart
              data={state.chartData}
              onDateRangeChange={handleDateRangeChange}
            />
          </Col>
        </Row>

        {/* Deposit and Withdrawal info */}
        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          <Col xs={24} md={12}>
            <RequestInfoCard
              title="Thông tin nạp tiền"
              pendingCount={state.depositRequests.pending}
              completedCount={state.depositRequests.completed}
              failedCount={state.depositRequests.failed}
              pendingLabel="yêu cầu nạp tiền Chờ xác nhận"
              completedLabel="yêu cầu nạp tiền Đã thanh toán"
              failedLabel="yêu cầu nạp tiền Nạp tiền thất bại"
              onPendingClick={handleDepositPendingClick}
              onCompletedClick={handleDepositCompletedClick}
              onFailedClick={handleDepositFailedClick}
            />
          </Col>
          <Col xs={24} md={12}>
            <RequestInfoCard
              title="Thông tin rút tiền"
              pendingCount={state.withdrawalRequests.pending}
              completedCount={state.withdrawalRequests.completed}
              failedCount={state.withdrawalRequests.failed}
              pendingLabel="yêu cầu rút tiền Chờ xác nhận"
              completedLabel="yêu cầu rút tiền Đã thanh toán"
              failedLabel="yêu cầu rút tiền Rút tiền thất bại"
              onPendingClick={handleWithdrawalPendingClick}
              onCompletedClick={handleWithdrawalCompletedClick}
              onFailedClick={handleWithdrawalFailedClick}
            />
          </Col>
        </Row>

        {/* Transaction Tables */}
        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          <Col xs={24} md={12}>
            <TransactionTable
              title="Doanh thu"
              totalAmount={state.summaryData.revenue}
              data={state.revenueData}
              totalItems={state.totalRevenue}
              isRevenue={true}
              onPageChange={handleRevenuePageChange}
            />
          </Col>
          <Col xs={24} md={12}>
            <TransactionTable
              title="Chi phí"
              totalAmount={state.summaryData.expenses}
              data={state.expenseData}
              totalItems={state.totalExpense}
              isRevenue={false}
              onPageChange={handleExpensePageChange}
            />
          </Col>
        </Row>

        {/* Top users section */}
        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          <Col xs={24} md={12}>
            <TopUsers
              data={
                topUsersFilter === "deposit"
                  ? state.topUsersData
                  : state.topUsersWithdrawData
              }
              totalItems={
                topUsersFilter === "deposit"
                  ? state.totalTopUsers
                  : state.topUsersWithdrawData.length
              }
              onPageChange={handleTopUsersPageChange}
              onFilterChange={handleTopUsersFilterChange}
              filterType={topUsersFilter}
            />
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
