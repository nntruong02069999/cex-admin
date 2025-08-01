import React, { useState } from "react";
import { Card, Table, Button } from "antd";
import { useHistory } from "react-router-dom";

export interface TransactionItem {
  id: number;
  time: string;
  userId: string;
  amount: string;
  type: string;
}

interface TransactionTableProps {
  title: string;
  totalAmount: number;
  data: TransactionItem[];
  totalItems: number;
  isRevenue: boolean;
  onPageChange?: (page: number) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  title,
  totalAmount,
  data,
  totalItems,
  isRevenue,
  onPageChange,
}) => {
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Calculate current page data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Call external callback if provided
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      width: 220,
    },
    {
      title: "Thành viên",
      dataIndex: "userId",
      key: "userId",
      width: 180,
      render: (text: string) => (
        <Button
          type="primary"
          size="small"
          style={{ backgroundColor: "#38b0de", borderColor: "#38b0de" }}
          onClick={() => history.push(`/customer/${text}`)}
        >
          ID {text}
        </Button>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (text: string) => (
        <span style={{ color: text.includes("+") ? "green" : "red" }}>
          {text}
        </span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (text: string) => (
        <Button
          type="primary"
          size="small"
          style={{
            backgroundColor: isRevenue ? "#5cb85c" : "#d9534f",
            borderColor: isRevenue ? "#5cb85c" : "#d9534f",
          }}
        >
          {text}
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <div>
          {title}{" "}
          <span style={{ fontWeight: "normal", float: "right" }}>
            Tổng: {new Intl.NumberFormat("en-US").format(totalAmount)} ₹
          </span>
        </div>
      }
      bordered={false}
    >
      <Table
        dataSource={currentPageData}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} mục`,
          onChange: handlePageChange,
          size: "small",
        }}
        rowKey="id"
        size="small"
        style={{ overflowX: "auto" }}
      />
    </Card>
  );
};

export default TransactionTable;
