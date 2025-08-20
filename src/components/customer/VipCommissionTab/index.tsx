import React from "react";
import { Row, Col, Card, Tag } from "antd";
import { CustomerDetailData } from "../types/customer.types";
import { formatCurrency } from "../utils/formatters";
import VipCommissionTable from "./VipCommissionTable";
import VipDailyChart from "./VipDailyChart";
import "./styles.less";

interface VipCommissionTabProps {
  customerId: number;
  customerData: CustomerDetailData;
}

const VipCommissionTab: React.FC<VipCommissionTabProps> = ({
  customerId,
  customerData,
}) => {
  const currentLevel = customerData.customer.currentVipLevel;

  return (
    <div className="vip-commission-tab">
      {/* VIP Information */}
      <Card title="👑 Thông tin VIP" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 16, color: "#666", marginBottom: 8 }}>
                Cấp hiện tại
              </div>
              <Tag color="purple" style={{ fontSize: 16, padding: "8px 16px" }}>
                Level {currentLevel}
              </Tag>
            </div>
          </Col>

          <Col span={12}>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 16, color: "#666", marginBottom: 8 }}>
                Kích hoạt VIP
              </div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>01/01/2024</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Commission Dashboard */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}
              >
                {formatCurrency(customerData.customerMoney.totalCommission)}
              </div>
              <div style={{ color: "#666" }}>💰 Tổng</div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}
              >
                {formatCurrency(245)}
              </div>
              <div style={{ color: "#666" }}>📅 Tháng này</div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}
              >
                {formatCurrency(245)}
              </div>
              <div style={{ color: "#666" }}>👑 Tổng F1 VIP</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Commission Chart */}
      <VipDailyChart customerId={customerId} />

      {/* Commission History */}
      <VipCommissionTable customerId={customerId} />
    </div>
  );
};

export default VipCommissionTab;
