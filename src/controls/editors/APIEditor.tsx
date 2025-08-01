import { Component } from 'react';
import { Button, Col, Input, Row, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import OrderableList from './OrderableList';
import ArrayEditor from './ArrayEditor';
import Widgets from '@src/packages/pro-component/schema/Widgets';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const types = ['create', 'update', 'find'];

class APIEditor extends Component<
  {
    apis?: any;
    data: any;
    onChange?: (val: any) => void;
    onSave?: (val?: any) => void;
  },
  {
    apis?: any;
    currentAPI?: any;
    currentIndex?: any;
    error?: any;
    pIndex?: any;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      apis: this.props.apis,
      currentAPI: null,
      currentIndex: 0,
      error: null,
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(next: any) {
    this.setState({ apis: next.apis });
  }

  onPropertyClick(property: any) {
    this.setState({ pIndex: property });
  }

  addItem = () => {
    const dt = this.props.data.splice(0);
    dt.push({});
    this.onChange(dt);
  };

  onChange(dt: any) {
    if (this.props.onChange) {
      this.props.onChange(dt);
    }
  }

  onAPIDataChange(name: any, val: any) {
    const apis = this.props.data;
    const item: Array<any> = apis[this.state.currentIndex];
    item[name] = val;
    this.setState({ apis });
  }

  deleteProperty() {
    const dt = this.props.data.splice(0);
    dt.splice(this.state.currentIndex, 1);
    let currentIndex = this.state.currentIndex;
    currentIndex--;
    if (currentIndex < 0) currentIndex = 0;
    this.setState({ currentIndex });
    this.onChange(dt);
  }

  OrderableListSideBar = () => {
    return (
      <OrderableList
        name={'API'}
        items={this.props.data}
        renderItem={(item, index) => {
          return (
            <div
              className={`gx-editor-properties-item ${
                this.state.currentIndex === index ? 'active' : ''
              }`}
              onClick={() => this.setState({ currentIndex: index })}
            >
              <div className='gx-editor-properties-row'>
                <div className='gx-editor-avatar'>
                  <div className='gx-status-pos'>
                    {this.state.currentIndex === index ? (
                      <i className='icon icon-rendaring-calendar gx-pt-1' />
                    ) : (
                      <i className={`icon icon-circle gx-text-teal`} />
                    )}
                  </div>
                </div>
                <div className='gx-editor-orderable-col'>
                  <div className='h4 gx-name'>
                    {item.name || 'Chưa đặt tên'}
                  </div>
                  <div className='gx-editor-info-des gx-text-truncate'>
                    {item.url}
                  </div>
                </div>
              </div>
            </div>
          );
        }}
        activeIndex={this.state.currentIndex}
        onChange={(result) => {
          const dt = result.items.splice(0);
          this.onChange(dt);
          this.setState({ currentIndex: result.activeIndex });

          this.setState({
            apis: result.items,
            currentIndex: result.activeIndex,
          });
        }}
        headerButtons={() => {
          return (
            <Button
              type='primary'
              className='gx-btn-block'
              onClick={() => {
                this.addItem();
              }}
            >
              {' '}
              Thêm trường{' '}
            </Button>
          );
        }}
      />
    );
  };

  Editor = (currentAPI: any) => {
    const rowStyles: any = {
      gutter: [16, 16],
    };
    const labelCols = {
      sm: 24,
      md: 6,
    };
    const inputCols = {
      sm: 24,
      md: 18,
    };
    return (
      <div className='gx-form-editor'>
        <div className='gx-form-editor-header'>
          <Row {...rowStyles} className='gx-mt-2' justify='space-between'>
            <Col>
              <span>Thuộc tính </span>
            </Col>
            <Col>
              <Button
                type='primary'
                danger
                onClick={this.deleteProperty.bind(this)}
                icon={<DeleteOutlined />}
              >
                Xóa
              </Button>
            </Col>
          </Row>
        </div>
        <div className='gx-form-editor-content'>
          <Row {...rowStyles} className='gx-mt-2'>
            <Col {...labelCols}>
              <span>Tên</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentAPI.name || ''}
                type='text'
                placeholder='Tiêu đề'
                required
                onChange={(e) => {
                  this.onAPIDataChange('name', e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className='gx-mt-2'>
            <Col {...labelCols}>
              <span>Kiểu</span>
            </Col>
            <Col {...inputCols}>
              <Select
                style={{ minWidth: '100px' }}
                value={currentAPI.type || ''}
                onChange={(e) => {
                  this.onAPIDataChange('type', e);
                }}
              >
                <Select.Option key={-1} value={''}>
                  Chưa chọn
                </Select.Option>
                {types.map((d) => (
                  <Select.Option key={d} value={d}>
                    {d}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Row {...rowStyles} className='gx-mt-2'>
            <Col {...labelCols}>
              <span>Url</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentAPI.url || ''}
                type='text'
                required
                onChange={(e) => {
                  this.onAPIDataChange('url', e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className='gx-mt-2'>
            <Col {...labelCols}>
              <span>Phân quyền</span>
            </Col>
            <Col {...inputCols}>
              <Widgets.ArrayModel
                schema={{
                  pageId: 4,
                  modelSelectMultiple: true,
                  modelSelectField: 'id,name',
                  embeds: [],
                  api: 'find_role',
                }}
                value={currentAPI.roles || []}
                onChange={(e: any) => {
                  this.onAPIDataChange('roles', e);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className='gx-mt-2'>
            <Col {...labelCols}>
              <span>Tùy chọn gửi lên</span>
            </Col>
            <Col {...inputCols}>
              <ArrayEditor
                value={currentAPI.options || []}
                onChange={(val) => {
                  this.onAPIDataChange('options', val);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className='gx-mt-2'>
            <Col {...labelCols}>
              <span>Tùy chọn cập nhật</span>
            </Col>
            <Col {...inputCols}>
              <ArrayEditor
                value={currentAPI.criterias || ''}
                onChange={(val) => {
                  this.onAPIDataChange('criterias', val);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className='gx-mt-2'>
            <Col {...labelCols}>
              <span>Dữ liệu gửi lên</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentAPI.requestFields || ''}
                type='text'
                required
                onChange={(e) => {
                  this.onAPIDataChange('requestFields', e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className='gx-mt-2'>
            <Col {...labelCols}>
              <span>Dữ liệu trả về</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentAPI.responseFields || ''}
                type='text'
                required
                onChange={(e) => {
                  this.onAPIDataChange('responseFields', e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row {...rowStyles} className='gx-mt-2'>
            <Col {...labelCols}>
              <span>Phương thức http</span>
            </Col>
            <Col {...inputCols}>
              <Select
                style={{ minWidth: '100px' }}
                value={currentAPI.method || ''}
                onChange={(e) => {
                  this.onAPIDataChange('method', e);
                }}
              >
                <Select.Option key={-1} value={''}>
                  Chưa chọn
                </Select.Option>
                {methods.map((d) => (
                  <Select.Option key={d} value={d}>
                    {d}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Row {...rowStyles} className='gx-mt-2'>
            <Col {...labelCols}>
              <span>Xuất báo cáo</span>
            </Col>
            <Col {...inputCols}>
              <Input
                value={currentAPI.downloadReport || ''}
                type='text'
                required
                onChange={(e) => {
                  this.onAPIDataChange('downloadReport', e.target.value);
                }}
              />
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  render() {
    const currentAPI = this.props.data[this.state.currentIndex];
    return (
      <div className='gx-main-content'>
        <div className='gx-editor-module'>
          <div className='gx-editor-sidenav gx-d-lg-flex'>
            {this.OrderableListSideBar()}
          </div>
          <div className='gx-editor-box'>
            <div className='gx-editor-box-header'>
              <div className='gx-editor-box-header-info'>
                <h5 className='gx-text-uppercase gx-font-weight-bold'>API</h5>
                <div className='gx-font-weight-semi-bold'>Quản lý API</div>
              </div>
              <div className='gx-editor-box-header-setting'>
                {/* <SettingOutlined /> */}
              </div>
            </div>
            <div className='gx-editor-box-content'>
              {currentAPI ? this.Editor(currentAPI) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default APIEditor;
