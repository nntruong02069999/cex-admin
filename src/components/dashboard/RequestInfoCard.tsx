import React from "react";
import { Card, Row, Col, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";

export interface RequestItemProps {
  count: number;
  label: string;
  backgroundColor: string;
  onClick?: () => void;
}

const RequestItem: React.FC<RequestItemProps> = ({
  count,
  label,
  backgroundColor,
  onClick,
}) => (
  <Card bordered={false} style={{ backgroundColor: "#f5f5f5" }}>
    <Row align="middle" justify="space-between">
      <Col>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              backgroundColor,
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "5px",
              marginRight: "10px",
            }}
          ></div>
          <div>
            <div>{count} {label}</div>
          </div>
        </div>
      </Col>
      <Col>
        <Button
          type="primary"
          shape="circle"
          icon={<EyeOutlined />}
          style={{
            backgroundColor: "#38b0de",
            borderColor: "#38b0de",
          }}
          onClick={onClick}
        />
      </Col>
    </Row>
  </Card>
);

export interface RequestInfoCardProps {
  title: string;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  pendingLabel: string;
  completedLabel: string;
  failedLabel: string;
  onPendingClick?: () => void;
  onCompletedClick?: () => void;
  onFailedClick?: () => void;
}

const RequestInfoCard: React.FC<RequestInfoCardProps> = ({
  title,
  pendingCount,
  completedCount,
  failedCount,
  pendingLabel,
  completedLabel,
  failedLabel,
  onPendingClick,
  onCompletedClick,
  onFailedClick,
}) => {
  return (
    <Card title={title} bordered={false}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <RequestItem
            count={pendingCount}
            label={pendingLabel}
            backgroundColor="#8a6de9"
            onClick={onPendingClick}
          />
        </Col>
        <Col span={24}>
          <RequestItem
            count={completedCount}
            label={completedLabel}
            backgroundColor="#5cb85c"
            onClick={onCompletedClick}
          />
        </Col>
        <Col span={24}>
          <RequestItem
            count={failedCount}
            label={failedLabel}
            backgroundColor="#d9534f"
            onClick={onFailedClick}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default RequestInfoCard; 