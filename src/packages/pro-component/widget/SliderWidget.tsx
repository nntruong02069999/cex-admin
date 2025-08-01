import React, { FC, useEffect, useState } from 'react';
import { Slider } from 'antd';
import { SliderMarks, SliderBaseProps } from 'antd/lib/slider';
import { isDeepEqualReact } from '@src/packages/pro-utils';

export type SliderWidgetProps = {
  value?: any;
  onChange?: (val: any) => void;
  data?: Array<number>;
} & Omit<SliderBaseProps, 'value' | 'onChange'>;

const SliderWidget: FC<SliderWidgetProps> = (props) => {
  const {
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    data,
    ...restProps
  } = props;
  const [val, setVal] = useState<number>(value ?? '');

  const marks = React.useMemo<SliderMarks | null>(() => {
    if (!data) return null;
    const _masks: any = {};
    data.forEach((value, i) => {
      _masks[i] = value;
    });
    return _masks;
  }, [data]);

  useEffect(() => {
    if (!isDeepEqualReact(val, value)) {
      setVal(value);
      if (value) {
        onChange?.(value);
      }
    }
  }, [value]);

  if (marks) {
    return (
      <Slider
        min={min}
        max={Object.keys(marks).length - 1}
        marks={marks}
        step={null}
        tipFormatter={(value: any) => marks[value]}
        {...restProps}
        value={data?.findIndex((i) => i == val)}
        onChange={(e: any) => {
          props.onChange?.(marks[e]);
        }}
      ></Slider>
    );
  }
  return (
    <Slider
      min={min}
      max={max}
      step={step}
      tipFormatter={(value: any) => value}
      {...restProps}
      value={val}
      onChange={(e: any) => {
        props.onChange?.(e);
      }}
    ></Slider>
  );
};

export default SliderWidget;
