import React from "react";
import { Row, Col, Card, Statistic, Tag } from "antd";
import {
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SecurityScanOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  Customer,
  CustomerMoney,
  CustomerVip,
  NetworkSummary,
} from "../types/customer.types";
import { formatCurrency } from "../utils/formatters";
import { calculateWinRate, isVipCustomer } from "../utils/helpers";
import { STATUS_ICONS } from "../utils/constants";
import "./SummaryCards.less";

interface SummaryCardsProps {
  customer: Customer;
  customerMoney: CustomerMoney;
  networkSummary: NetworkSummary;
  customerVip?: CustomerVip;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  customer,
  customerMoney,
  networkSummary,
  customerVip,
}) => {
  const winRate = calculateWinRate(
    customerMoney.totalTradeWinCount,
    customerMoney.totalTradeCount
  );
  const totalBalance = customerMoney.balance + customerMoney.balanceUSDT;
  const isVip = isVipCustomer(
    customerVip || ({ currentVipLevel: 0 } as CustomerVip)
  );

  return (
    <div className="summary-cards">
      <Row gutter={[16, 16]} className="customer-responsive-grid--4-cols">
        {/* Account Status Card */}
        <Col>
          <Card className="summary-card summary-card--account" hoverable>
            <div className="summary-card__header">
              <div className="summary-card__icon account-icon">
                <UserOutlined />
              </div>
              <div className="summary-card__title">
                <h4>Trạng thái Tài khoản</h4>
                <div className="summary-card__main-status">
                  {customer.isBlocked ? (
                    <Tag color="red" className="status-main-tag">
                      {STATUS_ICONS.BLOCKED} Bị khóa
                    </Tag>
                  ) : (
                    <Tag color="green" className="status-main-tag">
                      {STATUS_ICONS.ACTIVE} Hoạt động
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            <div className="summary-card__content">
              <div className="summary-card__details">
                <div className="detail-item">
                  <CheckCircleOutlined className="detail-icon" />
                  <span>Email: </span>
                  <strong
                    className={
                      customer.isVerifyEmail ? "text-success" : "text-warning"
                    }
                  >
                    {customer.isVerifyEmail ? "Đã xác thực" : "Chưa xác thực"}
                  </strong>
                </div>

                <div className="detail-item">
                  <SecurityScanOutlined className="detail-icon" />
                  <span>2FA: </span>
                  <strong
                    className={
                      customer.twoFAEnabled ? "text-success" : "text-default"
                    }
                  >
                    {customer.twoFAEnabled ? "Bật" : "Tắt"}
                  </strong>
                </div>

                <div className="detail-item">
                  <SafetyCertificateOutlined className="detail-icon" />
                  <span>KYC: </span>
                  <strong
                    className={
                      customer.statusDocument === "approved"
                        ? "text-success"
                        : "text-warning"
                    }
                  >
                    {customer.statusDocument?.toUpperCase()}
                  </strong>
                </div>

                <div className="detail-item">
                  <ClockCircleOutlined className="detail-icon" />
                  <span>Marketing: </span>
                  <strong
                    className={
                      customer.isAccountMarketing ? "text-info" : "text-default"
                    }
                  >
                    {customer.isAccountMarketing ? "Bật" : "Tắt"}
                  </strong>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Financial Card */}
        <Col>
          <Card className="summary-card summary-card--financial" hoverable>
            <div className="summary-card__header">
              <div className="summary-card__icon financial-icon">
                <DollarOutlined />
              </div>
              <div className="summary-card__title">
                <h4>Tài chính</h4>
                <div className="summary-card__main-value">
                  <Statistic
                    value={totalBalance}
                    precision={2}
                    suffix="USD"
                    valueStyle={{
                      color: "#3f8600",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="summary-card__content">
              <div className="summary-card__details">
                <div className="detail-item">
                  <span>💰 Balance: </span>
                  <strong>{formatCurrency(customerMoney.balance)}</strong>
                </div>

                <div className="detail-item">
                  <span>🪙 USDT: </span>
                  <strong>
                    {formatCurrency(customerMoney.balanceUSDT, "USDT")}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>🔒 Frozen: </span>
                  <strong className="text-warning">
                    {formatCurrency(customerMoney.frozen)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>🎮 Demo: </span>
                  <strong className="text-info">
                    {formatCurrency(customerMoney.balanceDemo)}
                  </strong>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Trading Card */}
        <Col>
          <Card className="summary-card summary-card--trading" hoverable>
            <div className="summary-card__header">
              <div className="summary-card__icon trading-icon">
                <TrophyOutlined />
              </div>
              <div className="summary-card__title">
                <h4>Trading</h4>
                <div className="summary-card__main-value">
                  <Statistic
                    value={winRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{
                      color:
                        winRate >= 70
                          ? "#3f8600"
                          : winRate >= 50
                          ? "#faad14"
                          : "#cf1322",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  />
                  <span className="win-rate-label">Tỷ lệ thắng</span>
                </div>
              </div>
            </div>

            <div className="summary-card__content">
              <div className="summary-card__details">
                <div className="detail-item">
                  <span>🎯 Lệnh: </span>
                  <strong>{customerMoney.totalTradeCount}</strong>
                  <span className="detail-sub">
                    ({customerMoney.totalTradeWinCount}W)
                  </span>
                </div>

                <div className="detail-item">
                  <span>💰 Volume: </span>
                  <strong>
                    {formatCurrency(customerMoney.totalTradeAmount)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>📈 P&L: </span>
                  <strong
                    className={
                      customerMoney.totalTradeAmountWin -
                        customerMoney.totalTradeAmountLose >
                      0
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {formatCurrency(
                      customerMoney.totalTradeAmountWin -
                        customerMoney.totalTradeAmountLose
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>⏳ Khóa rút: </span>
                  <strong>{formatCurrency(0)}</strong>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Network Card */}
        <Col>
          <Card className="summary-card summary-card--network" hoverable>
            <div className="summary-card__header">
              <div className="summary-card__icon network-icon">
                <TeamOutlined />
              </div>
              <div className="summary-card__title">
                <h4>Network</h4>
                <div className="summary-card__main-value">
                  <Statistic
                    value={networkSummary.totalMembers}
                    valueStyle={{
                      color: "#722ed1",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  />
                  <span className="members-label">Thành viên</span>
                </div>
              </div>
            </div>

            <div className="summary-card__content">
              <div className="summary-card__details">
                <div className="detail-item">
                  <span>👑 VIP: </span>
                  <strong className="text-vip">
                    {networkSummary.totalVip} thành viên
                  </strong>
                </div>

                <div className="detail-item">
                  <span>📈 Tháng này: </span>
                  <strong className="text-success">
                    +{networkSummary.monthlyGrowth}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>💼 Cấp: </span>
                  <strong>
                    {isVip ? `VIP Level ${customer.currentVipLevel}` : "Thường"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>💰 Hoa hồng: </span>
                  <strong className="text-success">
                    {formatCurrency(customerMoney.totalCommission)}
                  </strong>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SummaryCards;
