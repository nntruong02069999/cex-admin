import React, { useState } from 'react';
import { Breadcrumb, Spin, Result, Button, Typography } from 'antd';
import { HomeOutlined, TeamOutlined, ReloadOutlined } from '@ant-design/icons';
import { useCustomerList } from '../hooks/useCustomerList';
import CustomerListFilters from './CustomerListFilters';
import CustomerListTable from './CustomerListTable';
import ColumnCustomizer, { loadColumnPreferences } from './ColumnCustomizer';
import { ColumnConfig } from './types';
import './CustomerList.less';

const { Text } = Typography;

const CustomerList: React.FC = () => {
  const {
    data,
    total,
    loading,
    error,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    refetch,
    pagination,
  } = useCustomerList();

  const [columns, setColumns] = useState<ColumnConfig[]>(loadColumnPreferences);

  if (error && data.length === 0) {
    return (
      <div className="customer-list">
        <Result
          status="error"
          title="Lỗi tải dữ liệu"
          subTitle={error}
          extra={[
            <Button
              type="primary"
              key="retry"
              icon={<ReloadOutlined />}
              onClick={refetch}
            >
              Thử lại
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="customer-list">
      {/* Breadcrumb */}
      <div className="customer-list__header">
        <Breadcrumb>
          <Breadcrumb.Item href="/">
            <HomeOutlined /> Admin
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <TeamOutlined /> Khách hàng
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Filters */}
      <CustomerListFilters
        filters={filters}
        updateFilter={updateFilter}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />

      {/* Summary Bar */}
      <div className="customer-list__summary">
        <Text type="secondary">
          {loading ? (
            'Đang tải...'
          ) : (
            <>
              Hiển thị{' '}
              <Text strong>
                {Math.min((filters.skip || 0) + 1, total)}-
                {Math.min((filters.skip || 0) + (filters.limit || 20), total)}
              </Text>{' '}
              / <Text strong>{total.toLocaleString()}</Text> khách hàng
            </>
          )}
        </Text>
        <div className="customer-list__summary-actions">
          <Button
            icon={<ReloadOutlined />}
            size="small"
            type="text"
            onClick={refetch}
          >
            Làm mới
          </Button>
          <ColumnCustomizer columns={columns} onChange={setColumns} />
        </div>
      </div>

      {/* Table */}
      <CustomerListTable
        data={data}
        loading={loading}
        columns={columns}
        pagination={pagination}
        onRefresh={refetch}
      />
    </div>
  );
};

export default CustomerList;
