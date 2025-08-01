import Base from "@src/packages/pro-component/schema/Base";
import { ISchemaSetting } from "@src/routes/default/pageManager/PageEditor";
import React, { FC, useMemo } from "react";
import { Row, Col, Divider } from "antd";
import { helper } from "../controlHelper";
import { ISchemaEditorProperties } from "../editors/SchemaEditor";
import _ from "lodash";

export interface FormOneColumnProps {
  children?: React.ReactNode;
  schema: ISchemaEditorProperties[];
  settings: ISchemaSetting;
  data: { [x: string]: any };
  itemId: string | number | undefined;
}

const FormOneColumn: FC<FormOneColumnProps> = (props: FormOneColumnProps) => {
  const { schema, data, itemId, settings, children } = props;
  const spanCol = React.useMemo(
    () => 24 / settings.columns,
    [settings.columns]
  );

  const renderDiviver = (index: number) => {
    if (settings.divider == "none") {
      return null;
    } else if ((index + 1) % Number(settings.columns) == 0) {
      if (
        settings.dividerText == true &&
        settings.dividerTextItems &&
        Array.isArray(settings.dividerTextItems) &&
        settings.dividerTextItems[(index + 1) / Number(settings.columns) - 1] &&
        settings.dividerTextItems[(index + 1) / Number(settings.columns) - 1]
          .show == true
      ) {
        return (
          <Divider orientation={settings.divider}>
            <span className="gx-text-light">
              {
                settings.dividerTextItems[
                  (index + 1) / Number(settings.columns) - 1
                ].title
              }
            </span>
          </Divider>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
  let copyData = useMemo(() => {
    let copy = _.cloneDeep(data);
    schema.forEach((s: ISchemaEditorProperties) => {
      if (data.hasOwnProperty(s.field)) {
        copy[s.field] =
          s.type === "string" && !data[s.field] ? "" : data[s.field];
      } else if (s.type === "string") {
        copy[s.field] = "";
      } else copy[s.field] = null;
    });
    return copy;
  }, [data]);
  return (
    <>
      <Row gutter={[settings.horizontal, settings.vertical]}>
        {schema.map((comp: ISchemaEditorProperties, index: number) => {
          const flexStyleProps: any = {};
          if (comp.flex && comp.flex != "") {
            flexStyleProps.flex = comp.flex;
          }
          if (comp.maxWidth && comp.maxWidth != "") {
            flexStyleProps.style = {
              maxWidth: comp.maxWidth,
            };
          }
          if (comp.hideExpression) {
            let str = comp.hideExpression;
            for (const i in copyData) {
              str = helper.replaceAll(str, i, copyData[i]);
            }
            try {
              if (window.eval(str)) return null;
            } catch (err) {
              console.log(err);
              return null;
            }
          }
          return (
            <React.Fragment key={index}>
              <Col
                {...flexStyleProps}
                key={comp.field}
                xxl={spanCol}
                xl={spanCol}
                lg={spanCol}
                md={spanCol}
                sm={24}
                xs={24}
              >
                <Base
                  // ref={refBase}
                  key={index}
                  schema={comp}
                  /* onChange={(e) => {
                    const dt = Object.assign({}, this.props.data)
                    dt[comp.field] = e
                    if (this.props.onChange) {
                      this.props.onChange(dt)
                    }
                  }} */
                  // value={this.props.data[comp.field]}
                  data={data}
                  itemId={itemId || null}
                />
              </Col>
              {renderDiviver(index)}
            </React.Fragment>
          );
        })}
      </Row>
      <Divider orientation="left"></Divider>
      <Row gutter={[16, 16]} justify="end" align="bottom">
        <Col
          flex={`0`}
          xxl={{
            span: spanCol,
          }}
          xl={{
            span: spanCol,
          }}
          lg={{
            span: spanCol,
          }}
          md={{
            span: spanCol,
          }}
          sm={24}
          xs={24}
        >
          {children}
        </Col>
      </Row>
    </>
  );
};

export default React.memo(FormOneColumn);
