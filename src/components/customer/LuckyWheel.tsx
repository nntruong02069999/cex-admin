import React from "react";
import { Input, Button, Checkbox, Table } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import SectionCard from "./common/SectionCard";

const LuckyWheel: React.FC = () => {
  // Sample data for lucky wheel rewards
  const luckyWheelData = [
    { name: "Tiền Thưởng", amount: 50000000, spins: 0, isDefault: false },
    { name: "Tiền Thưởng", amount: 100000000, spins: 0, isDefault: false },
    { name: "Tiền Thưởng", amount: 8888, spins: 0, isDefault: false },
    { name: "Tiền Thưởng", amount: 18888, spins: 0, isDefault: false },
    { name: "Tiền Thưởng", amount: 38888, spins: 0, isDefault: false },
  ];

  // Column definitions for the table
  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Số lần trúng",
      dataIndex: "spins",
      key: "spins",
      render: (spins: number) => (
        <Input defaultValue={spins} style={{ width: "100%" }} />
      ),
    },
    {
      title: "Mặc định",
      dataIndex: "isDefault",
      key: "isDefault",
      render: (isDefault: boolean) => <Checkbox checked={isDefault} />,
    },
  ];

  // History column definitions
  const historyColumns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Giải thưởng",
      dataIndex: "prize",
      key: "prize",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
    },
  ];

  return (
    <SectionCard
      title="Lucky Wheel"
      extra={
        <div>
          <Button type="primary" style={{ marginRight: 8 }}>
            Lưu
          </Button>
          <Button icon={<ReloadOutlined />}>Refresh</Button>
        </div>
      }
    >
      <div style={{ display: "flex" }}>
        <div style={{ flex: 3, marginRight: 16 }}>
          <div style={{ fontWeight: "bold", marginBottom: 10 }}>Cấu hình</div>
          <Table
            dataSource={luckyWheelData}
            columns={columns}
            pagination={false}
            rowKey={(record) => record.amount.toString()}
            size="small"
          />
        </div>
        <div style={{ flex: 2 }}>
          <div style={{ fontWeight: "bold", marginBottom: 10 }}>Lịch sử</div>
          <Table
            dataSource={[]} // Empty data for now
            columns={historyColumns}
            pagination={false}
            size="small"
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default LuckyWheel;
