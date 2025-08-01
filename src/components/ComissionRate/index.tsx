import React, { useState } from "react";
import {
  Card,
  Tabs,
  Table,
  InputNumber,
  Button,
  Space,
  Spin,
  Typography,
  Tag,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useCommissionRates } from "./hooks";
import "@src/styles/comission-rate/index.less";

const { Title } = Typography;
const { TabPane } = Tabs;

const CommissionRate: React.FC = () => {
  const {
    loading,
    saving,
    gameCategories,
    agencyLevels,
    subordinateLevels,
    loadData,
    startEditing,
    stopEditing,
    cancelEditing,
    updateCellValue,
    getCellValue,
    isCellEditing,
    saveChanges,
    hasPendingChanges,
  } = useCommissionRates();

  const [activeTab, setActiveTab] = useState<string>("");

  // Handle cell edit
  const handleCellEdit = (
    gameTypeCode: string,
    agencyLevel: string,
    subLevel: string
  ) => {
    startEditing(gameTypeCode, agencyLevel, subLevel);
  };

  // Handle cell value change
  const handleCellChange = (
    gameTypeCode: string,
    agencyLevel: string,
    subLevel: string,
    value: number | null
  ) => {
    if (value !== null && value >= 0 && value <= 100) {
      updateCellValue(gameTypeCode, agencyLevel, subLevel, value);
    }
  };

  // Handle cell save (keep pending changes)
  const handleCellSave = (
    gameTypeCode: string,
    agencyLevel: string,
    subLevel: string
  ) => {
    stopEditing(gameTypeCode, agencyLevel, subLevel);
  };

  // Handle cell cancel
  const handleCellCancel = (
    gameTypeCode: string,
    agencyLevel: string,
    subLevel: string
  ) => {
    cancelEditing(gameTypeCode, agencyLevel, subLevel);
  };

  // Render editable cell
  const renderEditableCell = (
    gameTypeCode: string,
    agencyLevel: string,
    subLevel: string
  ) => {
    const value = getCellValue(gameTypeCode, agencyLevel, subLevel);
    const isEditing = isCellEditing(gameTypeCode, agencyLevel, subLevel);

    if (isEditing) {
      return (
        <div className="commission-rate-cell editing">
          <InputNumber
            value={value}
            min={0}
            max={100}
            step={0.001}
            precision={4}
            size="small"
            onChange={(val) =>
              handleCellChange(gameTypeCode, agencyLevel, subLevel, val)
            }
            onPressEnter={() =>
              handleCellSave(gameTypeCode, agencyLevel, subLevel)
            }
            style={{ width: "80px" }}
            autoFocus
          />
          <Space size="small" className="cell-actions">
            <Button
              type="text"
              size="small"
              icon={<SaveOutlined />}
              onClick={() =>
                handleCellSave(gameTypeCode, agencyLevel, subLevel)
              }
              className="save-btn"
            />
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() =>
                handleCellCancel(gameTypeCode, agencyLevel, subLevel)
              }
              className="cancel-btn"
            />
          </Space>
        </div>
      );
    }

    return (
      <div className="commission-rate-cell">
        <span className="cell-value">{value.toFixed(4)}</span>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleCellEdit(gameTypeCode, agencyLevel, subLevel)}
          className="edit-btn"
        />
      </div>
    );
  };

  // Create table columns
  const getTableColumns = (gameTypeCode: string) => {
    const columns = [
      {
        title: "Cấp hoa hồng",
        dataIndex: "agencyLevel",
        key: "agencyLevel",
        width: 120,
        fixed: "left" as const,
        render: (agencyLevel: string) => <Tag color="blue">{agencyLevel}</Tag>,
      },
    ];

    // Add columns for each subordinate level (dynamic)
    subordinateLevels.forEach((subLevel) => {
      columns.push({
        title: `Doanh thu ${subLevel}`,
        dataIndex: subLevel,
        key: subLevel,
        width: 120,
        render: (_: any, record: { agencyLevel: string }) =>
          renderEditableCell(gameTypeCode, record.agencyLevel, subLevel),
      } as any);
    });

    return columns;
  };

  // Create table data (dynamic agency levels)
  const getTableData = () => {
    return agencyLevels.map((agencyLevel) => ({
      key: agencyLevel,
      agencyLevel,
    }));
  };

  // Handle save all changes for current tab
  const handleSaveChanges = () => {
    if (activeTab) {
      saveChanges(activeTab);
    }
  };

  // Set initial active tab
  React.useEffect(() => {
    if (gameCategories.length > 0 && !activeTab) {
      setActiveTab(gameCategories[0].gameTypeCode);
    }
  }, [gameCategories, activeTab]);

  if (loading) {
    return (
      <div className="commission-rate-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="commission-rate-container">
      <Card>
        <div className="commission-rate-header">
          <Title level={3}>Quản lý phần trăm hoa hồng đại lý</Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              disabled={loading}
            >
              Làm mới
            </Button>
            {activeTab && hasPendingChanges(activeTab) && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveChanges}
                loading={saving}
              >
                Lưu thay đổi
              </Button>
            )}
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="commission-rate-tabs"
        >
          {gameCategories.map((category) => (
            <TabPane
              tab={
                <span>
                  {category.name}
                  {hasPendingChanges(category.gameTypeCode) && (
                    <span className="pending-indicator">●</span>
                  )}
                </span>
              }
              key={category.gameTypeCode}
            >
              <div className="commission-rate-table-container">
                <Table
                  columns={getTableColumns(category.gameTypeCode)}
                  dataSource={getTableData()}
                  pagination={false}
                  scroll={{ x: 800 }}
                  size="small"
                  className="commission-rate-table"
                  bordered
                />
              </div>

              {hasPendingChanges(category.gameTypeCode) && (
                <div className="commission-rate-actions">
                  <Tooltip title="Lưu tất cả thay đổi cho loại trò chơi này">
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSaveChanges}
                      loading={saving}
                      size="large"
                    >
                      Lưu tất cả thay đổi
                    </Button>
                  </Tooltip>
                </div>
              )}
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default CommissionRate;
