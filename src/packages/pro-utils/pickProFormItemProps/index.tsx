const antdFormItemPropsList = [
  // https://ant.design/components/form-cn/#Form.Item
  'colon',
  'dependencies',
  'extra',
  'getValueFromEvent',
  'getValueProps',
  'hasFeedback',
  'help',
  'htmlFor',
  'initialValue',
  'noStyle',
  'label',
  'labelAlign',
  'labelCol',
  'name',
  'preserve',
  'normalize',
  'required',
  'rules',
  'shouldUpdate',
  'trigger',
  'validateFirst',
  'validateStatus',
  'validateTrigger',
  'valuePropName',
  'wrapperCol',
  'hidden',
  // 我自定义的
  'addonBefore',
  'addonAfter',
];

// eslint-disable-next-line @typescript-eslint/ban-types
export default function pickProFormItemProps(props: { [key: string]: any }) {
  const attrs: { [key: string]: any } = {};
  antdFormItemPropsList.forEach((key) => {
    if (props[key] !== undefined) {
      attrs[key] = props[key];
    }
  });
  return attrs;
}
