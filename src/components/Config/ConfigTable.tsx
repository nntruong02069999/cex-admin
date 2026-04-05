import React, { useState } from "react";
import { connect } from "dva";
import { Table, Input, InputNumber, Switch, Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { ConfigItem } from "@src/services/configService";
import { getConfigLabel, isApiKey } from "./configMapping";
import "./ConfigTable.less";

interface ConfigTableExternalProps {
  dataSource: ConfigItem[];
}

interface ConfigTableProps extends ConfigTableExternalProps {
  loading: boolean;
  dispatch: any;
}

const ConfigTable: React.FC<ConfigTableProps> = ({
  dataSource,
  loading,
  dispatch,
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, string>>(
    {},
  );
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  const handleValueChange = (name: string, value: string) => {
    setEditingValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (item: ConfigItem) => {
    const newValue = editingValues[item.name!];
    if (newValue === undefined || newValue === item.val) {
      return;
    }
    dispatch({
      type: "config/editConfig",
      payload: { name: item.name, value: newValue },
    });
  };

  const togglePasswordVisibility = (name: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const renderValueInput = (item: ConfigItem) => {
    const currentVal = editingValues[item.name!] ?? item.val ?? "";

    if (item.type === "number") {
      return (
        <InputNumber
          value={currentVal === "" ? undefined : Number(currentVal)}
          onChange={(val) =>
            handleValueChange(item.name!, val !== null ? String(val) : "")
          }
          style={{ width: "100%" }}
        />
      );
    }

    if (item.type === "boolean") {
      return (
        <Switch
          checked={currentVal === "true"}
          onChange={(checked) => handleValueChange(item.name!, String(checked))}
        />
      );
    }

    if (isApiKey(item.name)) {
      const isVisible = visiblePasswords[item.name!];
      return (
        <Input
          type={isVisible ? "text" : "password"}
          value={currentVal}
          onChange={(e) => handleValueChange(item.name!, e.target.value)}
          suffix={
            <span
              className="password-toggle"
              onClick={() => togglePasswordVisibility(item.name!)}
            >
              {isVisible ? "🙈" : "👁️"}
            </span>
          }
        />
      );
    }

    return (
      <Input
        value={currentVal}
        onChange={(e) => handleValueChange(item.name!, e.target.value)}
      />
    );
  };

  const renderLabel = (item: ConfigItem) => {
    const label = getConfigLabel(item.name, item.description);
    return (
      <div className="config-label-cell">
        <div className="config-label-main">{label}</div>
        {item.name && <code className="config-label-key">{item.name}</code>}
      </div>
    );
  };

  const columns = [
    {
      title: "Nhãn",
      key: "label",
      width: 280,
      render: (_: any, record: ConfigItem) => renderLabel(record),
    },
    {
      title: "Giá trị",
      key: "value",
      width: 260,
      render: (_: any, record: ConfigItem) => renderValueInput(record),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 90,
      render: (_: any, record: ConfigItem) => {
        const isChanged =
          editingValues[record.name!] !== undefined &&
          editingValues[record.name!] !== record.val;
        return (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="small"
            disabled={!isChanged}
            onClick={() => handleSave(record)}
          >
            Lưu
          </Button>
        );
      },
    },
  ];

  return (
    <div className="config-table-wrapper">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
        size="middle"
      />
    </div>
  );
};

const mapStateToProps = ({ config, loading }: any) => ({
  loading: loading.effects["config/fetchAllConfig"],
});

export default connect(mapStateToProps)(
  ConfigTable,
) as React.FC<ConfigTableExternalProps>;
