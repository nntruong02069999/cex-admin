import React, { useEffect } from "react";
import { connect } from "dva";
import {
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Popconfirm,
  Input,
  Select,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { WalletConfig } from "@src/services/houseWalletService";
import { HouseWalletState } from "@src/models/houseWallet";
import BSCScanLink from "../Common/BSCScanLink";
import AmountDisplay from "../Common/AmountDisplay";
import WalletConfigModal from "./WalletConfigModal";

const { Search } = Input;
const { Option } = Select;

interface WalletConfigTableProps {
  houseWallet: HouseWalletState;
  dispatch: any;
}

const WalletConfigTable: React.FC<WalletConfigTableProps> = ({
  houseWallet,
  dispatch,
}) => {
  const {
    walletConfigs,
    walletConfigsTotal,
    walletConfigsLoading,
    queryParams,
  } = houseWallet;

  useEffect(() => {
    dispatch({ type: "houseWallet/fetchWalletConfigs" });
  }, [dispatch]);

  const handleCreate = () => {
    dispatch({ type: "houseWallet/showWalletConfigModal" });
  };

  const handleEdit = (record: WalletConfig) => {
    dispatch({
      type: "houseWallet/showWalletConfigModal",
      payload: record,
    });
  };

  const handleDelete = (id: number) => {
    dispatch({
      type: "houseWallet/deleteWalletConfig",
      payload: id,
    });
  };

  const handleToggleStatus = (id: number, isActive: boolean) => {
    dispatch({
      type: "houseWallet/updateWalletConfig",
      payload: { id, isActive },
    });
  };

  const handleSyncBalance = (id: number) => {
    dispatch({
      type: "houseWallet/syncWalletBalance",
      payload: id,
    });
  };

  const handleSearch = (value: string) => {
    dispatch({
      type: "houseWallet/fetchWalletConfigs",
      payload: { search: value, page: 1 },
    });
  };

  const handleWalletTypeFilter = (value: string) => {
    dispatch({
      type: "houseWallet/fetchWalletConfigs",
      payload: { walletType: value, page: 1 },
    });
  };

  const handleTableChange = (pagination: any) => {
    dispatch({
      type: "houseWallet/fetchWalletConfigs",
      payload: {
        page: pagination.current,
        limit: pagination.pageSize,
      },
    });
  };

  const getWalletTypeColor = (type: string) => {
    const colors = {
      HOUSE_MAIN: "blue",
      FEE_PAYMENT: "orange",
      CUSTOMER_PAYOUT: "green",
    };
    return colors[type as keyof typeof colors] || "default";
  };

  const columns: ColumnsType<WalletConfig> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: true,
    },
    {
      title: "Loại ví",
      dataIndex: "walletType",
      key: "walletType",
      width: 150,
      render: (type: string) => (
        <Tag color={getWalletTypeColor(type)}>{type.replace("_", " ")}</Tag>
      ),
      filters: [
        { text: "House Main", value: "HOUSE_MAIN" },
        { text: "Fee Payment", value: "FEE_PAYMENT" },
        { text: "Customer Payout", value: "CUSTOMER_PAYOUT" },
      ],
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 200,
      render: (address: string) => (
        <BSCScanLink address={address} type="address" />
      ),
    },
    {
      title: "Số dư",
      key: "balance",
      width: 200,
      render: (record: WalletConfig) => (
        <div className="balance-display">
          <div>
            <AmountDisplay amount={record.balanceUsdt || 0} currency="USDT" />
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
      title: "Giới hạn",
      key: "limits",
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
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
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
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description: string) =>
        description ? (
          <Tooltip title={description}>{description}</Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      render: (record: WalletConfig) => (
        <Space size="small">
          <Tooltip title="Sync Balance">
            <Button
              type="text"
              icon={<SyncOutlined />}
              onClick={() => handleSyncBalance(record.id)}
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
          <h3>Cấu hình ví</h3>
        </div>
        <div className="header-right">
          <Space style={{ justifyContent: "center", width: "100%" }}>
            <Search
              placeholder="Tìm kiếm theo địa chỉ hoặc mô tả"
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
              enterButton={<SearchOutlined />}
            />

            <Select
              placeholder="Lọc theo loại"
              allowClear
              style={{ width: 150 }}
              onChange={handleWalletTypeFilter}
            >
              <Option value="HOUSE_MAIN">Ví chính</Option>
              <Option value="FEE_PAYMENT">Ví trả phí</Option>
              <Option value="CUSTOMER_PAYOUT">Ví rút tiền</Option>
            </Select>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Tạo ví
            </Button>
          </Space>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={walletConfigs}
        loading={walletConfigsLoading}
        rowKey="id"
        pagination={{
          current: queryParams.walletConfigs.page,
          pageSize: queryParams.walletConfigs.limit,
          total: walletConfigsTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
        size="middle"
        scroll={{ x: 1200 }}
      />

      <WalletConfigModal />
    </div>
  );
};

const mapStateToProps = ({ houseWallet }: any) => ({
  houseWallet,
});

export default connect(mapStateToProps)(WalletConfigTable);
