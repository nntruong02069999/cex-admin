import React, { useState, useMemo } from 'react';
import { Checkbox, Popover, Button } from 'antd';
import { SettingOutlined, UndoOutlined } from '@ant-design/icons';
import { ColumnConfig, DEFAULT_COLUMNS, COLUMN_STORAGE_KEY } from './types';

interface ColumnCustomizerProps {
  columns: ColumnConfig[];
  onChange: (columns: ColumnConfig[]) => void;
}

// Load saved column preferences from localStorage
export const loadColumnPreferences = (): ColumnConfig[] => {
  try {
    const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (saved) {
      const savedKeys: Record<string, boolean> = JSON.parse(saved);
      return DEFAULT_COLUMNS.map(col => ({
        ...col,
        visible: col.fixed ? true : (savedKeys[col.key] ?? col.visible),
      }));
    }
  } catch (e) {
    console.error('Error loading column preferences:', e);
  }
  return DEFAULT_COLUMNS;
};

// Save column preferences to localStorage
const saveColumnPreferences = (columns: ColumnConfig[]) => {
  try {
    const prefs: Record<string, boolean> = {};
    columns.forEach(col => {
      prefs[col.key] = col.visible;
    });
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Error saving column preferences:', e);
  }
};

const ColumnCustomizer: React.FC<ColumnCustomizerProps> = ({ columns, onChange }) => {
  const [visible, setVisible] = useState(false);

  const handleToggle = (key: string, checked: boolean) => {
    const updated = columns.map(col =>
      col.key === key ? { ...col, visible: checked } : col
    );
    onChange(updated);
    saveColumnPreferences(updated);
  };

  const handleReset = () => {
    onChange(DEFAULT_COLUMNS);
    saveColumnPreferences(DEFAULT_COLUMNS);
  };

  const visibleCount = useMemo(
    () => columns.filter(c => c.visible).length,
    [columns]
  );

  const content = (
    <div className="column-customizer__content">
      <div className="column-customizer__header">
        <span className="column-customizer__title">
          Hiển thị cột ({visibleCount}/{columns.length})
        </span>
        <Button
          type="link"
          size="small"
          icon={<UndoOutlined />}
          onClick={handleReset}
        >
          Mặc định
        </Button>
      </div>
      <div className="column-customizer__list">
        {columns.map(col => (
          <div key={col.key} className="column-customizer__item">
            <Checkbox
              checked={col.visible}
              disabled={col.fixed}
              onChange={(e) => handleToggle(col.key, e.target.checked)}
            >
              {col.label}
            </Checkbox>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      visible={visible}
      onVisibleChange={setVisible}
    >
      <Button
        icon={<SettingOutlined />}
        size="small"
        type="text"
      >
        Cột hiển thị
      </Button>
    </Popover>
  );
};

export default ColumnCustomizer;
