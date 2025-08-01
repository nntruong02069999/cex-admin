import React, { useState } from "react";
import { Card, Row, Col, DatePicker, message, Select } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

export interface ChartDataType {
  name: string;
  revenue: number;
  expense: number;
}

interface RevenueChartProps {
  data: ChartDataType[];
  onDateRangeChange?: (dates: [moment.Moment, moment.Moment]) => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  onDateRangeChange,
}) => {
  // State to track current date range
  const [currentDateRange, setCurrentDateRange] = useState<
    [moment.Moment, moment.Moment]
  >([moment().subtract(30, "days"), moment()]);

  // State for selected time period
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState<string>("30_days");

  // Calculate total revenue and expense from data
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);

  // Format numbers with Indian locale
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN").format(amount) + " ₹";
  };

  // Handle time period dropdown change
  const handleTimePeriodChange = (value: string) => {
    setSelectedTimePeriod(value);
    let startDate: moment.Moment;
    let endDate: moment.Moment;

    switch (value) {
      case "today":
        startDate = moment().startOf("day");
        endDate = moment().endOf("day");
        break;
      case "yesterday":
        startDate = moment().subtract(1, "day").startOf("day");
        endDate = moment().subtract(1, "day").endOf("day");
        break;
      case "7_days":
        startDate = moment().subtract(7, "days").startOf("day");
        endDate = moment().endOf("day");
        break;
      case "30_days":
        startDate = moment().subtract(30, "days").startOf("day");
        endDate = moment().endOf("day");
        break;
      case "this_month":
        startDate = moment().startOf("month");
        endDate = moment().endOf("month");
        break;
      case "last_month":
        startDate = moment().subtract(1, "month").startOf("month");
        endDate = moment().subtract(1, "month").endOf("month");
        break;
      case "this_year":
        startDate = moment().startOf("year");
        endDate = moment().endOf("year");
        break;
      case "last_year":
        startDate = moment().subtract(1, "year").startOf("year");
        endDate = moment().subtract(1, "year").endOf("year");
        break;
      case "all_time":
        startDate = moment("2020-01-01").startOf("day");
        endDate = moment().endOf("day");
        break;
      case "custom":
        // Don't update date range for custom, let user use date picker
        return;
      default:
        startDate = moment().subtract(30, "days").startOf("day");
        endDate = moment().endOf("day");
    }

    const newRange: [moment.Moment, moment.Moment] = [startDate, endDate];
    setCurrentDateRange(newRange);

    if (onDateRangeChange) {
      onDateRangeChange(newRange);
    }
  };

  // Custom validation for date range
  const validateDateRange = (dates: [moment.Moment, moment.Moment] | null) => {
    if (!dates || !dates[0] || !dates[1]) return true;

    const [start, end] = dates;
    const diffInDays = end.diff(start, "days");

    if (diffInDays > 90) {
      message.error("Khoảng thời gian chỉ được phép tối đa 3 tháng");
      return false;
    }

    return true;
  };

  // Disable dates function for RangePicker
  const disabledDate = (current: moment.Moment) => {
    // Disable future dates
    return current && current.isAfter(moment(), "day");
  };

  return (
    <Card
      title="Biểu đồ doanh thu / chi phí"
      bordered={false}
      bodyStyle={{ padding: "0 20px 20px" }}
    >
      <div style={{ marginBottom: "16px", padding: "16px 0 0" }}>
        <Row align="middle" gutter={[16, 8]} wrap>
          <Col>
            <Select
              value={selectedTimePeriod}
              onChange={handleTimePeriodChange}
              style={{ width: 150 }}
              size="middle"
            >
              <Option value="today">Hôm nay</Option>
              <Option value="yesterday">Hôm qua</Option>
              <Option value="7_days">7 ngày gần đây</Option>
              <Option value="30_days">30 ngày gần đây</Option>
              <Option value="this_month">Tháng này</Option>
              <Option value="last_month">Tháng trước</Option>
              <Option value="this_year">Năm này</Option>
              <Option value="last_year">Năm ngoái</Option>
              <Option value="all_time">Tất cả thời gian</Option>
              <Option value="custom">Tùy chọn</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              format="DD/MM/YYYY"
              value={currentDateRange}
              style={{ marginRight: "10px" }}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  if (validateDateRange([dates[0], dates[1]])) {
                    const newRange: [moment.Moment, moment.Moment] = [
                      dates[0],
                      dates[1],
                    ];
                    setCurrentDateRange(newRange);
                    setSelectedTimePeriod("custom");
                    if (onDateRangeChange) {
                      onDateRangeChange(newRange);
                    }
                  }
                }
              }}
              disabledDate={disabledDate}
              allowClear={false}
              disabled={selectedTimePeriod !== "custom"}
            />
          </Col>
        </Row>
      </div>
      <div style={{ height: "300px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barGap={0}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="revenue"
              name={`Doanh thu: ${formatCurrency(totalRevenue)}`}
              fill="#5cb85c"
            />
            <Bar
              dataKey="expense"
              name={`Chi phí: ${formatCurrency(totalExpense)}`}
              fill="#d9534f"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RevenueChart;
