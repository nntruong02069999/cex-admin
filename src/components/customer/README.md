# Customer Detail Page

A comprehensive customer management interface built with React, TypeScript, Ant Design 4, and LESS stylesheets. This component provides detailed customer information, financial data, and administrative controls for a cryptocurrency exchange admin panel.

## 🏗️ Architecture

### Component Structure
```
src/components/customer/
├── CustomerDetail/           # Main container component
├── CustomerHeader/           # Header with breadcrumb and actions
├── SummaryCards/            # Financial summary cards
├── TabContainer/            # Tab navigation component
├── OverviewTab/             # Customer overview and info
│   ├── CustomerInfo/        # Basic customer information
│   ├── FinancialOverview/   # Financial summary
│   └── NetworkHierarchy/    # Referral network
├── DepositsWithdrawalsTab/  # Deposit/withdrawal history
├── TransactionsTab/         # USDT and wallet transactions
├── TradingHistoryTab/       # Trading performance metrics
├── VipCommissionTab/        # VIP status and commissions
├── types/                   # TypeScript definitions
├── utils/                   # Helper functions and constants
└── hooks/                   # Custom React hooks
```

### Technology Stack
- **React 17** with TypeScript
- **Ant Design 4.16.13** UI framework
- **LESS** stylesheets with modular organization
- **Custom Hooks** for data management
- **Responsive Design** with mobile-first approach
- **Mock API Integration** with realistic data

## 🎨 Design Features

### Responsive Design
- **Mobile-first approach** with breakpoints at 480px, 576px, 768px, 992px
- **Flexible grid layouts** that adapt to screen size
- **Collapsible components** for mobile optimization
- **Touch-friendly interactions** on mobile devices

### UI Components
- **Color-coded status indicators** for quick status recognition
- **Interactive cards** with hover effects and animations
- **Data visualization** with progress bars and statistics
- **Comprehensive tables** with sorting, filtering, and pagination

### Accessibility
- **ARIA labels** and semantic HTML structure
- **Keyboard navigation** support
- **Screen reader friendly** content structure
- **High contrast** color schemes for better visibility

## 📊 Features

### 5 Main Tabs

#### 1. Overview Tab (`OverviewTab/`)
- **Customer Information**: Avatar, name, VIP status, contact details
- **Financial Overview**: Balance cards with deposit, withdrawal, profit/loss
- **Network Hierarchy**: Referral tree with commission calculations
- **Quick Actions**: Balance management and VIP controls

#### 2. Deposits & Withdrawals (`DepositsWithdrawalsTab/`)
- **Summary Statistics**: Success, pending, and failed transactions
- **Split Table Layout**: Separate tables for deposits and withdrawals
- **Action Buttons**: Approve, reject, and view transaction details
- **Export Functionality**: Data export capabilities

#### 3. Transactions (`TransactionsTab/`)
- **Sub-tabs**: USDT transactions and wallet transactions
- **Transaction History**: Detailed transaction records with status tracking
- **Filtering Options**: Date range and transaction type filters
- **Real-time Status**: Live transaction status updates

#### 4. Trading History (`TradingHistoryTab/`)
- **Performance Metrics**: Win rate, total volume, current streak
- **Trading Statistics**: Detailed order history with P&L calculations
- **Chart Placeholders**: Performance visualization areas
- **Order Management**: Trade order details with result tracking

#### 5. VIP & Commission (`VipCommissionTab/`)
- **VIP Status**: Current level with upgrade progress
- **Commission Dashboard**: Total, monthly, pending commissions
- **Commission History**: Detailed commission payment records
- **Level Progression**: Visual progress tracking

## 🔧 Technical Implementation

### TypeScript Interfaces
```typescript
// Core customer data structure
interface Customer {
  id: number;
  email: string;
  nickname: string;
  avatar?: string;
  currentVipLevel: number;
  totalMember: number;
  isVerifyEmail: boolean;
  createdAt: number;
  userLoginDate?: number;
}

// Financial information
interface CustomerMoney {
  totalBalance: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalCommission: number;
  totalTradeAmount: number;
  totalTradeCount: number;
  totalTradeWinCount: number;
}
```

### Custom Hooks
- **useCustomerData**: Data fetching with loading states and error handling
- **useCustomerActions**: Action handlers for balance management and administrative tasks

### Utility Functions
- **Formatters**: Currency, date, and number formatting
- **Helpers**: Status checking, validation, and calculation utilities
- **Constants**: Status mappings, colors, and configuration values

## 📱 Responsive Breakpoints

### Mobile (≤576px)
- Single column layout
- Stacked cards and components
- Simplified navigation
- Touch-optimized interactions

### Tablet (≤768px)
- Two-column grid layouts
- Condensed information display
- Adapted table layouts
- Medium-sized components

### Desktop (≥992px)
- Full multi-column layouts
- Complete information display
- Advanced table features
- Rich interactive elements

## 🎯 Mock Data Integration

### Realistic Data Simulation
- **Customer Profiles**: Complete customer information with Vietnamese localization
- **Financial Transactions**: Realistic transaction histories with proper timestamps
- **Trading Data**: Simulated trading performance with win/loss calculations
- **Commission Records**: Commission tracking with status and payment information

### API Integration Ready
- Service layer structure for real API integration
- Error handling and loading states
- Data transformation utilities
- Caching and optimization hooks

## 🌐 Internationalization

### Vietnamese Localization
- **Admin Interface**: Vietnamese labels and messages
- **Date Formatting**: Localized date and time display
- **Currency Display**: USDT and Vietnamese Dong support
- **Status Messages**: Localized status indicators and notifications

## 🚀 Performance Optimizations

### Code Splitting
- Component-level imports
- Lazy loading for tab content
- Optimized bundle sizes

### Memory Management
- Efficient data structures
- Proper component cleanup
- Optimized re-rendering

### Styling Optimizations
- LESS variable usage for consistency
- Modular stylesheet organization
- CSS-in-JS for dynamic styles

## 📝 Usage Example

```typescript
import CustomerDetail from '@/components/customer/CustomerDetail';

// Use in your routing system
<Route path="/customer/:customerId" component={CustomerDetail} />

// Or directly with customer ID
<CustomerDetail customerId={123} />
```

## 🔄 Future Enhancements

### Potential Improvements
- Real-time WebSocket integration for live updates
- Advanced charting with Chart.js or D3.js
- Enhanced filtering and search capabilities
- Bulk operations for administrative tasks
- Advanced export options (PDF, Excel)
- Audit trail and activity logging

### API Integration
- Replace mock data with real API calls
- Implement proper error handling and retry logic
- Add caching layer for improved performance
- Implement optimistic updates for better UX

## 📋 Development Notes

### Code Quality
- **TypeScript**: Full type safety with strict mode
- **ESLint**: Consistent code style and quality
- **LESS**: Modular and maintainable stylesheets
- **Component Architecture**: Reusable and maintainable components

### Testing Considerations
- Unit tests for utility functions
- Component testing for UI interactions
- Integration tests for data flow
- Accessibility testing for compliance

This implementation provides a solid foundation for customer management in a cryptocurrency exchange admin panel, with room for future enhancements and real API integration.