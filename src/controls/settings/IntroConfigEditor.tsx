import React, { useState, useMemo } from 'react';
import { Input, Select, Switch, Row, Col, Card, Collapse, InputNumber } from 'antd';
import { Html5Outlined, FileTextOutlined } from '@ant-design/icons';
import IntroDisplay from '../../packages/pro-component/schema/IntroDisplay';
import IntroRichText from '../../packages/pro-component/schema/IntroRichText';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface IntroConfig {
  content: string;
  type: 'text' | 'html';
  collapsible?: boolean;
  defaultExpanded?: boolean;
  maxLines?: number;
  showToggle?: boolean;
}

interface IntroConfigEditorProps {
  value?: string | IntroConfig;
  onChange?: (value: string | IntroConfig) => void;
}

const IntroConfigEditor: React.FC<IntroConfigEditorProps> = ({ value, onChange }) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(
    typeof value === 'object' && value !== null
  );

  const config = useMemo((): IntroConfig => {
    if (typeof value === 'string') {
      return {
        content: value,
        type: 'text',
        collapsible: false,
        defaultExpanded: true,
        maxLines: 3,
        showToggle: true
      };
    }
    return value || {
      content: '',
      type: 'text',
      collapsible: false,
      defaultExpanded: true,
      maxLines: 3,
      showToggle: true
    };
  }, [value]);

  const handleModeChange = (advanced: boolean) => {
    setIsAdvancedMode(advanced);
    if (!advanced) {
      // Switch to simple mode - return just the content string
      onChange?.(config.content);
    } else {
      // Switch to advanced mode - return full config object
      onChange?.(config);
    }
  };

  const handleSimpleChange = (content: string) => {
    onChange?.(content);
  };

  const handleAdvancedChange = (field: keyof IntroConfig, newValue: any) => {
    const newConfig = { ...config, [field]: newValue };
    onChange?.(newConfig);
  };

  return (
    <div className="intro-config-editor">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ marginBottom: 12 }}>
            <Switch
              checked={isAdvancedMode}
              onChange={handleModeChange}
              checkedChildren="Nâng cao"
              unCheckedChildren="Đơn giản"
            />
            <span style={{ marginLeft: 8, color: '#666' }}>
              {isAdvancedMode ? 'Chế độ nâng cao (HTML + Expand/Collapse)' : 'Chế độ đơn giản (Text)'}
            </span>
          </div>
        </Col>

        <Col span={24}>
          {isAdvancedMode ? (
            <Card size="small" title="Cấu hình nâng cao">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ marginBottom: 8 }}>
                    <label>Loại nội dung:</label>
                  </div>
                  <Select
                    value={config.type}
                    onChange={(val) => handleAdvancedChange('type', val)}
                    style={{ width: '100%' }}
                  >
                    <Option value="text">
                      <FileTextOutlined /> Text thường
                    </Option>
                    <Option value="html">
                      <Html5Outlined /> HTML
                    </Option>
                  </Select>
                </Col>

                <Col span={24}>
                  <div style={{ marginBottom: 8 }}>
                    <label>Nội dung {config.type === 'html' ? 'HTML' : 'Text'}:</label>
                  </div>
                  {config.type === 'html' ? (
                    <IntroRichText
                      value={config.content}
                      onChange={(val) => handleAdvancedChange('content', val)}
                      placeholder="Nhập nội dung HTML cho intro..."
                      height={250}
                    />
                  ) : (
                    <TextArea
                      value={config.content}
                      onChange={(e) => handleAdvancedChange('content', e.target.value)}
                      placeholder="Nhập text hướng dẫn..."
                      rows={8}
                    />
                  )}
                </Col>

                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <label>Có thể thu gọn:</label>
                  </div>
                  <Switch
                    checked={config.collapsible}
                    onChange={(val) => handleAdvancedChange('collapsible', val)}
                    checkedChildren="Có"
                    unCheckedChildren="Không"
                  />
                </Col>

                {config.collapsible && (
                  <>
                    <Col span={12}>
                      <div style={{ marginBottom: 8 }}>
                        <label>Mở rộng mặc định:</label>
                      </div>
                      <Switch
                        checked={config.defaultExpanded}
                        onChange={(val) => handleAdvancedChange('defaultExpanded', val)}
                        checkedChildren="Có"
                        unCheckedChildren="Không"
                      />
                    </Col>

                    <Col span={12}>
                      <div style={{ marginBottom: 8 }}>
                        <label>Số dòng tối đa:</label>
                      </div>
                      <InputNumber
                        value={config.maxLines}
                        onChange={(val) => handleAdvancedChange('maxLines', val || 3)}
                        min={1}
                        max={10}
                        style={{ width: '100%' }}
                      />
                    </Col>

                    <Col span={12}>
                      <div style={{ marginBottom: 8 }}>
                        <label>Hiện nút toggle:</label>
                      </div>
                      <Switch
                        checked={config.showToggle}
                        onChange={(val) => handleAdvancedChange('showToggle', val)}
                        checkedChildren="Có"
                        unCheckedChildren="Không"
                      />
                    </Col>
                  </>
                )}
              </Row>
            </Card>
          ) : (
            <div>
              <div style={{ marginBottom: 8 }}>
                <label>Nội dung hướng dẫn:</label>
              </div>
              <TextArea
                value={typeof value === 'string' ? value : config.content}
                onChange={(e) => handleSimpleChange(e.target.value)}
                placeholder="Nhập text hướng dẫn..."
                rows={4}
              />
            </div>
          )}
        </Col>

        {/* Preview */}
        {(config.content || (typeof value === 'string' && value)) && (
          <Col span={24}>
            <Collapse>
              <Panel header="🔍 Xem trước" key="preview">
                <div style={{ 
                  padding: 12, 
                  background: '#fafafa', 
                  border: '1px solid #d9d9d9',
                  borderRadius: 4 
                }}>
                  <IntroDisplay intro={isAdvancedMode ? config : (value as string)} />
                </div>
              </Panel>
            </Collapse>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default React.memo(IntroConfigEditor); 