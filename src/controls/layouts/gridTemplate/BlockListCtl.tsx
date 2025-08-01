import React, { useCallback, useEffect, useState } from 'react';
import {
  Table,
  Image,
  Button,
  Switch,
  Modal,
  Form,
  Row,
  Col,
  Input,
  Select,
  message,
} from 'antd';
import {
  SortableContainer,
  SortableContainerProps,
  SortableElement,
  SortableHandle,
  SortEnd,
} from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { DragOutlined, EyeOutlined } from '@ant-design/icons';
import Loading from '@src/components/Loading';
import { helper } from '@src/controls/controlHelper';

import '../schemaTemplate/flashSale.css';
import ArrayModel from '@src/packages/pro-component/schema/ArrayModel';
import ImageModel from '@src/packages/pro-component/schema/Image';
import ArrayImageModel from '@src/packages/pro-component/schema/ArrayImage';
import { toDot } from '@src/util/utils';

const PAGE_ID = 271;

export const getCurrentState = async (useState: any): Promise<any> => {
  return new Promise((rs) => {
    useState((pre: any) => {
      rs(pre);
      return pre;
    });
  });
};

const DragHandle = SortableHandle(() => (
  <DragOutlined style={{ cursor: 'grab', color: '#999' }} />
));

const SortableItem = SortableElement(
  (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />
);

const SortableBody = SortableContainer(
  (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />
);

export default function BlockListCtl() {
  const [blockList, setBlockList] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any>();
  const [init, setInit] = useState(false);
  const [visible, setVisible] = useState(false);
  const [blockActive, setBlockActive] = useState();

  useEffect(() => {
    getPageInfo();
  }, []);

  const getPageInfo = async () => {
    const _pageInfo = await helper.getPage(PAGE_ID);
    setPageInfo(_pageInfo);
  };

  const getBlockList = useCallback(async () => {
    try {
      const rs: any = await helper.callPageApi(pageInfo, 'find-block', {
        limit: 2000,
      });
      setBlockList(
        rs.data.data.sort((a: any, b: any) => a.position - b.position)
      );
    } catch (error) {
      console.log(error);
    }
    setInit(true);
  }, [pageInfo]);

  useEffect(() => {
    if (pageInfo) getBlockList();
  }, [pageInfo, getBlockList]);

  const updateBlock = async ({
    id,
    key,
    value,
  }: {
    id: number;
    key: string;
    value: any;
  }) => {
    try {
      let newBlock = blockList.map((item) => {
        return {
          ...item,
          [key]: item.id === id ? value : item[key],
        };
      });
      setBlockList(newBlock);
      await helper.callPageApi(pageInfo, 'update-block', {
        id: id,
        [key]: value,
      });
      await getBlockList();
    } catch (error) {
      console.log(error);
    }
  };

  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(blockList.slice(), oldIndex, newIndex)
        .filter((el: any) => !!el)
        .map((item: any, index: number) => {
          updateBlock({ id: item.id, key: 'position', value: index + 1 });
          return {
            ...item,
            position: index + 1,
          };
        });
      setBlockList(newData);
    }
  };

  const defaultColumns: any[] = [
    {
      title: 'Sort',
      dataIndex: 'sort',
      width: 60,
      className: 'drag-visible',
      render: () => <DragHandle />,
    },
    {
      title: 'ID',
      key: 'id',
      dataIndex: 'id',
      valueType: 'digit',
    },
    {
      title: 'Tên',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Loại',
      key: 'type',
      dataIndex: 'type',
      render: (value: any) => {
        switch (value) {
          case 'FLASHSALE':
            return 'FlashSale';
          case 'FREE':
            return 'Ưu đãi 0 đồng';
          case 'MONOPOLY':
            return 'Độc quyền';
          case 'DEALHOT':
            return 'DEALHOT';
          default:
            return value;
        }
      },
    },
    // {
    //   title: 'Ảnh nền',
    //   key: 'icon',
    //   dataIndex: 'icon',
    //   render: (value: any) => {
    //     return <Image src={value} width={40} />;
    //   },
    // },
    {
      title: 'Kích hoạt (Webview)',
      key: 'isActive',
      dataIndex: 'isActive',
      render: (value: any, record: any) => {
        return (
          <Switch
            checked={value}
            onChange={(checked) => {
              updateBlock({ id: record.id, key: 'isActive', value: checked });
            }}
          />
        );
      },
    },
    {
      title: 'Hiển thị (Home App)',
      key: 'isIntegration',
      dataIndex: 'isIntegration',
      render: (value: any, record: any) => {
        return (
          <Switch
            checked={value}
            onChange={(checked) => {
              updateBlock({
                id: record.id,
                key: 'isIntegration',
                value: checked,
              });
            }}
          />
        );
      },
    },
    // {
    //   title: "Chiều cao block (Home App)",
    //   key: "height",
    //   dataIndex: "height",
    // },
    {
      title: 'Tác vụ',
      dataIndex: 'operation',
      render: (_: any, record: any) => (
        <Button
          type='text'
          danger
          onClick={() => {
            setBlockActive(record);
            setVisible(true);
          }}
        >
          Sửa
        </Button>
      ),
    },
  ];

  const DraggableContainer = (props: SortableContainerProps) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      helperClass='row-dragging'
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow: React.FC<any> = ({
    className,
    style,
    ...restProps
  }) => {
    const index = blockList.findIndex(
      (x) => x.position === restProps['data-row-key']
    );
    return <SortableItem index={index} {...restProps} />;
  };

  if (!init) return <Loading />;

  return (
    <div>
      <Table
        // search={false}
        pagination={false}
        dataSource={blockList}
        columns={defaultColumns}
        rowKey='position'
        components={{
          body: {
            wrapper: DraggableContainer,
            row: DraggableBodyRow,
          },
        }}
      />
      <ModalForm
        pageInfo={pageInfo}
        visible={visible}
        blockActive={blockActive}
        onCancel={() => setVisible(false)}
        onOk={() => {
          getBlockList();
          setVisible(false);
        }}
      />
    </div>
  );
}

const ModalForm = (props: any) => {
  const { visible, onCancel, onOk, pageInfo, blockActive } = props;
  const [form] = Form.useForm();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [typeVoucher, setTypeVoucher] = useState<any>('');
  const [formData, setFormData] = useState<any>(null);

  const getVouchers = useCallback(
    async (ids: any[]) => {
      try {
        if (!ids.length) return setVouchers([]);
        let sequence: any = {};
        ids.forEach((item: any, index: number) => {
          sequence[item] = index + 1;
        });
        const rs: any = await helper.callPageApi(pageInfo, 'find-voucher', {
          queryInput: JSON.stringify({
            id: ids,
          }),
          limit: 2000,
          select: 'id,name,images,paymentCash,paymentPoint,value,type,payment',
        });
        if (rs.status !== 200) throw rs;
        let newVoucher = rs.data.data
          .map((item: any, index: number) => {
            return {
              ...item,
              sequence: sequence[item.id] || index + 1,
            };
          })
          .sort((a: any, b: any) => a.sequence - b.sequence);
        setVouchers(newVoucher);
      } catch (error) {
        console.log('error get voucher info: ', error);
      }
    },
    [pageInfo, setVouchers]
  );

  useEffect(() => {
    if (blockActive && visible) {
      setTypeVoucher(blockActive.type);
      getVouchers(blockActive.voucherIds);
      const newFormData = {
        name: blockActive.name,
        type: blockActive.type,
        height: blockActive.height,
        voucherInfos: blockActive.voucherIds,
        icon: blockActive.icon,
        images: blockActive.images,
      };
      setFormData(newFormData);
      form.setFieldsValue(newFormData);
    } else if (!visible) {
      form.resetFields();
      setFormData(null);
      setTypeVoucher('');
    }
  }, [blockActive, visible, form, getVouchers]);

  const onSubmit = async () => {
    try {
      const formValues = form.getFieldsValue();
      if (blockActive) {
        const rs: any = await helper.callPageApi(pageInfo, 'update-block', {
          id: blockActive.id,
          ...formValues,
          icon: formValues.icon?.[0]?.url || formValues.icon,
          images: formValues.images?.map((img: any) => img.url || img) || [],
          voucherIds: vouchers.map((i) => i.id),
        });
        if (rs.status !== 200) throw rs;
        onOk();
        message.success('Cập nhật thành công');
      } else {
        const rs: any = await helper.callPageApi(pageInfo, 'create-block', {
          ...formValues,
          icon: formValues.icon?.[0]?.url || formValues.icon,
          images: formValues.images?.map((img: any) => img.url || img) || [],
          voucherIds: vouchers.map((i) => i.id),
        });
        if (rs.status !== 200) throw rs;
        onOk();
        message.success('Tạo mới thành công');
      }
      // helper.callPageApi(pageInfo, "update-voucher", {
      //   ids: vouchers.map((i) => i.id),
      // });
    } catch (error) {
      console.log(error);
    }
  };

  const defaultColumns: any[] = [
    {
      title: 'Sort',
      dataIndex: 'sort',
      width: 60,
      className: 'drag-visible',
      render: () => <DragHandle />,
    },
    {
      title: 'ID',
      key: 'id',
      dataIndex: 'id',
    },
    {
      title: 'Tên',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Ảnh',
      key: 'images',
      dataIndex: 'images',
      render: (value: any) => {
        // return <Image src={value[0]} width={80} />;
        return (
          <div
            style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid #d9d9d9',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <Image
              src={value[0]}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'cover',
              }}
              preview={{
                src: value[0],
                mask: <EyeOutlined style={{ fontSize: '16px' }} />,
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Loại thanh toán',
      dataIndex: 'paymentType',
      render: (value: any, record: any) => {
        switch (record.payment) {
          case 'both':
            return 'Tiền + Điểm';
          case 'point':
            return 'Điểm';
          case 'online':
            return 'Tiền';
          default:
            return 'Chưa cập nhật';
        }
      },
    },
    {
      title: 'Giá trị',
      dataIndex: 'payment',
      render: (value: any, record: any) => {
        switch (record.payment) {
          case 'both':
            return toDot(record.paymentCash) || toDot(record.paymentPoint) || 0;
          case 'point':
            return record.paymentPoint ? toDot(record.paymentPoint) : 0;
          case 'online':
            return record.paymentCash ? toDot(record.paymentCash) : 0;
          default:
            return 0;
        }
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_: any, record: any) =>
        vouchers.length >= 1 ? (
          <Button
            type='text'
            danger
            onClick={() => {
              let newVoucher = vouchers.filter((item) => item.id !== record.id);
              setVouchers(newVoucher);
              form.setFieldsValue({
                voucherInfos: newVoucher.map((i: any) => i.voucherId || i.id),
              });
            }}
          >
            Xoá
          </Button>
        ) : null,
    },
  ];

  const getApiName = () => {
    switch (typeVoucher) {
      case 'FLASHSALE':
        return 'find-voucher';
      case 'FREE':
        return 'find-voucher-free';
      case 'MONOPOLY':
        return 'find-voucher-monopoly';
      case 'DEALHOT':
        return 'find-voucher-hot';
      default:
        return 'find-voucher';
    }
  };

  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(vouchers.slice(), oldIndex, newIndex)
        .filter((el: any) => !!el)
        .map((item: any, index: number) => {
          return {
            ...item,
            sequence: index + 1,
          };
        });
      setVouchers(newData);
    }
  };

  const DraggableContainer = (props: SortableContainerProps) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      helperClass='row-dragging'
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow: React.FC<any> = ({
    className,
    style,
    ...restProps
  }) => {
    const index = vouchers.findIndex(
      (x) => x.sequence === restProps['data-row-key']
    );
    return <SortableItem index={index} {...restProps} />;
  };

  return (
    <Modal
      title={blockActive ? 'Sửa block' : 'Thêm block'}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={'80%'}
      footer={[
        <Button key='back' onClick={onCancel}>
          Hủy
        </Button>,
        <Button key='submit' type='primary' onClick={() => form.submit()}>
          {blockActive ? 'Cập nhật' : 'Tạo mới'}
        </Button>,
      ]}
    >
      <Form form={form} onFinish={onSubmit} initialValues={formData || {}}>
        {formData && (
          <>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label='Tên'
                  name='name'
                  rules={[
                    { required: true, message: 'Vui lòng điền tên block' },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label='Kiểu' name='type'>
                  <Select
                    disabled
                    onChange={(value) => {
                      setTypeVoucher(value);
                      if (value !== 'FLASHSALE') {
                        setVouchers([]);
                        form.setFieldsValue({
                          voucherInfos: [],
                        });
                      }
                    }}
                  >
                    <Select.Option value=''>Không chọn</Select.Option>
                    <Select.Option value='DEALHOT'>Deal hot</Select.Option>
                    <Select.Option value='MONOPOLY'>Độc quyền</Select.Option>
                    <Select.Option value='FREE'>Ưu đãi 0đ</Select.Option>
                    <Select.Option value='FLASHSALE'>Flash Sale</Select.Option>
                    <Select.Option value='CAMPAIGN'>Campaign</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {typeVoucher === 'CAMPAIGN' && (
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label='Ảnh nền' name='icon'>
                    <ImageModel value={blockActive?.icon} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label='Ảnh chạy' name='images'>
                    <ArrayImageModel value={blockActive?.images} />
                  </Form.Item>
                </Col>
              </Row>
            )}
            {typeVoucher !== 'FLASHSALE' && (
              <>
                <Row style={{ marginTop: 14 }} key={typeVoucher + 'voucher'}>
                  <Form.Item
                    label='Chọn voucher'
                    name='voucherInfos'
                    rules={[{ required: true, message: 'Chọn voucher' }]}
                  >
                    <CustomModel
                      apiName={getApiName()}
                      getVouchers={getVouchers}
                    />
                  </Form.Item>
                </Row>
                <Table
                  scroll={{ y: 700 }}
                  pagination={false}
                  dataSource={vouchers}
                  columns={defaultColumns}
                  rowKey='sequence'
                  components={{
                    body: {
                      wrapper: DraggableContainer,
                      row: DraggableBodyRow,
                    },
                  }}
                />
              </>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};

const CustomModel = ({
  value,
  onChange,
  getVouchers,
  apiName = 'find-voucher',
}: any) => {
  return (
    <ArrayModel
      schema={{
        name: 'Danh sách voucher',
        field: 'voucherIds',
        widget: 'ArrayModel',
        type: 'number',
        api: apiName,
        modelSelectField: 'id$$ID,name$$Tên,images$$Hình ảnh',
        pageId: PAGE_ID,
      }}
      value={value}
      onChange={(ids) => {
        onChange(ids);
        getVouchers(ids);
      }}
    />
  );
};
