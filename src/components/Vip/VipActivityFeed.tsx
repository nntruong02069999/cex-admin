import React, { useMemo, useState } from 'react';
import { 
  Card, 
  Typography, 
  Skeleton,
  Space,
  List,
  Avatar,
  Tag,
  Select,
  Empty,
  Button,
  Tooltip
} from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  RiseOutlined,
  DollarCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { VipActivityFeedProps, VipActivity, VIP_ACTIVITY_TYPES, VIP_COLORS } from './types';

const { Text } = Typography;
const { Option } = Select;

const VipActivityFeed: React.FC<VipActivityFeedProps> = ({
  activities = [],
  loading = false,
  onTypeFilter
}) => {
  const [selectedType, setSelectedType] = useState<string>(VIP_ACTIVITY_TYPES.ALL);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get activity icon and color
  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'upgrade':
        return {
          icon: <RiseOutlined />,
          color: VIP_COLORS.SUCCESS,
          bgColor: '#f6ffed',
          label: 'VIP Upgrade'
        };
      case 'f1_joined':
        return {
          icon: <TeamOutlined />,
          color: VIP_COLORS.PRIMARY,
          bgColor: '#f0f5ff',
          label: 'F1 Network'
        };
      case 'commission':
        return {
          icon: <DollarCircleOutlined />,
          color: VIP_COLORS.WARNING,
          bgColor: '#fffbf0',
          label: 'Commission'
        };
      case 'ranking':
        return {
          icon: <TrophyOutlined />,
          color: '#722ed1',
          bgColor: '#f9f0ff',
          label: 'Ranking'
        };
      default:
        return {
          icon: <UserOutlined />,
          color: VIP_COLORS.NEUTRAL,
          bgColor: '#fafafa',
          label: 'Activity'
        };
    }
  };

  // Handle type filter change
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    onTypeFilter?.(type);
  };

  // Handle refresh
  const handleRefresh = () => {
    onTypeFilter?.(selectedType);
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    return moment(timestamp).fromNow();
  };

  // Sort activities by timestamp
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => 
      moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf()
    );
  }, [activities]);

  if (loading) {
    return (
      <Card 
        title="Recent Activities" 
        className="vip-activity-card"
        style={{ height: '400px' }}
        extra={
          <Space>
            <Skeleton.Button size="small" />
            <Skeleton.Button size="small" />
          </Space>
        }
      >
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  return (
    <Card 
      className="vip-activity-card"
      style={{ height: '400px' }}
      title={
        <Space align="center">
          <ClockCircleOutlined style={{ color: VIP_COLORS.PRIMARY }} />
          <span>Recent Activities</span>
        </Space>
      }
      extra={
        <Space>
          <Select
            value={selectedType}
            onChange={handleTypeChange}
            style={{ width: 120 }}
            size="small"
            suffixIcon={<FilterOutlined />}
          >
            <Option value={VIP_ACTIVITY_TYPES.ALL}>All Types</Option>
            <Option value={VIP_ACTIVITY_TYPES.UPGRADE}>Upgrades</Option>
            <Option value={VIP_ACTIVITY_TYPES.F1}>F1 Network</Option>
            <Option value={VIP_ACTIVITY_TYPES.COMMISSION}>Commission</Option>
            <Option value={VIP_ACTIVITY_TYPES.RANKING}>Rankings</Option>
          </Select>
          <Tooltip title="Refresh activities">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              disabled={loading}
            />
          </Tooltip>
        </Space>
      }
    >
      <div className="activity-content" style={{ height: '320px', overflow: 'auto' }}>
        {sortedActivities.length > 0 ? (
          <List
            dataSource={sortedActivities}
            renderItem={(activity: VipActivity) => {
              const config = getActivityConfig(activity.type);
              
              return (
                <List.Item
                  style={{ 
                    padding: '12px 0', 
                    border: 'none',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={36}
                        style={{
                          backgroundColor: config.bgColor,
                          color: config.color,
                          border: `1px solid ${config.color}20`
                        }}
                        icon={config.icon}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <Space size={8} wrap>
                            <Text strong style={{ fontSize: '13px' }}>
                              {activity.customerName}
                            </Text>
                            <Tag 
                              color={config.color} 
                              style={{ 
                                fontSize: '10px', 
                                padding: '2px 6px',
                                lineHeight: 1.2
                              }}
                            >
                              {config.label}
                            </Tag>
                          </Space>
                        </div>
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: '11px',
                            whiteSpace: 'nowrap',
                            marginLeft: '8px'
                          }}
                        >
                          {formatRelativeTime(activity.timestamp)}
                        </Text>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: '4px' }}>
                        <Text style={{ fontSize: '12px', color: '#666' }}>
                          {activity.description}
                        </Text>
                        {activity.amount && (
                          <div style={{ marginTop: '4px' }}>
                            <Tag 
                              color="blue" 
                              style={{ 
                                fontSize: '11px',
                                backgroundColor: '#e6f7ff',
                                border: '1px solid #91d5ff',
                                color: '#1890ff'
                              }}
                            >
                              <DollarCircleOutlined style={{ fontSize: '10px', marginRight: '2px' }} />
                              {formatCurrency(activity.amount)} USDT
                            </Tag>
                          </div>
                        )}
                        {activity.f1CustomerName && (
                          <div style={{ marginTop: '4px' }}>
                            <Tag 
                              color="green"
                              style={{ 
                                fontSize: '11px',
                                backgroundColor: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                color: '#52c41a'
                              }}
                            >
                              <TeamOutlined style={{ fontSize: '10px', marginRight: '2px' }} />
                              {activity.f1CustomerName}
                            </Tag>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <div style={{ 
            height: '280px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Empty 
              description={
                selectedType === VIP_ACTIVITY_TYPES.ALL 
                  ? "No recent activities" 
                  : `No ${selectedType} activities`
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                size="small" 
                onClick={handleRefresh}
                icon={<ReloadOutlined />}
              >
                Refresh
              </Button>
            </Empty>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      {sortedActivities.length > 0 && (
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '12px', 
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center'
        }}>
          <Space wrap size={12}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              <ClockCircleOutlined style={{ marginRight: '4px' }} />
              {sortedActivities.length} activities shown
            </Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Last updated: {moment().format('HH:mm:ss')}
            </Text>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default VipActivityFeed;