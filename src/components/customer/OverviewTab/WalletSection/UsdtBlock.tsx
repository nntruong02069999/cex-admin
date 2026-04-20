import React, { memo, useCallback } from "react";
import { Button, message, Typography } from "antd";
import {
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { SectionBlock } from "../SectionBlock";
import { formatCurrency } from "../../utils/formatters";
import { truncateAddress, copyToClipboard } from "../../utils/helpers";

const { Text } = Typography;

interface UsdtBlockProps {
  balanceUSDT: number;
  totalDeposit: number;
  totalWithdraw: number;
  usdtAddress?: string;
}

const USDT_METRICS = [
  { key: "balance", label: "Số dư USDT", icon: null },
  { key: "deposit", label: "Tổng nạp", icon: <ArrowUpOutlined /> },
  { key: "withdraw", label: "Tổng rút", icon: <ArrowDownOutlined /> },
] as const;

const UsdtBlock: React.FC<UsdtBlockProps> = ({
  balanceUSDT,
  totalDeposit,
  totalWithdraw,
  usdtAddress,
}) => {
  const handleCopy = useCallback(async () => {
    if (!usdtAddress) return;
    const ok = await copyToClipboard(usdtAddress);
    if (ok) message.success("Đã sao chép địa chỉ USDT");
    else message.error("Không thể sao chép địa chỉ");
  }, [usdtAddress]);

  const values: Record<string, number> = {
    balance: balanceUSDT,
    deposit: totalDeposit,
    withdraw: totalWithdraw,
  };

  return (
    <SectionBlock
      icon={<WalletOutlined />}
      title="Ví USDT"
      subtitle="Dòng tiền nạp/rút chính"
      accent="success"
    >
      <div className="usdt-metrics">
        {USDT_METRICS.map((m) => (
          <div key={m.key} className="usdt-metric">
            <div className="usdt-metric__label">
              {m.icon}
              <span>{m.label}</span>
            </div>
            <div className="usdt-metric__value">
              {formatCurrency(values[m.key], "USDT")}
            </div>
          </div>
        ))}
      </div>

      {usdtAddress && (
        <div className="usdt-address">
          <span className="usdt-address__label">Địa chỉ</span>
          <Text code className="usdt-address__value">
            {truncateAddress(usdtAddress)}
          </Text>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={handleCopy}
            className="usdt-address__copy"
            aria-label="Copy USDT address"
          />
        </div>
      )}
    </SectionBlock>
  );
};

export default memo(UsdtBlock);
