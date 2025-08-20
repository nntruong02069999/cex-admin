# Đặc tả UI/UX - Trang Chi tiết Khách hàng Admin

## 📋 Tổng quan Dự án

### Mục tiêu
Xây dựng trang chi tiết khách hàng trong hệ thống admin CEX với đầy đủ thông tin quản lý và thao tác.

### Công nghệ
- **Frontend**: ReactJS 16+ với Hooks
- **UI Framework**: Ant Design v4.x
- **Styling**: LESS files
- **State Management**: React Context hoặc Redux (tuỳ chọn)
- **HTTP Client**: Axios
- **Charts**: Ant Design Charts hoặc Chart.js

---

## 🏗️ Cấu trúc Component

```
src/
├── pages/
│   └── admin/
│       └── customers/
│           ├── CustomerDetail/
│           │   ├── index.tsx                 // Main container
│           │   ├── CustomerDetail.less       // Main styles
│           │   ├── components/
│           │   │   ├── CustomerHeader/       // Header section
│           │   │   ├── SummaryCards/         // Summary metrics
│           │   │   ├── TabContainer/         // Tab navigation
│           │   │   └── tabs/
│           │   │       ├── OverviewTab/      // Tab 1: Tổng quan
│           │   │       ├── DepositsWithdrawalsTab/ // Tab 2
│           │   │       ├── TransactionsTab/  // Tab 3
│           │   │       ├── TradingHistoryTab/ // Tab 4
│           │   │       └── VipCommissionTab/ // Tab 5
│           │   ├── hooks/
│           │   │   ├── useCustomerData.ts    // Data fetching
│           │   │   ├── useCustomerActions.ts // Actions
│           │   │   └── useNetworkHierarchy.ts // Network tree
│           │   └── types/
│           │       └── customer.types.ts     // TypeScript types
│           └── CustomerDetail.route.tsx      // Route component
```

---

## 🎨 Design System & Styling

### LESS Variables
```less
// customer-detail-variables.less
@primary-color: #1890ff;
@success-color: #52c41a;
@warning-color: #faad14;
@error-color: #ff4d4f;
@vip-color: #722ed1;

// Spacing
@spacing-xs: 4px;
@spacing-sm: 8px;
@spacing-md: 16px;
@spacing-lg: 24px;
@spacing-xl: 32px;

// Card styles
@card-radius: 8px;
@card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

// Layout
@header-height: 64px;
@sidebar-width: 280px;
@content-padding: 24px;

// Status colors
@status-success: #52c41a;
@status-pending: #faad14;
@status-failed: #ff4d4f;
@status-blocked: #f5222d;
@status-inactive: #d9d9d9;
```

### Component Classes
```less
// CustomerDetail.less
.customer-detail {
  &__container {
    padding: @content-padding;
    background: #f0f2f5;
    min-height: calc(100vh - @header-height);
  }

  &__header {
    background: white;
    border-radius: @card-radius;
    padding: @spacing-lg;
    margin-bottom: @spacing-lg;
    box-shadow: @card-shadow;
  }

  &__summary-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: @spacing-md;
    margin-bottom: @spacing-lg;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__tab-container {
    background: white;
    border-radius: @card-radius;
    box-shadow: @card-shadow;
  }
}

.status-badge {
  &--success { color: @status-success; }
  &--pending { color: @status-pending; }
  &--failed { color: @status-failed; }
  &--blocked { color: @status-blocked; }
  &--inactive { color: @status-inactive; }
}

.network-tree {
  &__container {
    padding: @spacing-md;
    border: 1px solid #f0f0f0;
    border-radius: @card-radius;
    background: #fafafa;
  }

  &__node {
    display: flex;
    align-items: center;
    padding: @spacing-sm;
    margin: @spacing-xs 0;

    &--level-1 { margin-left: 0; }
    &--level-2 { margin-left: 20px; }
    &--level-3 { margin-left: 40px; }
    &--level-4 { margin-left: 60px; }
    &--level-5 { margin-left: 80px; }
    &--level-6 { margin-left: 100px; }
    &--level-7 { margin-left: 120px; }
  }

  &__icon {
    margin-right: @spacing-xs;
    color: @primary-color;
  }

  &__count {
    margin-left: @spacing-sm;
    color: #666;
    font-size: 12px;
  }
}
```

---

## 📝 Chi tiết Component Implementation

### 1. Main Container (CustomerDetail/index.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import CustomerHeader from './components/CustomerHeader';
import SummaryCards from './components/SummaryCards';
import TabContainer from './components/TabContainer';
import { useCustomerData } from './hooks/useCustomerData';
import { CustomerDetailData } from './types/customer.types';
import './CustomerDetail.less';

interface CustomerDetailProps {}

const CustomerDetail: React.FC<CustomerDetailProps> = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { data, loading, error, refetch } = useCustomerData(parseInt(customerId));

  useEffect(() => {
    if (error) {
      message.error('Không thể tải thông tin khách hàng');
    }
  }, [error]);

  if (loading) {
    return (
      <div className="customer-detail__loading">
        <Spin size="large" tip="Đang tải thông tin khách hàng..." />
      </div>
    );
  }

  return (
    <div className="customer-detail__container">
      <CustomerHeader 
        customer={data?.customer} 
        onRefresh={refetch}
      />
      
      <SummaryCards 
        summary={data?.summary} 
        customer={data?.customer}
      />
      
      <TabContainer 
        customerId={parseInt(customerId)}
        customerData={data}
        onDataUpdate={refetch}
      />
    </div>
  );
};

export default CustomerDetail;
```

### 2. Customer Header Component

```typescript
// components/CustomerHeader/index.tsx
import React from 'react';
import { Row, Col, Avatar, Tag, Button, Breadcrumb } from 'antd';
import { UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { Customer } from '../../types/customer.types';
import './CustomerHeader.less';

interface CustomerHeaderProps {
  customer?: Customer;
  onRefresh: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ customer, onRefresh }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="customer-detail__header">
      <Breadcrumb className="customer-header__breadcrumb">
        <Breadcrumb.Item>Admin</Breadcrumb.Item>
        <Breadcrumb.Item>Khách hàng</Breadcrumb.Item>
        <Breadcrumb.Item>Chi tiết</Breadcrumb.Item>
      </Breadcrumb>

      <Row justify="space-between" align="middle" className="customer-header__main">
        <Col>
          <div className="customer-header__info">
            <Avatar 
              size={64} 
              src={customer?.avatar} 
              icon={<UserOutlined />}
              className="customer-header__avatar"
            />
            <div className="customer-header__details">
              <h2 className="customer-header__name">
                {customer?.firstName} {customer?.lastName}
                {customer?.isVip && <Tag color="purple">VIP</Tag>}
              </h2>
              <p className="customer-header__nickname">@{customer?.nickname}</p>
              <p className="customer-header__email">
                {customer?.email}
                {customer?.isVerifyEmail && <Tag color="green">Đã xác thực</Tag>}
              </p>
            </div>
          </div>
        </Col>
        
        <Col>
          <div className="customer-header__actions">
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={onRefresh}
            >
              Làm mới
            </Button>
          </div>
        </Col>
      </Row>

      <Row gutter={16} className="customer-header__status">
        <Col>
          <Tag color={customer?.isBlocked ? 'red' : 'green'}>
            {customer?.isBlocked ? 'Đã khóa' : 'Hoạt động'}
          </Tag>
        </Col>
        <Col>
          <Tag color={getStatusColor(customer?.statusDocument)}>
            KYC: {customer?.statusDocument}
          </Tag>
        </Col>
        <Col>
          <Tag color={customer?.twoFAEnabled ? 'blue' : 'default'}>
            2FA: {customer?.twoFAEnabled ? 'Bật' : 'Tắt'}
          </Tag>
        </Col>
        <Col>
          <Tag color={customer?.isAccountMarketing ? 'orange' : 'default'}>
            Marketing: {customer?.isAccountMarketing ? 'Bật' : 'Tắt'}
          </Tag>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerHeader;
```

### 3. Summary Cards Component

```typescript
// components/SummaryCards/index.tsx
import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { 
  UserOutlined, 
  DollarOutlined, 
  TrophyOutlined, 
  TeamOutlined 
} from '@ant-design/icons';
import { CustomerSummary } from '../../types/customer.types';
import './SummaryCards.less';

interface SummaryCardsProps {
  summary?: CustomerSummary;
  customer?: any;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, customer }) => {
  return (
    <Row gutter={16} className="customer-detail__summary-cards">
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card summary-card--account">
          <Statistic
            title="Trạng thái Tài khoản"
            value={customer?.isBlocked ? 'Bị khóa' : 'Hoạt động'}
            prefix={<UserOutlined />}
            valueStyle={{ 
              color: customer?.isBlocked ? '#ff4d4f' : '#3f8600' 
            }}
          />
          <div className="summary-card__details">
            <p>✅ Email: {customer?.isVerifyEmail ? 'Xác thực' : 'Chưa xác thực'}</p>
            <p>🔐 2FA: {customer?.twoFAEnabled ? 'Bật' : 'Tắt'}</p>
            <p>📋 KYC: {customer?.statusDocument}</p>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card summary-card--financial">
          <Statistic
            title="Số dư Tài khoản"
            value={summary?.totalBalance || 0}
            prefix={<DollarOutlined />}
            precision={2}
            suffix="USD"
          />
          <div className="summary-card__details">
            <p>💰 Balance: ${summary?.balance}</p>
            <p>🪙 USDT: ${summary?.usdtBalance}</p>
            <p>🔒 Frozen: ${summary?.frozenBalance}</p>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card summary-card--trading">
          <Statistic
            title="Tỷ lệ Thắng"
            value={summary?.winRate || 0}
            prefix={<TrophyOutlined />}
            precision={1}
            suffix="%"
          />
          <div className="summary-card__details">
            <p>🎯 Lệnh: {summary?.totalOrders}</p>
            <p>🏆 Thắng: {summary?.totalWins}</p>
            <p>💰 Volume: ${summary?.totalVolume}</p>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card summary-card--network">
          <Statistic
            title="Tổng Thành viên"
            value={summary?.totalMembers || 0}
            prefix={<TeamOutlined />}
          />
          <div className="summary-card__details">
            <p>👑 VIP: {summary?.vipMembers}</p>
            <p>📈 Tháng này: +{summary?.monthlyGrowth}</p>
            <p>💼 Cấp: {summary?.currentLevel}</p>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default SummaryCards;
```

### 4. Tab 1: Tổng quan (OverviewTab)

```typescript
// components/tabs/OverviewTab/index.tsx
import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Avatar, 
  Tag, 
  Input, 
  Button, 
  Select, 
  Switch,
  message,
  Divider
} from 'antd';
import { UserOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import NetworkHierarchyTree from './NetworkHierarchyTree';
import FinancialOverview from './FinancialOverview';
import { useCustomerActions } from '../../../hooks/useCustomerActions';
import './OverviewTab.less';

const { Option } = Select;

interface OverviewTabProps {
  customerId: number;
  customerData: any;
  onDataUpdate: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  customerId, 
  customerData, 
  onDataUpdate 
}) => {
  const [balanceAmount, setBalanceAmount] = useState<string>('');
  const [balanceNote, setBalanceNote] = useState<string>('');
  const [newVipLevel, setNewVipLevel] = useState<number>(customerData?.customer?.currentVipLevel || 0);
  const [isMarketing, setIsMarketing] = useState<boolean>(customerData?.customer?.isAccountMarketing || false);

  const { addBalance, subtractBalance, updateVipLevel, updateMarketingStatus } = useCustomerActions();

  const handleAddBalance = async () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      message.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      await addBalance(customerId, parseFloat(balanceAmount), balanceNote);
      message.success('Cộng tiền thành công');
      setBalanceAmount('');
      setBalanceNote('');
      onDataUpdate();
    } catch (error) {
      message.error('Cộng tiền thất bại');
    }
  };

  const handleSubtractBalance = async () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      message.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      await subtractBalance(customerId, parseFloat(balanceAmount), balanceNote);
      message.success('Trừ tiền thành công');
      setBalanceAmount('');
      setBalanceNote('');
      onDataUpdate();
    } catch (error) {
      message.error('Trừ tiền thất bại');
    }
  };

  const handleUpdateVipLevel = async () => {
    try {
      await updateVipLevel(customerId, newVipLevel);
      message.success('Cập nhật cấp VIP thành công');
      onDataUpdate();
    } catch (error) {
      message.error('Cập nhật cấp VIP thất bại');
    }
  };

  const handleUpdateMarketing = async (checked: boolean) => {
    try {
      await updateMarketingStatus(customerId, checked);
      setIsMarketing(checked);
      message.success('Cập nhật trạng thái marketing thành công');
      onDataUpdate();
    } catch (error) {
      message.error('Cập nhật trạng thái marketing thất bại');
      setIsMarketing(!checked);
    }
  };

  return (
    <div className="overview-tab">
      <Row gutter={24}>
        {/* Left Panel - 65% */}
        <Col xs={24} lg={16}>
          {/* Customer Information */}
          <Card title="Thông tin Khách hàng" className="overview-tab__customer-info">
            <Row gutter={16} align="middle">
              <Col>
                <Avatar 
                  size={80} 
                  src={customerData?.customer?.avatar} 
                  icon={<UserOutlined />}
                />
              </Col>
              <Col flex="auto">
                <h3>
                  {customerData?.customer?.firstName} {customerData?.customer?.lastName}
                  {customerData?.customer?.isVip && <Tag color="purple">VIP Level {customerData?.customer?.currentVipLevel}</Tag>}
                </h3>
                <p className="overview-tab__nickname">🎯 {customerData?.customer?.nickname}</p>
                <p className="overview-tab__email">
                  ✉️ {customerData?.customer?.email}
                  {customerData?.customer?.isVerifyEmail && <Tag color="green">Đã xác thực</Tag>}
                </p>
                <p>📅 Tham gia: {new Date(customerData?.customer?.createdAt * 1000).toLocaleDateString('vi-VN')}</p>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col>🎯 Mã mời: <strong>{customerData?.customer?.inviteCode}</strong></Col>
              {customerData?.inviter && (
                <Col>👤 Người mời: <strong>{customerData?.inviter?.email}</strong></Col>
              )}
            </Row>
          </Card>

          {/* Financial Overview */}
          <FinancialOverview customerMoney={customerData?.customerMoney} />

          {/* Network Hierarchy */}
          <NetworkHierarchyTree 
            hierarchy={customerData?.hierarchy}
            networkSummary={customerData?.networkSummary}
          />
        </Col>

        {/* Right Panel - 35% */}
        <Col xs={24} lg={8}>
          {/* Actions Panel */}
          <Card title="Thao tác Nhanh" className="overview-tab__actions">
            {/* Balance Management */}
            <div className="action-section">
              <h4>💰 Quản lý Số dư</h4>
              <Input
                placeholder="Nhập số tiền"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                style={{ marginBottom: 8 }}
                addonAfter="USD"
              />
              <Input.TextArea
                placeholder="Ghi chú (tùy chọn)"
                value={balanceNote}
                onChange={(e) => setBalanceNote(e.target.value)}
                rows={2}
                style={{ marginBottom: 8 }}
              />
              <Row gutter={8}>
                <Col span={12}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    block
                    onClick={handleAddBalance}
                  >
                    Cộng tiền
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    danger 
                    icon={<MinusOutlined />}
                    block
                    onClick={handleSubtractBalance}
                  >
                    Trừ tiền
                  </Button>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* VIP Management */}
            <div className="action-section">
              <h4>👑 Quản lý VIP</h4>
              <p>Cấp hiện tại: <Tag color="purple">{customerData?.customer?.currentVipLevel || 0}</Tag></p>
              <Select
                placeholder="Chọn cấp VIP mới"
                value={newVipLevel}
                onChange={setNewVipLevel}
                style={{ width: '100%', marginBottom: 8 }}
              >
                <Option value={0}>Cấp 0 (Thường)</Option>
                <Option value={1}>Cấp 1</Option>
                <Option value={2}>Cấp 2</Option>
                <Option value={3}>Cấp 3</Option>
                <Option value={4}>Cấp 4</Option>
                <Option value={5}>Cấp 5</Option>
                <Option value={6}>Cấp 6</Option>
                <Option value={7}>Cấp 7</Option>
              </Select>
              <Button 
                type="primary" 
                block
                onClick={handleUpdateVipLevel}
                disabled={newVipLevel === customerData?.customer?.currentVipLevel}
              >
                Cập nhật Cấp VIP
              </Button>
            </div>

            <Divider />

            {/* Marketing Account */}
            <div className="action-section">
              <h4>📢 Tài khoản Marketing</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Kích hoạt Marketing:</span>
                <Switch
                  checked={isMarketing}
                  onChange={handleUpdateMarketing}
                />
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card title="Thống kê Nhanh" className="overview-tab__quick-stats">
            <div className="stat-item">
              <span>💰 Số dư hiện tại:</span>
              <strong>${customerData?.customerMoney?.balance || 0}</strong>
            </div>
            <div className="stat-item">
              <span>🪙 USDT:</span>
              <strong>${customerData?.customerMoney?.balanceUSDT || 0}</strong>
            </div>
            <div className="stat-item">
              <span>🔒 Đóng băng:</span>
              <strong>${customerData?.customerMoney?.frozen || 0}</strong>
            </div>
            <div className="stat-item">
              <span>🎮 Demo:</span>
              <strong>${customerData?.customerMoney?.balanceDemo || 0}</strong>
            </div>
            
            <Divider />
            
            <div className="stat-item">
              <span>🎯 Tỷ lệ thắng:</span>
              <strong>{((customerData?.customerMoney?.totalTradeWinCount || 0) / Math.max(customerData?.customerMoney?.totalTradeCount || 1, 1) * 100).toFixed(1)}%</strong>
            </div>
            <div className="stat-item">
              <span>📊 Tổng lệnh:</span>
              <strong>{customerData?.customerMoney?.totalTradeCount || 0}</strong>
            </div>
            <div className="stat-item">
              <span>💰 Volume:</span>
              <strong>${customerData?.customerMoney?.totalTradeAmount || 0}</strong>
            </div>
            
            <Divider />
            
            <div className="stat-item">
              <span>👥 Tổng thành viên:</span>
              <strong>{customerData?.networkSummary?.totalMembers || 0}</strong>
            </div>
            <div className="stat-item">
              <span>👑 VIP:</span>
              <strong>{customerData?.networkSummary?.totalVip || 0}</strong>
            </div>
            <div className="stat-item">
              <span>💼 Hoa hồng:</span>
              <strong>${customerData?.customerMoney?.totalCommission || 0}</strong>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewTab;
```

---

## 🔌 API Specifications

### 1. Get Customer Detail
```typescript
// GET /api/admin/customers/{customerId}/detail
interface CustomerDetailResponse {
  success: boolean;
  data: {
    customer: {
      id: number;
      nickname: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
      isVerifyEmail: boolean;
      isBlocked: boolean;
      isVip: boolean;
      twoFAEnabled: boolean;
      statusDocument: 'not_submit' | 'pending' | 'approved' | 'rejected';
      isAccountMarketing: boolean;
      inviteCode: string;
      inviterCustomerId?: number;
      totalMember: number;
      totalMemberVip: number;
      totalMemberVip1: number;
      currentVipLevel: number;
      createdAt: number;
      userLoginDate?: number;
    };
    customerMoney: {
      balance: number;
      frozen: number;
      total: number;
      balanceDemo: number;
      balanceUSDT: number;
      usdtAddress?: string;
      totalDeposit: number;
      totalWithdraw: number;
      totalTradeCount: number;
      totalTradeAmount: number;
      totalTradeAmountWin: number;
      totalTradeAmountLose: number;
      totalTradeAmountDraw: number;
      totalTradeWinCount: number;
      totalTradeLoseCount: number;
      totalTradeDrawCount: number;
      totalVolumnTrade: number;
      totalOrderTradeSell: number;
      totalOrderTradeBuy: number;
      totalCommission: number;
      totalRewardFirstDeposit: number;
      totalRewardMembersFirstDeposit: number;
      totalRefundTradeAmount: number;
      totalDailyQuestRewards: number;
    };
    hierarchy: {
      level1: { count: number; vipCount: number };
      level2: { count: number; vipCount: number };
      level3: { count: number; vipCount: number };
      level4: { count: number; vipCount: number };
      level5: { count: number; vipCount: number };
      level6: { count: number; vipCount: number };
      level7: { count: number; vipCount: number };
    };
    networkSummary: {
      totalMembers: number;
      totalVip: number;
      monthlyGrowth: number;
      totalCommission: number;
    };
    inviter?: {
      email: string;
      nickname: string;
    };
  };
}
```

### 2. Balance Management APIs

```typescript
// POST /api/admin/customers/{customerId}/balance/add
interface AddBalanceRequest {
  amount: number;
  note?: string;
}

interface AddBalanceResponse {
  success: boolean;
  message: string;
  data: {
    newBalance: number;
    transactionId: string;
  };
}

// POST /api/admin/customers/{customerId}/balance/subtract
interface SubtractBalanceRequest {
  amount: number;
  note?: string;
}

interface SubtractBalanceResponse {
  success: boolean;
  message: string;
  data: {
    newBalance: number;
    transactionId: string;
  };
}
```

### 3. VIP Management API

```typescript
// PUT /api/admin/customers/{customerId}/vip-level
interface UpdateVipLevelRequest {
  newLevel: number; // 0-7
  note?: string;
}

interface UpdateVipLevelResponse {
  success: boolean;
  message: string;
  data: {
    oldLevel: number;
    newLevel: number;
    upgradeFee?: number;
  };
}
```

### 4. Marketing Account API

```typescript
// PUT /api/admin/customers/{customerId}/marketing-status
interface UpdateMarketingStatusRequest {
  isAccountMarketing: boolean;
}

interface UpdateMarketingStatusResponse {
  success: boolean;
  message: string;
  data: {
    isAccountMarketing: boolean;
  };
}
```

### 5. Deposits & Withdrawals APIs

```typescript
// GET /api/admin/customers/{customerId}/deposits
interface DepositsRequest {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
}

interface DepositsResponse {
  success: boolean;
  data: {
    deposits: Array<{
      id: number;
      usdtAmount: number;
      bonusAmount: number;
      fromAddress: string;
      toAddress: string;
      txHash: string;
      asset: string;
      status: string;
      chain: string;
      createdAt: number;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    summary: {
      totalSuccess: number;
      totalPending: number;
      totalFailed: number;
    };
  };
}

// GET /api/admin/customers/{customerId}/withdrawals
interface WithdrawalsRequest {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'SUCCESS' | 'REJECTED';
  type?: 'INTERNAL' | 'EXTERNAL';
  fromDate?: string;
  toDate?: string;
}

interface WithdrawalsResponse {
  success: boolean;
  data: {
    withdrawals: Array<{
      id: number;
      withdrawCode: string;
      amount: number;
      feeWithdraw: number;
      status: string;
      type: string;
      txHash?: string;
      fromAddress?: string;
      toAddress?: string;
      reasonRejected?: string;
      createdAt: number;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    summary: {
      totalSuccess: number;
      totalPending: number;
      totalRejected: number;
    };
  };
}
```

### 6. Transactions APIs

```typescript
// GET /api/admin/customers/{customerId}/usdt-transactions
interface USDTTransactionsResponse {
  success: boolean;
  data: {
    transactions: Array<{
      id: number;
      type: string;
      amount: number;
      balanceUSDT: number;
      status: string;
      note?: string;
      txHash?: string;
      description?: string;
      fromAddress?: string;
      toAddress?: string;
      toCustomerId?: number;
      toNickname?: string;
      referenceId?: string;
      createdAt: number;
    }>;
    pagination: PaginationInfo;
  };
}

// GET /api/admin/customers/{customerId}/wallet-transactions
interface WalletTransactionsResponse {
  success: boolean;
  data: {
    transactions: Array<{
      id: number;
      email: string;
      nickname: string;
      amount: number;
      balanceUSDT: number;
      balance: number;
      status: string;
      type: string;
      createdAt: number;
    }>;
    pagination: PaginationInfo;
  };
}
```

### 7. VIP & Commission APIs

```typescript
// GET /api/admin/customers/{customerId}/vip-commissions
interface VipCommissionsResponse {
  success: boolean;
  data: {
    commissions: Array<{
      id: number;
      fromCustomerId: number;
      fromCustomerNickname: string;
      levelReferral: number;
      commissionType: string;
      amount: number;
      type: string;
      value: number;
      vipLevel: number;
      sourceAmount: number;
      sourceOrderId?: number;
      sourceTransactionId?: number;
      sourceDepositId?: number;
      status: string;
      paidAt?: number;
      period?: string;
      description?: string;
      createdAt: number;
    }>;
    pagination: PaginationInfo;
    summary: {
      totalCommission: number;
      thisMonthCommission: number;
      lastMonthCommission: number;
      pendingCommission: number;
    };
  };
}

// GET /api/admin/customers/{customerId}/daily-statistics
interface DailyStatisticsResponse {
  success: boolean;
  data: {
    statistics: Array<{
      date: string;
      deposit: number;
      withdraw: number;
      win: number;
      lose: number;
      beforeBalance: number;
      afterBalance: number;
      receive: number;
      transfer: number;
      totalOrder: number;
      totalWin: number;
      totalLose: number;
      totalDraw: number;
      totalBuy: number;
      totalSell: number;
      totalAmountWin: number;
      totalAmountLose: number;
      totalVolume: number;
      commissionBalance: number;
      totalMember: number;
      totalMemberVipF1: number;
      totalOrderF1: number;
      winRate?: number;
      profitLossRatio?: number;
      dailyProfitLoss: number;
    }>;
    chartData: {
      dates: string[];
      profitLoss: number[];
      volume: number[];
      orders: number[];
      winRate: number[];
    };
  };
}
```

---

## 🛠️ Implementation Guidelines

### 1. Folder Structure Detail
```
src/pages/admin/customers/CustomerDetail/
├── index.tsx                     // Main container component
├── CustomerDetail.less           // Main styles
├── components/
│   ├── CustomerHeader/
│   │   ├── index.tsx
│   │   └── CustomerHeader.less
│   ├── SummaryCards/
│   │   ├── index.tsx
│   │   └── SummaryCards.less
│   ├── TabContainer/
│   │   ├── index.tsx
│   │   └── TabContainer.less
│   └── tabs/
│       ├── OverviewTab/
│       │   ├── index.tsx
│       │   ├── OverviewTab.less
│       │   ├── NetworkHierarchyTree.tsx
│       │   ├── FinancialOverview.tsx
│       │   └── CustomerActions.tsx
│       ├── DepositsWithdrawalsTab/
│       │   ├── index.tsx
│       │   ├── DepositsWithdrawalsTab.less
│       │   ├── DepositsTable.tsx
│       │   ├── WithdrawalsTable.tsx
│       │   └── TransactionSummary.tsx
│       ├── TransactionsTab/
│       │   ├── index.tsx
│       │   ├── TransactionsTab.less
│       │   ├── USDTTransactions.tsx
│       │   └── WalletTransactions.tsx
│       ├── TradingHistoryTab/
│       │   ├── index.tsx
│       │   ├── TradingHistoryTab.less
│       │   ├── TradingChart.tsx
│       │   ├── OrdersTable.tsx
│       │   └── PerformanceMetrics.tsx
│       └── VipCommissionTab/
│           ├── index.tsx
│           ├── VipCommissionTab.less
│           ├── VipInfo.tsx
│           ├── CommissionTable.tsx
│           └── CommissionChart.tsx
├── hooks/
│   ├── useCustomerData.ts        // Main data fetching hook
│   ├── useCustomerActions.ts     // Action hooks (add/subtract money, etc.)
│   ├── useNetworkHierarchy.ts    // Network tree data
│   ├── useDepositsWithdrawals.ts // Deposits & withdrawals data
│   ├── useTransactions.ts        // Transaction data
│   ├── useTradingHistory.ts      // Trading data
│   └── useVipCommissions.ts      // VIP & commission data
├── types/
│   ├── customer.types.ts         // Customer related types
│   ├── transaction.types.ts      // Transaction types
│   ├── vip.types.ts             // VIP system types
│   └── api.types.ts             // API response types
└── utils/
    ├── formatters.ts            // Number, date formatters
    ├── constants.ts             // Constants (status maps, etc.)
    └── helpers.ts               // Helper functions
```

### 2. Custom Hooks Implementation

```typescript
// hooks/useCustomerData.ts
import { useState, useEffect } from 'react';
import { customerApi } from '../../../services/api';
import { CustomerDetailData } from '../types/customer.types';

export const useCustomerData = (customerId: number) => {
  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerApi.getCustomerDetail(customerId);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

// hooks/useCustomerActions.ts
import { customerApi } from '../../../services/api';

export const useCustomerActions = () => {
  const addBalance = async (customerId: number, amount: number, note?: string) => {
    const response = await customerApi.addBalance(customerId, { amount, note });
    return response.data;
  };

  const subtractBalance = async (customerId: number, amount: number, note?: string) => {
    const response = await customerApi.subtractBalance(customerId, { amount, note });
    return response.data;
  };

  const updateVipLevel = async (customerId: number, newLevel: number) => {
    const response = await customerApi.updateVipLevel(customerId, { newLevel });
    return response.data;
  };

  const updateMarketingStatus = async (customerId: number, isAccountMarketing: boolean) => {
    const response = await customerApi.updateMarketingStatus(customerId, { isAccountMarketing });
    return response.data;
  };

  return {
    addBalance,
    subtractBalance,
    updateVipLevel,
    updateMarketingStatus
  };
};
```

### 3. Responsive Design Classes

```less
// CustomerDetail.less - Responsive utilities
.responsive-grid {
  display: grid;
  gap: 16px;
  
  &--4-cols {
    grid-template-columns: repeat(4, 1fr);
    
    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  &--2-cols {
    grid-template-columns: 65% 35%;
    
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
}

.mobile-stack {
  @media (max-width: 768px) {
    .ant-col {
      margin-bottom: 16px;
    }
  }
}

.scroll-table {
  .ant-table-tbody {
    max-height: 400px;
    overflow-y: auto;
  }
}
```

### 4. Error Handling & Loading States

```typescript
// components/LoadingState.tsx
import React from 'react';
import { Spin, Result } from 'antd';

interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ loading, error, children }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Lỗi tải dữ liệu"
        subTitle={error}
        extra={[
          <Button type="primary" key="retry" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        ]}
      />
    );
  }

  return <>{children}</>;
};
```

### 5. Utility Functions

```typescript
// utils/formatters.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const truncateAddress = (address: string, length: number = 6): string => {
  if (!address) return '';
  return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
};

// utils/constants.ts
export const STATUS_COLORS = {
  SUCCESS: 'success',
  PENDING: 'warning',
  FAILED: 'error',
  REJECTED: 'error',
  APPROVED: 'success',
  BLOCKED: 'error',
  ACTIVE: 'success'
} as const;

export const VIP_LEVELS = [
  { value: 0, label: 'Cấp 0 (Thường)' },
  { value: 1, label: 'Cấp 1' },
  { value: 2, label: 'Cấp 2' },
  { value: 3, label: 'Cấp 3' },
  { value: 4, label: 'Cấp 4' },
  { value: 5, label: 'Cấp 5' },
  { value: 6, label: 'Cấp 6' },
  { value: 7, label: 'Cấp 7' }
];

export const TRANSACTION_TYPES = {
  DEPOSIT: 'Nạp tiền',
  WITHDRAW: 'Rút tiền',
  PAYMENT: 'Thanh toán',
  DEPOSIT_INTERNAL: 'Nạp nội bộ',
  WITHDRAW_INTERNAL: 'Rút nội bộ'
} as const;
```

---

## ✅ Checklist Implementation

### Phase 1: Setup & Structure
- [ ] Tạo folder structure theo specification
- [ ] Setup TypeScript types
- [ ] Install dependencies (Ant Design v4, LESS)
- [ ] Setup routing cho customer detail page

### Phase 2: Core Components
- [ ] Implement CustomerHeader component
- [ ] Implement SummaryCards component  
- [ ] Implement TabContainer với navigation
- [ ] Setup responsive grid system

### Phase 3: Tab Implementation
- [ ] **OverviewTab**: Customer info, actions, network tree
- [ ] **DepositsWithdrawalsTab**: Tables với filtering
- [ ] **TransactionsTab**: USDT và Wallet transactions
- [ ] **TradingHistoryTab**: Charts và orders table
- [ ] **VipCommissionTab**: VIP info và commission data

### Phase 4: API Integration
- [ ] Setup API service layer
- [ ] Implement data fetching hooks
- [ ] Handle loading và error states
- [ ] Add data refresh mechanisms

### Phase 5: Polish & Optimization
- [ ] Mobile responsive testing
- [ ] Performance optimization
- [ ] Error boundary implementation
- [ ] Unit testing key components

---

## 📞 Support & Questions

Nếu có bất kỳ câu hỏi nào trong quá trình implementation:

1. **Component Structure**: Tham khảo folder structure chi tiết ở trên
2. **API Integration**: Kiểm tra API specs và response types
3. **Styling**: Sử dụng LESS variables và responsive utilities
4. **State Management**: Ưu tiên custom hooks cho data management

**Lưu ý quan trọng:**
- Luôn handle loading và error states
- Implement responsive design từ đầu
- Sử dụng TypeScript cho type safety
- Follow Ant Design v4 guidelines
- Test trên multiple screen sizes

Chúc team implementation thành công! 🚀 