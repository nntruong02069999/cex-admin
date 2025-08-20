import React from "react";
import { useParams } from "react-router-dom";
import CustomerDetail from "@src/components/customer/CustomerDetail";

const CustomerPage: React.FC = () => {
  const { customerId } = useParams<{ customerId?: string }>();
  
  // If we have a customerId parameter, show the detail page
  if (customerId) {
    return <CustomerDetail />;
  }

  // Otherwise show a customer list or dashboard (placeholder for now)
  return (
    <div className="customer-page">
      <h1>Quản lý người dùng</h1>
      <p>Danh sách khách hàng sẽ được hiển thị ở đây</p>
      <p>Truy cập <code>/customer/123</code> để xem chi tiết khách hàng</p>
    </div>
  );
};

export default CustomerPage;
