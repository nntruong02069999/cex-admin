import React, { useState } from "react";
import {
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Card,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  FileTextOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { WithdrawStatus, WithdrawListParams } from "./types";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

interface WithdrawFiltersProps {
  filters: WithdrawListParams;
  onFiltersChange: (filters: WithdrawListParams) => void;
  loading?: boolean;
  totalCount?: number;
}

const WithdrawFilters: React.FC<WithdrawFiltersProps> = ({
  filters,
  onFiltersChange,
  loading = false,
  totalCount = 0,
}) => {
  const [localFilters, setLocalFilters] = useState({
    nickname: filters.nickname || "",
    withdrawCode: filters.withdrawCode || "",
    customerId: filters.customerId?.toString() || "",
  });

  // Handle immediate search
  const handleSearch = () => {
    const newFilters = {
      ...filters,
      nickname: localFilters.nickname || undefined,
      withdrawCode: localFilters.withdrawCode || undefined,
      customerId: localFilters.customerId ? parseInt(localFilters.customerId, 10) : undefined,
    };
    onFiltersChange(newFilters);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters({ ...localFilters, nickname: value });
  };

  const handleWithdrawCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters({ ...localFilters, withdrawCode: value });
  };

  const handleCustomerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters({ ...localFilters, customerId: value });
  };

  const handleStatusChange = (value: WithdrawStatus | undefined) => {
    onFiltersChange({
      ...filters,
      status: value,
    });
  };


  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      onFiltersChange({
        ...filters,
        startDate: dates[0].valueOf(),
        endDate: dates[1].valueOf(),
      });
    } else {
      onFiltersChange({
        ...filters,
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sort: value as any,
      order: "desc", // Reset to desc when changing sort type
    });
  };

  const getOrderOptions = () => {
    if (filters.sort === "amount" || filters.sort === "feeWithdraw") {
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

  const handleOrderChange = (value: "asc" | "desc") => {
    onFiltersChange({
      ...filters,
      order: value,
    });
  };

  const handleReset = () => {
    const resetFilters: WithdrawListParams = {
      skip: 0,
      limit: 10,
      sort: "createdAt",
      order: "desc",
    };
    setLocalFilters({
      nickname: "",
      withdrawCode: "",
      customerId: "",
    });
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = Boolean(
    filters.nickname ||
    filters.withdrawCode ||
    filters.customerId ||
    filters.status ||
    filters.startDate ||
    filters.endDate
  );

  const getActiveFiltersText = () => {
    const activeFilters = [];
    if (filters.nickname) activeFilters.push(`Nickname: ${filters.nickname}`);
    if (filters.withdrawCode) activeFilters.push(`Mã rút tiền: ${filters.withdrawCode}`);
    if (filters.customerId) activeFilters.push(`ID KH: ${filters.customerId}`);
    if (filters.status) activeFilters.push(`Trạng thái: ${getStatusText(filters.status)}`);
    if (filters.startDate && filters.endDate) {
      activeFilters.push(
        `Thời gian: ${moment(filters.startDate).format("DD/MM")} - ${moment(filters.endDate).format("DD/MM")}`
      );
    }
    return activeFilters.join(" • ");
  };

  const getStatusText = (status: WithdrawStatus) => {
    switch (status) {
      case WithdrawStatus.PENDING:
        return "Chờ xử lý";
      case WithdrawStatus.SUCCESS:
        return "Thành công";
      case WithdrawStatus.REJECTED:
        return "Bị từ chối";
      default:
        return status;
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="withdraw-filters">
      {/* Search Section */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row align="middle" style={{ marginBottom: 8 }}>
          <Col>
            <Text strong style={{ color: "#fa8c16" }}>
              <SearchOutlined style={{ marginRight: 8 }} />
              Tìm kiếm
            </Text>
          </Col>
        </Row>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Nickname"
              prefix={<SearchOutlined />}
              value={localFilters.nickname}
              onChange={handleNicknameChange}
              onKeyPress={handleKeyPress}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Mã rút tiền"
              prefix={<FileTextOutlined />}
              value={localFilters.withdrawCode}
              onChange={handleWithdrawCodeChange}
              onKeyPress={handleKeyPress}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="ID khách hàng"
              prefix={<UserOutlined />}
              type="number"
              value={localFilters.customerId}
              onChange={handleCustomerIdChange}
              onKeyPress={handleKeyPress}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              >
                Tìm kiếm
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                disabled={loading}
              >
                Đặt lại
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filter Section */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row align="middle" style={{ marginBottom: 8 }}>
          <Col>
            <Text strong style={{ color: "#fa8c16" }}>
              <FilterOutlined style={{ marginRight: 8 }} />
              Bộ lọc
            </Text>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={handleStatusChange}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value={WithdrawStatus.PENDING}>Chờ xử lý</Option>
              <Option value={WithdrawStatus.SUCCESS}>Thành công</Option>
              <Option value={WithdrawStatus.REJECTED}>Bị từ chối</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={16} lg={12}>
            <RangePicker
              value={
                filters.startDate && filters.endDate
                  ? [moment(filters.startDate), moment(filters.endDate)]
                  : null
              }
              onChange={handleDateRangeChange}
              style={{ width: "100%" }}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
        </Row>
      </Card>

      {/* Sort Section */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row align="middle" style={{ marginBottom: 8 }}>
          <Col>
            <Text strong style={{ color: "#fa8c16" }}>
              <SortAscendingOutlined style={{ marginRight: 8 }} />
              Sắp xếp
            </Text>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              value={filters.sort}
              onChange={handleSortChange}
              style={{ width: "100%" }}
              placeholder="Sắp xếp theo"
            >
              <Option value="createdAt">Thời gian tạo</Option>
              <Option value="id">ID</Option>
              <Option value="amount">Số tiền</Option>
              <Option value="feeWithdraw">Phí rút</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              value={filters.order}
              onChange={handleOrderChange}
              style={{ width: "100%" }}
              placeholder="Thứ tự"
            >
              {getOrderOptions().map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <Card size="small" className="filter-summary">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <FilterOutlined style={{ color: "#fa8c16" }} />
                <Text strong style={{ color: "#fa8c16" }}>
                  Kết quả tìm kiếm: {totalCount} bản ghi
                </Text>
                <Text type="secondary">({getActiveFiltersText()})</Text>
              </Space>
            </Col>
            <Col>
              <Button size="small" onClick={handleReset}>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default WithdrawFilters; 