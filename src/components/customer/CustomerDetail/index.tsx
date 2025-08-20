import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, message, Result, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import CustomerHeader from "../CustomerHeader";
import SummaryCards from "../SummaryCards";
import TabContainer from "../TabContainer";
import { useCustomerData } from "../hooks/useCustomerData";
import "./CustomerDetail.less";

interface CustomerDetailProps {}

const CustomerDetail: React.FC<CustomerDetailProps> = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { data, loading, error, refetch } = useCustomerData(
    parseInt(customerId || "0")
  );

  useEffect(() => {
    if (error) {
      message.error("Không thể tải thông tin khách hàng");
    }
  }, [error]);

  const handleRefresh = () => {
    refetch();
    message.success("Đã làm mới dữ liệu");
  };

  if (loading) {
    return (
      <div className="customer-detail__loading">
        <Spin size="large" tip="Đang tải thông tin khách hàng..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-detail__error">
        <Result
          status="error"
          title="Lỗi tải dữ liệu"
          subTitle={error}
          extra={[
            <Button
              type="primary"
              key="retry"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              Thử lại
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="customer-detail__no-data">
        <Result
          status="404"
          title="Không tìm thấy khách hàng"
          subTitle="Khách hàng với ID này không tồn tại hoặc đã bị xóa."
          extra={[
            <Button
              type="primary"
              key="back"
              onClick={() => window.history.back()}
            >
              Quay lại
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="customer-detail">
      <div className="customer-detail__container">
        <CustomerHeader customer={data.customer} onRefresh={handleRefresh} />

        <SummaryCards
          customer={data.customer}
          customerMoney={data.customerMoney}
          networkSummary={data.networkSummary}
        />

        <TabContainer
          customerId={parseInt(customerId || "0")}
          customerData={data}
          onDataUpdate={refetch}
        />
      </div>
    </div>
  );
};

export default CustomerDetail;
