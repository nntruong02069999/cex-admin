import React, { useState } from "react";
import { Card, Table, Button, Select } from "antd";
import { useHistory } from "react-router-dom";

const { Option } = Select;

export interface TopUserItem {
  id: number;
  userId: string;
  totalDeposit: string;
}

interface TopUserProps {
  data: TopUserItem[];
  totalItems: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (value: string) => void;
  filterType?: "deposit" | "withdrawal";
}

const TopUsers: React.FC<TopUserProps> = ({
  data,
  totalItems,
  onPageChange,
  onFilterChange,
  filterType = "deposit",
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
      title:
        filterType === "deposit"
          ? "Tổng số tiền đã nạp"
          : "Tổng số tiền đã rút",
      dataIndex: "totalDeposit",
      key: "totalDeposit",
      width: 220,
    },
  ];

  return (
    <Card
      title="Top thành viên"
      bordered={false}
      extra={
        <Select
          defaultValue="Nạp nhiều tiền nhất"
          style={{ width: 180 }}
          onChange={onFilterChange}
        >
          <Option value="deposit">Nạp nhiều tiền nhất</Option>
          <Option value="withdrawal">Rút nhiều tiền nhất</Option>
        </Select>
      }
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

export default TopUsers;
