import React, { FC, useEffect, useState } from "react";
import { Dropdown, Tag, Tooltip, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";
import clone from "lodash/clone";
import join from "lodash/join";
import ArrayTable from "./ArrayTable";
// import SingleModel from './SingleModel'
import { helper } from "@src/controls/controlHelper";
import { IS_DEBUG } from "@src/constants/constants";

const ArraySelect: FC<{
  type?: "radio" | "checkbox";
  schema: any;
  disabled?: boolean;
  invalid?: boolean;
  value?: any;
  onChange?: (val: any) => void;
  placeholder?: string;
}> = (props) => {
  const {
    type = "checkbox",
    schema,
    value: initValue,
    onChange: superChange,
    placeholder = "",
    ...rest
  } = props;
  const [pageInfo, setPageInfo] = useState<any>({});
  const [displayObj, setDisplayObj] = useState<{
    names: Array<any>;
    display: any;
  }>({
    names: [],
    display: "",
  });
  const [pageId] = useState<number>(props.schema.pageId || 0);
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(() => {
    if (initValue) {
      if (Array.isArray(initValue)) {
        return initValue;
      } else {
        return [initValue];
      }
    }
    return [];
    /* if (type == 'checkbox') {
      return initValue && Array.isArray(initValue) ? initValue : []
    } else {
      return initValue && typeof initValue == 'object' ? initValue : {}
    } */
  });

  const fetchItemName = async (_pageInfo: any, _schema: any, _output: any) => {
    if (!_pageInfo || !_schema || !_output) return;
    const filter: Record<string, any> = {};
    filter.id = _output;
    try {
      const rs: any = await helper.callPageApi(_pageInfo, _schema.api, {
        queryInput: JSON.stringify(filter),
        select: "name",
      });
      const display: Array<any> = [];
      rs?.data?.data.map((d: Record<string, any>) => {
        return display.push(d.name);
      });
      setDisplayObj({ names: rs?.data?.data, display: join(display, "-") });
    } catch (err) {
      if (IS_DEBUG) {
        console.log(
          `🚀 ~ file: ArraySelect.tsx ~ line 60 ~ fetchItemName ~ err`,
          err
        );
      }
    }
  };

  const init = async (_pageId: number, _schema: any, _output: any) => {
    const _pageInfo = await helper.getPage(_pageId);
    setPageInfo(_pageInfo);
    fetchItemName(_pageInfo, _schema, _output);
  };

  const handleVisibleChange = () => {
    setVisible(!visible);
  };

  const onChange = (keys: Array<number>, rows: Array<Record<string, any>>) => {
    setValue(keys);
    setDisplayObj((prev) => ({
      ...prev,
      names: rows,
    }));
    if (type == "checkbox") {
      superChange?.(keys);
    } else {
      superChange?.(keys[0]);
    }
  };

  const onRemoveClick = (id: number) => {
    if (IS_DEBUG) {
      console.log(
        `🚀 ~ file: ArraySelect.tsx ~ line 89 ~ onRemoveClick ~ id`,
        id
      );
    }

    const output = [];
    const _names: Array<any> = [];
    for (let i = 0; i < displayObj.names.length; i++) {
      if (displayObj.names[i].id !== id) {
        output.push(displayObj.names[i].id);
        _names.push(displayObj.names[i]);
      }
    }
    setValue(output);
    setDisplayObj((prev) => ({
      ...prev,
      names: _names,
    }));
    onChange(output, _names);
  };

  const renderNames = () => {
    const _renderTags = (items: Array<any>) => (
      <Row style={{ marginLeft: 0, marginRight: 0 }} gutter={[0, 4]}>
        {items.map((item: any) => (
          <Col key={item.id}>
            <Tag
              key={item.id}
              closable={!rest.disabled}
              // color={COLORS[random(11)]}
              onClose={() => {
                onRemoveClick(item.id);
              }}
            >
              {item.name}
            </Tag>
          </Col>
        ))}
      </Row>
    );
    const _tags = _renderTags(displayObj.names);
    if (displayObj.names.length === 0) return null;
    if (displayObj.names.length <= 4) {
      return <React.Fragment>{_tags}</React.Fragment>;
    }
    return <Tooltip title={_tags}>Đã chọn {displayObj.names.length}</Tooltip>;
  };

  useEffect(() => {
    init(props.schema.pageId, props.schema, clone(props.value || []));
  }, []);

  useEffect(() => {
    if (props.schema.pageId != pageId) {
      fetchItemName(pageInfo, props.schema, initValue);
    }
  }, [initValue]);

  const overlay = React.useMemo(
    () =>
      type == "checkbox" ? (
        <ArrayTable
          pageInfo={pageInfo}
          schema={schema}
          value={value}
          onChange={onChange}
          disabled={rest.disabled}
          itemsPerPage={5}
          type={type}
        />
      ) : (
        <ArrayTable
          pageInfo={pageInfo}
          schema={schema}
          value={value}
          onChange={onChange}
          disabled={rest.disabled}
          itemsPerPage={5}
          type={"radio"}
        />
      ),
    [type, pageInfo, schema, value, onChange, rest.disabled]
  );


  return (
    <Dropdown
      overlayStyle={{
        minWidth: "450px",
      }}
      overlay={overlay}
      trigger={["click"]}
      placement="bottomLeft"
      onVisibleChange={handleVisibleChange}
      visible={visible}
      disabled={rest.disabled}
    >
      <div className="gx-dropdown-content">
        {type == "checkbox"
          ? value && value.length > 0
            ? renderNames()
            : placeholder || "Chọn đơn vị"
          : value && Object.keys(value).length > 0
          ? renderNames()
          : placeholder || "Chọn đơn vị"}
        &nbsp;
        <a
          className="ant-dropdown-link"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <DownOutlined color="#1DA57A" />
        </a>
      </div>
    </Dropdown>
  );
};

export default ArraySelect;
