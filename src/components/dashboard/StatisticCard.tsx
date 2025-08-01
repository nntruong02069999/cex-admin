import React from "react";
import { Card, Row, Col, Typography } from "antd";

const { Title, Text } = Typography;

export interface StatisticCardProps {
  icon: React.ReactNode;
  backgroundColor: string;
  value: string | number;
  title: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  icon,
  backgroundColor,
  value,
  title,
}) => {
  return (
    <Card bodyStyle={{ padding: "15px" }} bordered={false}>
      <Row align="middle" gutter={16}>
        <Col span={6}>
          <div
            style={{
              backgroundColor,
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {icon}
          </div>
        </Col>
        <Col span={18}>
          <Title level={5} style={{ margin: 0, color: "#666" }}>
            {value}
          </Title>
          <Text type="secondary">{title}</Text>
        </Col>
      </Row>
    </Card>
  );
};

export default StatisticCard; 