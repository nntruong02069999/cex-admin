import React from "react";
import { Tabs, Badge, Spin } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { WithdrawStatus, WithdrawStats } from "./types";

interface TabConfig {
  key: string;
  label: string;
  count: number;
}

interface WithdrawHeaderProps {
  activeTab: string;
  stats?: WithdrawStats;
  loading?: boolean;
  onTabChange: (tab: string) => void;
}

const { TabPane } = Tabs;

const WithdrawHeader: React.FC<WithdrawHeaderProps> = ({
  activeTab,
  stats,
  loading = false,
  onTabChange,
}) => {
  const getTabConfig = (): TabConfig[] => [
    {
      key: WithdrawStatus.PENDING,
      label: "Chờ xử lý",
      count: stats?.PENDING || 0,
    },
    {
      key: WithdrawStatus.SUCCESS,
      label: "Thành công",
      count: stats?.SUCCESS || 0,
    },
    {
      key: WithdrawStatus.REJECTED,
      label: "Bị từ chối",
      count: stats?.REJECTED || 0,
    },
  ];

  const getTabIcon = (key: string) => {
    switch (key) {
      case WithdrawStatus.PENDING:
        return <ClockCircleOutlined />;
      case WithdrawStatus.SUCCESS:
        return <CheckCircleOutlined />;
      case WithdrawStatus.REJECTED:
        return <CloseCircleOutlined />;
      default:
        return <AppstoreOutlined />;
    }
  };

  const getTabColor = (key: string) => {
    switch (key) {
      case WithdrawStatus.PENDING:
        return "#fa8c16"; // orange
      case WithdrawStatus.SUCCESS:
        return "#52c41a"; // green
      case WithdrawStatus.REJECTED:
        return "#ff4d4f"; // red
      default:
        return "#d9d9d9"; // gray
    }
  };

  const renderTabTitle = (config: TabConfig) => (
    <span className="withdraw-tab-title">
      {getTabIcon(config.key)}
      <span className="tab-label">{config.label}</span>
      {loading ? (
        <Spin size="small" />
      ) : (
        <Badge
          count={config.count}
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
    <div className="withdraw-header">
      <div className="header-title">
        <h2>
          <DollarOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
          Quản lý rút tiền
        </h2>
        <p className="header-description">
          Theo dõi và quản lý các yêu cầu rút tiền của khách hàng
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        className="withdraw-tabs"
        size="large"
        type="card"
      >
        {getTabConfig().map((config) => (
          <TabPane
            tab={renderTabTitle(config)}
            key={config.key}
            className={`withdraw-tab-${config.key}`}
          />
        ))}
      </Tabs>
    </div>
  );
};

export default WithdrawHeader;
