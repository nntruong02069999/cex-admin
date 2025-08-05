import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Table, Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { WalletRule } from '@src/services/houseWalletService';
import { HouseWalletState } from '@src/models/houseWallet';

interface WalletRuleTableProps {
  houseWallet: HouseWalletState;
  dispatch: any;
}

const WalletRuleTable: React.FC<WalletRuleTableProps> = ({
  houseWallet,
  dispatch
}) => {
  const { 
    walletRules, 
    walletRulesTotal, 
    walletRulesLoading,
    queryParams 
  } = houseWallet;

  useEffect(() => {
    dispatch({ type: 'houseWallet/fetchWalletRules' });
  }, [dispatch]);

  const columns: ColumnsType<WalletRule> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Ví',
      dataIndex: ['wallet', 'address'],
      key: 'wallet',
      width: 200,
      render: (address: string) => address ? address.slice(0, 10) + '...' : '-',
    },
    {
      title: 'Loại trigger',
      dataIndex: 'triggerType',
      key: 'triggerType',
      width: 150,
      render: (type: string) => (
        <Tag color="blue">{type.replace('_', ' ')}</Tag>
      ),
    },
    {
      title: 'Loại hành động',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 150,
      render: (type: string) => (
        <Tag color="green">{type.replace('_', ' ')}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="wallet-rule-table">
      <div className="table-header">
        <div className="header-left">
          <h3>Quy tắc ví</h3>
        </div>
        <div className="header-right">
          <Button
            type="primary"
            icon={<PlusOutlined />}
          >
            Tạo quy tắc
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={walletRules}
        loading={walletRulesLoading}
        rowKey="id"
        pagination={{
          current: queryParams.walletRules.page,
          pageSize: queryParams.walletRules.limit,
          total: walletRulesTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        size="middle"
      />
    </div>
  );
};

const mapStateToProps = ({ houseWallet }: any) => ({
  houseWallet,
});

export default connect(mapStateToProps)(WalletRuleTable);