import React from "react";
import { Tabs, Badge, Spin } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { DepositStats, TabConfig, PaymentStatus } from "./types";

interface DepositHeaderProps {
  activeTab: string;
  stats?: DepositStats;
  loading?: boolean;
  onTabChange: (tab: string) => void;
}

const { TabPane } = Tabs;

const DepositHeader: React.FC<DepositHeaderProps> = ({
  activeTab,
  stats,
  loading = false,
  onTabChange,
}) => {
  const getTabConfig = (): TabConfig[] => [
    {
      key: PaymentStatus.PENDING,
      label: "Chờ thanh toán",
      count: stats?.PENDING || 0,
    },
    {
      key: PaymentStatus.SUCCESS,
      label: "Thành công",
      count: stats?.SUCCESS || 0,
    },
    {
      key: PaymentStatus.FAILED,
      label: "Thất bại",
      count: stats?.FAILED || 0,
    },
  ];

  const getTabIcon = (key: string) => {
    switch (key) {
      case PaymentStatus.PENDING:
        return <ClockCircleOutlined />;
      case PaymentStatus.SUCCESS:
        return <CheckCircleOutlined />;
      case PaymentStatus.FAILED:
        return <CloseCircleOutlined />;
      default:
        return <AppstoreOutlined />;
    }
  };

  const getTabColor = (key: string) => {
    switch (key) {
      case PaymentStatus.PENDING:
        return "#ffa940"; // softer orange
      case PaymentStatus.SUCCESS:
        return "#73d13d"; // softer green
      case PaymentStatus.FAILED:
        return "#ff7875"; // softer red
      default:
        return "#bfbfbf"; // softer gray
    }
  };

  const renderTabTitle = (config: TabConfig) => (
    <span className="deposit-tab-title">
      {getTabIcon(config.key)}
      <span className="tab-label">{config.label}</span>
      {loading ? (
        <Spin size="small" />
      ) : (
        <Badge
          count={config.count}
          overflowCount={999999}
          style={{
            backgroundColor: getTabColor(config.key),
            marginLeft: 8,
          }}
          showZero
        />
      )}
    </span>
  );

  return (
    <div className="deposit-header">
      <div className="header-title">
        <h2>
          <DollarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          Quản lý nạp tiền
        </h2>
        <p className="header-description">
          Theo dõi và quản lý các giao dịch nạp tiền của khách hàng
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        className="deposit-tabs"
        size="large"
        type="card"
      >
        {getTabConfig().map((config) => (
          <TabPane
            tab={renderTabTitle(config)}
            key={config.key}
            className={`deposit-tab-${config.key}`}
          />
        ))}
      </Tabs>
    </div>
  );
};

export default DepositHeader;
