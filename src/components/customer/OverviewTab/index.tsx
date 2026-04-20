import React from "react";
import CustomerInfo from "./CustomerInfo";
import FinancialOverview from "./FinancialOverview";
import HierarchyTreeSection from "./HierarchyTreeSection";
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
      <CustomerInfo
        customerId={customerId}
        customer={customerData.customer}
        customerVip={customerData.customerVip}
        inviter={customerData.inviter}
        onDataUpdate={onDataUpdate}
      />

      <FinancialOverview customerMoney={customerData.customerMoney} />

      <HierarchyTreeSection customerId={customerId} />
    </div>
  );
};

export default OverviewTab;
