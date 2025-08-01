import React, { useEffect, useState } from "react";
import { Table, Alert, Spin, Pagination } from "antd";
import SectionCard from "./common/SectionCard";
import {
  getLoginHistory,
  GetLoginHistoryParams,
} from "@src/services/customer-transaction";
import { CustomerLogin } from "@src/interfaces/CustomerTransaction";
import moment from "moment";
import { useParams } from "react-router-dom";
import { TablePaginationConfig } from "antd/es/table/interface";

interface RouteParams {
  customerId?: string;
}

const LoginHistory: React.FC = () => {
  const { customerId } = useParams<RouteParams>();
  const [loading, setLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState<CustomerLogin[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchLoginHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const fetchLoginHistory = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: GetLoginHistoryParams = {
        page,
        limit,
        customerId: customerId ? parseInt(customerId) : undefined,
      };

      const result = await getLoginHistory(params);
      if (result) {
        const { data, total } = result;
        setLoginHistory(data);
        setPagination({
          ...pagination,
          current: page,
          pageSize: limit,
          total: total,
        });
      }
    } catch (error) {
      console.error("Error fetching login history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    fetchLoginHistory(page, pageSize);
  };

  // Column definitions
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_: any, __: any, index: number) =>
        (pagination.current! - 1) * pagination.pageSize! + index + 1,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp: number) =>
        timestamp ? moment(timestamp).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "IP",
      dataIndex: "ipLogin",
      key: "ipLogin",
    },
  ];

  return (
    <SectionCard title="Lịch sử đăng nhập">
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      ) : loginHistory.length > 0 ? (
        <>
          {/* Total display */}
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <span style={{ fontSize: 16, fontWeight: "bold" }}>
              Tổng số: {pagination.total} lượt đăng nhập
            </span>
          </div>

          <Table
            dataSource={loginHistory}
            columns={columns}
            pagination={false}
            rowKey="id"
            size="middle"
          />

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `Tổng ${total} lượt đăng nhập`}
            />
          </div>
        </>
      ) : (
        <Alert message="Chưa có lịch sử đăng nhập" type="info" showIcon />
      )}
    </SectionCard>
  );
};

export default LoginHistory;
