import React from 'react';
import { 
  Typography, 
  Row, 
  Col, 
  Button, 
  Tooltip,
  Space
} from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { VipHeaderProps } from './types';

const { Title, Text } = Typography;

const VipHeader: React.FC<VipHeaderProps> = ({
  activeTab,
  onTabChange,
  loading = false
}) => {
  
  const handleRefresh = () => {
    // This will be handled by parent component
    window.location.reload();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export VIP data');
  };

  const handleSettings = () => {
    // TODO: Implement settings
    console.log('VIP settings');
  };

  return (
    <div className="vip-header">
      <Row justify="space-between" align="middle">
        <Col>
          <div className="vip-header-title">
            <Space align="center" size="middle">
              <CrownOutlined 
                style={{ 
                  fontSize: '32px', 
                  color: '#2563eb',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }} 
              />
              <div>
                <Title level={2} style={{ margin: 0, fontSize: '28px' }}>
                  VIP Overview
                </Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Comprehensive VIP program management and analytics
                </Text>
              </div>
            </Space>
          </div>
        </Col>
        
        <Col>
          <Space size="middle">
            <Tooltip title="Refresh data">
              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={handleRefresh}
                type="default"
              >
                Refresh
              </Button>
            </Tooltip>
            
            <Tooltip title="Export data">
              <Button
                icon={<DownloadOutlined />}
                disabled={loading}
                onClick={handleExport}
                type="default"
              >
                Export
              </Button>
            </Tooltip>
            
            <Tooltip title="Settings">
              <Button
                icon={<SettingOutlined />}
                disabled={loading}
                onClick={handleSettings}
                type="default"
              />
            </Tooltip>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default VipHeader;