import React, { useState, useEffect } from "react";
import { Row, Col, Card, Tag, message, Spin } from "antd";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getVipCommissionSummary } from "../../../services/customer";
import VipCommissionTable from "./VipCommissionTable";
import VipDailyChart from "./VipDailyChart";
import "./styles.less";
import { VipCommissionSummaryResponse } from "../types/vipCommission.types";

interface VipCommissionTabProps {
  customerId: number;
}

const VipCommissionTab: React.FC<VipCommissionTabProps> = ({ customerId }) => {
  const [summaryData, setSummaryData] =
    useState<VipCommissionSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Load VIP commission summary data
  useEffect(() => {
    loadSummaryData();
  }, [customerId]);

  const loadSummaryData = async () => {
    setSummaryLoading(true);
    try {
      const response = await getVipCommissionSummary(customerId);

      if (response.errorCode) {
        message.error(
          response.message || "Có lỗi xảy ra khi tải dữ liệu tổng quan"
        );
        return;
      }

      setSummaryData(response.data);
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải dữ liệu tổng quan");
      console.error("Error loading VIP commission summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

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
              {summaryLoading ? (
                <Spin size="small" />
              ) : (
                <Tag
                  color="purple"
                  style={{ fontSize: 16, padding: "8px 16px" }}
                >
                  Level {summaryData?.currentVipLevel || 0}
                </Tag>
              )}
            </div>
          </Col>

          <Col span={12}>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 16, color: "#666", marginBottom: 8 }}>
                Kích hoạt VIP
              </div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>
                {summaryLoading ? (
                  <Spin size="small" />
                ) : summaryData?.vipActivationDate ? (
                  formatDate(summaryData.vipActivationDate, "TIMESTAMP")
                ) : (
                  "Chưa có dữ liệu"
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Commission Dashboard */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              {summaryLoading ? (
                <Spin />
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#52c41a",
                    }}
                  >
                    {formatCurrency(summaryData?.totalCommission || 0)}
                  </div>
                  <div style={{ color: "#666" }}>💰 Tổng</div>
                </>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              {summaryLoading ? (
                <Spin />
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {formatCurrency(summaryData?.monthlyCommission || 0)}
                  </div>
                  <div style={{ color: "#666" }}>📅 Tháng này</div>
                </>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              {summaryLoading ? (
                <Spin />
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {summaryData?.totalF1Vip || 0}
                  </div>
                  <div style={{ color: "#666" }}>👑 Tổng F1 VIP</div>
                </>
              )}
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
