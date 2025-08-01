import { Component } from 'react';
import { Button, Card, Col, Input, Row, Tabs, Select } from 'antd';
import { SaveOutlined, CopyOutlined } from '@ant-design/icons';
import queryString from 'qs';
import { helper } from '@src/controls/controlHelper';
import APIEditor from '@src/controls/editors/APIEditor';
import ButtonEditor, {
  IButtonEditor,
} from '@src/controls/editors/ButtonEditor';
import GridEditor, {
  IGridEditorColumn,
} from '@src/controls/editors/GridEditor';
import Widgets from '@src/packages/pro-component/schema/Widgets';
import SchemaEditor, {
  ISchemaEditorProperties,
} from '@src/controls/editors/SchemaEditor';
import { DEFAULT_PAGE_EDITOR_ID, IS_DEBUG } from '@src/constants/constants';
import HttpStatusCode from '@src/constants/HttpStatusCode';

const { TabPane } = Tabs;

export const defaultSchema: ISchemaSetting = {
  layoutCtrl: 'DefaultCtrl',
  layout: 'oneCol',
  colon: true,
  formLayout: 'horizontal',
  horizontal: 16,
  vertical: 16,
  columns: 2,
  divider: 'none',
  dividerText: false,
  dividerTextItems: [],
};

export const defaultGridSetting: IGridSetting = {
  layout: 'DefaultCtrl',
  paginationTop: 'topRight',
  paginationBottom: 'bottomRight',
  bordered: false,
  paginationShowQuickJumper: false,
  paginationShowSizeChanger: true,
  paginationSimple: false,
  paginationShowTitle: true,
  paginationShowLessItems: false,
  paginationResponsive: true,
  paginationSize: 'default',
};

export const defaultSettings: {
  schema: ISchemaSetting;
  grid: IGridSetting;
} = {
  schema: defaultSchema,
  grid: defaultGridSetting,
};

export const defaultPageInfo: IPageEditorProps = {
  schema: [],
  apis: [],
  buttons: [],
  name: '',
  description: '',
  form: {},
  read: '',
  roles: [],
  grid: [],
  settings: defaultSettings,
};

export type IPageEditorProps = {
  id?: number;
  name: string;
  schema: Array<ISchemaEditorProperties>;
  roles: Array<number>;
  description: string;
  apis: Array<any>;
  read: string;
  buttons: Array<IButtonEditor>;
  grid: Array<IGridEditorColumn>;
  settings: {
    schema: ISchemaSetting;
    grid: IGridSetting;
  };
  type?: string;
  submit?: string;
  createdAt?: number;
  updatedAt?: number;
  form?: any;
  procedures?: Array<any>;
};

export type ISchemaSetting = {
  layoutCtrl: string;
  layout: string;
  colon: boolean;
  formLayout: 'horizontal' | 'vertical' | 'inline';
  horizontal: number;
  vertical: number;
  columns: number;
  divider: 'none' | 'left' | 'right' | 'center';
  dividerText?: boolean;
  dividerTextItems?: Array<{
    title?: string;
    show?: boolean;
  }>;
};

export type IGridSetting = {
  layout: string;
  paginationTop: 'topLeft' | 'topCenter' | 'topRight' | 'none';
  paginationBottom: 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'none';
  bordered: boolean;
  paginationShowQuickJumper: boolean;
  paginationShowSizeChanger: boolean;
  paginationSimple: boolean;
  paginationShowTitle: boolean;
  paginationShowLessItems: boolean;
  paginationResponsive: boolean;
  paginationSize: 'default' | 'small';
  // [x: string]: any
};

export interface PageEditorProps {
  location?: any;
}

export interface PageEditorState {
  activeTab: string | number;
  data: any;
  pageData: any;
  pageInfo: IPageEditorProps;
  form?: any;
  name?: string;
  desc?: string;
  apis: Array<any>;
  read?: string;
  buttons?: Array<IButtonEditor>;
  grid?: Array<IGridSetting>;
  id?: any;
  roles?: Array<number>;
  schema: Array<ISchemaEditorProperties>;
  error?: string;
  settings: {
    schema: ISchemaSetting;
    grid: IGridSetting;
  };
}
class PageEditor extends Component<PageEditorProps, PageEditorState> {
  constructor(props: PageEditorProps) {
    super(props);
    this.state = {
      activeTab: `1`,
      schema: [],
      data: {},
      apis: [],
      buttons: [],
      pageData: null,
      name: '',
      desc: '',
      read: '',
      pageInfo: defaultPageInfo,
      roles: [],
      settings: defaultSettings,
    };
    this.query = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    this.loadData();
  }

  query: any;
  page = null;
  pageInfo: any;

  async loadData() {
    this.pageInfo = await helper.getPage(DEFAULT_PAGE_EDITOR_ID);
    if (this.query.mode === 'edit') {
      if (!this.query.id) {
        return this.setState({ error: 'Không có thông tin để tải dữ liệu' });
      }
      const rs: any = await helper.callPageApi(
        this.pageInfo,
        this.pageInfo.read,
        {
          queryInput: JSON.stringify({ id: this.query.id }),
        }
      );
      if (IS_DEBUG) {
        console.log(`🚀 ~ file: PageEditor.tsx ~ line 74 ~ loadData ~ rs`, rs);
      }
      if (rs.status == HttpStatusCode.OK) {
        this.setState({
          schema: rs?.data?.data[0]?.schema,
          roles: rs?.data?.data[0]?.roles,
          form: rs?.data?.data[0]?.form,
          name: rs?.data?.data[0]?.name,
          desc: rs?.data?.data[0]?.desc,
          apis: rs?.data?.data[0]?.apis || [],
          read: rs?.data?.data[0]?.read,
          buttons: rs?.data?.data[0]?.buttons,
          grid: rs?.data?.data[0]?.grid,
          settings: rs?.data?.data[0]?.settings || defaultSettings,
        });
      } else {
        helper.alert(rs?.data?.message || 'Đã có lỗi xảy ra', 'error');
      }
    }
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.location != this.props.location) {
      this.query = queryString.parse(this.props.location.search, {
        ignoreQueryPrefix: true,
      });
      this.loadData();
    }
  }

  async saveData() {
    const input = {
      name: this.state.name,
      desc: this.state.desc,
      apis: this.state.apis,
      read: this.state.read,
      buttons: this.state.buttons,
      grid: this.state.grid,
      id: this.query.id,
      roles: this.state.roles,
      schema: this.state.schema,
      settings: this.state.settings,
    };
    await helper.callPageApi(this.pageInfo, 'update', input);
    helper.alert('Cập nhật thành công');
  }

  async createPage() {
    const input = {
      name: this.state.name,
      desc: this.state.desc,
      apis: this.state.apis,
      read: this.state.read,
      buttons: this.state.buttons,
      grid: this.state.grid,
      schema: this.state.schema,
      roles: this.state.roles,
      settings: this.state.settings || defaultSettings,
    };
    await helper.callPageApi(this.pageInfo, 'create', input);
    helper.alert('Tạo mới thành công');
  }

  toggleTab(activeTab: string) {
    this.setState({ activeTab });
  }

  render() {
    let header = null;
    switch (this.query.mode) {
      case 'create':
        header = (
          <div className='gx-d-flex gx-justify-content-between gx-align-items-center'>
            <h3 className='pull-left'>Tạo trang mới</h3>
            <Button
              htmlType='submit'
              type='primary'
              onClick={this.createPage.bind(this)}
              icon={<SaveOutlined />}
            >
              {`Tạo mới`}
            </Button>
          </div>
        );
        break;
      case 'edit':
        header = (
          <div className='gx-d-flex gx-justify-content-between gx-align-items-center'>
            <h3 className='pull-left'>Sửa thông tin trang</h3>
            <div>
              <Button
                htmlType='submit'
                type='default'
                onClick={this.createPage.bind(this)}
                icon={<CopyOutlined />}
              >
                {`Sao chép`}
              </Button>
              <Button
                htmlType='submit'
                type='primary'
                onClick={this.saveData.bind(this)}
                icon={<SaveOutlined />}
              >
                {`Lưu thông tin`}
              </Button>
            </div>
          </div>
        );
        break;
      default:
        break;
    }
    return (
      <Row>
        <Col md={24}>
          <Card title={header}>
            <Row gutter={[16, 0]}>
              <Col md={4}>
                <div>
                  <label>Tên trang</label>
                  <Input
                    value={this.state.name}
                    type='text'
                    placeholder='Tiêu đề'
                    required
                    onChange={(e) => {
                      this.setState({ name: e.target.value });
                    }}
                  />
                </div>
              </Col>
              <Col md={4}>
                <div>
                  <label>Mô tả</label>
                  <Input
                    value={this.state.desc}
                    type='text'
                    placeholder='Nhập mô tả trang'
                    required
                    onChange={(e) => {
                      this.setState({ desc: e.target.value });
                    }}
                  />
                </div>
              </Col>
              <Col md={8}>
                <div>
                  <label>Hàm tải dữ liệu</label>
                  <Select
                    style={{ width: '100%' }}
                    value={this.state.read}
                    onChange={(e: any) => {
                      this.setState({ read: e });
                    }}
                  >
                    <Select.Option key={-1} value={''}>
                      Chưa chọn
                    </Select.Option>
                    {this.state.apis.map((d: any, index: number) => (
                      <Select.Option key={index} value={d.name}>
                        {d.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col md={8}>
                <div className=''>
                  <label>Phân quyền</label>
                  <Widgets.ArrayModel
                    schema={{
                      pageId: 4,
                      modelSelectField: 'id,name',
                      api: 'find_role',
                    }}
                    value={this.state.roles}
                    onChange={(e: any) => {
                      this.setState({ roles: e });
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Card>
          <Card title=''>
            <Tabs
              activeKey={`${this.state.activeTab}`}
              onChange={(tabkey) => {
                this.toggleTab(tabkey);
              }}
            >
              <TabPane tab={`Form`} key={`1`}>
                <SchemaEditor
                  apis={this.state.apis}
                  schema={this.state.schema}
                  settings={this.state.settings.schema || defaultSchema}
                  onSettingChange={(settingSchema: ISchemaSetting) => {
                    this.setState({
                      settings: {
                        ...this.state.settings,
                        schema: settingSchema,
                      },
                    });
                  }}
                  onChange={(schema) => {
                    this.setState({ schema });
                  }}
                />
              </TabPane>
              <TabPane tab={`Button`} key={`2`}>
                <ButtonEditor
                  data={this.state.buttons || []}
                  apis={this.state.apis}
                  onChange={(buttons) => {
                    this.setState({ buttons });
                  }}
                />
              </TabPane>
              <TabPane tab={`API`} key={`3`}>
                <APIEditor
                  data={this.state.apis || []}
                  onChange={(apis) => {
                    this.setState({ apis });
                  }}
                />
              </TabPane>
              <TabPane tab={`Grid`} key={`4`}>
                <GridEditor
                  name={this.state.name}
                  data={this.state.grid || []}
                  apis={this.state.apis}
                  settings={this.state.settings.grid || defaultGridSetting}
                  onSettingChange={(settingGrid: IGridSetting) => {
                    this.setState({
                      settings: {
                        ...this.state.settings,
                        grid: settingGrid,
                      },
                    });
                  }}
                  onChange={(grid) => {
                    this.setState({ grid });
                  }}
                />
              </TabPane>
              {/* <TabPane tab={`Form JSON`} key={`5`}>
                <p>Tạm đóng</p>
              </TabPane> */}
            </Tabs>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default PageEditor;
