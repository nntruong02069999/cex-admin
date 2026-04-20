import React, { memo } from "react";
import { CustomerMoney } from "../../types/customer.types";
import UsdtBlock from "./UsdtBlock";
import RewardsBlock from "./RewardsBlock";
import "./WalletSection.less";

interface WalletSectionProps {
  customerMoney: CustomerMoney;
}

const WalletSection: React.FC<WalletSectionProps> = ({ customerMoney }) => (
  <>
    <UsdtBlock
      balanceUSDT={customerMoney.balanceUSDT}
      totalDeposit={customerMoney.totalDeposit}
      totalWithdraw={customerMoney.totalWithdraw}
      usdtAddress={customerMoney.usdtAddress}
    />
    <RewardsBlock
      totalCommission={customerMoney.totalCommission}
      totalRewardFirstDeposit={customerMoney.totalRewardFirstDeposit}
      totalRewardMembersFirstDeposit={
        customerMoney.totalRewardMembersFirstDeposit
      }
      totalDailyQuestRewards={customerMoney.totalDailyQuestRewards}
      totalRefundTradeAmount={customerMoney.totalRefundTradeAmount}
    />
  </>
);

export default memo(WalletSection);
