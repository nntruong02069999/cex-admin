import React from "react";
import { Card, Row, Col, Divider, Typography, Button } from "antd";
import {
  CopyOutlined,
  DollarOutlined,
  WalletOutlined,
  BarChartOutlined,
  TrophyOutlined,
  GiftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { CustomerMoney } from "../types/customer.types";
import { formatCurrency, calculateWinRate } from "../utils/formatters";
import { truncateAddress, copyToClipboard } from "../utils/helpers";
import { message } from "antd";

const { Text, Title } = Typography;

interface FinancialOverviewProps {
  customerMoney: CustomerMoney;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  customerMoney,
}) => {
  const winRate = calculateWinRate(
    customerMoney.totalTradeWinCount,
    customerMoney.totalTradeCount
  );

  const handleCopyAddress = async (address?: string) => {
    if (!address) return;
    const success = await copyToClipboard(address);
    if (success) {
      message.success("Đã sao chép địa chỉ USDT");
    } else {
      message.error("Không thể sao chép địa chỉ");
    }
  };

  return (
    <Card
      title="Tổng quan tài chính"
      className="overview-section financial-overview-card"
      size="small"
    >
      {/* Balance Section */}
      <div className="financial-section">
        <Title level={5} className="section-title">
          <DollarOutlined /> Thông tin số dư
        </Title>
        <Row gutter={16} className="balance-grid">
          <Col xs={12} sm={6}>
            <div className="balance-item balance-item--primary">
              <div className="balance-label">Balance</div>
              <div className="balance-value">
                {formatCurrency(customerMoney.balance)}
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="balance-item balance-item--frozen">
              <div className="balance-label">Frozen</div>
              <div className="balance-value">
                {formatCurrency(customerMoney.frozen)}
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="balance-item balance-item--total">
              <div className="balance-label">Total</div>
              <div className="balance-value">
                {formatCurrency(customerMoney.total)}
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="balance-item balance-item--demo">
              <div className="balance-label">Demo</div>
              <div className="balance-value">
                {formatCurrency(customerMoney.balanceDemo)}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* USDT Section */}
      <div className="financial-section">
        <Title level={5} className="section-title">
          <WalletOutlined /> USDT
        </Title>
        <Row gutter={16} className="usdt-grid">
          <Col xs={24} sm={8}>
            <div className="usdt-item">
              <div className="usdt-label">Số dư USDT</div>
              <div className="usdt-value">
                {formatCurrency(customerMoney.balanceUSDT, "USDT")}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="usdt-item">
              <div className="usdt-label">
                <ArrowUpOutlined /> Tổng nạp
              </div>
              <div className="usdt-value">
                {formatCurrency(customerMoney.totalDeposit)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="usdt-item">
              <div className="usdt-label">
                <ArrowDownOutlined /> Tổng rút
              </div>
              <div className="usdt-value">
                {formatCurrency(customerMoney.totalWithdraw)}
              </div>
            </div>
          </Col>
        </Row>

        {customerMoney.usdtAddress && (
          <div className="usdt-address">
            <Text type="secondary">Địa chỉ USDT:</Text>
            <div className="address-container">
              <Text code className="address-text">
                {truncateAddress(customerMoney.usdtAddress)}
              </Text>
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopyAddress(customerMoney.usdtAddress)}
                className="copy-button"
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </div>

      <Divider />

      {/* Trading Statistics */}
      <div className="financial-section">
        <Title level={5} className="section-title">
          <BarChartOutlined /> Thống kê Trading
        </Title>
        <Row gutter={16} className="trading-grid">
          <Col xs={12} sm={6}>
            <div className="trading-item">
              <div className="trading-label">Tổng lệnh</div>
              <div className="trading-value">
                {customerMoney.totalTradeCount}
              </div>
              <div className="trading-sub">
                {customerMoney.totalTradeWinCount}W /{" "}
                {customerMoney.totalTradeLoseCount}L /{" "}
                {customerMoney.totalTradeDrawCount}D
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="trading-item">
              <div className="trading-label">
                <TrophyOutlined /> Tỷ lệ thắng
              </div>
              <div
                className={`trading-value ${
                  winRate >= 70
                    ? "win-rate-high"
                    : winRate >= 50
                    ? "win-rate-medium"
                    : "win-rate-low"
                }`}
              >
                {winRate.toFixed(1)}%
              </div>
              <div className="trading-sub">
                ({customerMoney.totalTradeWinCount} thắng)
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="trading-item">
              <div className="trading-label">
                <SwapOutlined /> Volume
              </div>
              <div className="trading-value">
                {formatCurrency(customerMoney.totalTradeAmount)}
              </div>
              <div className="trading-sub">Tổng khối lượng</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="trading-item">
              <div className="trading-label">Khóa rút</div>
              <div className="trading-value">{formatCurrency(0)}</div>
              <div className="trading-sub">Hiện tại</div>
            </div>
          </Col>
        </Row>

        {/* P&L Breakdown */}
        <Row gutter={16} className="pnl-breakdown">
          <Col xs={24} sm={8}>
            <div className="pnl-item pnl-win">
              <div className="pnl-label">Tổng thắng</div>
              <div className="pnl-value">
                {formatCurrency(customerMoney.totalTradeAmountWin)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="pnl-item pnl-lose">
              <div className="pnl-label">Tổng thua</div>
              <div className="pnl-value">
                {formatCurrency(customerMoney.totalTradeAmountLose)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="pnl-item pnl-net">
              <div className="pnl-label">P&L ròng</div>
              <div
                className={`pnl-value ${
                  customerMoney.totalTradeAmountWin -
                    customerMoney.totalTradeAmountLose >
                  0
                    ? "pnl-positive"
                    : "pnl-negative"
                }`}
              >
                {formatCurrency(
                  customerMoney.totalTradeAmountWin -
                    customerMoney.totalTradeAmountLose
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Rewards Section */}
      <div className="financial-section">
        <Title level={5} className="section-title">
          <GiftOutlined /> Hoa hồng & Thưởng
        </Title>
        <div className="rewards-list">
          <div className="reward-item">
            <Text>Tổng hoa hồng</Text>
            <Text strong className="reward-value">
              {formatCurrency(customerMoney.totalCommission)}
            </Text>
          </div>
          <div className="reward-item">
            <Text>Thưởng nạp đầu</Text>
            <Text strong className="reward-value">
              {formatCurrency(customerMoney.totalRewardFirstDeposit)}
            </Text>
          </div>
          <div className="reward-item">
            <Text>Thưởng F1 nạp đầu</Text>
            <Text strong className="reward-value">
              {formatCurrency(customerMoney.totalRewardMembersFirstDeposit)}
            </Text>
          </div>
          <div className="reward-item">
            <Text>Daily Quest</Text>
            <Text strong className="reward-value">
              {formatCurrency(customerMoney.totalDailyQuestRewards)}
            </Text>
          </div>
          <div className="reward-item">
            <Text>Hoàn trả</Text>
            <Text strong className="reward-value">
              {formatCurrency(customerMoney.totalRefundTradeAmount)}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FinancialOverview;