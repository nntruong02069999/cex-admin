/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import { helper } from "@src/controls/controlHelper";
import ArrayModel from "@src/packages/pro-component/schema/ArrayModel";
import SingleSelect from "@src/packages/pro-component/schema/SingleSelect";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Row,
  Space,
  Switch,
  Table,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Loading from "@src/components/Loading";
import moment from "moment";
import type { SortableContainerProps, SortEnd } from "react-sortable-hoc";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";
import { DragOutlined } from "@ant-design/icons";

import "./flashSale.css";
import { formatNumber } from "@src/util/utils";
import { DISPLAY_TYPE } from "@src/constants/enums";

const PAGE_ID = 260;

export const getCurrentState = async (useState: any): Promise<any> => {
  return new Promise((rs) => {
    useState((pre: any) => {
      rs(pre);
      return pre;
    });
  });
};

const DragHandle = SortableHandle(() => (
  <DragOutlined style={{ cursor: "grab", color: "#999" }} />
));

const SortableItem = SortableElement(
  (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />
);

const SortableBody = SortableContainer(
  (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />
);

export default function FlashSaleVoucherCtrl(props: any) {
  const params = props.query;
  const isUpdate = params.mode === "update";
  const token = localStorage.getItem("token");

  const [form] = Form.useForm();
  const [pageInfo, setPageInfo] = useState<any>();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(false);

  const cachedFlashIds = useRef<any>({});

  const selectedDate = form.getFieldValue("dayFlashSale");
  const isDateInFuture =
    selectedDate &&
    moment(selectedDate).startOf("day").isAfter(moment().startOf("day"));

  // Allow editing if it's not an update OR if the selected date is in the future
  const isDisabled = isUpdate && !isDateInFuture;

  useEffect(() => {
    getPageInfo();
    if (isUpdate) {
      getInfo();
    } else {
      setInit(true);
    }
  }, []);

  const getInfo = async () => {
    try {
      setLoading(true);
      let rs = await axios({
        method: "get",
        url:
          process.env.REACT_APP_URL! +
          (process.env.REACT_APP_IS_DEV ? "/api" : "") +
          `/admin/voucher/get-flashsale-info?flashSaleVoucherId=${params.id}`,
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      let { data } = rs.data;
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        dayFlashSale: moment(data.dayFlashSale, "YYYY-MM-DD"),
        timeFrameId: data.timeFrameFlashSaleId,
        voucherInfos: data.flashSaleVoucherDetails.map((i: any) => i.voucherId),
      });
      data.flashSaleVoucherDetails.map((item: any) => {
        cachedFlashIds.current[item.voucherInfo.id] = item.id;
      });
      setVouchers(
        data.flashSaleVoucherDetails.map((item: any) => {
          form.setFieldsValue({
            ["quantity" + item.id]: item.quantity,
            ["salePrice" + item.id]: item.salePrice,
          });
          return {
            ...item.voucherInfo,
            quantity: item.quantity + "",
            salePrice: item.salePrice + "",
            sequence: item.sequence + "",
          };
        })
      );
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    setInit(true);
  };

  const getPageInfo = async () => {
    const _pageInfo = await helper.getPage(PAGE_ID);
    setPageInfo(_pageInfo);
  };

  const getVouchers = async (ids: any[]) => {
    try {
      if (!ids.length) return setVouchers([]);
      const rs: any = await helper.callPageApi(pageInfo, "get-voucher", {
        queryInput: JSON.stringify({
          id: ids,
        }),
        limit: 2000,
        select: "id,name,images,paymentCash,paymentPoint,value,type,payment",
      });
      if (rs.status !== 200) throw rs;

      let current = await getCurrentState(setVouchers);
      // Create a map of existing vouchers by ID for quick lookup
      const existingVouchersMap = current.reduce((acc: any, v: any) => {
        acc[v.id] = v;
        return acc;
      }, {});

      // Get the highest existing sequence number
      const maxSequence = current.length
        ? Math.max(...current.map((v: any) => parseInt(v.sequence)))
        : 0;

      let newVoucher = rs.data.data.map((item: any, index: number) => {
        // If voucher already exists, keep its existing data
        if (existingVouchersMap[item.id]) {
          return existingVouchersMap[item.id];
        }
        // For new vouchers, add them with sequence continuing from the highest existing number
        return {
          ...item,
          quantity: "",
          salePrice: "",
          sequence: (maxSequence + index + 1).toString(),
        };
      });
      // Sort by sequence
      newVoucher.sort((a: any, b: any) => a.sequence - b.sequence);
      setVouchers(newVoucher);
    } catch (error) {
      console.log("error get voucher info: ", error);
    }
  };

  const handleSave = (record: any, dataIndex: string, value: any) => {
    console.log(
      "🚀 ~ file: FlashSaleVoucherCtrl.tsx:163 ~ handleSave ~ value:",
      value
    );

    let copy = _.cloneDeep(vouchers);
    let findIndex = copy.findIndex((item: any) => item.id === record.id);
    copy[findIndex] = {
      ...copy[findIndex],
      [dataIndex]: value,
    };
    setVouchers(copy);
    console.log(
      "🚀 ~ file: FlashSaleVoucherCtrl.tsx:176 ~ handleSave ~ copy:",
      copy
    );
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (!isUpdate) {
        await axios({
          method: "post",
          url:
            process.env.REACT_APP_URL! +
            (process.env.REACT_APP_IS_DEV ? "/api" : "") +
            `/admin/voucher/create-flashsale`,
          headers: {
            Authorization: "Bearer " + token,
          },
          data: {
            dayFlashSale: moment(values.dayFlashSale).format("YYYY-MM-DD"),
            timeFrameId: values.timeFrameId,
            name: values.name,
            description: values.description,
            isActive: values.isActive ?? false,
            voucherInfos: vouchers.map((item: any) => {
              return {
                voucherId: item.id,
                normalPrice: item.paymentCash,
                salePrice: parseInt(item.salePrice),
                quantity: parseInt(item.quantity),
                sequence: parseInt(item.sequence),
              };
            }),
          },
        });
        message.success("Tạo mới thành công");
        props.onClose();
      } else {
        await axios({
          method: "post",
          url:
            process.env.REACT_APP_URL! +
            (process.env.REACT_APP_IS_DEV ? "/api" : "") +
            `/admin/voucher/update-flashsale`,
          headers: {
            Authorization: "Bearer " + token,
          },
          data: {
            flashSaleVoucherId: parseInt(params.id as string),
            dayFlashSale: moment(values.dayFlashSale).format("YYYY-DD-MM"),
            timeFrameId: values.timeFrameId,
            name: values.name,
            description: values.description,
            isActive: values.isActive ?? false,
            flashSaleVoucherDetais: vouchers.map((item: any) => {
              let salePrice = form.getFieldValue("salePrice" + item.id);
              let quantity = form.getFieldValue("quantity" + item.id);
              let sequence = form.getFieldValue("sequence" + item.id);
              return {
                id: cachedFlashIds.current[item.id] || moment().valueOf(),
                voucherId: item.id,
                normalPrice: item.paymentCash,
                salePrice: salePrice
                  ? parseInt(salePrice)
                  : parseInt(item.salePrice),
                quantity: quantity
                  ? parseInt(quantity)
                  : parseInt(item.quantity),
                sequence: sequence
                  ? parseInt(sequence)
                  : parseInt(item.sequence),
              };
            }),
          },
        });
        message.success("Cập nhật thành công");
        props.onClose();
      }
    } catch (error: any) {
      console.log(error.response);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      }
      if (error.response?.data?.errors) {
        message.error(error.response.data.errors);
      }
    }
    setLoading(false);
  };

  const renderCell = (text: string, record: any, dataIndex: any) => {
    return (
      <td key={dataIndex + record.id}>
        <Form.Item
          name={dataIndex + record.id}
          style={{ margin: 0 }}
          initialValue={Number(text)}
          rules={[
            // { required: true, message: 'Vui lòng điền giá trị' },
            { type: "number", message: "Vui lòng nhập số >= 1", min: 1 },
          ]}
        >
          <InputNumber
            style={{ minWidth: 170 }}
            formatter={(value) => formatNumber(value).toString()}
            parser={(value: any) => value.replace(/\D/g, "")}
            onBlur={(e) => {
              const value = Number(e.target.value.replace(/\D/g, ""));
              if (value < 0) return;
              handleSave(record, dataIndex, value);
            }}
          />
        </Form.Item>
      </td>
    );
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

  const defaultColumns: any[] = [
    {
      title: "Sort",
      dataIndex: "sort",
      width: 60,
      className: "drag-visible",
      render: () => <DragHandle />,
    },
    // {
    //   title: "Thứ tự",
    //   dataIndex: "sequence",
    //   width: 100,
    //   editable: true,
    //   render: (text: any, record: any) => renderCell(text, record, "sequence"),
    // },
    {
      title: "ID",
      key: "id",
      dataIndex: "id",
      valueType: DISPLAY_TYPE.DIGIT,
    },
    {
      title: "Tên",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "Ảnh",
      key: "images",
      dataIndex: "images",
      render: (value: any) => {
        return <Image src={value[0]} width={180} />;
      },
    },
    {
      title: "Giá tiền",
      dataIndex: "payment",
      render: (value: any, record: any) => {
        let amount;
        switch (record.payment) {
          case "both":
            amount = record.paymentCash;
            break;
          case "point":
            amount = record.paymentPoint;
            break;
          case "online":
            amount = record.paymentCash;
            break;
          default:
            amount = 0;
        }
        return formatNumber(amount) + " đ";
      },
    },
    {
      title: "Giá bán",
      dataIndex: "salePrice",
      editable: true,
      render: (text: any, record: any) => {
        return renderCell(text, record, "salePrice");
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      editable: true,
      render: (text: any, record: any) => renderCell(text, record, "quantity"),
    },
    {
      title: "Action",
      dataIndex: "operation",
      render: (_: any, record: any) =>
        vouchers.length >= 1 ? (
          <Button
            type="text"
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

  const DraggableContainer = (props: SortableContainerProps) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
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
      (x) => x.sequence === restProps["data-row-key"]
    );
    return <SortableItem index={index} {...restProps} />;
  };

  if (!init) return <Loading />;

  return (
    <>
      {loading && (
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            backgroundColor: "rgba(0,0,0,.25)",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Loading />
        </div>
      )}
      <Form form={form} onFinish={onFinish}>
        <Card title={"Cấu hình flash sale"}>
          <Row>
            <Col span={8}>
              <Form.Item
                label="Tên FlashSale"
                name="name"
                rules={[{ required: true, message: "Tên FlashSale" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={1} />
            <Col span={8}>
              <Form.Item
                label="Trạng thái"
                valuePropName="checked"
                name="isActive"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Miêu tả" name="description">
            <TextArea rows={3} />
          </Form.Item>
          <Row>
            <Space align="center">
              <Form.Item
                label="Thiết lập thời gian"
                name="dayFlashSale"
                rules={[{ required: true, message: "Chọn ngày" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  picker="date"
                  disabled={isUpdate}
                />
              </Form.Item>
              <Form.Item
                name="timeFrameId"
                rules={[{ required: true, message: "Chọn khung giờ" }]}
              >
                <CustomSelect isDisabled={isDisabled} />
              </Form.Item>
            </Space>
          </Row>
          <Row style={{ marginTop: 14 }}>
            <Form.Item
              label="Chọn voucher"
              name="voucherInfos"
              rules={[{ required: true, message: "Chọn voucher" }]}
            >
              <CustomModel getVouchers={getVouchers} />
            </Form.Item>
          </Row>
          <Row>
            <h4 style={{ marginTop: 14 }}>Cấu hình chi tiết</h4>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                // rowClassName={() => "editable-row"}
                // bordered
                scroll={{ y: 600 }}
                pagination={false}
                dataSource={vouchers}
                columns={defaultColumns}
                rowKey="sequence"
                components={{
                  body: {
                    wrapper: DraggableContainer,
                    row: DraggableBodyRow,
                  },
                }}
              />
            </Col>
          </Row>
          <Button
            style={{ float: "right", marginTop: 10 }}
            type="primary"
            onClick={() => {
              form.submit();
            }}
          >
            {params.mode === "create" ? "Thêm FlashSale" : "Cập nhật FlashSale"}
          </Button>
        </Card>
      </Form>
    </>
  );
}

const CustomSelect = ({ value, onChange, isDisabled }: any) => {
  return (
    <SingleSelect
      schema={{
        pageId: PAGE_ID,
        api: "get-times",
        modelSelectMultiple: true,
      }}
      placeholder="Chọn khung thời gian"
      onChange={(value) => {
        onChange(value);
      }}
      value={value}
      disabled={isDisabled}
    />
  );
};

const CustomModel = ({ value, onChange, getVouchers }: any) => {
  return (
    <ArrayModel
      schema={{
        name: "Danh sách voucher",
        field: "voucherIds",
        widget: "ArrayModel",
        type: "number",
        api: "get-voucher",
        modelSelectField: "id$$ID,name$$Tên voucher,images$$Ảnh",
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
