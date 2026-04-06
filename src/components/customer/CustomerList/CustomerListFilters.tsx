import React, { useState, useRef, useCallback } from 'react';
import {
  Input,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Row,
  Col,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { CustomerListParams, CustomerDocumentStatus } from './types';
import { VIP_LEVELS } from '../utils/constants';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface CustomerListFiltersProps {
  filters: CustomerListParams;
  updateFilter: (key: keyof CustomerListParams, value: any) => void;
  setFilters: (filters: CustomerListParams) => void;
  resetFilters: () => void;
}

const CustomerListFilters: React.FC<CustomerListFiltersProps> = ({
  filters,
  updateFilter,
  setFilters,
  resetFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Advanced filter local state — only applied on "Áp dụng"
  const [advancedLocal, setAdvancedLocal] = useState<Partial<CustomerListParams>>({
    vipLevel: filters.vipLevel,
    minBalance: filters.minBalance,
    maxBalance: filters.maxBalance,
    minTotalDeposit: filters.minTotalDeposit,
    maxTotalDeposit: filters.maxTotalDeposit,
    inviterEmail: filters.inviterEmail,
    inviterUuid: filters.inviterUuid,
    createdFrom: filters.createdFrom,
    createdTo: filters.createdTo,
    sortBy: filters.sortBy || 'id',
    sortOrder: filters.sortOrder || 'desc',
  });

  // Debounced search
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      updateFilter('search', value || undefined);
    }, 300);
  }, [updateFilter]);

  // Apply advanced filters
  const handleApplyAdvanced = () => {
    setFilters({
      ...filters,
      ...advancedLocal,
      skip: 0, // Reset pagination
    });
  };

  // Reset all filters
  const handleResetAll = () => {
    setSearchValue('');
    setAdvancedLocal({
      vipLevel: undefined,
      minBalance: undefined,
      maxBalance: undefined,
      minTotalDeposit: undefined,
      maxTotalDeposit: undefined,
      inviterEmail: undefined,
      inviterUuid: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      sortBy: 'id',
      sortOrder: 'desc',
    });
    resetFilters();
  };

  // Date range change handler
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setAdvancedLocal(prev => ({
        ...prev,
        createdFrom: dates[0].startOf('day').valueOf(),
        createdTo: dates[1].endOf('day').valueOf(),
      }));
    } else {
      setAdvancedLocal(prev => ({
        ...prev,
        createdFrom: undefined,
        createdTo: undefined,
      }));
    }
  };

  // Count active advanced filters
  const activeAdvancedCount = [
    advancedLocal.vipLevel,
    advancedLocal.minBalance,
    advancedLocal.maxBalance,
    advancedLocal.minTotalDeposit,
    advancedLocal.maxTotalDeposit,
    advancedLocal.inviterEmail,
    advancedLocal.inviterUuid,
    advancedLocal.createdFrom,
  ].filter(v => v !== undefined && v !== null && v !== '').length;

  return (
    <div className="customer-list__filters">
      {/* Primary Filter Bar */}
      <div className="customer-list__filter-bar">
        <Input
          placeholder="Tìm theo nickname, email, UUID, ID..."
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={handleSearchChange}
          allowClear
          className="customer-list__search"
        />

        <Select
          placeholder="KYC"
          allowClear
          value={filters.statusDocument}
          onChange={(value) => updateFilter('statusDocument', value)}
          className="customer-list__filter-select"
        >
          <Option value={CustomerDocumentStatus.NOT_SUBMIT}>Chưa nộp</Option>
          <Option value={CustomerDocumentStatus.PENDING}>Chờ duyệt</Option>
          <Option value={CustomerDocumentStatus.APPROVED}>Đã duyệt</Option>
          <Option value={CustomerDocumentStatus.REJECTED}>Từ chối</Option>
        </Select>

        <Select
          placeholder="Email"
          allowClear
          value={filters.isVerifyEmail !== undefined ? String(filters.isVerifyEmail) : undefined}
          onChange={(value) => updateFilter('isVerifyEmail', value !== undefined ? value === 'true' : undefined)}
          className="customer-list__filter-select"
        >
          <Option value="true">Đã xác thực</Option>
          <Option value="false">Chưa xác thực</Option>
        </Select>

        <Select
          placeholder="MKT"
          allowClear
          value={filters.isAccountMarketing !== undefined ? String(filters.isAccountMarketing) : undefined}
          onChange={(value) => updateFilter('isAccountMarketing', value !== undefined ? value === 'true' : undefined)}
          className="customer-list__filter-select"
        >
          <Option value="true">Marketing</Option>
          <Option value="false">Thường</Option>
        </Select>

        <Select
          placeholder="VIP"
          allowClear
          value={filters.isVip !== undefined ? String(filters.isVip) : undefined}
          onChange={(value) => updateFilter('isVip', value !== undefined ? value === 'true' : undefined)}
          className="customer-list__filter-select"
        >
          <Option value="true">VIP</Option>
          <Option value="false">Không VIP</Option>
        </Select>

        <Button
          icon={showAdvanced ? <UpOutlined /> : <DownOutlined />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="customer-list__advanced-toggle"
          type={activeAdvancedCount > 0 ? 'primary' : 'default'}
          ghost={activeAdvancedCount > 0}
        >
          Bộ lọc nâng cao{activeAdvancedCount > 0 ? ` (${activeAdvancedCount})` : ''}
        </Button>
      </div>

      {/* Advanced Filters Collapse */}
      {showAdvanced && (
        <div className="customer-list__advanced-filters">
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={6}>
              <div className="customer-list__filter-group">
                <label className="customer-list__filter-label">Cấp VIP</label>
                <Select
                  placeholder="Chọn cấp VIP"
                  allowClear
                  value={advancedLocal.vipLevel}
                  onChange={(value) => setAdvancedLocal(prev => ({ ...prev, vipLevel: value }))}
                  style={{ width: '100%' }}
                >
                  {VIP_LEVELS.map(level => (
                    <Option key={level.value} value={level.value}>{level.label}</Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="customer-list__filter-group">
                <label className="customer-list__filter-label">Số dư (USDT)</label>
                <div className="customer-list__range-inputs">
                  <InputNumber
                    placeholder="Min"
                    min={0}
                    value={advancedLocal.minBalance}
                    onChange={(value) => setAdvancedLocal(prev => ({ ...prev, minBalance: value ?? undefined }))}
                    style={{ width: '50%' }}
                  />
                  <span className="customer-list__range-sep">—</span>
                  <InputNumber
                    placeholder="Max"
                    min={0}
                    value={advancedLocal.maxBalance}
                    onChange={(value) => setAdvancedLocal(prev => ({ ...prev, maxBalance: value ?? undefined }))}
                    style={{ width: '50%' }}
                  />
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="customer-list__filter-group">
                <label className="customer-list__filter-label">Tổng nạp (USDT)</label>
                <div className="customer-list__range-inputs">
                  <InputNumber
                    placeholder="Min"
                    min={0}
                    value={advancedLocal.minTotalDeposit}
                    onChange={(value) => setAdvancedLocal(prev => ({ ...prev, minTotalDeposit: value ?? undefined }))}
                    style={{ width: '50%' }}
                  />
                  <span className="customer-list__range-sep">—</span>
                  <InputNumber
                    placeholder="Max"
                    min={0}
                    value={advancedLocal.maxTotalDeposit}
                    onChange={(value) => setAdvancedLocal(prev => ({ ...prev, maxTotalDeposit: value ?? undefined }))}
                    style={{ width: '50%' }}
                  />
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="customer-list__filter-group">
                <label className="customer-list__filter-label">Ngày đăng ký</label>
                <RangePicker
                  onChange={handleDateRangeChange}
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="customer-list__filter-group">
                <label className="customer-list__filter-label">Email người mời</label>
                <Input
                  placeholder="Nhập email"
                  value={advancedLocal.inviterEmail}
                  onChange={(e) => setAdvancedLocal(prev => ({ ...prev, inviterEmail: e.target.value || undefined }))}
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="customer-list__filter-group">
                <label className="customer-list__filter-label">UUID người mời</label>
                <Input
                  placeholder="Nhập UUID"
                  value={advancedLocal.inviterUuid}
                  onChange={(e) => setAdvancedLocal(prev => ({ ...prev, inviterUuid: e.target.value || undefined }))}
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="customer-list__filter-group">
                <label className="customer-list__filter-label">Sắp xếp theo</label>
                <Select
                  value={advancedLocal.sortBy}
                  onChange={(value) => setAdvancedLocal(prev => ({ ...prev, sortBy: value }))}
                  style={{ width: '100%' }}
                >
                  <Option value="id">ID</Option>
                  <Option value="createdAt">Ngày tạo</Option>
                  <Option value="balance">Số dư</Option>
                  <Option value="totalDeposit">Tổng nạp</Option>
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="customer-list__filter-group">
                <label className="customer-list__filter-label">Thứ tự</label>
                <Select
                  value={advancedLocal.sortOrder}
                  onChange={(value) => setAdvancedLocal(prev => ({ ...prev, sortOrder: value }))}
                  style={{ width: '100%' }}
                >
                  <Option value="desc">Giảm dần</Option>
                  <Option value="asc">Tăng dần</Option>
                </Select>
              </div>
            </Col>
          </Row>

          <div className="customer-list__advanced-actions">
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleApplyAdvanced}
            >
              Áp dụng
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={handleResetAll}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerListFilters;
