import { Component } from 'react';
import { Input, Button, Row, Col, Select, Switch } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import clone from 'lodash/clone';
import ColorPicker from '@src/containers/ColorPicker';
import { IS_DEBUG } from '@src/constants/constants';
const dataTypes = ['number', 'string'];

const STATUS_ARRAY = [
  'Success',
  'Error',
  'Processing',
  'Default',
  'Warning',
  'Custom',
];

class ArrayEditor extends Component<
  {
    value?: any;
    onChange?: (val: any) => void;
  },
  {
    type?: any;
    data?: any;
  }
> {
  constructor(props: any) {
    super(props);
    let type = 'string';
    if (props.value && props.value.length > 0) {
      type = typeof props.value[0];
    }
    this.state = {
      type,
      data: props.value || [],
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(next: any) {
    let type = 'string';
    if (next.value && next.value.length > 0) {
      type = typeof next.value[0];
    }
    this.setState({ data: next.value || [], type });
  }

  /* static getDerivedStateFromProps(
    nextProps: {
      value?: any
      onChange?: (val: any) => void
    },
    prevState: {
      type?: any
      data?: any
    }
  ) {
    if (nextProps.value != prevState.data) {
      if (nextProps.value && nextProps.value.length > 0) {
        return { data: nextProps.value || [], type: typeof nextProps.value[0] }
      } else {
        return { data: nextProps.value || [], type: 'string' }
      }
    } else return null // Triggers no change in the state
  } */

  fixData = (data: any, type: any) => {
    if (type === 'number') {
      if (data) {
        data.map((d: any) => {
          return (d.value = Number(d.value));
        });
      }
    } else {
      if (data) {
        data.map((d: any) => {
          return (d.value = d.value + '');
        });
      }
    }
    return data;
  };

  addItem = () => {
    const data = clone(this.state.data);
    const value = this.state.type === 'number' ? 0 : '';
    data.push({ key: '', value });
    this.setState({ data });
  };

  removeItem = (index: number) => {
    const data = clone(this.state.data);
    data.splice(index, 1);
    this.setState({ data });
    if (this.props.onChange) {
      this.props.onChange(this.fixData(data, this.state.type));
    }
  };

  onItemDataChange = (index: number, name: string, val: any) => {
    const data = clone(this.state.data);
    const item = data[index];
    item[name] = val;
    data[index] = item;
    this.setState({ data });
    if (this.props.onChange) {
      this.props.onChange(this.fixData(data, this.state.type));
    }
  };

  render() {
    if (IS_DEBUG) {
      console.log(
        `🚀 ~ file: ArrayEditor.tsx ~ line 111 ~ this.state`,
        this.state
      );
    }
    return (
      <div className='gx-array-editor'>
        <Row gutter={[16, 16]}>
          <Col md={16}>
            <Select
              style={{ minWidth: '100%' }}
              // value={this.state.type || 'object'}
              onChange={(e: any) => {
                // this.onDataChange(this.state.data, e.target.value);
                this.setState({ type: e });
              }}
            >
              {dataTypes.map((d) => (
                <Select.Option key={d} value={d}>
                  {d}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col md={8}>
            <Button
              block
              onClick={this.addItem}
              type='dashed'
              icon={<PlusOutlined />}
            >
              {`Thêm`}
            </Button>
          </Col>
        </Row>
        {this.state.data.map((item: any, index: number) => {
          return (
            <Row
              className='gx-mt-1'
              key={index}
              gutter={[16, 16]}
              align='middle'
            >
              <Col xs={5}>
                {`Text hiển thị:`}
                <Input
                  type='text'
                  value={item.key}
                  placeholder={'Khóa'}
                  onChange={(e) => {
                    this.onItemDataChange(index, 'key', e.target.value);
                  }}
                />
              </Col>
              <Col xs={5}>
                {`Value từ API:`}
                <Input
                  type='text'
                  value={item.value}
                  placeholder={'Giá trị'}
                  onChange={(e) => {
                    this.onItemDataChange(index, 'value', e.target.value);
                  }}
                />
              </Col>
              <Col xs={12}>
                {`status:`}
                <Row gutter={16} justify='start' align='middle'>
                  <Col>
                    <Select
                      value={item.status || 'Init'}
                      placeholder={'Màu'}
                      onChange={(e) => {
                        this.onItemDataChange(index, 'status', e);
                      }}
                    >
                      <Select.Option key={''} value={'Init'}>
                        {`Không hiển thị`}
                      </Select.Option>
                      {STATUS_ARRAY.map((d) => (
                        <Select.Option key={d} value={d}>
                          {d}
                        </Select.Option>
                      ))}
                    </Select>
                  </Col>
                  {item.status && item.status == 'Custom' ? (
                    <Col>
                      <ColorPicker
                        type='sketch'
                        small
                        color={item.color || '#fff'}
                        position='top'
                        presetColors={[
                          '#038fde',
                          '#722ED1',
                          '#2F54EB',
                          '#1890FF',
                          '#13C2C2',
                          '#EB2F96',
                          '#F5222D',
                          '#FA541C',
                          '#FA8C16',
                          '#FAAD14',
                          '#FADB14',
                          '#A0D911',
                          '#52C41A',
                        ]}
                        onChangeComplete={(color: string) =>
                          this.onItemDataChange(index, 'color', color)
                        }
                      >
                        {item.color ? item.color.replace(/-/g, ' ') : '#fff'}
                      </ColorPicker>
                    </Col>
                  ) : null}
                  <Col>
                    <Switch
                      checkedChildren='Text'
                      unCheckedChildren='Text'
                      defaultChecked={item.isText || false}
                      onChange={(e: boolean) => {
                        this.onItemDataChange(index, 'isText', e);
                      }}
                    />
                  </Col>
                </Row>
              </Col>
              <Col xs={2}>
                {``}
                <Button
                  block
                  danger
                  onClick={() => {
                    this.removeItem(index);
                  }}
                  icon={<DeleteOutlined />}
                >
                  {``}
                </Button>
              </Col>
            </Row>
          );
        })}
      </div>
    );
  }
}

export default ArrayEditor;
