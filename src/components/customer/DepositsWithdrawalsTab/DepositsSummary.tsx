import React from "react";
import { Row, Col, Card, Statistic } from "antd";

interface DepositsSummaryProps {
  successfulDeposits: {
    amount: number;
    count: number;
  };
  pendingDeposits: {
    amount: number;
    count: number;
  };
  failedDeposits: {
    amount: number;
    count: number;
  };
}

const DepositsSummary: React.FC<DepositsSummaryProps> = ({
  successfulDeposits,
  pendingDeposits,
  failedDeposits,
}) => {
  return (
    <Row gutter={16} className="deposits-summary">
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="✅ Nạp thành công"
            value={successfulDeposits.amount}
            precision={0}
            suffix="$"
            valueStyle={{ color: "#3f8600" }}
          />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {successfulDeposits.count} giao dịch
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="⏳ Nạp chờ"
            value={pendingDeposits.amount}
            precision={0}
            suffix="$"
            valueStyle={{ color: "#faad14" }}
          />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {pendingDeposits.count} giao dịch
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="❌ Nạp lỗi"
            value={failedDeposits.amount}
            precision={0}
            suffix="$"
            valueStyle={{ color: "#cf1322" }}
          />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {failedDeposits.count} giao dịch
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default DepositsSummary;
