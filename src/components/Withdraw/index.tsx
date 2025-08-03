import React, { useState, useEffect, useCallback } from "react";
import { Card, message, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import WithdrawHeader from "./WithdrawHeader";
import WithdrawFilters from "./WithdrawFilters";
import WithdrawTable from "./WithdrawTable";
import {
  WithdrawRecord,
  WithdrawStatus,
  WithdrawListParams,
  WithdrawStats,
} from "./types";
import { withdrawService } from "../../services/withdrawService";
import "../../styles/withdraw/styles.less";

const { confirm } = Modal;

const WithdrawPage: React.FC = () => {
  const [data, setData] = useState<WithdrawRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [activeStatus, setActiveStatus] = useState<WithdrawStatus>(
    WithdrawStatus.PENDING
  );
  const [stats, setStats] = useState<WithdrawStats>({
    PENDING: 0,
    SUCCESS: 0,
    REJECTED: 0,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [filters, setFilters] = useState<WithdrawListParams>({
    skip: 0,
    limit: 10,
    sort: "createdAt",
    order: "desc",
  });

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await withdrawService.getWithdrawStats();
      if (response.code === 0) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching withdraw stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const params: WithdrawListParams = {
        ...filters,
        skip: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
        status: activeStatus,
      };

      const response = await withdrawService.getWithdrawList(params);

      if (response.code === 0) {
        setData(response.data);
        setTotal(response.count);
      } else {
        message.error("Không thể tải dữ liệu rút tiền");
      }
    } catch (error) {
      console.error("Error fetching withdraw data:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, activeStatus]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = (status: string) => {
    setActiveStatus(status as WithdrawStatus);
    setPagination({ ...pagination, current: 1 });
  };

  const handleFiltersChange = (newFilters: WithdrawListParams) => {
    setFilters(newFilters);
    setPagination({ ...pagination, current: 1 });
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination({
      current: page,
      pageSize: pageSize || pagination.pageSize,
    });
  };

  const handleAction = async (
    record: WithdrawRecord,
    action: "view" | "confirm" | "reject"
  ) => {
    switch (action) {
      case "view":
        // TODO: Implement view detail modal
        message.info(`Xem chi tiết rút tiền ID: ${record.id}`);
        break;

      case "confirm":
        confirm({
          title: "Xác nhận rút tiền",
          icon: <ExclamationCircleOutlined />,
          content: (
            <div>
              <p>Bạn có chắc chắn muốn xác nhận yêu cầu rút tiền này không?</p>
              <p>
                <strong>Mã rút tiền:</strong> {record.withdrawCode}
              </p>
              <p>
                <strong>Số tiền:</strong> {record.amount} USDT
              </p>
              <p>
                <strong>Khách hàng:</strong> {record.Customer.name}
                {record.Customer.nickname && ` (${record.Customer.nickname})`}
              </p>
            </div>
          ),
          okText: "Xác nhận",
          cancelText: "Hủy",
          okType: "primary",
          onOk: async () => {
            try {
              const response = await withdrawService.confirmWithdraw(record.id);
              if (response.code === 0) {
                message.success("Xác nhận rút tiền thành công");
                fetchData();
                fetchStats(); // Refresh stats after action
              } else {
                message.error(response.message || "Có lỗi xảy ra");
              }
            } catch (error) {
              console.error("Error confirming withdraw:", error);
              message.error("Có lỗi xảy ra khi xác nhận rút tiền");
            }
          },
        });
        break;

      case "reject":
        confirm({
          title: "Từ chối rút tiền",
          icon: <ExclamationCircleOutlined />,
          content: (
            <div>
              <p>Bạn có chắc chắn muốn từ chối yêu cầu rút tiền này không?</p>
              <p>
                <strong>Mã rút tiền:</strong> {record.withdrawCode}
              </p>
              <p>
                <strong>Số tiền:</strong> {record.amount} USDT
              </p>
              <p>
                <strong>Khách hàng:</strong> {record.Customer.name}
                {record.Customer.nickname && ` (${record.Customer.nickname})`}
              </p>
            </div>
          ),
          okText: "Từ chối",
          cancelText: "Hủy",
          okType: "danger",
          onOk: async () => {
            try {
              const response = await withdrawService.rejectWithdraw(record.id);
              if (response.code === 0) {
                message.success("Từ chối rút tiền thành công");
                fetchData();
                fetchStats(); // Refresh stats after action
              } else {
                message.error(response.message || "Có lỗi xảy ra");
              }
            } catch (error) {
              console.error("Error rejecting withdraw:", error);
              message.error("Có lỗi xảy ra khi từ chối rút tiền");
            }
          },
        });
        break;
    }
  };

  return (
    <div className="withdraw-page">
      <Card className="withdraw-card">
        <WithdrawHeader
          activeTab={activeStatus}
          stats={stats}
          loading={statsLoading}
          onTabChange={handleStatusChange}
        />

        <WithdrawFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={loading}
          totalCount={total}
        />

        <WithdrawTable
          data={data}
          total={total}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onAction={handleAction}
        />
      </Card>
    </div>
  );
};

export default WithdrawPage;
