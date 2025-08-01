import { FlashSaleTable } from '@src/eCommerce/component/FlashSaleInput';
import { Form, Button, Popover, Row, Col, Select, Card, message } from 'antd';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { connect } from 'dva';
import { CloseCircleOutlined } from '@ant-design/icons';
import { IS_DEBUG } from '@src/constants/constants';

const { Option } = Select;
const FlashSaleFormCtrl = ({
  productType,
  flashSale,
  dispatch,
  submitting,
}: any) => {
  if (IS_DEBUG) {
    console.log('@@flashSale', productType);
  }

  const fieldLabels: any = {};
  const [form] = Form.useForm();
  const [error, setError] = useState([] as any);
  const [flashSaleError, setFlashSaleError] = useState([] as any);
  useEffect(() => {
    dispatch({
      type: `productType/fetch`,
      payload: {
        queryInput: {},
        // skip:0,
        // limit:10
      },
    });
    dispatch({
      type: `flashSale/getTimeSlot`,
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

  const onFinish = (values: any) => {
    const data = _.cloneDeep(values);
    if (flashSaleError.length > 0) {
      message.error('Thêm thất bại');
      return;
    }
    // const listFlashSale = []
    if (IS_DEBUG) {
      console.log('@@data', data);
    }

    const products = data.flashSaleConfig.map((product: any) => {
      return {
        productTypeId: product.productTypeId,
        quantity: product.quantity,
        flashPrice: Number(product.saleOffPrice.replace(/[₫,]+/g, '')),
        normalPrice: product.importPrice,
        productDetailId: product.id,
      };
    });
    const timeSlots = data.timeSlot.map((item: any) => {
      return {
        startTime: JSON.parse(item).timeStart,
        endTime: JSON.parse(item).timeEnd,
      };
    });
    if (IS_DEBUG) {
      console.log('@@timeSlots', timeSlots);
    }

    Promise.all(
      timeSlots.map((item: any) => {
        dispatch({
          type: `flashSale/submit`,
          payload: {
            startTime: item.startTime,
            endTime: item.endTime,
            productFlashsaleInfo: products,
          },
          callback: (res: any) => {
            if (IS_DEBUG) {
              console.log('@@res', res);
            }

            if (res.status === 200) {
              res.data.code === 0
                ? message.success(res.data.message)
                : message.error(res.data.message);
            }
          },
        });
      })
    );

    // Promise.all();
  };
  const onFinishFailed = (errorInfo: any) => {
    if (IS_DEBUG) {
      console.log('$$Failed:', errorInfo);
    }

    setError(errorInfo.errorFields);
  };

  return (
    <>
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        hideRequiredMark
      >
        <Card title={'Cấu hình chiến dịch flash sale'}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label={' '} name='flashSaleConfig'>
                <FlashSaleTable
                  setError={setFlashSaleError}
                  listProductType={productType.data.list}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                style={{ paddingLeft: 8 }}
                label={<span style={{ fontSize: 16 }}>Chọn khung giờ</span>}
                name='timeSlot'
                rules={[
                  {
                    required: true,
                    message: 'Khung giờ không được trống',
                  },
                ]}
              >
                <Select
                  mode='multiple'
                  style={{ width: '100%' }}
                  placeholder='Chọn khung giờ chạy FlashSale'
                  defaultValue={[]}
                >
                  {flashSale?.listTimeSlot?.map((item: any, index: any) => (
                    <Option
                      key={index}
                      value={JSON.stringify({
                        timeStart: item.timeStart,
                        timeEnd: item.timeEnd,
                      })}
                    >
                      {item.message}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {getErrorInfo(error)}
        <Button
          style={{ float: 'right', marginTop: 10 }}
          type='primary'
          onClick={() => form.submit()}
          loading={submitting}
        >
          Thêm FlashSale
        </Button>
      </Form>
    </>
  );
};

export default connect(({ flashSale, productType, loading }: any) => ({
  submitting: loading.effects['flashSale/submit'],
  flashSale,
  productType,
}))(FlashSaleFormCtrl);
