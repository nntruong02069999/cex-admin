import React, { FC, useEffect, useState } from "react";
import { Drawer, Row, Col, Select, Divider } from "antd";
import {
  defaultGridSetting,
  IGridSetting,
} from "@src/routes/default/pageManager/PageEditor";
import clone from "lodash/clone";
import DescriptionItem from "./DescriptionItem";
import * as gridTemplateArray from "@src/controls/layouts/gridTemplate";
import Widgets from "@src/packages/pro-component/widget";
import ProTable, { ProColumns } from "@src/packages/pro-table";

export type TableListItem = {
  key: number;
  name: string;
  detail: string;
};

const defaultData = new Array(100).fill("").map((_, index) => ({
  key: index,
  name: `Ứng dụng ${index}`,
  detail: `Chi tiết ${index}`,
}));

const columns: ProColumns<TableListItem>[] = [
  {
    title: "Tên",
    dataIndex: "name",
  },
  {
    title: "Thông tin",
    dataIndex: "detail",
  },
  {
    title: "Action",
    key: "action",
    width: 120,
    valueType: "option",
    render: () => [<a key="link">Sửa</a>],
  },
];

export interface GridSettingProps {
  name?: string;
  onClose: () => void;
  drawerVisible: boolean;
  onChange: (name: string, val: any) => void;
  settings: IGridSetting;
}

const GridSetting: FC<GridSettingProps> = (props: GridSettingProps) => {
  const {
    onClose,
    drawerVisible,
    settings: propsSettings,
    onChange: superChange,
    ...restProps
  } = props;
  const [settings, setSettings] = useState<IGridSetting>(propsSettings);

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
  const pagination: any = {
    position: [settings.paginationTop, settings.paginationBottom],
    showQuickJumper: settings.paginationShowQuickJumper,
    showSizeChanger: settings.paginationShowSizeChanger,
    simple: settings.paginationSimple,
    showTitle: settings.paginationShowTitle,
    showLessItems: settings.paginationShowLessItems,
    responsive: settings.paginationResponsive,
    size: settings.paginationSize,
  };

  return (
    <React.Fragment>
      <Drawer
        width={640}
        style={{ width: "640px !important" }}
        className="nv-drawer-detail"
        title={<span style={{ color: "#f09b1b" }}>{`Thiết lập Grid`}</span>}
        placement="right"
        closable={true}
        onClose={onClose}
        visible={drawerVisible}
      >
        <Row gutter={16}>
          <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
            <DescriptionItem
              title="Giao diện"
              content={
                <Select
                  style={{ width: "100%" }}
                  value={settings.layout || defaultGridSetting.layout}
                  onChange={(val: any) => {
                    onChange("layout", val);
                  }}
                >
                  {Object.keys(gridTemplateArray).map((temp) => (
                    <Select.Option key={temp} value={temp}>
                      {temp}
                    </Select.Option>
                  ))}
                </Select>
              }
            />
          </Col>
        </Row>
        <Row gutter={16} className="gx-mt-2">
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Row gutter={16}>
              <Col>
                <Widgets.CheckboxWidget
                  checkedChildren="bordered"
                  unCheckedChildren="bordered"
                  value={settings.bordered ?? defaultGridSetting.bordered}
                  onChange={(val: any) => {
                    onChange("bordered", val);
                  }}
                />
              </Col>
              <Col>
                <Widgets.CheckboxWidget
                  checkedChildren="paginationShowQuickJumper"
                  unCheckedChildren="paginationShowQuickJumper"
                  value={
                    settings.paginationShowQuickJumper ??
                    defaultGridSetting.paginationShowQuickJumper
                  }
                  onChange={(val: any) => {
                    onChange("paginationShowQuickJumper", val);
                  }}
                />
              </Col>
              <Col>
                <Widgets.CheckboxWidget
                  checkedChildren="paginationShowSizeChanger"
                  unCheckedChildren="paginationShowSizeChanger"
                  value={
                    settings.paginationShowSizeChanger ??
                    defaultGridSetting.paginationShowSizeChanger
                  }
                  onChange={(val: any) => {
                    console.log({ val });
                    onChange("paginationShowSizeChanger", val);
                  }}
                />
              </Col>
              <Col>
                <Widgets.CheckboxWidget
                  checkedChildren="paginationSimple"
                  unCheckedChildren="paginationSimple"
                  value={
                    settings.paginationSimple ??
                    defaultGridSetting.paginationSimple
                  }
                  onChange={(val: any) => {
                    onChange("paginationSimple", val);
                  }}
                />
              </Col>
              <Col>
                <Widgets.CheckboxWidget
                  checkedChildren="paginationShowTitle"
                  unCheckedChildren="paginationShowTitle"
                  value={
                    settings.paginationShowTitle ??
                    defaultGridSetting.paginationShowTitle
                  }
                  onChange={(val: any) => {
                    onChange("paginationShowTitle", val);
                  }}
                />
              </Col>
              <Col>
                <Widgets.CheckboxWidget
                  checkedChildren="paginationShowLessItems"
                  unCheckedChildren="paginationShowLessItems"
                  value={
                    settings.paginationShowLessItems ??
                    defaultGridSetting.paginationShowLessItems
                  }
                  onChange={(val: any) => {
                    onChange("paginationShowLessItems", val);
                  }}
                />
              </Col>
              <Col>
                <Widgets.CheckboxWidget
                  checkedChildren="paginationResponsive"
                  unCheckedChildren="paginationResponsive"
                  value={
                    settings.paginationResponsive ??
                    defaultGridSetting.paginationResponsive
                  }
                  onChange={(val: any) => {
                    onChange("paginationResponsive", val);
                  }}
                />
              </Col>
              <Col>
                <Widgets.CheckboxWidget
                  checkedChildren="size default"
                  unCheckedChildren="size small"
                  value={
                    settings.paginationSize ?? defaultGridSetting.paginationSize
                  }
                  onChange={(val: any) => {
                    onChange("paginationSize", val);
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={16} className="gx-mt-2">
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <DescriptionItem
              title="Phân trang trên"
              content={
                <Widgets.RadioGroupWidget
                  valueEnum={{
                    topLeft: { text: "topLeft", status: "Custom" },
                    topCenter: { text: "topCenter", status: "Custom" },
                    topRight: { text: "topRight", status: "Custom" },
                    none: { text: "none", status: "Custom" },
                  }}
                  value={
                    settings.paginationTop || defaultGridSetting.paginationTop
                  }
                  onChange={(val: any) => {
                    onChange("paginationTop", val);
                  }}
                />
              }
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <DescriptionItem
              title="Phân trang dưới"
              content={
                <Widgets.RadioGroupWidget
                  valueEnum={{
                    bottomLeft: { text: "bottomLeft", status: "Custom" },
                    bottomCenter: { text: "bottomCenter", status: "Custom" },
                    bottomRight: { text: "bottomRight", status: "Custom" },
                    none: { text: "none", status: "Custom" },
                  }}
                  value={
                    settings.paginationBottom ||
                    defaultGridSetting.paginationBottom
                  }
                  onChange={(val: any) => {
                    onChange("paginationBottom", val);
                  }}
                />
              }
            />
          </Col>
        </Row>

        <Divider orientation="center">Preview Table Example</Divider>
        <Row gutter={16}>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <ProTable
              bordered={settings.bordered}
              type="table"
              tableClassName="gx-table-responsive"
              dateFormatter="string"
              // components={{
              //   header: {
              //     cell: ResizableHeaderTitle,
              //   },
              // }}
              headerTitle={restProps.name}
              rowKey={"id"}
              scroll={{
                scrollToFirstRowOnChange: true,
                x: "max-content",
              }}
              tableLayout="auto"
              search={true}
              tableAlertRender={false}
              pagination={pagination}
              columns={columns}
              dataSource={defaultData}
              // columnsStateMap={this.state.columnsStateMap}
              // onColumnsStateChange={(mapCols) => {
              //   this.setState({
              //     columnsStateMap: mapCols,
              //   });
              // }}
              // toolBarRender={this.toolBarRender}
            />
          </Col>
        </Row>
      </Drawer>
    </React.Fragment>
  );
};

export default React.memo(GridSetting);
