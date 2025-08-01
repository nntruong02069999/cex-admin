import React from "react";
import { Row, Col } from "antd";
import CustomerInfo from "@src/components/customer/CustomerInfo";
import CustomerTransactions from "@src/components/customer/CustomerTransactions";
import CustomerStatistics from "@src/components/customer/CustomerStatistics";
import BettingHistory from "@src/components/customer/BettingHistory";
import ThirdPartyGames from "@src/components/customer/ThirdPartyGames";
import TopDepositors from "@src/components/customer/TopDepositors";
import LuckyWheel from "@src/components/customer/LuckyWheel";
import LoginHistory from "@src/components/customer/LoginHistory";
import "../../components/customer/styles.css";

const CustomerPage: React.FC = () => {
  return (
    <div className="customer-page">
      <h1>Quản lý người dùng</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <CustomerTransactions />
          <CustomerStatistics />
          <BettingHistory />
          <ThirdPartyGames />
          <TopDepositors />
          <LuckyWheel />
          <LoginHistory />
        </Col>
        <Col xs={24} lg={8}>
          <CustomerInfo />
        </Col>
      </Row>
    </div>
  );
};

export default CustomerPage;
