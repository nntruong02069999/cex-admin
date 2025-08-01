import React from "react";
import { Tabs, Badge, Spin } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { InvitationStats, TabConfig, InvitationStatusEnum } from "./types";

interface InvitationHeaderProps {
  activeTab: string;
  stats?: InvitationStats;
  loading?: boolean;
  onTabChange: (tab: string) => void;
}

const { TabPane } = Tabs;

const InvitationHeader: React.FC<InvitationHeaderProps> = ({
  activeTab,
  stats,
  loading = false,
  onTabChange,
}) => {
  const getTabConfig = (): TabConfig[] => [
    {
      key: InvitationStatusEnum.PENDING,
      label: "Chờ xác nhận",
      count: stats?.pending || 0,
    },
    {
      key: InvitationStatusEnum.QUALIFIED,
      label: "Đủ điều kiện",
      count: stats?.qualified || 0,
    },
    {
      key: InvitationStatusEnum.PAID,
      label: "Đã trả thưởng",
      count: stats?.paid || 0,
    },
    {
      key: InvitationStatusEnum.EXPIRED,
      label: "Hết hạn",
      count: stats?.expired || 0,
    },
  ];

  const getTabIcon = (key: string) => {
    switch (key) {
      case InvitationStatusEnum.PENDING:
        return <ClockCircleOutlined />;
      case InvitationStatusEnum.QUALIFIED:
        return <CheckCircleOutlined />;
      case InvitationStatusEnum.PAID:
        return <DollarOutlined />;
      case InvitationStatusEnum.EXPIRED:
        return <ExclamationCircleOutlined />;
      default:
        return <AppstoreOutlined />;
    }
  };

  const getTabColor = (key: string) => {
    switch (key) {
      case InvitationStatusEnum.PENDING:
        return "#faad14"; // orange
      case InvitationStatusEnum.QUALIFIED:
        return "#52c41a"; // green
      case InvitationStatusEnum.PAID:
        return "#1890ff"; // blue
      case InvitationStatusEnum.EXPIRED:
        return "#ff4d4f"; // red
      default:
        return "#d9d9d9"; // gray
    }
  };

  const renderTabTitle = (config: TabConfig) => (
    <span className="invitation-tab-title">
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
    <div className="invitation-header">
      <div className="header-title">
        <h2>Thưởng nạp đầu cho đại lý</h2>
        <p className="header-description">
          Quản lý thưởng cho các đại lý khi giới thiệu người dùng mới nạp tiền
          lần đầu
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        className="invitation-tabs"
        size="large"
        type="card"
      >
        {getTabConfig().map((config) => (
          <TabPane
            tab={renderTabTitle(config)}
            key={config.key}
            className={`invitation-tab-${config.key}`}
          />
        ))}
      </Tabs>
    </div>
  );
};

export default InvitationHeader;
