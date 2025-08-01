import React from "react";
import {
  Row,
  Col,
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  InputNumber,
  Card,
  Typography,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import moment, { Moment } from "moment";
import { DepositListParams, ProviderPaymentCode } from "./types";

interface DepositFiltersProps {
  filters: DepositListParams;
  loading?: boolean;
  total?: number;
  onFiltersChange: (filters: Partial<DepositListParams>) => void;
  onSearch: () => void;
  onReset: () => void;
}

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

const DepositFilters: React.FC<DepositFiltersProps> = ({
  filters,
  loading = false,
  total = 0,
  onFiltersChange,
  onSearch,
  onReset,
}) => {
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      onFiltersChange({
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
      });
    } else {
      onFiltersChange({
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  const getDateRangeValue = (): [Moment, Moment] | null => {
    if (filters.startDate && filters.endDate) {
      return [moment(filters.startDate), moment(filters.endDate)];
    }
    return null;
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(
      filters.phone ||
      filters.orderId ||
      filters.customerId ||
      filters.gatewayOrderId ||
      filters.startDate ||
      filters.endDate ||
      filters.providerPaymentCode
    );
  };

  const getFilterSummary = () => {
    const activeFilters = [];

    if (filters.phone) activeFilters.push(`SĐT: ${filters.phone}`);
    if (filters.orderId) activeFilters.push(`Mã đơn hàng: ${filters.orderId}`);
    if (filters.customerId) activeFilters.push(`Mã KH: ${filters.customerId}`);
    if (filters.gatewayOrderId)
      activeFilters.push(`Mã cổng thanh toán: ${filters.gatewayOrderId}`);
    if (filters.providerPaymentCode)
      activeFilters.push(`Provider: ${filters.providerPaymentCode}`);
    if (filters.startDate && filters.endDate) {
      activeFilters.push(`Từ ${filters.startDate} đến ${filters.endDate}`);
    }

    return activeFilters;
  };

  // Get order options based on sort type
  const getOrderOptions = () => {
    const sortType = filters.sort;

    if (sortType === "amount" || sortType === "bonusAmount") {
      return [
        { value: "desc", label: "Cao nhất" },
        { value: "asc", label: "Thấp nhất" },
      ];
    } else {
      return [
        { value: "desc", label: "Mới nhất" },
        { value: "asc", label: "Cũ nhất" },
      ];
    }
  };

  return (
    <div className="deposit-filters">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8} lg={5}>
          <Input
            placeholder="Số điện thoại"
            prefix={<SearchOutlined />}
            value={filters.phone}
            onChange={(e) => onFiltersChange({ phone: e.target.value })}
            onPressEnter={onSearch}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={5}>
          <Input
            placeholder="Mã đơn hàng"
            value={filters.orderId}
            onChange={(e) => onFiltersChange({ orderId: e.target.value })}
            onPressEnter={onSearch}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <InputNumber
            placeholder="Mã khách hàng"
            value={filters.customerId}
            onChange={(value) =>
              onFiltersChange({ customerId: value || undefined })
            }
            style={{ width: "100%" }}
            min={1}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Input
            placeholder="Mã cổng thanh toán"
            value={filters.gatewayOrderId}
            onChange={(e) =>
              onFiltersChange({ gatewayOrderId: e.target.value })
            }
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <RangePicker
            placeholder={["Từ ngày", "Đến ngày"]}
            value={getDateRangeValue()}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
          />
        </Col>

        <Col xs={24} sm={12} md={6} lg={2}>
          <Select
            placeholder="Nhà cung cấp"
            value={filters.providerPaymentCode}
            onChange={(value) =>
              onFiltersChange({ providerPaymentCode: value })
            }
            style={{ width: "100%" }}
            allowClear
          >
            {Object.values(ProviderPaymentCode).map((provider) => (
              <Option key={provider} value={provider}>
                {provider}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle" style={{ marginTop: 12 }}>
        <Col xs={24} sm={12} md={6} lg={3}>
          <Select
            placeholder="Sắp xếp theo"
            value={filters.sort}
            onChange={(value) => {
              // Reset order to desc when changing sort type for consistency
              onFiltersChange({ sort: value, order: "desc" });
            }}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="createdAt">Thời gian tạo</Option>
            <Option value="id">ID</Option>
            <Option value="amount">Số tiền</Option>
            <Option value="bonusAmount">Tiền thưởng</Option>
          </Select>
        </Col>

        <Col xs={24} sm={12} md={6} lg={3}>
          <Select
            placeholder={
              filters.sort === "amount" || filters.sort === "bonusAmount"
                ? "Cao/Thấp"
                : "Mới/Cũ"
            }
            value={filters.order}
            onChange={(value) => onFiltersChange({ order: value })}
            style={{ width: "100%" }}
          >
            {getOrderOptions().map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} md={12} lg={18}>
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={onSearch}
              loading={loading}
            >
              Tìm kiếm
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
              disabled={loading}
            >
              Làm mới
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filter Summary */}
      {hasActiveFilters() && (
        <Card size="small" style={{ marginTop: 16 }} className="filter-summary">
          <Row align="middle" justify="space-between">
            <Col>
              <Text strong style={{ color: "#1890ff", fontSize: "14px" }}>
                Tìm thấy {total?.toLocaleString()} kết quả
              </Text>
              {getFilterSummary().length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Bộ lọc đang áp dụng: {getFilterSummary().join(" • ")}
                  </Text>
                </div>
              )}
            </Col>
            <Col>
              <Button size="small" onClick={onReset} disabled={loading}>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default DepositFilters;
