/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-restricted-globals */
import { useState, useEffect, useRef } from 'react';
import {
  Form,
  Button,
  Popover,
  Row,
  Col,
  Cascader,
  Switch,
  Card,
  Select,
  Modal,
  Input,
  Affix,
  Steps,
  message,
} from 'antd';

import { connect } from 'dva';
import { CloseCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { FormInputRender } from '@src/packages/pro-table/form';
import { useIntl } from '@src/packages/pro-table/component/intlContext';
import {
  ConfigProDuctTypeAttributesInput,
  SalePriceByQuanityInput,
} from '@src/eCommerce/component';
import Upload from '../../../components/Upload';
import _ from 'lodash';
import { IS_DEBUG } from '@src/constants/constants';

const { Option } = Select;
const { Step } = Steps;

const ProductFormCtrl = ({
  productType: { formData },
  dispatch,
  submitting,
}: any) => {
  const intl = useIntl();
  const [currentStep, setCurrentStep] = useState(0);
  const step1Ref = useRef<any>();
  const step2Ref = useRef<any>();
  const step3Ref = useRef<any>();
  const fieldLabels: any = {
    product_type_id: 'Loại sản phẩm',
    categoryId: 'Danh mục',
    partner_id: 'Đối tác',
    product: 'Tên sản phẩm',
    name: 'Tên loại sản phẩm',
    saleType: 'Loại bán',
    images: 'Ảnh',
    thumbnail: 'Thumbnail',
    importPrice: 'Giá nhập',
    paymentPrice: 'Giá bán',
    description: 'Mô tả',
    attributeValues: 'Danh sách giá trị',
    attributes: 'Thuộc tính',
    isActive: 'Trạng thái',
    // unit: "Đơn vị"
    trademark: 'Thương hiệu',
  };
  const queryParams = new URLSearchParams(
    `?${location.href.split('?')[1]}`
  ) as any;
  const [form] = Form.useForm();
  const [error, setError] = useState([] as any);
  const [errorSaleList, setErrorSaleList] = useState([] as any);
  // const [modalAttribute, setModalAttribute] = useState<boolean>(false);
  const [modalBrand, setModalBrand] = useState<boolean>(false);
  const [nameBrand, setNameBrand] = useState<string>('');
  // const [nameAttribute, setNameAttribute] = useState<string>("");
  // const [nameBrand, setNameBrand] = useState<string>("");
  const [listCategory, setListCategory] = useState([]);
  const [listSelectAttrs, setListSelectAttrs] = useState([] as any);
  const [listSelectBrand, setListSelectBrand] = useState([] as any);

  function getCascaderOptions(categories = []) {
    if (!categories || categories.length == 0) {
      return [];
    }
    const options = categories
      .filter((item: any) => !item.parentId)
      .map((item: any) => {
        return { value: item.id, label: item.name, children: [] };
      });
    categories.forEach((item: any) => {
      if (!item.parentId) return;
      for (const op of options as any) {
        if (op.value == item.parentId) {
          op.children.push({
            value: item.id,
            label: item.name,
          });
        }
      }
    });
    if (IS_DEBUG) {
      console.log('@@options', options);
    }
    return options;
  }
  useEffect(() => {
    dispatch({
      type: 'productType/loadForm',
      payload: {
        type: queryParams.get('id') !== 'add' ? 'E' : 'A',
        id: queryParams.get('id') !== 'add' ? queryParams.get('id') : null,
      },
    });

    dispatch({
      type: 'productType/fetchAttribute',
      callback: (response: any) => {
        setListSelectAttrs(response);
      },
    });

    dispatch({
      type: 'productType/fetchCategory',
      callback: (response: any) => {
        if (IS_DEBUG) {
          console.log('checkpoint 1', response);
        }
        setListCategory(response);
      },
    });

    dispatch({
      type: 'productType/fetchBrand',
      callback: (response: any) => {
        if (IS_DEBUG) {
          console.log('checkpoint 1', response);
        }
        setListSelectBrand(response);
      },
    });
  }, []);
  const getErrorInfo = (errors: any) => {
    const errorCount = errors.filter(
      (item: any) => item.errors.length > 0
    ).length;
    if (!errors || errorCount === 0) {
      return null;
    }
    const scrollToField = (fieldKey: any) => {
      const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
      if (labelNode) {
        labelNode.scrollIntoView(true);
      }
    };
    if (IS_DEBUG) {
      console.log('!!form', form.getFieldsError());
    }
    const errorList = errors.map((err: any) => {
      if (!err || err.errors.length === 0) {
        return null;
      }
      const key = err.name[0];
      return (
        <li
          key={key}
          // className={styles.errorListItem}
          onClick={() => scrollToField(key)}
        >
          <CloseCircleOutlined />
          <div>{err.errors[0]}</div>
          <div>{fieldLabels[key]}</div>
        </li>
      );
    });
    return (
      <span>
        <Popover
          title='Thông tin lỗi'
          content={errorList}
          // overlayClassName={styles.errorPopover}
          trigger='click'
          getPopupContainer={(trigger: any) => {
            if (trigger && trigger.parentNode) {
              return trigger.parentNode;
            }
            return trigger;
          }}
        >
          <CloseCircleOutlined /> &nbsp;{errorCount || 0} lỗi
        </Popover>
      </span>
    );
  };

  const onFinishFailed = (errorInfo: any) => {
    if (IS_DEBUG) {
      console.log('$$Failed:', errorInfo);
    }
    message.error('Thêm thất bại');
    setError(errorInfo.errorFields);
  };

  const onFinish = (values: any) => {
    if (IS_DEBUG) {
      console.log('@@error', error);
    }
    if (errorSaleList.length > 0) {
      message.error('Thêm thất bại');
      return;
    }
    const data = _.cloneDeep(values);
    if (IS_DEBUG) {
      console.log('@@ok', data);
    }
    if (!data.isActive) {
      data.isActive = true;
    }
    if (data.categoryId.length !== 0) {
      data.categoryId = data.categoryId[data.categoryId.length - 1];
    }
    if (data.images) {
      data.images =
        data.images && data.images.length > 0
          ? data.images.map(
              (i: any) =>
                i.url ||
                (i.response && i.response.length > 0
                  ? i.response[0].url
                  : i.response.url)
            )
          : '';
    }
    if (data.thumbnail) {
      data.thumbnail =
        data.thumbnail && data.thumbnail.length > 0
          ? data.thumbnail.map(
              (i: any) =>
                i.url ||
                (i.response && i.response.length > 0
                  ? i.response[0].url
                  : i.response.url)
            )
          : '';
    }
    if (data.partner_id) {
      data.partner_id = data.partner_id.id;
    }

    data.products = data.products.map((item: any) => {
      const result = {
        ...item,
        image:
          item.images && item.images.length > 0
            ? item.images.map(
                (i: any) =>
                  i.url ||
                  (i.response && i.response.length > 0
                    ? i.response[0].url
                    : i.response.url)
              )[0]
            : '',
      };
      delete result.images;
      return result;
    });
    dispatch({
      type: 'productType/submit',
      payload: data,
      // callback: (res:any) => {
      //   console.log("res", res)
      //   const id = queryParams.get("id") === "add" ? res.productTypeInfo.id : queryParams.get("id")
      //   setIdAfterAdd({ ...data, ["productTypeId"]: id })
      //   // dispatch(routerRedux.push({ pathname: `/base/${camelCaseToDash(RESOURCE)}` }));
      // },
    });
  };
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      ...formData,
    });
  }, [formData]);

  const columnsProduct = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      width: 70,
      fixed: 'left',
      // render:(val:any)=>{
      //   console.log("@@val",val)
      //   return <span>{val}</span>
      // }
    },
    {
      title: 'Ảnh chi tiết',
      dataIndex: 'images',
      width: 80,
      formItemType: 'UPLOAD_IMAGE',
    },
    {
      title: 'Giá nhập(đ)',
      dataIndex: 'importPrice',
      width: 70,
      formItemType: 'INPUT_NUMBER',
    },
    {
      title: 'Giá bán(đ)',
      dataIndex: 'paymentPrice',
      width: 70,
      formItemType: 'INPUT_NUMBER',
    },
    {
      title: 'Cân nặng(g)',
      dataIndex: 'weight',
      width: 50,
      formItemType: 'INPUT_NUMBER',
    },
    {
      title: 'Số lượng',
      dataIndex: 'numberOfProduct',
      width: 50,
      formItemType: 'INPUT_NUMBER',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 50,
      formItemType: 'SWITCH',
    },
  ];
  const addNameBrand = () => {
    if (nameBrand === '') return setModalBrand(false);
    dispatch({
      type: 'productType/submitBrand',
      payload: { name: nameBrand },
      callback: (response: any) => {
        if (IS_DEBUG) {
          console.log('@@test brand', response);
        }
        setModalBrand(false);
        setListSelectBrand([
          { name: nameBrand, id: response.data.id },
          ...listSelectBrand,
        ]);
        setNameBrand('');
      },
    });
  };

  return (
    <>
      <Row>
        <Col
          xs={22}
          sm={22}
          lg={22}
          xl={{ span: 20, offset: 1 }}
          xxl={{ span: 18, offset: 2 }}
        >
          <Form
            form={form}
            layout='vertical'
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            hideRequiredMark
            initialValues={{ ...formData }}
          >
            <div ref={step1Ref}>
              <Card
                // ref={step1Ref}
                title='Thông tin loại sản phẩm'
                // className={styles.card}
                bordered={false}
              >
                <Row gutter={16}>
                  <Col lg={24} md={24} sm={24}>
                    <Form.Item
                      label={fieldLabels['name']}
                      name='name'
                      rules={[
                        {
                          required: true,
                          message: 'Tên loại sản phẩm không được trống',
                        },
                      ]}
                    >
                      <FormInputRender
                        type='form'
                        item={{ title: 'Tên loại sản phẩm' }}
                        // value={formData.type}
                        intl={intl}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item
                      label={fieldLabels['categoryId']}
                      name='categoryId'
                      rules={[
                        {
                          required: true,
                          message: 'Danh mục không được trống',
                        },
                      ]}
                    >
                      <Cascader
                        defaultValue={[]}
                        options={getCascaderOptions(listCategory)}
                        // displayRender={(label, selectedOptions) => {
                        //   let clone = [...listCategory]
                        //   let obj = clone.filter(item => item.id === label[0])

                        //   console.log("$$ther",obj)
                        //   // return obj[0] ? obj[0].name : ""
                        // }}
                        // onChange={onChange}
                        style={{ width: '100%' }}
                        // showSearch={{ filter }}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xl={{ span: 6, offset: 2 }}
                    lg={{ span: 8 }}
                    md={{ span: 12 }}
                    sm={24}
                  >
                    <Form.Item
                      label={fieldLabels['trademark']}
                      name='trademark'
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Select showSearch={true}>
                        {listSelectBrand.map((item: any) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={3} md={3} sm={3}>
                    <Form.Item label={' '}>
                      <PlusCircleOutlined onClick={() => setModalBrand(true)} />
                    </Form.Item>
                  </Col>
                  {/* <Col
                    xl={{ span: 8, offset: 2 }}
                    lg={{ span: 10 }}
                    md={{ span: 24 }}
                    sm={24}
                  >
                    <Form.Item
                      label={fieldLabels["unit"]}
                      name="unit"
                    >
                      <FormInputRender
                        item={{ title: "Đơn vị sản phẩm" }}
                        // value={formData.type}
                        intl={intl}
                      />
                    </Form.Item>
                  </Col> */}
                </Row>
                <Row>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabels['images']} name='images'>
                      <Upload multiple={true} />
                    </Form.Item>
                  </Col>
                  <Col
                    xl={{ span: 6, offset: 2 }}
                    lg={{ span: 8 }}
                    md={{ span: 12 }}
                    sm={24}
                  >
                    <Form.Item
                      label={fieldLabels['thumbnail']}
                      name='thumbnail'
                    >
                      <Upload multiple={false} />
                    </Form.Item>
                  </Col>

                  <Col
                    xl={{ span: 8, offset: 2 }}
                    lg={{ span: 10 }}
                    md={{ span: 24 }}
                    sm={24}
                  >
                    <Form.Item label={fieldLabels['isActive']} name='isActive'>
                      <Switch defaultChecked={formData?.isActive || true} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item
                      label={fieldLabels['paymentPrice']}
                      name='paymentPrice'
                      rules={[
                        {
                          pattern: /^\d+$/,
                          message: 'Chỉ được nhập số nguyên ',
                        },
                      ]}
                    >
                      <FormInputRender
                        type='form'
                        item={{
                          title: 'Giá bán',
                          dataIndex: 'paymentPrice',
                          // valueEnum: enums.paymentMethod,
                        }}
                        intl={intl}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xl={{ span: 6, offset: 2 }}
                    lg={{ span: 8 }}
                    md={{ span: 12 }}
                    sm={24}
                  >
                    <Form.Item
                      label={fieldLabels['importPrice']}
                      name='importPrice'
                      rules={[
                        {
                          pattern: /^\d+$/,
                          message: 'Chỉ được nhập số nguyên ',
                        },
                      ]}
                    >
                      <FormInputRender
                        type='form'
                        item={{
                          title: 'Giá nhập',
                          dataIndex: 'importPrice',
                          // valueEnum: enums.shippingMethod,
                        }}
                        intl={intl}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xl={{ span: 8, offset: 2 }}
                    lg={{ span: 10 }}
                    md={{ span: 24 }}
                    sm={24}
                  >
                    <Form.Item label={fieldLabels['saleType']} name='saleType'>
                      <Select showSearch={true}>
                        <Option key={'user'} value={'user'}>
                          Người dùng
                        </Option>
                        <Option key={'partner'} value={'partner'}>
                          Đối tác
                        </Option>
                        <Option key={'both'} value={'both'}>
                          Người dùng và đối tác
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col lg={24} md={24} sm={24}>
                    <Form.Item
                      label={fieldLabels['description']}
                      name='description'
                      rules={[
                        { required: true, message: 'Mô tả không được trống' },
                      ]}
                    >
                      <FormInputRender
                        item={{ title: 'Mô tả', valueType: 'textarea' }}
                        type='form'
                        intl={intl}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </div>
            <div ref={step2Ref}>
              <Card title='Cấu hình thuộc tính'>
                <Form.Item label={' '} name='products'>
                  <ConfigProDuctTypeAttributesInput
                    listSelectAttributes={listSelectAttrs}
                    columns={columnsProduct}
                  />
                </Form.Item>
              </Card>
            </div>
            <div ref={step3Ref}>
              <Card title='Cấu hình giá theo số lượng'>
                <Form.Item label={' '} name='wholesaleTireList' rules={[]}>
                  <SalePriceByQuanityInput
                    setError={setErrorSaleList}
                    // listSelectAttributes={listSelectAttrs}
                    // columns={columnsProduct}
                  />
                </Form.Item>
              </Card>
            </div>

            {getErrorInfo(error)}
            <Button
              style={{ float: 'right', marginTop: 10 }}
              type='primary'
              onClick={() => form.submit()}
              loading={submitting}
            >
              {queryParams.get('id') === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}
            </Button>
          </Form>
        </Col>
        <Col xs={24} sm={24} lg={24} xl={{ span: 3 }} xxl={{ span: 3 }}>
          <Affix
            offsetTop={120}
            // onChange={(affixed) => console.log(affixed)}
            style={{ marginLeft: '10px' }}
          >
            <Steps
              direction='vertical'
              size='small'
              current={currentStep}
              onChange={() => {}}
            >
              <Step
                onStepClick={() => {
                  step1Ref.current.scrollIntoView();
                  setCurrentStep(0);
                }}
                title='Tạo thông tin sản phẩm'
              />
              <Step
                onStepClick={() => {
                  step2Ref.current.scrollIntoView(), setCurrentStep(1);
                }}
                title='Cấu hình sản phẩm'
              />
              <Step
                onStepClick={() => {
                  step3Ref.current.scrollIntoView(), setCurrentStep(2);
                }}
                title='Mua nhiều giảm giá'
              />
            </Steps>
          </Affix>
        </Col>
      </Row>
      <Modal
        title='Thêm tên Thương hiệu'
        visible={modalBrand}
        onOk={addNameBrand}
        onCancel={() => setModalBrand(false)}
        cancelText='Đóng'
        okText='Thêm'
      >
        <Input
          placeholder='Tên Thương hiệu'
          onChange={(e) => setNameBrand(e.target.value)}
          value={nameBrand}
        />
      </Modal>
    </>
  );
};

export default connect(({ productType, loading }: any) => ({
  submitting: loading.effects['productType/submit'],
  submittingAtribute: loading.effects['atribute/submit'],
  productType,
}))(ProductFormCtrl);
