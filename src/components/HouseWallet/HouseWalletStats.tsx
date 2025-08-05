import React from "react";
import { Card, Row, Col, Statistic, Button } from "antd";
import {
  WalletOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { DashboardStats } from "@src/services/houseWalletService";

interface HouseWalletStatsProps {
  stats: DashboardStats | null;
  onRefresh: () => void;
}

const HouseWalletStats: React.FC<HouseWalletStatsProps> = ({
  stats,
  onRefresh,
}) => {
  if (!stats) return null;

  return (
    <Card
      className="dashboard-stats"
      bordered={false}
      extra={
        <Button icon={<ReloadOutlined />} onClick={onRefresh} type="text">
          Làm mới
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Ví hoạt động"
              value={stats.activeWallets}
              suffix={`/ ${stats.totalWallets}`}
              prefix={<WalletOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng số dư"
              value={stats.totalBalanceUsdt}
              precision={2}
              suffix="USDT"
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Giao dịch chờ"
              value={stats.pendingTransactions}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Giao dịch thất bại"
              value={stats.failedTransactions}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default HouseWalletStats;
