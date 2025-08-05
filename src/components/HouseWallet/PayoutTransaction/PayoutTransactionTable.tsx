import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Table, Tag, Button, Space } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PayoutTransaction } from '@src/services/houseWalletService';
import { HouseWalletState } from '@src/models/houseWallet';
import BSCScanLink from '../Common/BSCScanLink';
import AmountDisplay from '../Common/AmountDisplay';

interface PayoutTransactionTableProps {
  houseWallet: HouseWalletState;
  dispatch: any;
}

const PayoutTransactionTable: React.FC<PayoutTransactionTableProps> = ({
  houseWallet,
  dispatch
}) => {
  const { 
    payoutTransactions, 
    payoutTransactionsTotal, 
    payoutTransactionsLoading,
    queryParams 
  } = houseWallet;

  useEffect(() => {
    dispatch({ type: 'houseWallet/fetchPayoutTransactions' });
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'orange',
      'PROCESSING': 'blue',
      'SUCCESS': 'green',
      'FAILED': 'red',
      'CANCELLED': 'default',
      'INSUFFICIENT_FUNDS': 'magenta',
      'INVALID_ADDRESS': 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<PayoutTransaction> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
      width: 100,
    },
    {
      title: 'Nhận từ',
      dataIndex: 'toAddress',
      key: 'toAddress',
      width: 200,
      render: (address: string) => (
        <BSCScanLink address={address} type="address" />
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number) => <AmountDisplay amount={amount} currency="USDT" />,
    },
    {
      title: 'Hash',
      dataIndex: 'txHash',
      key: 'txHash',
      width: 200,
      render: (txHash: string) => (
        txHash ? <BSCScanLink txHash={txHash} type="tx" /> : '-'
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Lặp lại',
      dataIndex: 'retryCount',
      key: 'retryCount',
      width: 100,
      render: (retryCount: number, record: PayoutTransaction) => (
        `${retryCount || 0}/${record.maxRetries || 3}`
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (record: PayoutTransaction) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => dispatch({
              type: 'houseWallet/fetchPayoutTransactionDetails',
              payload: record.id
            })}
            size="small"
          />
          {record.status === 'FAILED' && (
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => dispatch({
                type: 'houseWallet/showPayoutRetryModal',
                payload: record
              })}
              size="small"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="payout-transaction-table">
      <div className="table-header">
        <div className="header-left">
          <h3>Giao dịch rút</h3>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={payoutTransactions}
        loading={payoutTransactionsLoading}
        rowKey="id"
        pagination={{
          current: queryParams.payoutTransactions.page,
          pageSize: queryParams.payoutTransactions.limit,
          total: payoutTransactionsTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        size="middle"
        scroll={{ x: 1100 }}
      />
    </div>
  );
};

const mapStateToProps = ({ houseWallet }: any) => ({
  houseWallet
});

export default connect(mapStateToProps)(PayoutTransactionTable);