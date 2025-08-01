import React, { useState } from 'react';
import { Card, Row, Col, Divider, Space, Button } from 'antd';
import IntroDisplay from '../packages/pro-component/schema/IntroDisplay';
import IntroConfigEditor from '../controls/settings/IntroConfigEditor';
import IntroRichText from '../packages/pro-component/schema/IntroRichText';
import Base from '../packages/pro-component/schema/Base';
import { ISchemaEditorProperties } from '../controls/editors/SchemaEditor';

const IntroSystemDemo: React.FC = () => {
  const [introValue, setIntroValue] = useState<string | any>('');
  const [richTextValue, setRichTextValue] = useState<string>('<p>Đây là <strong>demo IntroRichText</strong></p>');

  // Example schemas to test
  const exampleSchemas: ISchemaEditorProperties[] = [
    {
      name: 'Text Simple',
      field: 'textSimple',
      type: 'string',
      widget: 'Text',
      intro: 'Đây là hướng dẫn đơn giản cho trường text'
    },
    {
      name: 'HTML Collapsible',
      field: 'htmlCollapsible',
      type: 'string',
      widget: 'Text',
      intro: {
        content: `
          <p>Đây là <strong>hướng dẫn HTML</strong> với nhiều tính năng:</p>
          <ul>
            <li>Hỗ trợ <em>định dạng</em> HTML</li>
            <li>Có thể <code>thu gọn</code> và mở rộng</li>
            <li>Tích hợp với <a href="#" onclick="return false;">links</a></li>
          </ul>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        `,
        type: 'html' as const,
        collapsible: true,
        defaultExpanded: false,
        maxLines: 3,
        showToggle: true
      }
    },
    {
      name: 'Long Text',
      field: 'longText',
      type: 'string',
      widget: 'TextArea',
      intro: {
        content: `Đây là một hướng dẫn rất dài để test tính năng truncation.
        
Nó có nhiều dòng và sẽ được cắt ngắn khi hiển thị.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
        type: 'text' as const,
        collapsible: true,
        defaultExpanded: false,
        maxLines: 2,
        showToggle: true
      }
    }
  ];

  const predefinedExamples = [
    {
      name: 'Text đơn giản',
      value: 'Hướng dẫn text đơn giản'
    },
    {
      name: 'HTML với expand/collapse',
      value: {
        content: '<p>Hướng dẫn <strong>HTML</strong> với tính năng <em>expand/collapse</em></p><ul><li>Tính năng 1</li><li>Tính năng 2</li></ul>',
        type: 'html' as const,
        collapsible: true,
        defaultExpanded: false,
        maxLines: 2
      }
    },
    {
      name: 'Text dài với truncation',
      value: {
        content: 'Đây là text rất dài sẽ được cắt ngắn. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        type: 'text' as const,
        collapsible: true,
        defaultExpanded: false,
        maxLines: 1
      }
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>🚀 Intro System Demo</h1>
      <p>Demo hệ thống intro mới với support cho text và HTML, plus expand/collapse functionality.</p>

      <Divider />

      {/* IntroDisplay Examples */}
      <Card title="📝 IntroDisplay Examples" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {exampleSchemas.map((schema, index) => (
            <Col span={24} key={index}>
              <Card 
                size="small" 
                title={`${schema.name} (${schema.field})`}
                extra={
                  <span style={{ fontSize: 12, color: '#666' }}>
                    Type: {typeof schema.intro === 'string' ? 'String' : 'Object'}
                  </span>
                }
              >
                <Base schema={schema} />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* IntroConfigEditor Demo */}
      <Card title="🔧 IntroConfigEditor Demo" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ marginBottom: 16 }}>
              <strong>Quick Examples:</strong>
              <Space wrap style={{ marginLeft: 12 }}>
                {predefinedExamples.map((example, index) => (
                  <Button 
                    key={index}
                    size="small"
                    onClick={() => setIntroValue(example.value)}
                  >
                    {example.name}
                  </Button>
                ))}
                <Button 
                  size="small" 
                  danger 
                  onClick={() => setIntroValue('')}
                >
                  Clear
                </Button>
              </Space>
            </div>
          </Col>

          <Col span={24}>
            <IntroConfigEditor 
              value={introValue}
              onChange={setIntroValue}
            />
          </Col>

          <Col span={24}>
            <Card size="small" title="📊 Current Value" style={{ background: '#f5f5f5' }}>
              <pre style={{ 
                background: '#fff', 
                padding: 12, 
                borderRadius: 4, 
                fontSize: 12,
                overflow: 'auto'
              }}>
                {JSON.stringify(introValue, null, 2)}
              </pre>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* IntroRichText Demo */}
      <Card title="📝 IntroRichText Demo" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <p>Rich text editor riêng cho intro HTML:</p>
            <IntroRichText
              value={richTextValue}
              onChange={setRichTextValue}
              height={200}
            />
          </Col>
          <Col span={24}>
            <Card size="small" title="🔍 Preview" style={{ background: '#f5f5f5' }}>
              <IntroDisplay intro={{
                content: richTextValue,
                type: 'html',
                collapsible: true,
                defaultExpanded: false,
                maxLines: 2
              }} />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Usage Guide */}
      <Card title="📚 Usage Guide" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <h3>🔧 Trong SchemaEditor</h3>
            <ol>
              <li><strong>Mở SchemaEditor</strong> - Click vào field để edit</li>
              <li><strong>Scroll xuống "Hướng dẫn"</strong> - Sẽ thấy IntroConfigEditor</li>
              <li><strong>Chế độ đơn giản</strong> - Nhập text thường như trước</li>
              <li><strong>Chế độ nâng cao</strong> - Toggle switch để enable HTML mode</li>
              <li><strong>HTML mode</strong> - Sử dụng IntroRichText để tạo content</li>
              <li><strong>Configure options</strong> - Set collapsible, maxLines, etc.</li>
              <li><strong>Live Preview</strong> - Xem kết quả real-time</li>
            </ol>
          </Col>
          
          <Col span={24}>
            <h3>💡 Best Practices</h3>
            <ul>
              <li><strong>Text mode</strong> cho intro đơn giản, ngắn gọn</li>
              <li><strong>HTML mode</strong> cho intro dài, có format phức tạp</li>
                             <li><strong>Collapsible = true</strong> cho content &gt; 3 dòng</li>
              <li><strong>maxLines = 2-3</strong> cho mobile-friendly</li>
              <li><strong>Sử dụng valid HTML tags</strong> (p, strong, em, ul, li, etc.)</li>
            </ul>
          </Col>
        </Row>
      </Card>

      {/* Feature Showcase */}
      <Card title="✨ Feature Showcase">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <h3>🎯 Key Features</h3>
            <ul>
              <li>✅ <strong>Backward Compatible</strong> - Existing string intro still works</li>
              <li>✅ <strong>Schema Integration</strong> - IntroConfigEditor trong SchemaEditor</li>
              <li>✅ <strong>Mode Switching</strong> - Chuyển đổi text ↔ HTML ngay trong editor</li>
              <li>✅ <strong>HTML Support</strong> - Rich text with safe HTML rendering</li>
              <li>✅ <strong>Expand/Collapse</strong> - Long content can be truncated</li>
              <li>✅ <strong>Rich Text Editor</strong> - IntroRichText cho HTML editing</li>
              <li>✅ <strong>Flexible Configuration</strong> - Simple and advanced modes</li>
              <li>✅ <strong>Live Preview</strong> - See changes in real-time</li>
              <li>✅ <strong>XSS Protection</strong> - Safe HTML sanitization</li>
              <li>✅ <strong>Responsive Design</strong> - Works on mobile and desktop</li>
            </ul>
          </Col>

          <Col span={24}>
            <h3>🔧 Technical Details</h3>
            <ul>
              <li><strong>Type Definition:</strong> <code>intro?: string | IntroConfig</code></li>
              <li><strong>Components:</strong> IntroDisplay, IntroConfigEditor, IntroRichText</li>
              <li><strong>Schema Integration:</strong> IntroConfigEditor được tích hợp vào SchemaEditor</li>
              <li><strong>Mode Switching:</strong> Chuyển đổi text ↔ HTML trực tiếp trong editor</li>
              <li><strong>Rich Editor:</strong> TinyMCE-based editor với essential plugins</li>
              <li><strong>CSS:</strong> Smooth animations, responsive design</li>
              <li><strong>Security:</strong> HTML sanitization và valid elements filtering</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default IntroSystemDemo; 