import React, { Component, Fragment } from 'react';
import { formatMessage, FormattedMessage, injectIntl } from 'react-intl';
import { Form, Input, Upload, Select, Button,Divider } from 'antd';
import { connect } from 'dva';
import { UploadOutlined } from '@ant-design/icons';
import styles from './BaseView.less';
// import GeographicView from './GeographicView';
// import PhoneView from './PhoneView';
// import { getTimeDistance } from '@/utils/utils';

const FormItem = Form.Item;
const { Option } = Select;

const AvatarView = ({ avatar }) => (
  <Fragment>
    <div className={"avatar"}>
      <img src={avatar} alt="avatar" />
    </div>
    <Upload fileList={[]}>
      <div className={"button_view"}>
        <Button icon={<UploadOutlined />}>
          Chọn ảnh từ máy
        </Button>
      </div>
    </Upload>
  </Fragment>
);

const validatorGeographic = (rule, value, callback) => {
  const { province, city } = value;
  if (!province.key) {
    callback('Please input your province!');
  }
  if (!city.key) {
    callback('Please input your city!');
  }
  callback();
};

const validatorPhone = (rule, value, callback) => {
  const values = value.split('-');
  if (!values[0]) {
    callback('Please input your area code!');
  }
  if (!values[1]) {
    callback('Please input your phone number!');
  }
  callback();
};

class BaseView extends Component {
  form = React.createRef();

  componentDidMount() {
    this.setBaseInfo();
  }

  setBaseInfo = () => {
    const  currentUser = JSON.parse(localStorage.getItem("user_id"));
    Object.keys(this.form.current.getFieldsValue()).forEach(key => {
      const obj = {};
      obj[key] = currentUser[key] || null;
      this.form.current.setFieldsValue(obj);
    });
  };

  getAvatarURL() {
    const currentUser = JSON.parse(localStorage.getItem("user_id"));
  
    if (currentUser?.avatar) {
      return currentUser.avatar;
    }
    const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
    return url;
  }

  getViewDom = ref => {
    this.view = ref;
  };

  render() {
    const {
      intl: { formatMessage }
    } = this.props;
    return (
    <>
      <Divider >Thông tin tài khoản</Divider>
      <div className={"baseView"} ref={this.getViewDom}>
        <div className={"left"}>
          <Form ref={this.form} layout="vertical" onSucess={this.handleSubmit} hideRequiredMark>
            <FormItem
              label={"Tên"}
              name="name"
              rules={[
                {
                  required: false,
                  message: "tên sai",
                },
              ]}
            >
              <Input />
            </FormItem>
            <FormItem label={"Email"}
              name="email"
              rules={[
                {
                  required: true,
                  message: "tài khoản sai",
                },
              ]}
            >
              <Input />
            </FormItem>
            <FormItem
              label={"Số điện thoại"}
              name="phone"
              rules={[
                {
                  required: false,
                  message: "địa chỉ sai",
                },
              ]}
            >
              <Input
              />
            </FormItem>
            {/* <FormItem label={formatMessage({ id: 'app.settings.basic.phone' })}
              name="address"
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'app.settings.basic.phone-message' }, {}),
                },
                { validator: validatorPhone },
              ]}
            >
              <Input />
            </FormItem> */}
            {/* <FormItem label={formatMessage({ id: 'app.settings.basic.phone' })}
              name="phone"
              rule={[
                {
                  required: true,
                  message: formatMessage({ id: 'app.settings.basic.phone-message' }, {}),
                },
                { validator: validatorPhone },
              ]}
            >
             <PhoneView />
            </FormItem> */}
            <Button type="primary">
              Cập nhật
            </Button>
          </Form>
        </div>
        <div className={"right"}>
          <AvatarView avatar={this.getAvatarURL()} />
        </div>
      </div>
    </>);
  }
}

export default BaseView;
