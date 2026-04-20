import React, { memo, Suspense, lazy } from "react";
import AccountInfoSection from "./AccountInfoSection";
import WalletSection from "./WalletSection";
import { SectionSkeleton } from "./SectionBlock";
import { CustomerDetailData } from "../types/customer.types";
import "./OverviewTab.less";

const HierarchyTreeSection = lazy(() => import("./HierarchyTreeSection"));

interface OverviewTabProps {
  customerId: number;
  customerData: CustomerDetailData;
  onDataUpdate: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  customerId,
  customerData,
}) => {
  return (
    <div className="overview-tab">
      <AccountInfoSection
        customer={customerData.customer}
        inviter={customerData.inviter}
      />
      <WalletSection customerMoney={customerData.customerMoney} />
      <Suspense fallback={<SectionSkeleton title="Cây phả hệ" rows={5} />}>
        <HierarchyTreeSection
          customerId={customerId}
          customer={customerData.customer}
          customerVip={customerData.customerVip}
        />
      </Suspense>
    </div>
  );
};

export default memo(OverviewTab);
