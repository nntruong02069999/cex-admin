import React, { useEffect } from "react";
import { connect } from "dva";
import { Table, Tag, Button, Space } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { WithdrawTransaction } from "@src/services/houseWalletService";
import { HouseWalletState } from "@src/models/houseWallet";
import BSCScanLink from "../Common/BSCScanLink";
import AmountDisplay from "../Common/AmountDisplay";
import dayjs from "dayjs";

interface WithdrawTransactionTableProps {
  houseWallet: HouseWalletState;
  dispatch: any;
}

const WithdrawTransactionTable: React.FC<WithdrawTransactionTableProps> = ({
  houseWallet,
  dispatch,
}) => {
  const {
    withdrawTransactions,
    withdrawTransactionsTotal,
    withdrawTransactionsLoading,
    queryParams,
  } = houseWallet;

  useEffect(() => {
    dispatch({ type: "houseWallet/fetchWithdrawTransactions" });
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "orange",
      SUCCESS: "green",
      FAILED: "red",
      CANCELLED: "default",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const columns: ColumnsType<WithdrawTransaction> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (createdAt: number) => (
        <span>{dayjs(createdAt).format("DD/MM/YYYY HH:mm")}</span>
      ),
    },
    {
      title: "ID khách hàng",
      dataIndex: "fromCustomerId",
      key: "fromCustomerId",
      width: 100,
    },
    {
      title: "Đến địa chỉ",
      dataIndex: "toWalletAddress",
      key: "toWalletAddress",
      width: 200,
      render: (address: string) =>
        address ? <BSCScanLink address={address} type="address" /> : "-",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (amount: number) => (
        <AmountDisplay amount={amount} currency="USDT" />
      ),
    },
    {
      title: "Hash",
      dataIndex: "txHash",
      key: "txHash",
      width: 200,
      render: (txHash: string) =>
        txHash ? <BSCScanLink txHash={txHash} type="tx" /> : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Loại",
      dataIndex: "withdrawType",
      key: "withdrawType",
      width: 100,
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      render: (record: WithdrawTransaction) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() =>
              dispatch({
                type: "houseWallet/fetchWithdrawTransactionDetails",
                payload: record.id,
              })
            }
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="withdraw-transaction-table">
      <div className="table-header">
        <div className="header-left">
          <h3>Giao dịch rút</h3>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={withdrawTransactions}
        loading={withdrawTransactionsLoading}
        rowKey="id"
        pagination={{
          current: queryParams.withdrawTransactions.page,
          pageSize: queryParams.withdrawTransactions.limit,
          total: withdrawTransactionsTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        size="middle"
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

const mapStateToProps = ({ houseWallet }: any) => ({
  houseWallet,
});

export default connect(mapStateToProps)(WithdrawTransactionTable);
