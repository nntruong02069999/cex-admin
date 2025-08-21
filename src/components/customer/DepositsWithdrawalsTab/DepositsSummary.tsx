import React from "react";
import { Row, Col, Card, Statistic } from "antd";

interface DepositsSummaryProps {
  successful: {
    amount: number;
    count: number;
  };
  pending: {
    amount: number;
    count: number;
  };
  failed: {
    amount: number;
    count: number;
  };
}

const DepositsSummary: React.FC<DepositsSummaryProps> = ({
  successful,
  pending,
  failed,
}) => {
  return (
    <Row gutter={16} className="deposits-summary">
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="✅ Nạp thành công"
            value={successful.amount.toFixed(2)}
            precision={2}
            suffix="$"
            valueStyle={{ color: "#3f8600" }}
          />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {successful.count} giao dịch
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="⏳ Nạp chờ"
            value={pending.amount.toFixed(2)}
            precision={2}
            suffix="$"
            valueStyle={{ color: "#faad14" }}
          />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {pending.count} giao dịch
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="❌ Nạp lỗi"
            value={failed.amount.toFixed(2)}
            precision={2}
            suffix="$"
            valueStyle={{ color: "#cf1322" }}
          />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {failed.count} giao dịch
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default DepositsSummary;
