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
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment, { Moment } from "moment";
import { InvitationListParams } from "./types";

interface InvitationFiltersProps {
  filters: InvitationListParams;
  loading?: boolean;
  onFiltersChange: (filters: Partial<InvitationListParams>) => void;
  onSearch: () => void;
  onReset: () => void;
  onExport?: () => void;
}

const { RangePicker } = DatePicker;
const { Option } = Select;

const InvitationFilters: React.FC<InvitationFiltersProps> = ({
  filters,
  loading = false,
  onFiltersChange,
  onSearch,
  onReset,
  onExport,
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

  return (
    <div className="invitation-filters">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8} lg={5}>
          <Input
            placeholder="Tìm theo SĐT hoặc mã giới thiệu"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            onPressEnter={onSearch}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <InputNumber
            placeholder="ID người giới thiệu"
            value={filters.referrerId}
            onChange={(value) =>
              onFiltersChange({ referrerId: value || undefined })
            }
            style={{ width: "100%" }}
            min={1}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <InputNumber
            placeholder="ID người được giới thiệu"
            value={filters.inviterId}
            onChange={(value) =>
              onFiltersChange({ inviterId: value || undefined })
            }
            style={{ width: "100%" }}
            min={1}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={5}>
          <RangePicker
            placeholder={["Từ ngày", "Đến ngày"]}
            value={getDateRangeValue()}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
          />
        </Col>

        <Col xs={24} sm={12} md={6} lg={3}>
          <Select
            placeholder="Sắp xếp theo"
            value={filters.sort}
            onChange={(value) => onFiltersChange({ sort: value })}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="createdAt">Thời gian tạo</Option>
            <Option value="id">ID</Option>
            <Option value="depositAmount">Số tiền nạp</Option>
            <Option value="rewardAmount">Số thưởng</Option>
          </Select>
        </Col>

        <Col xs={24} sm={12} md={6} lg={3}>
          <Select
            placeholder="Thứ tự"
            value={filters.order}
            onChange={(value) => onFiltersChange({ order: value })}
            style={{ width: "100%" }}
          >
            <Option value="desc">Mới nhất</Option>
            <Option value="asc">Cũ nhất</Option>
          </Select>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
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
    </div>
  );
};

export default InvitationFilters;
