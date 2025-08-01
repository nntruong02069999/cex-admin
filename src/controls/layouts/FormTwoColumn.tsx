import Base from "@src/packages/pro-component/schema/Base";
import { ISchemaSetting } from "@src/routes/default/pageManager/PageEditor";
import React, { FC } from "react";
import { Row, Col } from "antd";
import { helper } from "../controlHelper";
import { ISchemaEditorProperties } from "../editors/SchemaEditor";
import _ from "lodash";

export interface FormTwoColumnProps {
  children?: React.ReactNode;
  schema: ISchemaEditorProperties[];
  settings: ISchemaSetting;
  data: { [x: string]: any };
  itemId: string | number | undefined;
}

const FormTwoColumn: FC<FormTwoColumnProps> = (props: FormTwoColumnProps) => {
  const { schema, data, itemId } = props;
  // const refBase = React.useRef<any>()
  let copy = _.cloneDeep(data);
  schema.forEach((s: ISchemaEditorProperties) => {
    if (data.hasOwnProperty(s.field)) {
      copy[s.field] = data[s.field];
    } else if (s.type === "string") {
      copy[s.field] = "";
    } else copy[s.field] = null;
  });
  const shallowSchema = React.useMemo(() => {
    return schema.filter((comp: ISchemaEditorProperties) => {
      if (comp.hideExpression) {
        let str = comp.hideExpression;
        for (const i in copy) {
          str = helper.replaceAll(str, i, copy[i]);
        }
        try {
          if (window.eval(str)) return false;
        } catch (err) {
          return true;
        }
        return true;
      }
      return true;
    });
  }, [schema]);

  const totalRows = React.useMemo(() => {
    return Math.ceil(shallowSchema.length / 2);
  }, [shallowSchema]);

  const renderCol = (rowIdx: number) => {
    const startIdx = (rowIdx - 1) * 2;
    const endIdx = rowIdx * 2;
    const arrCols = schema.slice(startIdx, endIdx);
    return arrCols.map((comp: ISchemaEditorProperties, index: number) => {
      return (
        <Col key={comp.field} md={12} sm={24}>
          <Base
            // ref={refBase}
            key={index}
            schema={comp}
            data={data}
            itemId={itemId || null}
            /* labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }} */
          />
        </Col>
      );
    });
  };

  return (
    <React.Fragment>
      {Array.from({ length: totalRows }).map((_currentElement, rowIdx) => {
        return (
          <Row key={rowIdx} gutter={[16, 16]}>
            {renderCol(rowIdx + 1)}
          </Row>
        );
      })}
    </React.Fragment>
  );
};

export default React.memo(FormTwoColumn);
