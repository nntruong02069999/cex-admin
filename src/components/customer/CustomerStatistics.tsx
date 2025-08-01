import React from "react";
import { Row, Col, Select, Input, DatePicker, Button, Alert } from "antd";
import {
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import SectionCard from "./common/SectionCard";

const { Option } = Select;
const { RangePicker } = DatePicker;

const StatisticCard: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
  color?: string;
}> = ({ icon, value, label, color = "#1890ff" }) => {
  return (
    <div
      style={{
        padding: "15px",
        border: "1px solid #e8e8e8",
        borderRadius: "4px",
        marginBottom: "16px",
        background: "#fff",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
      >
        <div
          style={{
            backgroundColor: color,
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "10px",
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            style: { fontSize: "20px", color: "#fff" },
          })}
        </div>
        <div style={{ fontWeight: "bold", fontSize: "18px" }}>{value}</div>
      </div>
      <div style={{ color: "#666" }}>{label}</div>
    </div>
  );
};

const CustomerStatistics: React.FC = () => {
  return (
    <SectionCard title="Thông kê đại lý người dùng">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="-- Tất cả --"
            style={{ width: "100%", marginBottom: "8px" }}
            defaultValue="all"
          >
            <Option value="all">-- Tất cả --</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Id cấp dưới"
            style={{ width: "100%", marginBottom: "8px" }}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <RangePicker
            style={{ width: "100%", marginBottom: "8px" }}
            placeholder={["16/4/2025", "16/5/2025"]}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Button type="primary" style={{ width: "100%" }}>
            30 ngày gần đây
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            icon={<TeamOutlined />}
            value="0"
            label="thành viên"
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            icon={<BankOutlined />}
            value="0"
            label="số người nạp"
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            icon={<DollarOutlined />}
            value="0 đ"
            label="tổng tiền nạp"
            color="#52c41a"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            icon={<BankOutlined />}
            value="0"
            label="Số người cược"
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            icon={<DollarOutlined />}
            value="0 đ"
            label="Tổng vol cược"
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            icon={<DollarOutlined />}
            value="0 đ"
            label="Tổng hoa hồng"
            color="#f5222d"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            icon={<UserOutlined />}
            value="0"
            label="Số người nạp đầu"
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            icon={<DollarOutlined />}
            value="0 đ"
            label="Tổng nạp đầu"
            color="#faad14"
          />
        </Col>
      </Row>

      <Alert
        message="Tạm thời chưa có bản ghi nào"
        type="warning"
        showIcon
        style={{ marginTop: 16 }}
      />
    </SectionCard>
  );
};

export default CustomerStatistics;