import React, { useState } from "react";
import { Tabs } from "antd";
import {
  FolderViewOutlined,
  TransactionOutlined,
  SwapOutlined,
  TrophyOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import OverviewTab from "../OverviewTab";
import DepositsWithdrawalsTab from "../DepositsWithdrawalsTab";
import TransactionsTab from "../TransactionsTab";
import TradingHistoryTab from "../TradingHistoryTab";
import VipCommissionTab from "../VipCommissionTab";
import { CustomerDetailData } from "../types/customer.types";
import "./TabContainer.less";

const { TabPane } = Tabs;

interface TabContainerProps {
  customerId: number;
  customerData: CustomerDetailData;
  onDataUpdate: () => void;
}

const TabContainer: React.FC<TabContainerProps> = ({
  customerId,
  customerData,
  onDataUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="tab-container">
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
        size="large"
        className="customer-tabs"
        tabPosition="top"
        destroyInactiveTabPane={false} // Keep tab content for better UX
      >
        <TabPane
          key="overview"
          tab={
            <span className="tab-label">
              <FolderViewOutlined />
              <span className="tab-text">Tổng quan</span>
            </span>
          }
        >
          <OverviewTab
            customerId={customerId}
            customerData={customerData}
            onDataUpdate={onDataUpdate}
          />
        </TabPane>

        <TabPane
          key="deposits-withdrawals"
          tab={
            <span className="tab-label">
              <TransactionOutlined />
              <span className="tab-text">Nạp/Rút tiền</span>
            </span>
          }
        >
          <DepositsWithdrawalsTab
            customerId={customerId}
            customerData={customerData}
          />
        </TabPane>

        <TabPane
          key="transactions"
          tab={
            <span className="tab-label">
              <SwapOutlined />
              <span className="tab-text">Giao dịch</span>
            </span>
          }
        >
          <TransactionsTab
            customerId={customerId}
            customerData={customerData}
          />
        </TabPane>

        <TabPane
          key="trading-history"
          tab={
            <span className="tab-label">
              <TrophyOutlined />
              <span className="tab-text">Lịch sử Cược</span>
            </span>
          }
        >
          <TradingHistoryTab
            customerId={customerId}
            customerData={customerData}
          />
        </TabPane>

        <TabPane
          key="vip-commission"
          tab={
            <span className="tab-label">
              <CrownOutlined />
              <span className="tab-text">VIP & Hoa hồng</span>
            </span>
          }
        >
          <VipCommissionTab customerId={customerId} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TabContainer;
