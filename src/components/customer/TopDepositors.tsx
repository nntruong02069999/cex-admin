import React, { useEffect, useState } from "react";
import { Alert, Table, Typography, Spin } from "antd";
import { ColumnsType } from "antd/es/table";
import SectionCard from "./common/SectionCard";
import { topF1Deposit } from "../../services/customer";
import { TopF1Deposit } from "../../interfaces/Customer";
import { useParams } from "react-router-dom";

const { Text } = Typography;

interface RouteParams {
  customerId?: string;
}

const TopDepositors: React.FC = () => {
  const { customerId } = useParams<RouteParams>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TopF1Deposit>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await topF1Deposit(Number(customerId));

        if (response.errorCode) {
          setError(response.message || "Có lỗi xảy ra khi tải dữ liệu");
        } else {
          setData(response.data || []);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  const columns: ColumnsType<TopF1Deposit[0]> = [
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Mã UUID",
      dataIndex: "uuid",
      key: "uuid",
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: "Tổng nạp tiền",
      dataIndex: "total",
      key: "total",
      render: (amount: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          ₹{amount.toLocaleString("en-US")}
        </Text>
      ),
      sorter: (a, b) => a.total - b.total,
      defaultSortOrder: "descend",
    },
  ];

  return (
    <SectionCard title="Top F1 nạp nhiều">
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
        />
      ) : data.length === 0 ? (
        <Alert
          message="Chưa có dữ liệu"
          description="Tạm thời chưa có dữ liệu top F1 nạp tiền"
          type="info"
          showIcon
        />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="uuid"
          pagination={false}
          size="small"
          scroll={{ x: true }}
        />
      )}
    </SectionCard>
  );
};

export default TopDepositors;
