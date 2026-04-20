import React, { useState, Suspense, lazy } from "react";
import { Tabs, Spin } from "antd";
import {
  FolderViewOutlined,
  TransactionOutlined,
  SwapOutlined,
  TrophyOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import OverviewTab from "../OverviewTab";
import { CustomerDetailData } from "../types/customer.types";
import "./TabContainer.less";

// Lazy-load non-Overview tabs for better performance
const DepositsWithdrawalsTab = lazy(() => import("../DepositsWithdrawalsTab"));
const TransactionsTab = lazy(() => import("../TransactionsTab"));
const TradingHistoryTab = lazy(() => import("../TradingHistoryTab"));
const VipCommissionTab = lazy(() => import("../VipCommissionTab"));

const TabFallback: React.FC = () => (
  <div className="tab-container__fallback">
    <Spin />
  </div>
);

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

  return (
    <div className="tab-container">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="line"
        className="customer-tabs"
        tabPosition="top"
        destroyInactiveTabPane={false}
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
              <span className="tab-text">Nạp/Rút</span>
            </span>
          }
        >
          <Suspense fallback={<TabFallback />}>
            <DepositsWithdrawalsTab customerId={customerId} />
          </Suspense>
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
          <Suspense fallback={<TabFallback />}>
            <TransactionsTab customerId={customerId} />
          </Suspense>
        </TabPane>

        <TabPane
          key="trading-history"
          tab={
            <span className="tab-label">
              <TrophyOutlined />
              <span className="tab-text">Lịch sử cược</span>
            </span>
          }
        >
          <Suspense fallback={<TabFallback />}>
            <TradingHistoryTab customerId={customerId} />
          </Suspense>
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
          <Suspense fallback={<TabFallback />}>
            <VipCommissionTab customerId={customerId} />
          </Suspense>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TabContainer;
