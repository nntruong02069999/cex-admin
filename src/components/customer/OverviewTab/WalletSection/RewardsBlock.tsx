import React, { memo } from "react";
import {
  GiftOutlined,
  DollarOutlined,
  RocketOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { SectionBlock } from "../SectionBlock";
import { formatCurrency } from "../../utils/formatters";

interface RewardsBlockProps {
  totalCommission: number;
  totalRewardFirstDeposit: number;
  totalRewardMembersFirstDeposit: number;
  totalDailyQuestRewards: number;
  totalRefundTradeAmount: number;
}

const FIELDS = [
  { key: "totalCommission", label: "Tổng hoa hồng", icon: <DollarOutlined /> },
  { key: "totalRewardFirstDeposit", label: "Thưởng nạp đầu", icon: <RocketOutlined /> },
  { key: "totalRewardMembersFirstDeposit", label: "Thưởng F1 nạp đầu", icon: <TeamOutlined /> },
  { key: "totalDailyQuestRewards", label: "Daily Quest", icon: <CheckCircleOutlined /> },
  { key: "totalRefundTradeAmount", label: "Hoàn trả", icon: <RollbackOutlined /> },
] as const;

const RewardsBlock: React.FC<RewardsBlockProps> = (props) => {
  return (
    <SectionBlock
      icon={<GiftOutlined />}
      title="Hoa hồng & Thưởng"
      subtitle="Tổng các khoản thưởng hệ thống đã ghi nhận"
      accent="gold"
    >
      <ul className="rewards-list">
        {FIELDS.map((f) => (
          <li key={f.key} className="rewards-list__item">
            <span className="rewards-list__icon">{f.icon}</span>
            <span className="rewards-list__label">{f.label}</span>
            <span className="rewards-list__value">
              {formatCurrency((props as any)[f.key])}
            </span>
          </li>
        ))}
      </ul>
    </SectionBlock>
  );
};

export default memo(RewardsBlock);
