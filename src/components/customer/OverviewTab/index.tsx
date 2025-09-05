import React from "react";
import { Row, Col } from "antd";
import CustomerInfo from "./CustomerInfo";
import FinancialOverview from "./FinancialOverview";
import NetworkHierarchy from "./NetworkHierarchy";
import QuickActions from "./QuickActions";
import { CustomerDetailData } from "../types/customer.types";
import "./OverviewTab.less";

interface OverviewTabProps {
  customerId: number;
  customerData: CustomerDetailData;
  onDataUpdate: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  customerId,
  customerData,
  onDataUpdate,
}) => {
  return (
    <div className="overview-tab">
      <Row gutter={24} className="customer-responsive-grid--2-cols">
        {/* Left Panel - 65% */}
        <Col xs={24} lg={16} className="overview-tab__left-panel">
          <div className="overview-tab__sections">
            {/* Customer Information */}
            <CustomerInfo
              customerId={customerId}
              customer={customerData.customer}
              customerVip={customerData.customerVip}
              inviter={customerData.inviter}
              onDataUpdate={onDataUpdate}
            />

            {/* Financial Overview */}
            <FinancialOverview customerMoney={customerData.customerMoney} />

            {/* Network Hierarchy */}
            <NetworkHierarchy
              hierarchy={customerData.hierarchy}
              networkSummary={customerData.networkSummary}
            />
          </div>
        </Col>

        {/* Right Panel - 35% */}
        <Col xs={24} lg={8} className="overview-tab__right-panel">
          <div className="overview-tab__actions-panel">
            <QuickActions
              customerId={customerId}
              customerData={customerData}
              onDataUpdate={onDataUpdate}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewTab;
