import React, { useState } from "react";
import {
  Typography,
  Input,
  Button,
  Card,
  Spin,
  Tag,
  Avatar,
  Space,
  Table,
} from "antd";
import {
  TagOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import axios, { AxiosRequestConfig } from "axios";
axios.defaults.baseURL = `${
  process.env.REACT_APP_URL ? process.env.REACT_APP_URL : window.location.origin
}/api`;

type VoucherData = {
  voucherName: string;
  voucherImage: string;
  totalQuantity: number;
  thisMonth: number;
  today: number;
  lastHour: number;
  totalQuantityCache: number; // New field
  thisMonthCache: number; // New field
  todayCache: number; // New field
  lastHourCache: number; // New field
};

type CustomerData = {
  customerName: string;
  customerPhone: string; // Changed from customerPhone
  customerEmail: string;
  lastPurchase: string;
  totalQuantity: number;
  thisMonth: number;
  today: number;
  lastHour: number;
  totalQuantityCache: number; // New field
  thisMonthCache: number; // New field
  todayCache: number; // New field
  lastHourCache: number; // New field
  voucherId?: string;
};

type FlashsaleData = {
  flashsaleName: string;
  startTime: string;
  endTime: string;
  voucherData: {
    voucherId: number;
    voucherName: string;
    itemId: number;
    total: number;
    purchased: number;
    totalReal: number;
  }[];
};

const { Title, Text } = Typography;

const DataDisplay = ({ data, type }: { data: any; type: string }) => (
  <Space
    direction="vertical"
    size="large"
    style={{ width: "100%", marginTop: 16 }}
  >
    <Space align="center">
      <Avatar
        size={60}
        src={
          type === "voucher"
            ? data.voucherImage
            : "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61"
        }
      />
      <Title level={4}>
        {type === "voucher" ? data.voucherName : data.customerName}
      </Title>
    </Space>
    {type === "voucher" && (
      <img
        src={data.voucherImage}
        alt={data.voucherName}
        style={{
          width: "100%",
          height: 200,
          objectFit: "cover",
          borderRadius: 8,
        }}
      />
    )}
    <Space wrap>
      <Tag icon={<ShoppingCartOutlined />} color="blue">
        Tổng lượt lấy (DB): {data.totalQuantity}
      </Tag>
      <Tag icon={<ShoppingCartOutlined />} color="blue">
        Tổng lượt lấy (Cache): {data.totalQuantityCache}
      </Tag>
      <Tag icon={<CalendarOutlined />} color="purple">
        Tháng này (DB): {data.thisMonth}
      </Tag>
      <Tag icon={<CalendarOutlined />} color="purple">
        Tháng này (Cache): {data.thisMonthCache}
      </Tag>
      <Tag icon={<ClockCircleOutlined />} color="green">
        Hôm nay (DB): {data.today}
      </Tag>
      <Tag icon={<ClockCircleOutlined />} color="green">
        Hôm nay (Cache): {data.todayCache}
      </Tag>
      <Tag icon={<ClockCircleOutlined />} color="cyan">
        Trong giờ (DB): {data.lastHour}
      </Tag>
      <Tag icon={<ClockCircleOutlined />} color="cyan">
        Trong giờ (Cache): {data.lastHourCache}
      </Tag>
    </Space>
    {type === "customer" && (
      <Card>
        <Text strong>SĐT:</Text> {data.customerPhone}
        <br />
        <Text strong>Email:</Text> {data.customerEmail}
        <br />
        <Text strong>Lần mua hàng cuối:</Text> {data.lastPurchase}
      </Card>
    )}
  </Space>
);

const FlashsaleDataDisplay = ({ data }: { data: FlashsaleData }) => (
  <Space
    direction="vertical"
    size="large"
    style={{ width: "100%", marginTop: 16 }}
  >
    <Title level={4}>{data.flashsaleName}</Title>
    <Space>
      <Tag icon={<CalendarOutlined />} color="blue">
        Start: {data.startTime}
      </Tag>
      <Tag icon={<CalendarOutlined />} color="green">
        End: {data.endTime}
      </Tag>
    </Space>
    <Table
      dataSource={data.voucherData}
      columns={[
        { title: "ID Voucher", dataIndex: "voucherId", key: "voucherId" },
        { title: "Tên voucher", dataIndex: "voucherName", key: "voucherName" },
        { title: "Item ID", dataIndex: "itemId", key: "itemId" },
        { title: "Tổng giới hạn", dataIndex: "total", key: "total" },
        { title: "Đã lấy", dataIndex: "purchased", key: "purchased" },
        { title: "Thực tế", dataIndex: "totalReal", key: "totalReal" },
      ]}
      pagination={false}
      scroll={{ x: true }}
    />
  </Space>
);

const VoucherCustomerLookup = () => {
  const [inputType, setInputType] = useState<
    "voucher" | "customer" | "flashsale" | ""
  >("");
  const [input, setInput] = useState("");
  const [voucherIdInput, setVoucherIdInput] = useState("");
  const [data, setData] = useState<
    VoucherData | CustomerData | FlashsaleData | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const token = localStorage.getItem("token");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "voucherId") {
      setVoucherIdInput(value);
    } else {
      setInput(value);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const options: AxiosRequestConfig = {
        method: "POST",
        url: `/admin/report/get-sold-voucher`,
        data: {
          type: inputType,
          voucherId:
            inputType === "voucher"
              ? Number(input)
              : voucherIdInput
              ? Number(voucherIdInput)
              : undefined,
          customerId: inputType === "customer" ? Number(input) : undefined,
          flashsaleId: inputType === "flashsale" ? Number(input) : undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const rs = await axios(options);
      if (rs.data.code === 0) {
        const data: VoucherData | CustomerData | FlashsaleData = rs.data.data;
        setData(data);
      } else {
        setError(rs.data.message);
      }
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      }
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputType === "voucher" || inputType === "flashsale") {
      if (!/^\d+$/.test(input)) {
        setError("Vui lòng nhập chỉ số cho mã voucher hoặc mã flashsale.");
        return;
      }
    } else if (inputType === "customer") {
      if (!/^\d+$/.test(input)) {
        setError("Vui lòng nhập chỉ số cho mã khách hàng.");
        return;
      }
      if (voucherIdInput && !/^\d+$/.test(voucherIdInput)) {
        setError("Vui lòng nhập chỉ số cho mã voucher.");
        return;
      }
    }
    setError("");
    if (input) fetchData();
  };

  const handleInputTypeChange = (
    type: "voucher" | "customer" | "flashsale"
  ) => {
    setInputType(type);
    setInput("");
    setError("");
    setShowVoucherInput(false);
    setVoucherIdInput("");
    setData(null);
  };

  const renderInputField = () => (
    <form onSubmit={handleSubmit}>
      <Input
        placeholder={
          inputType === "voucher"
            ? "Mã voucher"
            : inputType === "customer"
            ? "Mã khách hàng"
            : "Mã Flashsale"
        }
        value={input}
        onChange={handleInputChange}
        className={error ? "ant-input-status-error" : ""}
      />
      {inputType === "customer" && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => setShowVoucherInput(!showVoucherInput)}>
            {showVoucherInput ? "Ẩn mã voucher" : "Nhập mã voucher (tùy chọn)"}
          </Button>
          {showVoucherInput && (
            <Input
              name="voucherId"
              placeholder="Mã voucher"
              value={voucherIdInput}
              onChange={handleInputChange}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      )}
      {error && <Text type="danger">{error}</Text>}
      <Button
        type="primary"
        htmlType="submit"
        style={{ marginTop: 16, width: "100%" }}
        disabled={loading || !input}
      >
        {loading ? <Spin /> : "Tìm kiếm"}
      </Button>
    </form>
  );

  const renderResult = () => {
    if (!data) return null;
    if (inputType === "flashsale")
      return <FlashsaleDataDisplay data={data as FlashsaleData} />;
    return <DataDisplay data={data} type={inputType} />;
  };

  return (
    <Card style={{ maxWidth: 800, margin: "auto", marginTop: 32 }}>
      <Title level={4}>Tìm kiếm thông tin voucher/khách hàng/flashsale</Title>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space wrap>
          {["voucher", "customer", "flashsale"].map((type) => (
            <Button
              key={type}
              icon={
                type === "voucher" ? (
                  <TagOutlined />
                ) : type === "customer" ? (
                  <UserOutlined />
                ) : (
                  <ThunderboltOutlined />
                )
              }
              type={inputType === type ? "primary" : "default"}
              onClick={() =>
                handleInputTypeChange(
                  type as "voucher" | "customer" | "flashsale"
                )
              }
            >
              {type === "voucher"
                ? "Nhập mã voucher"
                : type === "customer"
                ? "Nhập mã khách hàng"
                : "Nhập mã Flashsale"}
            </Button>
          ))}
        </Space>
        {inputType && renderInputField()}
        {renderResult()}
      </Space>
    </Card>
  );
};

export default VoucherCustomerLookup;
