import React from "react";
import { useParams } from "react-router-dom";
import CustomerDetail from "@src/components/customer/CustomerDetail";
import CustomerList from "@src/components/customer/CustomerList";

const CustomerPage: React.FC = () => {
  const { customerId } = useParams<{ customerId?: string }>();
  
  if (customerId) {
    return <CustomerDetail />;
  }

  return <CustomerList />;
};

export default CustomerPage;

