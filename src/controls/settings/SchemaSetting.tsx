import React, { FC, useEffect, useState } from 'react';
import { Drawer, Row, Col, Select } from 'antd';
import { EyeTwoTone } from '@ant-design/icons';
import Widgets from '@src/packages/pro-component/widget';
import {
  defaultSchema,
  ISchemaSetting,
} from '@src/routes/default/pageManager/PageEditor';
import clone from 'lodash/clone';
import FormOneColumnPreview from '../previews/FormOneColumnPreview';
import { ISchemaEditorProperties } from '../editors/SchemaEditor';
import DescriptionItem from './DescriptionItem';
import * as schemaTemplateArray from '@src/controls/layouts/schemaTemplate';

export interface SchemaSettingProps {
  onClose: () => void;
  drawerVisible: boolean;
  onChange: (name: string, val: any) => void;
  settings: ISchemaSetting;
  schema: ISchemaEditorProperties[];
}

const SchemaSetting: FC<SchemaSettingProps> = (props: SchemaSettingProps) => {
  const {
    onClose,
    drawerVisible,
    settings: propsSettings,
    schema = [],
    onChange: superChange,
  } = props;
  const [settings, setSettings] = useState<ISchemaSetting>(propsSettings);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    if (propsSettings !== settings) {
      setSettings(propsSettings);
    }
  }, [propsSettings]);

  const onChange = (name: string, val: any) => {
    const _settings: any = clone(settings);
    _settings[name] = val;
    setSettings(_settings);
    superChange?.(name, val);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <React.Fragment>
      <Drawer
        width={640}
        style={{ width: '640px !important' }}
        className='nv-drawer-detail'
        title={
          <span style={{ color: '#f09b1b' }}>
            {`Thiết lập Form`}{' '}
            {settings.layoutCtrl == defaultSchema.layoutCtrl && (
              <EyeTwoTone onClick={togglePreview} />
            )}
          </span>
        }
        placement='right'
        closable={true}
        onClose={onClose}
        visible={drawerVisible}
      >
        <Row gutter={16}>
          <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
            <DescriptionItem
              title='Giao diện'
              content={
                <Select
                  style={{ width: '100%' }}
                  value={settings.layoutCtrl || defaultSchema.layoutCtrl}
                  onChange={(val: any) => {
                    onChange('layoutCtrl', val);
                  }}
                >
                  {Object.keys(schemaTemplateArray).map((temp) => (
                    <Select.Option key={temp} value={temp}>
                      {temp}
                    </Select.Option>
                  ))}
                </Select>
              }
            />
          </Col>
        </Row>
        {settings.layoutCtrl == defaultSchema.layoutCtrl && (
          <>
            <Row gutter={16}>
              <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
                <DescriptionItem
                  title='Giao diện cột'
                  content={
                    <Select
                      style={{ width: '100%' }}
                      value={settings.layout}
                      onChange={(val: any) => {
                        onChange('layout', val);
                      }}
                    >
                      <Select.Option value='oneCol'>1 cột</Select.Option>
                      <Select.Option value='twoCol'>2 cột</Select.Option>
                    </Select>
                  }
                />
              </Col>
              <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
                <DescriptionItem
                  title='Giao diện form'
                  content={
                    <Widgets.RadioGroupWidget
                      valueEnum={{
                        horizontal: { text: 'horizontal', status: 'Custom' },
                        vertical: { text: 'vertical', status: 'Custom' },
                        inline: { text: 'inline', status: 'Custom' },
                      }}
                      value={settings.formLayout}
                      onChange={(val: any) => {
                        onChange('formLayout', val);
                      }}
                    />
                  }
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
                <DescriptionItem
                  title='Colon'
                  content={
                    <Widgets.CheckboxWidget
                      checkedChildren='Dấu hai chấm'
                      unCheckedChildren='Dấu hai chấm'
                      value={settings.colon}
                      onChange={(val: any) => {
                        onChange('colon', val);
                      }}
                    />
                  }
                />
              </Col>
              <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
                <DescriptionItem
                  title='Divider'
                  content={
                    <Widgets.RadioGroupWidget
                      valueEnum={{
                        none: { text: 'None', status: 'Custom' },
                        left: { text: 'Left', status: 'Custom' },
                        center: { text: 'Center', status: 'Custom' },
                        right: { text: 'Right', status: 'Custom' },
                      }}
                      value={settings.divider || 'none'}
                      onChange={(val: any) => {
                        onChange('divider', val);
                      }}
                    />
                  }
                />
                {settings.divider && settings.divider != 'none' && (
                  <DescriptionItem
                    title='Divider text'
                    content={
                      <Widgets.CheckboxWidget
                        checkedChildren='Divider text'
                        unCheckedChildren='Divider text'
                        value={settings.dividerText}
                        onChange={(val: any) => {
                          onChange('dividerText', val);
                        }}
                      />
                    }
                  />
                )}
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                <DescriptionItem
                  title='Horizontal Gutter (px):'
                  content={
                    <Widgets.SliderWidget
                      data={[8, 16, 24, 32, 40, 48]}
                      value={settings.horizontal}
                      onChange={(val: any) => {
                        onChange('horizontal', val);
                      }}
                    />
                  }
                />
              </Col>
              <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                <DescriptionItem
                  title='Vertical Gutter (px):'
                  content={
                    <Widgets.SliderWidget
                      data={[8, 16, 24, 32, 40, 48]}
                      value={settings.vertical}
                      onChange={(val: any) => {
                        onChange('vertical', val);
                      }}
                    />
                  }
                />
              </Col>
              <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                <DescriptionItem
                  title='Số cột:'
                  content={
                    <Widgets.SliderWidget
                      data={[1, 2, 3, 4]}
                      value={settings.columns}
                      onChange={(val: any) => {
                        onChange('columns', val);
                      }}
                    />
                  }
                />
              </Col>
            </Row>
          </>
        )}
      </Drawer>
      <Drawer
        width={640}
        style={{ width: '640px !important' }}
        className='nv-drawer-detail'
        title={<span style={{ color: '#f09b1b' }}>{`Preview Form`}</span>}
        placement='left'
        closable={true}
        onClose={togglePreview}
        visible={showPreview}
      >
        <FormOneColumnPreview
          schema={schema}
          settings={settings}
          onChange={onChange}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default React.memo(SchemaSetting);
