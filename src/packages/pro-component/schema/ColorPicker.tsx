import React, { useEffect, useState } from "react";
import { Popover, Button } from "antd";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/lib/css/styles.css";
import { isEqual } from "lodash";

type ColorPickerProps = {
  schema: Record<string, any>;
  disabled?: boolean;
  invalid?: boolean;
  value?: string;
  onChange?: (val: any) => void;
};

const ColorPickerComponent = ({
  value,
  onChange,
  schema,
}: ColorPickerProps) => {
  const [color, setColor] = useColor("hex", value || "#ed5b5b");

  useEffect(() => {
    if (isEqual(color.hex, value)) return;
    setColor((p: any) => ({
      ...p,
      hex: value,
    }));
  }, [value]);

  const content = (
    <ColorPicker
      width={300}
      height={150}
      color={color}
      onChange={(value) => {
        setColor(value);
        onChange?.(value.hex);
      }}
    />
  );

  return (
    <Popover content={content} trigger="click">
      <Button
      size="large"
        icon={
          <div
            style={{
              backgroundColor: color.hex,
              width: 26,
              height: 26,
              borderRadius: 5,
              marginRight: 6,
            }}
          />
        }
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        {color.hex ?? "Pick Color"}
      </Button>
    </Popover>
  );
};

export default ColorPickerComponent;
