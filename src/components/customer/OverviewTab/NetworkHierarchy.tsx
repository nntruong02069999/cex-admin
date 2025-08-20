import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { NetworkHierarchy as NetworkHierarchyType, NetworkSummary } from '../types/customer.types';
import { NETWORK_LEVELS } from '../utils/constants';
import { formatNumber } from '../utils/formatters';

const { Text, Title } = Typography;

interface NetworkHierarchyProps {
  hierarchy: NetworkHierarchyType;
  networkSummary: NetworkSummary;
}

const NetworkHierarchy: React.FC<NetworkHierarchyProps> = ({ 
  hierarchy, 
  networkSummary 
}) => {
  const renderNetworkLevel = (levelKey: keyof NetworkHierarchyType, levelIndex: number) => {
    const level = hierarchy[levelKey];
    const levelConfig = NETWORK_LEVELS[levelIndex];
    
    if (level.count === 0) return null;
    
    return (
      <div 
        key={levelKey}
        className="network-level"
        style={{ marginLeft: levelConfig.marginLeft }}
      >
        <div className="network-level-header">
          <div 
            className="network-level-icon"
            style={{ backgroundColor: levelConfig.color }}
          >
            👥
          </div>
          <div className="network-level-info">
            <div className="network-level-title">{levelConfig.label}</div>
            <div className="network-level-stats">
              <span className="member-count">{level.count} thành viên</span>
              {level.vipCount > 0 && (
                <span className="vip-count">({level.vipCount} VIP)</span>
              )}
            </div>
          </div>
        </div>
        
        {level.count > 0 && (
          <div className="network-level-children">
            {/* Visual representation of members */}
            <div className="member-dots">
              {Array.from({ length: Math.min(level.count, 10) }).map((_, i) => (
                <div 
                  key={i}
                  className={`member-dot ${i < level.vipCount ? 'member-dot--vip' : ''}`}
                />
              ))}
              {level.count > 10 && (
                <div className="member-count-more">+{level.count - 10}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card title="Sơ đồ Phả hệ (Network Hierarchy)" className="overview-section network-hierarchy-card">
      {/* Network Tree Visualization */}
      <div className="network-tree">
        <div className="network-root">
          <div className="root-node">
            <div className="root-icon">👤</div>
            <div className="root-info">
              <div className="root-title">Root User</div>
              <div className="root-subtitle">Network Leader</div>
            </div>
          </div>
        </div>
        
        <div className="network-levels">
          {(Object.keys(hierarchy) as Array<keyof NetworkHierarchyType>).map((levelKey, index) => 
            renderNetworkLevel(levelKey, index)
          )}
        </div>
      </div>
      
      {/* Network Summary */}
      <div className="network-summary">
        <Title level={5} className="summary-title">📊 Tóm tắt Network</Title>
        
        <Row gutter={16} className="summary-stats">
          <Col xs={12} sm={6}>
            <div className="summary-item">
              <div className="summary-value">{formatNumber(networkSummary.totalMembers)}</div>
              <div className="summary-label">👥 Tổng thành viên</div>
            </div>
          </Col>
          
          <Col xs={12} sm={6}>
            <div className="summary-item">
              <div className="summary-value vip-value">{formatNumber(networkSummary.totalVip)}</div>
              <div className="summary-label">👑 VIP</div>
            </div>
          </Col>
          
          <Col xs={12} sm={6}>
            <div className="summary-item">
              <div className="summary-value active-value">
                {formatNumber(Math.floor(networkSummary.totalMembers * 0.8))}
              </div>
              <div className="summary-label">💰 Đang hoạt động</div>
            </div>
          </Col>
          
          <Col xs={12} sm={6}>
            <div className="summary-item">
              <div className="summary-value growth-value">+{formatNumber(networkSummary.monthlyGrowth)}</div>
              <div className="summary-label">📈 Tăng trưởng tháng</div>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default NetworkHierarchy;