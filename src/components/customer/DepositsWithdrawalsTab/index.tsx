import React, { useState, useEffect, useCallback, useRef } from "react";
import { Row, Col, Card, Spin, message } from "antd";
import {
  DepositTransaction,
  WithdrawTransaction,
} from "../types/customer.types";
import { DepositsWithdrawalsSummaryResponse } from "@src/types/deposits-withdrawals.types";
import {
  getCustomerDepositsWithdrawalsSummary,
  getCustomerDepositsList,
  getCustomerWithdrawalsList,
  confirmWithdraw,
  cancelWithdraw,
} from "@src/services/customer";
import {
  DepositListParams,
  WithdrawListParams,
} from "@src/types/deposits-withdrawals.types";
import DepositsSummary from "./DepositsSummary";
import DepositsTable, { DepositsFilterState } from "./DepositsTable";
import WithdrawalsTable, { WithdrawalsFilterState } from "./WithdrawalsTable";
import DepositDetailModal from "./DepositDetailModal";
import WithdrawDetailModal from "./WithdrawDetailModal";
import "./DepositsWithdrawalsTab.less";

interface DepositsWithdrawalsTabProps {
  customerId: number;
}

const DepositsWithdrawalsTab: React.FC<DepositsWithdrawalsTabProps> = ({
  customerId,
}) => {
  // Modal states
  const [selectedDeposit, setSelectedDeposit] =
    useState<DepositTransaction | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawTransaction | null>(null);
  const [isWithdrawDetailModalVisible, setIsWithdrawDetailModalVisible] =
    useState(false);

  // API data states
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawTransaction[]>([]);
  const [summary, setSummary] =
    useState<DepositsWithdrawalsSummaryResponse | null>(null);

  // Loading states
  const [depositsLoading, setDepositsLoading] = useState(false);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [depositsFilterLoading, setDepositsFilterLoading] = useState(false);
  const [withdrawalsFilterLoading, setWithdrawalsFilterLoading] =
    useState(false);

  // Filter states
  const [depositsFilters, setDepositsFilters] = useState<DepositsFilterState>(
    {}
  );
  const [withdrawalsFilters, setWithdrawalsFilters] =
    useState<WithdrawalsFilterState>({});

  // Pagination states
  const [depositsPageSize, setDepositsPageSize] = useState<number>(10);
  const [withdrawalsPageSize, setWithdrawalsPageSize] = useState<number>(10);

  // Load summary data
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const result = await getCustomerDepositsWithdrawalsSummary(customerId);
      if ("errorCode" in result) {
        message.error(`Failed to load summary: ${result.message}`);
      } else {
        setSummary(result);
      }
    } catch (error) {
      message.error("Error loading summary data");
    } finally {
      setSummaryLoading(false);
    }
  }, [customerId]);

  // Helper functions to convert filter state to API parameters
  const getDepositsAPIParams = (
    filters: DepositsFilterState
  ): Partial<DepositListParams> => {
    const params: Partial<DepositListParams> = {};

    if (filters.dateRange) {
      params.fromDate = filters.dateRange[0];
      params.toDate = filters.dateRange[1];
    }

    if (filters.status && filters.status !== "ALL") {
      params.status = filters.status as DepositListParams["status"];
    }

    return params;
  };

  const getWithdrawalsAPIParams = (
    filters: WithdrawalsFilterState
  ): Partial<WithdrawListParams> => {
    const params: Partial<WithdrawListParams> = {};

    if (filters.dateRange) {
      params.fromDate = filters.dateRange[0];
      params.toDate = filters.dateRange[1];
    }

    if (filters.status && filters.status !== "ALL") {
      params.status = filters.status as WithdrawListParams["status"];
    }

    if (filters.type && filters.type !== "ALL") {
      params.type = filters.type as WithdrawListParams["type"];
    }

    return params;
  };

  // Debounce refs for filter changes
  const depositsDebounceRef = useRef<NodeJS.Timeout>();
  const withdrawalsDebounceRef = useRef<NodeJS.Timeout>();

  // Debounced filter change handlers
  const handleDepositsFiltersChange = useCallback(
    (newFilters: DepositsFilterState) => {
      setDepositsFilters(newFilters);

      // Clear existing timeout
      if (depositsDebounceRef.current) {
        clearTimeout(depositsDebounceRef.current);
      }

      // Set new timeout for debounced API call
      depositsDebounceRef.current = setTimeout(() => {
        loadDeposits(newFilters);
      }, 300); // 300ms debounce
    },
    []
  );

  const handleWithdrawalsFiltersChange = useCallback(
    (newFilters: WithdrawalsFilterState) => {
      setWithdrawalsFilters(newFilters);

      // Clear existing timeout
      if (withdrawalsDebounceRef.current) {
        clearTimeout(withdrawalsDebounceRef.current);
      }

      // Set new timeout for debounced API call
      withdrawalsDebounceRef.current = setTimeout(() => {
        loadWithdrawals(newFilters);
      }, 300); // 300ms debounce
    },
    []
  );

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (depositsDebounceRef.current) {
        clearTimeout(depositsDebounceRef.current);
      }
      if (withdrawalsDebounceRef.current) {
        clearTimeout(withdrawalsDebounceRef.current);
      }
    };
  }, []);

  // Load deposits data with filters
  const loadDeposits = useCallback(
    async (filters?: DepositsFilterState) => {
      const isFiltering = filters !== undefined;
      if (isFiltering) {
        setDepositsFilterLoading(true);
      } else {
        setDepositsLoading(true);
      }

      try {
        const params: DepositListParams = {
          limit: depositsPageSize,
          ...getDepositsAPIParams(filters || depositsFilters),
        };

        const result = await getCustomerDepositsList(customerId, params);
        if ("errorCode" in result) {
          message.error(`Failed to load deposits: ${result.message}`);
        } else {
          setDeposits(result.data);
        }
      } catch (error) {
        message.error("Error loading deposits data");
      } finally {
        if (isFiltering) {
          setDepositsFilterLoading(false);
        } else {
          setDepositsLoading(false);
        }
      }
    },
    [customerId, depositsFilters, depositsPageSize]
  );

  // Load withdrawals data with filters
  const loadWithdrawals = useCallback(
    async (filters?: WithdrawalsFilterState) => {
      const isFiltering = filters !== undefined;
      if (isFiltering) {
        setWithdrawalsFilterLoading(true);
      } else {
        setWithdrawalsLoading(true);
      }

      try {
        const params: WithdrawListParams = {
          limit: withdrawalsPageSize,
          ...getWithdrawalsAPIParams(filters || withdrawalsFilters),
        };

        const result = await getCustomerWithdrawalsList(customerId, params);
        if ("errorCode" in result) {
          message.error(`Failed to load withdrawals: ${result.message}`);
        } else {
          setWithdrawals(result.data);
        }
      } catch (error) {
        message.error("Error loading withdrawals data");
      } finally {
        if (isFiltering) {
          setWithdrawalsFilterLoading(false);
        } else {
          setWithdrawalsLoading(false);
        }
      }
    },
    [customerId, withdrawalsFilters, withdrawalsPageSize]
  );

  // Get deposits summary data from API
  const depositsSummaryData = summary
    ? {
        successful: summary.deposits.successful,
        pending: summary.deposits.pending,
        failed: summary.deposits.failed,
      }
    : {
        successful: { amount: 0, count: 0 },
        pending: { amount: 0, count: 0 },
        failed: { amount: 0, count: 0 },
      };

  // Handle deposit detail view
  const handleViewDepositDetails = (deposit: DepositTransaction) => {
    setSelectedDeposit(deposit);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedDeposit(null);
  };

  // Handle withdrawal detail view
  const handleViewWithdrawalDetails = (withdrawal: WithdrawTransaction) => {
    setSelectedWithdrawal(withdrawal);
    setIsWithdrawDetailModalVisible(true);
  };

  const handleCloseWithdrawDetailModal = () => {
    setIsWithdrawDetailModalVisible(false);
    setSelectedWithdrawal(null);
  };

  // Handle withdrawal approve
  const handleApproveWithdrawal = async (withdrawal: WithdrawTransaction) => {
    try {
      const result = await confirmWithdraw(withdrawal.id);
      if ("errorCode" in result) {
        message.error(`Failed to approve withdrawal: ${result.message}`);
      } else {
        message.success("Withdrawal approved successfully");
        // Reload withdrawals data to reflect the status change
        loadWithdrawals();
        // Reload summary data as well
        loadSummary();
      }
    } catch (error) {
      message.error("Error approving withdrawal");
    }
  };

  // Handle withdrawal reject
  const handleRejectWithdrawal = async (withdrawal: WithdrawTransaction) => {
    try {
      const result = await cancelWithdraw(withdrawal.id);
      if ("errorCode" in result) {
        message.error(`Failed to reject withdrawal: ${result.message}`);
      } else {
        message.success("Withdrawal rejected successfully");
        // Reload withdrawals data to reflect the status change
        loadWithdrawals();
        // Reload summary data as well
        loadSummary();
      }
    } catch (error) {
      message.error("Error rejecting withdrawal");
    }
  };

  // Handle pagination changes
  const handleDepositsPaginationChange = (page: number, pageSize?: number) => {
    if (pageSize && pageSize !== depositsPageSize) {
      setDepositsPageSize(pageSize);
      // Reload data with new page size
      loadDeposits();
    }
  };

  const handleWithdrawalsPaginationChange = (
    page: number,
    pageSize?: number
  ) => {
    if (pageSize && pageSize !== withdrawalsPageSize) {
      setWithdrawalsPageSize(pageSize);
      // Reload data with new page size
      loadWithdrawals();
    }
  };

  // Get withdrawals summary data from API
  const withdrawalsSummaryData = summary
    ? {
        successfulWithdrawals: summary.withdrawals.successful,
        pendingWithdrawals: summary.withdrawals.pending,
        rejectedWithdrawals: summary.withdrawals.rejected,
      }
    : {
        successfulWithdrawals: { amount: 0, count: 0 },
        pendingWithdrawals: { amount: 0, count: 0 },
        rejectedWithdrawals: { amount: 0, count: 0 },
      };

  // Load data on component mount
  useEffect(() => {
    loadSummary();
    loadDeposits();
    loadWithdrawals();
  }, [customerId, loadSummary, loadDeposits, loadWithdrawals]);

  return (
    <div className="deposits-withdrawals-tab">
      {/* Deposits Summary */}
      <div style={{ marginBottom: 24 }}>
        <h4>📥 Tóm tắt Nạp tiền</h4>
        <Spin spinning={summaryLoading}>
          <DepositsSummary {...depositsSummaryData} />
        </Spin>
      </div>

      {/* Withdrawals Summary */}
      <div style={{ marginBottom: 24 }}>
        <h4>📤 Tóm tắt Rút tiền</h4>
        <Spin spinning={summaryLoading}>
          <Row gutter={16}>
            <Col xs={12} sm={8} lg={4}>
              <Card>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#3f8600",
                    }}
                  >
                    {withdrawalsSummaryData.successfulWithdrawals.amount.toFixed(
                      2
                    )}
                    $
                  </div>
                  <div style={{ color: "#666" }}>✅ Rút thành công</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {withdrawalsSummaryData.successfulWithdrawals.count} giao
                    dịch
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={8} lg={4}>
              <Card>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#faad14",
                    }}
                  >
                    {withdrawalsSummaryData.pendingWithdrawals.amount.toFixed(
                      2
                    )}
                    $
                  </div>
                  <div style={{ color: "#666" }}>⏳ Rút chờ</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {withdrawalsSummaryData.pendingWithdrawals.count} giao dịch
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={8} lg={4}>
              <Card>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#cf1322",
                    }}
                  >
                    {withdrawalsSummaryData.rejectedWithdrawals.amount.toFixed(
                      2
                    )}
                    $
                  </div>
                  <div style={{ color: "#666" }}>❌ Rút từ chối</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {withdrawalsSummaryData.rejectedWithdrawals.count} giao dịch
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>

      {/* Split Tables */}
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="📥 LỊCH SỬ NẠP TIỀN">
            <DepositsTable
              deposits={deposits}
              loading={depositsLoading}
              filterLoading={depositsFilterLoading}
              filters={depositsFilters}
              pageSize={depositsPageSize}
              onViewDetails={handleViewDepositDetails}
              onFiltersChange={handleDepositsFiltersChange}
              onPaginationChange={handleDepositsPaginationChange}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="📤 LỊCH SỬ RÚT TIỀN">
            <WithdrawalsTable
              withdrawals={withdrawals}
              loading={withdrawalsLoading}
              filterLoading={withdrawalsFilterLoading}
              filters={withdrawalsFilters}
              pageSize={withdrawalsPageSize}
              onApprove={handleApproveWithdrawal}
              onReject={handleRejectWithdrawal}
              onViewDetails={handleViewWithdrawalDetails}
              onFiltersChange={handleWithdrawalsFiltersChange}
              onPaginationChange={handleWithdrawalsPaginationChange}
            />
          </Card>
        </Col>
      </Row>

      {/* Deposit Detail Modal */}
      {selectedDeposit && (
        <DepositDetailModal
          deposit={selectedDeposit}
          visible={isDetailModalVisible}
          onClose={handleCloseDetailModal}
        />
      )}

      {/* Withdrawal Detail Modal */}
      {selectedWithdrawal && (
        <WithdrawDetailModal
          withdrawal={selectedWithdrawal}
          visible={isWithdrawDetailModalVisible}
          onClose={handleCloseWithdrawDetailModal}
        />
      )}
    </div>
  );
};

export default DepositsWithdrawalsTab;
