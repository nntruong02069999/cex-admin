import React from "react";
import { Row, Col, Statistic } from "antd";
import {
  DollarOutlined,
  WalletOutlined,
  LockOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { CustomerMoney } from "../types/customer.types";
import { formatCurrency } from "../utils/formatters";
import "./FinancialSummary.less";

interface FinancialSummaryProps {
  customerMoney: CustomerMoney;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  customerMoney,
}) => {
  const metrics = [
    {
      label: "Balance",
      value: customerMoney.balance,
      icon: <DollarOutlined />,
      className: "metric--balance",
    },
    {
      label: "USDT",
      value: customerMoney.balanceUSDT,
      icon: <WalletOutlined />,
      className: "metric--usdt",
      suffix: "USDT",
    },
    {
      label: "Frozen",
      value: customerMoney.frozen,
      icon: <LockOutlined />,
      className: "metric--frozen",
    },
    {
      label: "Demo",
      value: customerMoney.balanceDemo,
      icon: <ExperimentOutlined />,
      className: "metric--demo",
    },
  ];

  return (
    <div className="financial-summary">
      <Row gutter={16}>
        {metrics.map((metric) => (
          <Col xs={12} sm={6} key={metric.label}>
            <div className={`financial-summary__metric ${metric.className}`}>
              <div className="financial-summary__icon">{metric.icon}</div>
              <Statistic
                title={metric.label}
                value={metric.value}
                precision={2}
                suffix={metric.suffix}
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FinancialSummary;
