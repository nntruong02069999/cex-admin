import React, { useState } from "react";
import { Tabs } from "antd";
import {
  CustomerDetailData,
  USDTTransaction,
  WalletTransaction,
  USDTTransactionType,
  USDTTransactionStatus,
  WalletTranferType,
  WalletTransactionStatus,
} from "../types/customer.types";
import USDTTransactions from "./USDTTransactions";
import WalletTransactions from "./WalletTransactions";
import "./styles.less";

const { TabPane } = Tabs;

interface TransactionsTabProps {
  customerId: number;
  customerData: CustomerDetailData;
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({
  customerId,
  customerData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState("usdt");

  // Mock USDT transactions matching backend model
  const usdtTransactions: USDTTransaction[] = [
    {
      id: 1,
      customerId: customerId,
      customer: customerData.customer,
      type: USDTTransactionType.DEPOSIT,
      amount: 500,
      balanceUSDT: 1500,
      status: USDTTransactionStatus.SUCCESS,
      note: "Nạp tiền USDT từ ví ngoài",
      txHash:
        "0xa1e4b7c8d9f2a3b5c6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9",
      description: "Nạp tiền USDT",
      fromAddress: "0x742d35Cc6635C0532925a3b8D25C0B37E44a6C2D",
      toAddress: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      createdAt: Date.now() / 1000,
      updatedAt: Date.now() / 1000,
    },
    {
      id: 2,
      customerId: customerId,
      customer: customerData.customer,
      type: USDTTransactionType.WITHDRAW,
      amount: -200,
      balanceUSDT: 1300,
      status: USDTTransactionStatus.SUCCESS,
      note: "Rút tiền USDT ra ví ngoài",
      txHash:
        "0xb2f5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5",
      description: "Rút tiền USDT",
      fromAddress: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      toAddress: "0x742d35Cc6635C0532925a3b8D25C0B37E44a6C2D",
      createdAt: (Date.now() - 86400000) / 1000,
      updatedAt: (Date.now() - 86300000) / 1000,
    },
    {
      id: 3,
      customerId: customerId,
      customer: customerData.customer,
      type: USDTTransactionType.PAYMENT,
      amount: -50,
      balanceUSDT: 1250,
      status: USDTTransactionStatus.SUCCESS,
      note: "Thanh toán phí giao dịch",
      description: "Thanh toán phí",
      createdAt: (Date.now() - 172800000) / 1000,
      updatedAt: (Date.now() - 172700000) / 1000,
    },
    {
      id: 4,
      customerId: customerId,
      customer: customerData.customer,
      type: USDTTransactionType.DEPOSIT_INTERNAL,
      amount: 100,
      balanceUSDT: 1350,
      status: USDTTransactionStatus.PENDING,
      note: "Chuyển tiền nội bộ từ ví khác",
      description: "Nạp nội bộ",
      toCustomerId: customerId,
      toNickname: customerData.customer.nickname,
      referenceId: "INT_DEP_20240120_001",
      createdAt: (Date.now() - 259200000) / 1000,
      updatedAt: (Date.now() - 259100000) / 1000,
    },
    {
      id: 5,
      customerId: customerId,
      customer: customerData.customer,
      type: USDTTransactionType.WITHDRAW_INTERNAL,
      amount: -75,
      balanceUSDT: 1275,
      status: USDTTransactionStatus.FAILED,
      note: "Chuyển tiền nội bộ thất bại - Tài khoản đích không tồn tại",
      description: "Rút nội bộ",
      toCustomerId: 999999,
      toNickname: "user_not_found",
      referenceId: "INT_WITH_20240119_005",
      createdAt: (Date.now() - 345600000) / 1000,
      updatedAt: (Date.now() - 345500000) / 1000,
    },
  ];

  // Mock wallet transactions matching backend model
  const walletTransactions: WalletTransaction[] = [
    {
      id: 1,
      email: customerData.customer.email,
      nickname: customerData.customer.nickname,
      customerId: customerId,
      customer: customerData.customer,
      amount: 100,
      balanceUSDT: 1350,
      balance: 2500,
      status: WalletTransactionStatus.SUCCESS,
      type: WalletTranferType.IN,
      createdAt: Date.now() / 1000,
      updatedAt: Date.now() / 1000,
    },
    {
      id: 2,
      email: customerData.customer.email,
      nickname: customerData.customer.nickname,
      customerId: customerId,
      customer: customerData.customer,
      amount: -50,
      balanceUSDT: 1300,
      balance: 2450,
      status: WalletTransactionStatus.SUCCESS,
      type: WalletTranferType.OUT,
      createdAt: (Date.now() - 86400000) / 1000,
      updatedAt: (Date.now() - 86300000) / 1000,
    },
    {
      id: 3,
      email: customerData.customer.email,
      nickname: customerData.customer.nickname,
      customerId: customerId,
      customer: customerData.customer,
      amount: 200,
      balanceUSDT: 1500,
      balance: 2650,
      status: WalletTransactionStatus.PENDING,
      type: WalletTranferType.IN,
      createdAt: (Date.now() - 172800000) / 1000,
      updatedAt: (Date.now() - 172700000) / 1000,
    },
    {
      id: 4,
      email: customerData.customer.email,
      nickname: customerData.customer.nickname,
      customerId: customerId,
      customer: customerData.customer,
      amount: -150,
      balanceUSDT: 1350,
      balance: 2500,
      status: WalletTransactionStatus.FAILED,
      type: WalletTranferType.OUT,
      createdAt: (Date.now() - 259200000) / 1000,
      updatedAt: (Date.now() - 259100000) / 1000,
    },
    {
      id: 5,
      email: customerData.customer.email,
      nickname: customerData.customer.nickname,
      customerId: customerId,
      customer: customerData.customer,
      amount: 75,
      balanceUSDT: 1425,
      balance: 2575,
      status: WalletTransactionStatus.SUCCESS,
      type: WalletTranferType.IN,
      createdAt: (Date.now() - 345600000) / 1000,
      updatedAt: (Date.now() - 345500000) / 1000,
    },
  ];

  return (
    <div className="transactions-tab">
      <Tabs
        activeKey={activeSubTab}
        onChange={setActiveSubTab}
        type="card"
        className="transactions-sub-tabs"
      >
        <TabPane key="usdt" tab={<span>🪙 Giao dịch USDT</span>}>
          <USDTTransactions transactions={usdtTransactions} />
        </TabPane>

        <TabPane key="wallet" tab={<span>💰 Giao dịch Ví</span>}>
          <WalletTransactions transactions={walletTransactions} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TransactionsTab;
