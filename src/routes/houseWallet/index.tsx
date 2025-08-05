import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Tabs, Card, Spin } from 'antd';
import { WalletOutlined, SettingOutlined, TransactionOutlined, PayCircleOutlined } from '@ant-design/icons';
import HouseWalletHeader from '@src/components/HouseWallet/HouseWalletHeader';
import HouseWalletStats from '@src/components/HouseWallet/HouseWalletStats';
import WalletConfigTable from '@src/components/HouseWallet/WalletConfig/WalletConfigTable';
import WalletRuleTable from '@src/components/HouseWallet/WalletRule/WalletRuleTable';
import WithdrawTransactionTable from '@src/components/HouseWallet/WithdrawTransaction/WithdrawTransactionTable';
import WithdrawDetailModal from '@src/components/HouseWallet/WithdrawTransaction/WithdrawDetailModal';
import PayoutTransactionTable from '@src/components/HouseWallet/PayoutTransaction/PayoutTransactionTable';
import PayoutDetailModal from '@src/components/HouseWallet/PayoutTransaction/PayoutDetailModal';
import PayoutRetryModal from '@src/components/HouseWallet/PayoutTransaction/PayoutRetryModal';
import { HouseWalletState } from '@src/models/houseWallet';
import './index.less';

const { TabPane } = Tabs;

interface HouseWalletPageProps {
  houseWallet: HouseWalletState;
  dispatch: any;
  loading: boolean;
}

const HouseWalletPage: React.FC<HouseWalletPageProps> = ({
  houseWallet,
  dispatch,
  loading
}) => {
  const { stats, statsLoading, activeTab } = houseWallet;

  useEffect(() => {
    dispatch({
      type: 'houseWallet/fetchDashboardStats'
    });
  }, [dispatch]);

  const handleTabChange = (key: string) => {
    dispatch({
      type: 'houseWallet/setActiveTab',
      payload: key
    });

    // Load data for active tab
    switch (key) {
      case 'configs':
        dispatch({ type: 'houseWallet/fetchWalletConfigs' });
        break;
      case 'rules':
        dispatch({ type: 'houseWallet/fetchWalletRules' });
        break;
      case 'withdraws':
        dispatch({ type: 'houseWallet/fetchWithdrawTransactions' });
        break;
      case 'payouts':
        dispatch({ type: 'houseWallet/fetchPayoutTransactions' });
        break;
    }
  };

  const handleStatsRefresh = () => {
    dispatch({
      type: 'houseWallet/fetchDashboardStats'
    });
  };

  if (loading || statsLoading) {
    return (
      <div className="house-wallet-page">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="house-wallet-page">
      <HouseWalletHeader />
      
      <HouseWalletStats 
        stats={stats} 
        onRefresh={handleStatsRefresh}
      />
      
      <Card className="main-content" bordered={false}>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          size="large"
          type="card"
        >
          <TabPane 
            tab={
              <span>
                <WalletOutlined />
                Cấu hình ví
              </span>
            } 
            key="configs"
          >
            <WalletConfigTable />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                Quy tắc ví
              </span>
            } 
            key="rules"
          >
            <WalletRuleTable />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <TransactionOutlined />
                Giao dịch rút
              </span>
            } 
            key="withdraws"
          >
            <WithdrawTransactionTable />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <PayCircleOutlined />
                Giao dịch thanh toán
              </span>
            } 
            key="payouts"
          >
            <PayoutTransactionTable />
          </TabPane>
        </Tabs>
      </Card>

      {/* Transaction Detail Modals */}
      <WithdrawDetailModal />
      <PayoutDetailModal />
      <PayoutRetryModal />
    </div>
  );
};

const mapStateToProps = ({ houseWallet, loading }: any) => ({
  houseWallet,
  loading: loading.effects['houseWallet/fetchDashboardStats']
});

export default connect(mapStateToProps)(HouseWalletPage);