# House Wallet Admin Frontend Specification
**AI Agent Coding Instructions**

## 📋 Overview & Mission
Build a comprehensive House Wallet Management admin interface using React 17, Ant Design 4, and Less CSS. This system manages cryptocurrency wallets on Binance Smart Chain (BSC) with full CRUD operations for wallet configurations and rules, plus read-only transaction monitoring.

## 🛠 Technology Stack
- **React 17** - Functional components with hooks
- **Ant Design 4** - UI component library
- **Less CSS** - Modular styling approach
- **TypeScript** - Type safety and interfaces
- **Axios** - HTTP client for API calls
- **BSC Integration** - Blockchain transaction monitoring

## 📁 Project Structure
```
src/
├── pages/
│   └── HouseWallet/
│       ├── index.tsx                    // Main container page
│       └── index.less                   // Main page styles
├── components/
│   └── HouseWallet/
│       ├── WalletConfig/
│       │   ├── WalletConfigTable.tsx    // Config table component
│       │   ├── WalletConfigForm.tsx     // Create/edit form
│       │   ├── WalletConfigModal.tsx    // Modal wrapper
│       │   └── WalletConfig.less        // Config styles
│       ├── WalletRule/
│       │   ├── WalletRuleTable.tsx      // Rules table component
│       │   ├── WalletRuleForm.tsx       // Rule create/edit form
│       │   ├── WalletRuleModal.tsx      // Rule modal wrapper
│       │   └── WalletRule.less          // Rule styles
│       ├── WithdrawTransaction/
│       │   ├── WithdrawTable.tsx        // Transaction table
│       │   ├──  .tsx  // Transaction details
│       │   └── WithdrawTransaction.less // Transaction styles
│       ├── PayoutTransaction/
│       │   ├── PayoutTable.tsx          // Payout table
│       │   ├── PayoutDetailModal.tsx    // Payout details
│       │   ├── PayoutRetryModal.tsx     // Retry failed payouts
│       │   └── PayoutTransaction.less   // Payout styles
│       └── Common/
│           ├── StatusBadge.tsx          // Status indicator
│           ├── BSCScanLink.tsx          // Blockchain explorer links
│           ├── AmountDisplay.tsx        // Currency formatting
│           ├── DashboardStats.tsx       // Summary statistics
│           └── Common.less              // Shared styles
├── services/
│   └── houseWallet.service.ts           // All API business logic
├── types/
│   └── houseWallet.types.ts             // TypeScript interfaces
├── utils/
│   ├── bscScan.utils.ts                 // BSCScan URL generators
│   ├── format.utils.ts                  // Number/date formatting
│   └── validation.utils.ts              // Form validation helpers
└── constants/
    └── houseWallet.constants.ts         // Enums and constants
```

## 🎯 Core Requirements

### Main Page Layout
Create a tabbed interface with:
1. **Dashboard Stats** - Quick overview cards
2. **Four Main Tabs**:
   - Wallet Configuration (CRUD)
   - Wallet Rules (CRUD)  
   - Withdraw Transactions (Read-only)
   - Payout Transactions (Read-only)

### Component Architecture Rules
- **Container Components**: Handle state and data fetching
- **Presentation Components**: Pure UI components
- **Service Layer**: All API calls isolated in service files
- **Modular Styling**: Each component has its own Less file
- **TypeScript First**: Strong typing for all props and data

## 📊 TypeScript Interfaces

```typescript
// types/houseWallet.types.ts

export interface WalletConfig {
  id: number;
  walletType: 'HOUSE_MAIN' | 'FEE_PAYMENT' | 'CUSTOMER_PAYOUT';
  address: string;
  privateKey?: string;
  balance?: number;
  balanceUsdt?: number;
  minBalance?: number;
  maxBalance?: number;
  isActive: boolean;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateWalletData {
  walletType: 'HOUSE_MAIN' | 'FEE_PAYMENT' | 'CUSTOMER_PAYOUT';
  address: string;
  privateKey?: string;
  description?: string;
  minBalance?: number;
  maxBalance?: number;
}

export interface UpdateWalletData {
  minBalance?: number;
  maxBalance?: number;
  description?: string;
  isActive?: boolean;
}

export interface WalletRule {
  id: number;
  walletId: number;
  wallet?: WalletConfig;
  triggerType: 'BALANCE_THRESHOLD' | 'TIME_BASED' | 'MANUAL';
  triggerValue?: number;
  actionType: 'TRANSFER_TO_MAIN' | 'ALERT_ADMIN' | 'PAUSE_OPERATIONS';
  targetWalletId?: number;
  targetWallet?: WalletConfig;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateRuleData {
  walletId: number;
  triggerType: 'BALANCE_THRESHOLD' | 'TIME_BASED' | 'MANUAL';
  triggerValue?: number;
  actionType: 'TRANSFER_TO_MAIN' | 'ALERT_ADMIN' | 'PAUSE_OPERATIONS';
  targetWalletId?: number;
}

export interface WithdrawTransaction {
  id: number;
  fromCustomerId: number;
  fromWalletAddress?: string;
  toWalletAddress?: string;
  toWalletId: number;
  toWallet?: WalletConfig;
  amount: number;
  txHash?: string;
  feeAmount?: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  withdrawType: 'MANUAL' | 'AUTOMATED' | 'SCHEDULED';
  initiatedBy: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface PayoutTransaction {
  id: number;
  customerId: number;
  fromWalletId: number;
  fromWallet?: WalletConfig;
  amount: number;
  toAddress: string;
  txHash?: string;
  feeAmount?: number;
  withdrawRequestId?: string;
  orderId?: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'INSUFFICIENT_FUNDS' | 'INVALID_ADDRESS';
  initiatedBy: string;
  processedBy?: string;
  processedAt?: number;
  notes?: string;
  failReason?: string;
  retryCount?: number;
  maxRetries?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardStats {
  totalWallets: number;
  activeWallets: number;
  totalBalance: number;
  totalBalanceUsdt: number;
  pendingTransactions: number;
  failedTransactions: number;
  activeRules: number;
  criticalAlerts: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  walletType?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

## 🔧 Service Layer Implementation

```typescript
// services/houseWallet.service.ts
import axios from 'axios';
import { message } from 'antd';
import {
  WalletConfig,
  CreateWalletData,
  UpdateWalletData,
  WalletRule,
  CreateRuleData,
  WithdrawTransaction,
  PayoutTransaction,
  DashboardStats,
  QueryParams
} from '../types/houseWallet.types';

const API_BASE = '/admin/house-wallet';

export class HouseWalletService {
  // ============================================================================
  // DASHBOARD STATS
  // ============================================================================
  
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${API_BASE}/dashboard/stats`);
      return response.data.data;
    } catch (error) {
      message.error('Failed to load dashboard stats');
      throw error;
    }
  }

  // ============================================================================
  // WALLET CONFIG CRUD OPERATIONS
  // ============================================================================
  
  static async getWalletConfigs(params?: QueryParams): Promise<{data: WalletConfig[], total: number}> {
    try {
      const response = await axios.get(`${API_BASE}/configs/list`, { params });
      return {
        data: response.data.data,
        total: response.data.count
      };
    } catch (error) {
      message.error('Failed to load wallet configurations');
      throw error;
    }
  }

  static async createWalletConfig(data: CreateWalletData): Promise<WalletConfig> {
    try {
      const response = await axios.post(`${API_BASE}/configs/create`, data);
      message.success('Wallet configuration created successfully');
      return response.data.data;
    } catch (error) {
      message.error('Failed to create wallet configuration');
      throw error;
    }
  }

  static async updateWalletConfig(id: number, data: UpdateWalletData): Promise<WalletConfig> {
    try {
      const response = await axios.put(`${API_BASE}/configs/${id}/update`, data);
      message.success('Wallet configuration updated successfully');
      return response.data.data;
    } catch (error) {
      message.error('Failed to update wallet configuration');
      throw error;
    }
  }

  static async deleteWalletConfig(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/configs/${id}/delete`);
      message.success('Wallet configuration deleted successfully');
    } catch (error) {
      message.error('Failed to delete wallet configuration');
      throw error;
    }
  }

  static async syncWalletBalance(id: number): Promise<{balance: number, balanceUsdt: number}> {
    try {
      const response = await axios.post(`${API_BASE}/configs/${id}/sync-balance`);
      message.success('Balance synchronized successfully');
      return response.data.data;
    } catch (error) {
      message.error('Failed to synchronize balance');
      throw error;
    }
  }

  // ============================================================================
  // WALLET RULES CRUD OPERATIONS
  // ============================================================================
  
  static async getWalletRules(params?: QueryParams): Promise<{data: WalletRule[], total: number}> {
    try {
      const response = await axios.get(`${API_BASE}/rules/list`, { params });
      return {
        data: response.data.data,
        total: response.data.count
      };
    } catch (error) {
      message.error('Failed to load wallet rules');
      throw error;
    }
  }

  static async createWalletRule(data: CreateRuleData): Promise<WalletRule> {
    try {
      const response = await axios.post(`${API_BASE}/rules/create`, data);
      message.success('Wallet rule created successfully');
      return response.data.data;
    } catch (error) {
      message.error('Failed to create wallet rule');
      throw error;
    }
  }

  static async updateWalletRule(id: number, data: Partial<CreateRuleData>): Promise<WalletRule> {
    try {
      const response = await axios.put(`${API_BASE}/rules/${id}/update`, data);
      message.success('Wallet rule updated successfully');
      return response.data.data;
    } catch (error) {
      message.error('Failed to update wallet rule');
      throw error;
    }
  }

  static async deleteWalletRule(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/rules/${id}/delete`);
      message.success('Wallet rule deleted successfully');
    } catch (error) {
      message.error('Failed to delete wallet rule');
      throw error;
    }
  }

  // ============================================================================
  // READ-ONLY TRANSACTION LISTS
  // ============================================================================
  
  static async getWithdrawTransactions(params?: QueryParams): Promise<{data: WithdrawTransaction[], total: number}> {
    try {
      const response = await axios.get(`${API_BASE}/withdraws/list`, { params });
      return {
        data: response.data.data,
        total: response.data.count
      };
    } catch (error) {
      message.error('Failed to load withdraw transactions');
      throw error;
    }
  }

  static async getWithdrawTransactionDetails(id: number): Promise<WithdrawTransaction> {
    try {
      const response = await axios.get(`${API_BASE}/withdraws/${id}/details`);
      return response.data.data;
    } catch (error) {
      message.error('Failed to load transaction details');
      throw error;
    }
  }

  static async getPayoutTransactions(params?: QueryParams): Promise<{data: PayoutTransaction[], total: number}> {
    try {
      const response = await axios.get(`${API_BASE}/payouts/list`, { params });
      return {
        data: response.data.data,
        total: response.data.count
      };
    } catch (error) {
      message.error('Failed to load payout transactions');
      throw error;
    }
  }

  static async getPayoutTransactionDetails(id: number): Promise<PayoutTransaction> {
    try {
      const response = await axios.get(`${API_BASE}/payouts/${id}/details`);
      return response.data.data;
    } catch (error) {
      message.error('Failed to load payout details');
      throw error;
    }
  }

  static async retryFailedPayout(id: number): Promise<PayoutTransaction> {
    try {
      const response = await axios.post(`${API_BASE}/payouts/${id}/retry`);
      message.success('Payout retry initiated successfully');
      return response.data.data;
    } catch (error) {
      message.error('Failed to retry payout');
      throw error;
    }
  }
}
```

## 🎨 Ant Design Component Specifications

### Main Page Container
```typescript
// pages/HouseWallet/index.tsx
import React, { useState, useEffect } from 'react';
import { Tabs, Card, Row, Col, Spin } from 'antd';
import { WalletOutlined, SettingOutlined, TransactionOutlined, PayCircleOutlined } from '@ant-design/icons';
import DashboardStats from '../../components/HouseWallet/Common/DashboardStats';
import WalletConfigTable from '../../components/HouseWallet/WalletConfig/WalletConfigTable';
import WalletRuleTable from '../../components/HouseWallet/WalletRule/WalletRuleTable';
import WithdrawTable from '../../components/HouseWallet/WithdrawTransaction/WithdrawTable';
import PayoutTable from '../../components/HouseWallet/PayoutTransaction/PayoutTable';
import { HouseWalletService } from '../../services/houseWallet.service';
import { DashboardStats as DashboardStatsType } from '../../types/houseWallet.types';
import './index.less';

const { TabPane } = Tabs;

const HouseWalletPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [activeTab, setActiveTab] = useState('configs');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const statsData = await HouseWalletService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatsRefresh = () => {
    loadDashboardStats();
  };

  return (
    <div className="house-wallet-page">
      <Card className="page-header" bordered={false}>
        <h2>House Wallet Management</h2>
        <p>Manage cryptocurrency wallets, rules, and monitor transactions</p>
      </Card>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <DashboardStats 
            stats={stats} 
            onRefresh={handleStatsRefresh}
          />
          
          <Card className="main-content" bordered={false}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              size="large"
              type="card"
            >
              <TabPane 
                tab={
                  <span>
                    <WalletOutlined />
                    Wallet Configuration
                  </span>
                } 
                key="configs"
              >
                <WalletConfigTable onStatsChange={handleStatsRefresh} />
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <SettingOutlined />
                    Wallet Rules
                  </span>
                } 
                key="rules"
              >
                <WalletRuleTable onStatsChange={handleStatsRefresh} />
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <TransactionOutlined />
                    Withdraw Transactions
                  </span>
                } 
                key="withdraws"
              >
                <WithdrawTable />
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <PayCircleOutlined />
                    Payout Transactions
                  </span>
                } 
                key="payouts"
              >
                <PayoutTable />
              </TabPane>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
};

export default HouseWalletPage;
```

### Dashboard Statistics Component
```typescript
// components/HouseWallet/Common/DashboardStats.tsx
import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { 
  WalletOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { DashboardStats as DashboardStatsType } from '../../../types/houseWallet.types';
import './Common.less';

interface DashboardStatsProps {
  stats: DashboardStatsType | null;
  onRefresh: () => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onRefresh }) => {
  if (!stats) return null;

  return (
    <Card 
      className="dashboard-stats" 
      bordered={false}
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={onRefresh}
          type="text"
        >
          Refresh
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Wallets"
              value={stats.activeWallets}
              suffix={`/ ${stats.totalWallets}`}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Balance"
              value={stats.totalBalanceUsdt}
              precision={2}
              suffix="USDT"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Pending Transactions"
              value={stats.pendingTransactions}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Failed Transactions"
              value={stats.failedTransactions}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default DashboardStats;
```

## 🔗 BSCScan Integration

### BSCScan Utilities
```typescript
// utils/bscScan.utils.ts

// Determine network environment (you may need to adjust based on your config)
const BSC_NETWORK = process.env.REACT_APP_BSC_NETWORK || 'mainnet';

export const getBSCScanTxUrl = (txHash: string): string => {
  const baseUrl = BSC_NETWORK === 'mainnet' 
    ? 'https://bscscan.com/tx/' 
    : 'https://testnet.bscscan.com/tx/';
  return `${baseUrl}${txHash}`;
};

export const getBSCScanAddressUrl = (address: string): string => {
  const baseUrl = BSC_NETWORK === 'mainnet' 
    ? 'https://bscscan.com/address/' 
    : 'https://testnet.bscscan.com/address/';
  return `${baseUrl}${address}`;
};

export const truncateHash = (hash: string, length: number = 8): string => {
  if (!hash) return '';
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
};

export const truncateAddress = (address: string): string => {
  return truncateHash(address, 6);
};
```

### BSCScan Link Component
```typescript
// components/HouseWallet/Common/BSCScanLink.tsx
import React from 'react';
import { Button, Tooltip } from 'antd';
import { LinkOutlined, CopyOutlined } from '@ant-design/icons';
import { getBSCScanTxUrl, getBSCScanAddressUrl, truncateHash, truncateAddress } from '../../../utils/bscScan.utils';

interface BSCScanLinkProps {
  txHash?: string;
  address?: string;
  type?: 'tx' | 'address';
  showCopy?: boolean;
  truncate?: boolean;
}

const BSCScanLink: React.FC<BSCScanLinkProps> = ({ 
  txHash, 
  address, 
  type = 'tx',
  showCopy = true,
  truncate = true 
}) => {
  const hash = txHash || address;
  if (!hash) return <span>-</span>;

  const url = type === 'tx' ? getBSCScanTxUrl(hash) : getBSCScanAddressUrl(hash);
  const displayText = truncate 
    ? (type === 'tx' ? truncateHash(hash) : truncateAddress(hash))
    : hash;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    // You can add a message here if needed
  };

  return (
    <div className="bscscan-link">
      <Tooltip title={`View on BSCScan: ${hash}`}>
        <Button 
          type="link" 
          icon={<LinkOutlined />}
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          className="link-button"
        >
          {displayText}
        </Button>
      </Tooltip>
      
      {showCopy && (
        <Tooltip title="Copy to clipboard">
          <Button 
            type="text" 
            icon={<CopyOutlined />}
            onClick={handleCopy}
            size="small"
            className="copy-button"
          />
        </Tooltip>
      )}
    </div>
  );
};

export default BSCScanLink;
```

## 💰 Amount Display Component

```typescript
// components/HouseWallet/Common/AmountDisplay.tsx
import React from 'react';
import { formatNumber } from '../../../utils/format.utils';

interface AmountDisplayProps {
  amount: number;
  currency?: string;
  precision?: number;
  showSign?: boolean;
  colorful?: boolean;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({ 
  amount, 
  currency = 'USDT',
  precision = 2,
  showSign = false,
  colorful = true
}) => {
  const formattedAmount = formatNumber(amount, precision);
  const sign = showSign && amount > 0 ? '+' : '';
  
  let className = 'amount-display';
  if (colorful) {
    if (amount > 0) className += ' positive';
    else if (amount < 0) className += ' negative';
    else className += ' zero';
  }

  return (
    <span className={className}>
      {sign}{formattedAmount} {currency}
    </span>
  );
};

export default AmountDisplay;
```

## 📋 Wallet Configuration Table

```typescript
// components/HouseWallet/WalletConfig/WalletConfigTable.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Switch, 
  Popconfirm, 
  Input,
  Select,
  message,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SyncOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { HouseWalletService } from '../../../services/houseWallet.service';
import { WalletConfig, QueryParams } from '../../../types/houseWallet.types';
import WalletConfigModal from './WalletConfigModal';
import BSCScanLink from '../Common/BSCScanLink';
import AmountDisplay from '../Common/AmountDisplay';
import StatusBadge from '../Common/StatusBadge';
import './WalletConfig.less';

const { Search } = Input;
const { Option } = Select;

interface WalletConfigTableProps {
  onStatsChange?: () => void;
}

const WalletConfigTable: React.FC<WalletConfigTableProps> = ({ onStatsChange }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WalletConfig[]>([]);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WalletConfig | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set());
  
  // Filters
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    search: '',
    walletType: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await HouseWalletService.getWalletConfigs(queryParams);
      setData(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load wallet configurations:', error);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record: WalletConfig) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await HouseWalletService.deleteWalletConfig(id);
      loadData();
      onStatsChange?.();
    } catch (error) {
      console.error('Failed to delete wallet:', error);
    }
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await HouseWalletService.updateWalletConfig(id, { isActive });
      loadData();
      onStatsChange?.();
    } catch (error) {
      console.error('Failed to toggle wallet status:', error);
    }
  };

  const handleSyncBalance = async (id: number) => {
    try {
      setSyncingIds(prev => new Set(prev).add(id));
      await HouseWalletService.syncWalletBalance(id);
      loadData();
      onStatsChange?.();
    } catch (error) {
      console.error('Failed to sync balance:', error);
    } finally {
      setSyncingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleModalOk = () => {
    setModalVisible(false);
    setEditingRecord(null);
    loadData();
    onStatsChange?.();
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
  };

  const handleSearch = (value: string) => {
    setQueryParams(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleWalletTypeFilter = (value: string) => {
    setQueryParams(prev => ({ ...prev, walletType: value, page: 1 }));
  };

  const handleTableChange = (pagination: any) => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  const getWalletTypeColor = (type: string) => {
    const colors = {
      'HOUSE_MAIN': 'blue',
      'FEE_PAYMENT': 'orange',
      'CUSTOMER_PAYOUT': 'green',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const columns: ColumnsType<WalletConfig> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Wallet Type',
      dataIndex: 'walletType',
      key: 'walletType',
      width: 150,
      render: (type: string) => (
        <Tag color={getWalletTypeColor(type)}>
          {type.replace('_', ' ')}
        </Tag>
      ),
      filters: [
        { text: 'House Main', value: 'HOUSE_MAIN' },
        { text: 'Fee Payment', value: 'FEE_PAYMENT' },
        { text: 'Customer Payout', value: 'CUSTOMER_PAYOUT' },
      ],
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (address: string) => (
        <BSCScanLink address={address} type="address" />
      ),
    },
    {
      title: 'Balance',
      key: 'balance',
      width: 200,
      render: (record: WalletConfig) => (
        <div className="balance-display">
          <div>
            <AmountDisplay 
              amount={record.balanceUsdt || 0} 
              currency="USDT" 
            />
          </div>
          {record.balance && record.balance > 0 && (
            <div className="secondary-balance">
              <AmountDisplay 
                amount={record.balance} 
                currency="BNB" 
                precision={4}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Limits',
      key: 'limits',
      width: 150,
      render: (record: WalletConfig) => (
        <div className="limits-display">
          {record.minBalance !== undefined && (
            <div className="limit-item">
              Min: <AmountDisplay amount={record.minBalance} currency="USDT" />
            </div>
          )}
          {record.maxBalance !== undefined && (
            <div className="limit-item">
              Max: <AmountDisplay amount={record.maxBalance} currency="USDT" />
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: WalletConfig) => (
        <Switch 
          checked={isActive}
          onChange={(checked) => handleToggleStatus(record.id, checked)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => (
        description ? (
          <Tooltip title={description}>
            {description}
          </Tooltip>
        ) : '-'
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: WalletConfig) => (
        <Space size="small">
          <Tooltip title="Sync Balance">
            <Button
              type="text"
              icon={<SyncOutlined spin={syncingIds.has(record.id)} />}
              onClick={() => handleSyncBalance(record.id)}
              disabled={syncingIds.has(record.id)}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          
          <Popconfirm
            title="Are you sure you want to delete this wallet?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="wallet-config-table">
      <div className="table-header">
        <div className="header-left">
          <h3>Wallet Configurations</h3>
        </div>
        <div className="header-right">
          <Space>
            <Search
              placeholder="Search by address or description"
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
              enterButton={<SearchOutlined />}
            />
            
            <Select
              placeholder="Filter by type"
              allowClear
              style={{ width: 150 }}
              onChange={handleWalletTypeFilter}
            >
              <Option value="HOUSE_MAIN">House Main</Option>
              <Option value="FEE_PAYMENT">Fee Payment</Option>
              <Option value="CUSTOMER_PAYOUT">Customer Payout</Option>
            </Select>
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Create Wallet
            </Button>
          </Space>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.limit,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
        size="middle"
        scroll={{ x: 1200 }}
      />

      <WalletConfigModal
        visible={modalVisible}
        editingRecord={editingRecord}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default WalletConfigTable;
```

## 📝 Wallet Configuration Form & Modal

```typescript
// components/HouseWallet/WalletConfig/WalletConfigModal.tsx
import React from 'react';
import { Modal } from 'antd';
import WalletConfigForm from './WalletConfigForm';
import { WalletConfig } from '../../../types/houseWallet.types';

interface WalletConfigModalProps {
  visible: boolean;
  editingRecord: WalletConfig | null;
  onOk: () => void;
  onCancel: () => void;
}

const WalletConfigModal: React.FC<WalletConfigModalProps> = ({
  visible,
  editingRecord,
  onOk,
  onCancel,
}) => {
  const isEditing = !!editingRecord;
  
  return (
    <Modal
      title={isEditing ? 'Edit Wallet Configuration' : 'Create Wallet Configuration'}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <WalletConfigForm
        editingRecord={editingRecord}
        onSuccess={onOk}
        onCancel={onCancel}
      />
    </Modal>
  );
};

export default WalletConfigModal;
```

```typescript
// components/HouseWallet/WalletConfig/WalletConfigForm.tsx
import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Switch, 
  Button, 
  Space,
  Row,
  Col,
  Divider
} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, ThunderboltOutlined } from '@ant-design/icons';
import { HouseWalletService } from '../../../services/houseWallet.service';
import { WalletConfig, CreateWalletData, UpdateWalletData } from '../../../types/houseWallet.types';

const { Option } = Select;
const { TextArea } = Input;

interface WalletConfigFormProps {
  editingRecord: WalletConfig | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const WalletConfigForm: React.FC<WalletConfigFormProps> = ({
  editingRecord,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEditing = !!editingRecord;

  const walletTypeOptions = [
    { 
      value: 'HOUSE_MAIN', 
      label: 'House Main',
      description: 'Main house wallet for storing primary funds'
    },
    { 
      value: 'FEE_PAYMENT', 
      label: 'Fee Payment',
      description: 'Wallet designated for paying blockchain transaction fees'
    },
    { 
      value: 'CUSTOMER_PAYOUT', 
      label: 'Customer Payout',
      description: 'Wallet used for customer withdrawals and payouts'
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      if (isEditing) {
        const updateData: UpdateWalletData = {
          minBalance: values.minBalance,
          maxBalance: values.maxBalance,
          description: values.description,
          isActive: values.isActive,
        };
        await HouseWalletService.updateWalletConfig(editingRecord!.id, updateData);
      } else {
        const createData: CreateWalletData = {
          walletType: values.walletType,
          address: values.address,
          privateKey: values.privateKey,
          description: values.description,
          minBalance: values.minBalance,
          maxBalance: values.maxBalance,
        };
        await HouseWalletService.createWalletConfig(createData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Failed to save wallet configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePrivateKey = () => {
    // This is a placeholder - you should implement proper key generation
    const randomKey = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    form.setFieldsValue({ privateKey: randomKey });
  };

  const validateAddress = (rule: any, value: string) => {
    if (!value) return Promise.resolve();
    
    // Basic Ethereum address validation
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(value)) {
      return Promise.reject('Please enter a valid BSC address');
    }
    
    return Promise.resolve();
  };

  const validatePrivateKey = (rule: any, value: string) => {
    if (!value) return Promise.resolve();
    
    // Basic private key validation
    const keyRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!keyRegex.test(value)) {
      return Promise.reject('Please enter a valid private key (64 hex characters)');
    }
    
    return Promise.resolve();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={isEditing ? {
        walletType: editingRecord?.walletType,
        address: editingRecord?.address,
        description: editingRecord?.description,
        minBalance: editingRecord?.minBalance,
        maxBalance: editingRecord?.maxBalance,
        isActive: editingRecord?.isActive ?? true,
      } : {
        isActive: true,
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="walletType"
            label="Wallet Type"
            rules={[{ required: true, message: 'Please select wallet type' }]}
          >
            <Select
              placeholder="Select wallet type"
              disabled={isEditing}
            >
              {walletTypeOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <div>
                    <div><strong>{option.label}</strong></div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {option.description}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="address"
            label="Wallet Address"
            rules={[
              { required: true, message: 'Please enter wallet address' },
              { validator: validateAddress }
            ]}
          >
            <Input
              placeholder="0x..."
              disabled={isEditing}
            />
          </Form.Item>
        </Col>
      </Row>

      {!isEditing && (
        <Row gutter={16}>
          <Col span={20}>
            <Form.Item
              name="privateKey"
              label="Private Key"
              rules={[
                { validator: validatePrivateKey }
              ]}
            >
              <Input.Password
                placeholder="0x... (optional - can be generated)"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label=" ">
              <Button
                icon={<ThunderboltOutlined />}
                onClick={generatePrivateKey}
                style={{ width: '100%' }}
              >
                Generate
              </Button>
            </Form.Item>
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="minBalance"
            label="Minimum Balance (USDT)"
          >
            <InputNumber
              placeholder="0.00"
              min={0}
              precision={2}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="maxBalance"
            label="Maximum Balance (USDT)"
          >
            <InputNumber
              placeholder="No limit"
              min={0}
              precision={2}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              placeholder="Enter wallet description or purpose"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Form.Item>
        <Space>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? 'Update' : 'Create'} Wallet
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default WalletConfigForm;
```

## 🎯 Status Badge Component

```typescript
// components/HouseWallet/Common/StatusBadge.tsx
import React from 'react';
import { Tag } from 'antd';

interface StatusBadgeProps {
  status: string;
  type?: 'transaction' | 'payout' | 'general';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'general' }) => {
  const getStatusConfig = (status: string, type: string) => {
    const configs = {
      transaction: {
        'PENDING': { color: 'processing', text: 'Pending' },
        'SUCCESS': { color: 'success', text: 'Success' },
        'FAILED': { color: 'error', text: 'Failed' },
        'CANCELLED': { color: 'default', text: 'Cancelled' },
      },
      payout: {
        'PENDING': { color: 'processing', text: 'Pending' },
        'PROCESSING': { color: 'processing', text: 'Processing' },
        'SUCCESS': { color: 'success', text: 'Success' },
        'FAILED': { color: 'error', text: 'Failed' },
        'CANCELLED': { color: 'default', text: 'Cancelled' },
        'INSUFFICIENT_FUNDS': { color: 'warning', text: 'Insufficient Funds' },
        'INVALID_ADDRESS': { color: 'error', text: 'Invalid Address' },
      },
      general: {
        'ACTIVE': { color: 'success', text: 'Active' },
        'INACTIVE': { color: 'default', text: 'Inactive' },
        'ENABLED': { color: 'success', text: 'Enabled' },
        'DISABLED': { color: 'default', text: 'Disabled' },
      }
    };

    return configs[type as keyof typeof configs]?.[status] || 
           { color: 'default', text: status };
  };

  const config = getStatusConfig(status, type);

  return (
    <Tag color={config.color}>
      {config.text}
    </Tag>
  );
};

export default StatusBadge;
```

## 🔧 Utility Functions

```typescript
// utils/format.utils.ts

export const formatNumber = (num: number, precision: number = 2): string => {
  if (num === null || num === undefined) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(num);
};

export const formatCurrency = (amount: number, currency: string = 'USDT'): string => {
  return `${formatNumber(amount)} ${currency}`;
};

export const formatDate = (timestamp: number): string => {
  if (!timestamp) return '-';
  
  const date = new Date(timestamp * 1000); // Assuming timestamp is in seconds
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatDateShort = (timestamp: number): string => {
  if (!timestamp) return '-';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
  });
};
```

```typescript
// utils/validation.utils.ts

export const validateBSCAddress = (address: string): boolean => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validatePrivateKey = (key: string): boolean => {
  if (!key) return false;
  return /^0x[a-fA-F0-9]{64}$/.test(key);
};

export const validatePositiveNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

## 🎨 Less CSS Styling

```less
// pages/HouseWallet/index.less
.house-wallet-page {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100vh;

  .page-header {
    margin-bottom: 24px;
    
    h2 {
      margin-bottom: 8px;
      color: #1890ff;
    }
    
    p {
      margin-bottom: 0;
      color: #666;
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .main-content {
    .ant-tabs-card > .ant-tabs-content {
      margin-top: 16px;
    }
    
    .ant-tabs-tab {
      border-radius: 6px 6px 0 0;
    }
  }
}

// Global responsive adjustments
@media (max-width: 768px) {
  .house-wallet-page {
    padding: 16px;
    
    .ant-tabs-tab {
      padding: 8px 12px;
      
      .anticon {
        margin-right: 4px;
      }
    }
  }
}
```

```less
// components/HouseWallet/Common/Common.less
.dashboard-stats {
  margin-bottom: 24px;
  
  .stat-card {
    text-align: center;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    .ant-statistic-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .ant-statistic-content {
      font-size: 20px;
      font-weight: bold;
    }
  }
}

.amount-display {
  font-weight: 500;
  
  &.positive {
    color: #52c41a;
  }
  
  &.negative {
    color: #f5222d;
  }
  
  &.zero {
    color: #666;
  }
}

.bscscan-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  .link-button {
    padding: 0;
    height: auto;
    font-size: 12px;
    
    .anticon {
      margin-right: 4px;
    }
  }
  
  .copy-button {
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background-color: #f0f0f0;
      border-radius: 2px;
    }
  }
}

.status-badge {
  .ant-tag {
    margin: 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
}
```

```less
// components/HouseWallet/WalletConfig/WalletConfig.less
.wallet-config-table {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px 0;
    
    .header-left h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .header-right {
      .ant-input-search {
        .ant-btn {
          border-left: 0;
        }
      }
    }
  }

  .balance-display {
    .secondary-balance {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
  }

  .limits-display {
    .limit-item {
      font-size: 12px;
      margin-bottom: 2px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .ant-table {
    .ant-table-thead > tr > th {
      background-color: #fafafa;
      border-bottom: 2px solid #e8e8e8;
      font-weight: 600;
    }
    
    .ant-table-tbody > tr:hover > td {
      background-color: #f5f5f5;
    }
  }
}

// Modal and Form Styles
.ant-modal {
  .ant-form-item-label > label {
    font-weight: 500;
  }
  
  .ant-input-number {
    width: 100%;
  }
  
  .ant-select-selection-item {
    > div:first-child {
      font-weight: 500;
    }
    
    > div:last-child {
      color: #666;
      font-size: 12px;
    }
  }
}
```

## 📱 Responsive Design Considerations

```less
// Responsive breakpoints
@screen-xs: 480px;
@screen-sm: 576px;  
@screen-md: 768px;
@screen-lg: 992px;
@screen-xl: 1200px;
@screen-xxl: 1600px;

// Mobile-first responsive design
@media (max-width: @screen-md) {
  .house-wallet-page {
    .dashboard-stats {
      .ant-row {
        .ant-col {
          margin-bottom: 16px;
        }
      }
    }
    
    .table-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
      
      .header-right {
        .ant-space {
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }
      }
    }
    
    .ant-table {
      .ant-table-content {
        overflow-x: auto;
      }
    }
  }
}

@media (max-width: @screen-sm) {
  .house-wallet-page {
    padding: 12px;
    
    .ant-tabs-card > .ant-tabs-content {
      margin-top: 12px;
    }
    
    .dashboard-stats .stat-card {
      margin-bottom: 12px;
    }
  }
}
```

## 🏁 Final Implementation Notes

### Implementation Order:
1. **Setup Types & Constants** - Define all TypeScript interfaces
2. **Create Service Layer** - Implement all API calls
3. **Build Common Components** - StatusBadge, BSCScanLink, AmountDisplay
4. **Implement Dashboard Stats** - Overview statistics component
5. **Create Wallet Config Tab** - Full CRUD functionality
6. **Create Wallet Rules Tab** - Full CRUD functionality  
7. **Create Transaction Tabs** - Read-only lists with details
8. **Add Responsive Styling** - Mobile-friendly design
9. **Testing & Polish** - Error handling, edge cases

### Key Features to Implement:
- ✅ **Real-time Updates** - WebSocket integration for live data
- ✅ **BSCScan Integration** - Clickable links to blockchain explorer
- ✅ **Responsive Design** - Mobile-friendly interface  
- ✅ **Form Validation** - Client-side and server-side validation
- ✅ **Error Handling** - Comprehensive error states and messaging
- ✅ **Loading States** - User feedback during async operations
- ✅ **Accessibility** - WCAG compliance and keyboard navigation

### Testing Requirements:
- **Unit Tests** - Test all components with Jest + React Testing Library
- **Integration Tests** - Test API integration and data flow
- **E2E Tests** - Test complete user workflows
- **Responsive Tests** - Test across different screen sizes

This specification provides complete implementation guidance for building a professional House Wallet Management interface using React 17, Ant Design 4, and Less CSS with proper separation of concerns and modern development practices.