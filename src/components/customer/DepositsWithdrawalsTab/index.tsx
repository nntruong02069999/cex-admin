import React, { useState } from "react";
import { Row, Col, Card, Button, Modal } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import {
  CustomerDetailData,
  DepositTransaction,
  WithdrawTransaction,
  WithdrawStatus,
  WithdrawType,
} from "../types/customer.types";
import DepositsSummary from "./DepositsSummary";
import DepositsTable from "./DepositsTable";
import WithdrawalsTable from "./WithdrawalsTable";
import DepositDetailModal from "./DepositDetailModal";
import WithdrawDetailModal from "./WithdrawDetailModal";
import "./DepositsWithdrawalsTab.less";

interface DepositsWithdrawalsTabProps {
  customerId: number;
  customerData: CustomerDetailData;
}

const DepositsWithdrawalsTab: React.FC<DepositsWithdrawalsTabProps> = ({
  customerId,
  customerData,
}) => {
  const [selectedDeposit, setSelectedDeposit] =
    useState<DepositTransaction | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawTransaction | null>(null);
  const [isWithdrawDetailModalVisible, setIsWithdrawDetailModalVisible] = useState(false);

  // Mock BSC deposit transaction data
  const deposits: DepositTransaction[] = [
    {
      id: 1,
      customerId: customerId,
      customer: customerData.customer,
      usdtAmount: 150.5,
      bonusAmount: 15.05,
      fromAddress: "0x742d35Cc6635C0532925a3b8D25C0B37E44a6C2D",
      toAddress: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      txHash:
        "0xa1e4b7c8d9f2a3b5c6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9",
      asset: "USDT",
      status: "PENDING",
      orderId: "DEP_20240120_001",
      chain: "BSC",
      createdAt: Date.now() / 1000,
      updatedAt: Date.now() / 1000,
    },
    {
      id: 2,
      customerId: customerId,
      customer: customerData.customer,
      usdtAmount: 500.0,
      bonusAmount: 0,
      fromAddress: "0x123a35Cc6635C0532925a3b8D25C0B37E44a6789",
      toAddress: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      txHash:
        "0xb2f5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5",
      asset: "USDT",
      status: "SUCCESS",
      orderId: "DEP_20240119_007",
      chain: "BSC",
      createdAt: (Date.now() - 86400000) / 1000,
      updatedAt: (Date.now() - 86300000) / 1000,
    },
    {
      id: 3,
      customerId: customerId,
      customer: customerData.customer,
      usdtAmount: 1000.0,
      bonusAmount: 100.0,
      fromAddress: "0x456b35Cc6635C0532925a3b8D25C0B37E44a6abc",
      toAddress: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      txHash:
        "0xc3a6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
      asset: "USDT",
      status: "SUCCESS",
      orderId: "DEP_20240118_003",
      chain: "BSC",
      createdAt: (Date.now() - 172800000) / 1000,
      updatedAt: (Date.now() - 172700000) / 1000,
    },
    {
      id: 4,
      customerId: customerId,
      customer: customerData.customer,
      usdtAmount: 75.25,
      bonusAmount: 0,
      fromAddress: "0x789c35Cc6635C0532925a3b8D25C0B37E44a6def",
      toAddress: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      txHash:
        "0xd4b7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7",
      asset: "USDT",
      status: "FAILED",
      orderId: "DEP_20240117_012",
      chain: "BSC",
      createdAt: (Date.now() - 259200000) / 1000,
      updatedAt: (Date.now() - 259100000) / 1000,
    },
    {
      id: 5,
      customerId: customerId,
      customer: customerData.customer,
      usdtAmount: 300.0,
      bonusAmount: 30.0,
      fromAddress: "0xabcd35Cc6635C0532925a3b8D25C0B37E44a6123",
      toAddress: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      txHash:
        "0xe5c8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
      asset: "USDT",
      status: "SUCCESS",
      orderId: "DEP_20240116_008",
      chain: "BSC",
      createdAt: (Date.now() - 345600000) / 1000,
      updatedAt: (Date.now() - 345500000) / 1000,
    },
  ];

  // Mock withdrawal transaction data matching backend model
  const withdrawals: WithdrawTransaction[] = [
    {
      id: 1,
      withdrawCode: "WD_20240120_001",
      customerId: customerId,
      customer: customerData.customer,
      amount: 100.0,
      feeWithdraw: 5.0,
      status: WithdrawStatus.PENDING,
      type: WithdrawType.EXTERNAL,
      txHash: "0xf6d9e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9",
      fromAddress: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      toAddress: "0x742d35Cc6635C0532925a3b8D25C0B37E44a6C2D",
      createdAt: Date.now() / 1000,
      updatedAt: Date.now() / 1000,
    },
    {
      id: 2,
      withdrawCode: "WD_20240119_008",
      customerId: customerId,
      customer: customerData.customer,
      amount: 250.0,
      feeWithdraw: 12.5,
      status: WithdrawStatus.SUCCESS,
      type: WithdrawType.EXTERNAL,
      adminIdApproved: 1,
      txHash: "0xa7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
      fromAddress: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      toAddress: "0x123a35Cc6635C0532925a3b8D25C0B37E44a6789",
      createdAt: (Date.now() - 86400000) / 1000,
      updatedAt: (Date.now() - 86300000) / 1000,
    },
    {
      id: 3,
      withdrawCode: "WD_20240118_015",
      customerId: customerId,
      customer: customerData.customer,
      amount: 500.0,
      feeWithdraw: 0.0, // Internal transfer, no fee
      status: WithdrawStatus.SUCCESS,
      type: WithdrawType.INTERNAL,
      adminIdApproved: 2,
      createdAt: (Date.now() - 172800000) / 1000,
      updatedAt: (Date.now() - 172700000) / 1000,
    },
    {
      id: 4,
      withdrawCode: "WD_20240117_023",
      customerId: customerId,
      customer: customerData.customer,
      amount: 75.0,
      feeWithdraw: 3.75,
      status: WithdrawStatus.REJECTED,
      type: WithdrawType.EXTERNAL,
      adminIdRejected: 3,
      reasonRejected: "Thông tin xác minh không chính xác",
      createdAt: (Date.now() - 259200000) / 1000,
      updatedAt: (Date.now() - 259100000) / 1000,
    },
    {
      id: 5,
      withdrawCode: "WD_20240116_007",
      customerId: customerId,
      customer: customerData.customer,
      amount: 150.0,
      feeWithdraw: 7.5,
      status: WithdrawStatus.PENDING,
      type: WithdrawType.EXTERNAL,
      createdAt: (Date.now() - 345600000) / 1000,
      updatedAt: (Date.now() - 345500000) / 1000,
    },
  ];

  // Calculate summary data from deposits
  const calculateDepositsSummary = () => {
    const successful = deposits.filter((d) => d.status === "SUCCESS");
    const pending = deposits.filter((d) => d.status === "PENDING");
    const failed = deposits.filter((d) => d.status === "FAILED");

    return {
      successfulDeposits: {
        amount: successful.reduce(
          (sum, d) => sum + d.usdtAmount + (d.bonusAmount || 0),
          0
        ),
        count: successful.length,
      },
      pendingDeposits: {
        amount: pending.reduce(
          (sum, d) => sum + d.usdtAmount + (d.bonusAmount || 0),
          0
        ),
        count: pending.length,
      },
      failedDeposits: {
        amount: failed.reduce(
          (sum, d) => sum + d.usdtAmount + (d.bonusAmount || 0),
          0
        ),
        count: failed.length,
      },
    };
  };

  const depositsSummaryData = calculateDepositsSummary();

  // Handle deposit detail view
  const handleViewDepositDetails = (deposit: DepositTransaction) => {
    setSelectedDeposit(deposit);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedDeposit(null);
  };

  // Handle withdrawal detail view
  const handleViewWithdrawalDetails = (withdrawal: WithdrawTransaction) => {
    setSelectedWithdrawal(withdrawal);
    setIsWithdrawDetailModalVisible(true);
  };

  const handleCloseWithdrawDetailModal = () => {
    setIsWithdrawDetailModalVisible(false);
    setSelectedWithdrawal(null);
  };

  // Calculate summary data from withdrawals
  const calculateWithdrawalsSummary = () => {
    const successful = withdrawals.filter((w) => w.status === WithdrawStatus.SUCCESS);
    const pending = withdrawals.filter((w) => w.status === WithdrawStatus.PENDING);
    const rejected = withdrawals.filter((w) => w.status === WithdrawStatus.REJECTED);

    return {
      successfulWithdrawals: {
        amount: successful.reduce((sum, w) => sum + w.amount, 0),
        count: successful.length,
      },
      pendingWithdrawals: {
        amount: pending.reduce((sum, w) => sum + w.amount, 0),
        count: pending.length,
      },
      rejectedWithdrawals: {
        amount: rejected.reduce((sum, w) => sum + w.amount, 0),
        count: rejected.length,
      },
    };
  };

  const withdrawalsSummaryData = calculateWithdrawalsSummary();

  return (
    <div className="deposits-withdrawals-tab">
      {/* Deposits Summary */}
      <div style={{ marginBottom: 24 }}>
        <h4>📥 Tóm tắt Nạp tiền</h4>
        <DepositsSummary {...depositsSummaryData} />
      </div>

      {/* Withdrawals Summary */}
      <div style={{ marginBottom: 24 }}>
        <h4>📤 Tóm tắt Rút tiền</h4>
        <Row gutter={16}>
          <Col xs={12} sm={8} lg={4}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#3f8600" }}
                >
                  {withdrawalsSummaryData.successfulWithdrawals.amount}$
                </div>
                <div style={{ color: "#666" }}>✅ Rút thành công</div>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  {withdrawalsSummaryData.successfulWithdrawals.count} giao dịch
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#faad14" }}
                >
                  {withdrawalsSummaryData.pendingWithdrawals.amount}$
                </div>
                <div style={{ color: "#666" }}>⏳ Rút chờ</div>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  {withdrawalsSummaryData.pendingWithdrawals.count} giao dịch
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={8} lg={4}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#cf1322" }}
                >
                  {withdrawalsSummaryData.rejectedWithdrawals.amount}$
                </div>
                <div style={{ color: "#666" }}>❌ Rút từ chối</div>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  {withdrawalsSummaryData.rejectedWithdrawals.count} giao dịch
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Split Tables */}
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="📥 LỊCH SỬ NẠP TIỀN">
            <DepositsTable
              deposits={deposits}
              onViewDetails={handleViewDepositDetails}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="📤 LỊCH SỬ RÚT TIỀN">
            <WithdrawalsTable
              withdrawals={withdrawals}
              onApprove={(record) => console.log("Approve withdrawal:", record)}
              onReject={(record) => console.log("Reject withdrawal:", record)}
              onViewDetails={handleViewWithdrawalDetails}
            />
          </Card>
        </Col>
      </Row>

      {/* Deposit Detail Modal */}
      {selectedDeposit && (
        <DepositDetailModal
          deposit={selectedDeposit}
          visible={isDetailModalVisible}
          onClose={handleCloseDetailModal}
        />
      )}

      {/* Withdrawal Detail Modal */}
      {selectedWithdrawal && (
        <WithdrawDetailModal
          withdrawal={selectedWithdrawal}
          visible={isWithdrawDetailModalVisible}
          onClose={handleCloseWithdrawDetailModal}
        />
      )}
    </div>
  );
};

export default DepositsWithdrawalsTab;
