import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  message, 
  Row, 
  Col, 
  Spin,
  Tabs 
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined
} from '@ant-design/icons';

import VipHeader from './VipHeader';
import VipSummaryCards from './VipSummaryCards';
import VipLevelDistribution from './VipLevelDistribution';
import VipCommissionAnalytics from './VipCommissionAnalytics';
import VipRankingOverview from './VipRankingOverview';
import VipActivityFeed from './VipActivityFeed';

import {
  getVipSummary,
  getVipDistribution,
  getVipCommissions,
  getVipRankings,
  getVipActivities
} from '@src/services/vipService';

import {
  VipSummaryResponse,
  VipDistributionResponse,
  VipCommissionData,
  VipRankingResponse,
  VipActivity,
  VipLoadingStates,
  VipErrorStates,
  VIP_TABS,
  VipTabKey,
  CommissionPeriod
} from './types';

import './styles.less';

const { TabPane } = Tabs;

const VipOverview: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<VipTabKey>(VIP_TABS.DASHBOARD);
  
  // Data states
  const [summaryData, setSummaryData] = useState<VipSummaryResponse>();
  const [distributionData, setDistributionData] = useState<VipDistributionResponse>();
  const [commissionData, setCommissionData] = useState<VipCommissionData>();
  const [rankingData, setRankingData] = useState<VipRankingResponse>();
  const [activities, setActivities] = useState<VipActivity[]>([]);

  // Loading states
  const [loading, setLoading] = useState<VipLoadingStates>({
    summary: false,
    distribution: false,
    commission: false,
    ranking: false,
    activities: false
  });

  // Error states
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errors, setErrors] = useState<VipErrorStates>({
    summary: null,
    distribution: null,
    commission: null,
    ranking: null,
    activities: null
  });

  // Update loading state helper
  const updateLoadingState = useCallback((key: keyof VipLoadingStates, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update error state helper
  const updateErrorState = useCallback((key: keyof VipErrorStates, value: string | null) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  }, []);

  // Load summary data
  const loadSummaryData = useCallback(async () => {
    try {
      updateLoadingState('summary', true);
      updateErrorState('summary', null);
      
      const result = await getVipSummary();
      
      if ('errorCode' in result) {
        updateErrorState('summary', result.message);
        message.error(result.message || 'Failed to load VIP summary data');
        return;
      }
      
      setSummaryData(result);
    } catch (error) {
      const errorMessage = 'Failed to load VIP summary data';
      updateErrorState('summary', errorMessage);
      message.error(errorMessage);
      console.error('Error loading VIP summary:', error);
    } finally {
      updateLoadingState('summary', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Load distribution data
  const loadDistributionData = useCallback(async () => {
    try {
      updateLoadingState('distribution', true);
      updateErrorState('distribution', null);
      
      const result = await getVipDistribution();
      
      if ('errorCode' in result) {
        updateErrorState('distribution', result.message);
        message.error(result.message || 'Failed to load VIP distribution data');
        return;
      }
      
      setDistributionData(result);
    } catch (error) {
      const errorMessage = 'Failed to load VIP distribution data';
      updateErrorState('distribution', errorMessage);
      message.error(errorMessage);
      console.error('Error loading VIP distribution:', error);
    } finally {
      updateLoadingState('distribution', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Load commission data
  const loadCommissionData = useCallback(async (period: CommissionPeriod = 'daily', days: number = 30) => {
    try {
      updateLoadingState('commission', true);
      updateErrorState('commission', null);
      
      const result = await getVipCommissions({ period, days });
      
      if ('errorCode' in result) {
        updateErrorState('commission', result.message);
        message.error(result.message || 'Failed to load VIP commission data');
        return;
      }
      
      setCommissionData(result);
    } catch (error) {
      const errorMessage = 'Failed to load VIP commission data';
      updateErrorState('commission', errorMessage);
      message.error(errorMessage);
      console.error('Error loading VIP commission:', error);
    } finally {
      updateLoadingState('commission', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Load ranking data
  const loadRankingData = useCallback(async () => {
    try {
      updateLoadingState('ranking', true);
      updateErrorState('ranking', null);
      
      const result = await getVipRankings();
      
      if ('errorCode' in result) {
        updateErrorState('ranking', result.message);
        message.error(result.message || 'Failed to load VIP ranking data');
        return;
      }
      
      setRankingData(result);
    } catch (error) {
      const errorMessage = 'Failed to load VIP ranking data';
      updateErrorState('ranking', errorMessage);
      message.error(errorMessage);
      console.error('Error loading VIP ranking:', error);
    } finally {
      updateLoadingState('ranking', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Load activities data
  const loadActivitiesData = useCallback(async (type: string = 'all', limit: number = 20) => {
    try {
      updateLoadingState('activities', true);
      updateErrorState('activities', null);
      
      const result = await getVipActivities({ 
        type: type as any, 
        limit 
      });
      
      if ('errorCode' in result) {
        updateErrorState('activities', result.message);
        message.error(result.message || 'Failed to load VIP activities data');
        return;
      }
      
      setActivities(result.activities);
    } catch (error) {
      const errorMessage = 'Failed to load VIP activities data';
      updateErrorState('activities', errorMessage);
      message.error(errorMessage);
      console.error('Error loading VIP activities:', error);
    } finally {
      updateLoadingState('activities', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Load all data
  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadSummaryData(),
      loadDistributionData(),
      loadCommissionData(),
      loadRankingData(),
      loadActivitiesData()
    ]);
  }, [loadSummaryData, loadDistributionData, loadCommissionData, loadRankingData, loadActivitiesData]);

  // Handle tab change
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as VipTabKey);
  }, []);

  // Handle commission period change
  const handleCommissionPeriodChange = useCallback((period: CommissionPeriod) => {
    loadCommissionData(period);
  }, [loadCommissionData]);

  // Handle activity type filter
  const handleActivityTypeFilter = useCallback((type: string) => {
    loadActivitiesData(type);
  }, [loadActivitiesData]);

  // Initial data load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Check if any data is loading
  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="vip-overview-page">
      <Card className="vip-overview-card">
        <VipHeader
          activeTab={activeTab}
          onTabChange={handleTabChange}
          loading={isAnyLoading}
        />

        <div className="vip-content">
          <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange}
            className="vip-tabs"
            size="large"
          >
            <TabPane
              tab={
                <span>
                  <DashboardOutlined />
                  Dashboard
                </span>
              }
              key={VIP_TABS.DASHBOARD}
            >
              <div className="vip-dashboard">
                {/* Summary Cards */}
                <div className="vip-section">
                  <VipSummaryCards
                    summaryData={summaryData}
                    loading={loading.summary}
                  />
                </div>

                {/* Main Content Grid */}
                <Row gutter={[24, 24]} className="vip-main-grid">
                  {/* VIP Level Distribution */}
                  <Col xs={24} lg={12}>
                    <VipLevelDistribution
                      distributionData={distributionData}
                      loading={loading.distribution}
                    />
                  </Col>

                  {/* Commission Analytics */}
                  <Col xs={24} lg={12}>
                    <VipCommissionAnalytics
                      commissionData={commissionData}
                      loading={loading.commission}
                      onPeriodChange={handleCommissionPeriodChange}
                    />
                  </Col>

                  {/* Ranking Overview */}
                  <Col xs={24} lg={12}>
                    <VipRankingOverview
                      rankingData={rankingData}
                      loading={loading.ranking}
                    />
                  </Col>

                  {/* Activity Feed */}
                  <Col xs={24} lg={12}>
                    <VipActivityFeed
                      activities={activities}
                      loading={loading.activities}
                      onTypeFilter={handleActivityTypeFilter}
                    />
                  </Col>
                </Row>
              </div>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Customers
                </span>
              }
              key={VIP_TABS.CUSTOMERS}
            >
              <div className="vip-customers">
                <Spin spinning={isAnyLoading}>
                  <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p>Customer management section - Coming soon</p>
                  </div>
                </Spin>
              </div>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <DollarOutlined />
                  Commissions
                </span>
              }
              key={VIP_TABS.COMMISSIONS}
            >
              <div className="vip-commissions">
                <VipCommissionAnalytics
                  commissionData={commissionData}
                  loading={loading.commission}
                  onPeriodChange={handleCommissionPeriodChange}
                />
              </div>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <TrophyOutlined />
                  Rankings
                </span>
              }
              key={VIP_TABS.RANKINGS}
            >
              <div className="vip-rankings">
                <VipRankingOverview
                  rankingData={rankingData}
                  loading={loading.ranking}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default VipOverview;