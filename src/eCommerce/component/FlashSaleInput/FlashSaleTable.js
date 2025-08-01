import React, { useState, useEffect, useContext, useRef } from 'react'
import {
  Table,
  Modal,
  Avatar,
  Card,
  Button,
  Tag,
  Form,
  InputNumber,
  message,
} from 'antd'
// import EditableProTable from '../../../components/EditableTable';
import { toDot } from '@src/util/utils'
import { useIntl } from '@src/packages/pro-table/component/intlContext'
import { IS_DEBUG } from '@src/constants/constants'

const EditableContext = React.createContext(null)
const EditableRow = ({ ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form
      initialValues={
        props && props.children[0] ? props.children[0].props.record : null
      }
      form={form}
      component={false}
    >
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}
const EditableCell = (props) => {
  let {
    title,
    editable,
    children,
    dataIndex,
    record,
    // dataSource,
    handleSave,
    setError,
    ...restProps
  } = props
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)
  const intl = useIntl()
  useEffect(() => {
    if (editing) {
      inputRef.current.focus()
    }
  }, [editing])

  const form = useContext(EditableContext)

  const toggleEdit = (value) => {
    setEditing(!editing)
    form.setFieldsValue({
      [dataIndex]: value || record[dataIndex],
    })
  }

  const formNode = () => {
    switch (dataIndex) {
      case 'saleOffPrice':
        return (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `${title} là bắt buộc`,
              },
              () => ({
                validator(_, value) {
                  if (record.paymentPrice < value) {
                    return Promise.reject(
                      new Error('Giá giảm phải nhỏ hơn giá bán')
                    )
                  }
                  if ((value / record.paymentPrice) * 100 < 5) {
                    return Promise.reject(new Error('Giảm it nhất 5%'))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <InputNumber
              ref={inputRef}
              formatter={(value) => {
                if (value) {
                  return `${value} ${intl.getMessage(
                    'moneySymbol',
                    '￥'
                  )} `.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                return ''
              }}
              onPressEnter={save}
              onBlur={save}
              style={{
                width: '100%',
              }}
            />
            {/* <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} /> */}
          </Form.Item>
        )
      case 'saleOffPercent':
        return (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `${title} là bắt buộc`,
              },
              ({}) => ({
                validator(_, value) {
                  if (value > 100 || value < 0) {
                    return Promise.reject(
                      new Error('Phần trăm giảm phải từ 0 đến 100')
                    )
                  }
                  if (value < 5) {
                    return Promise.reject(new Error('Giảm it nhất 5%'))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <InputNumber
              ref={inputRef}
              formatter={(value) => {
                if (value) {
                  return `${value} %`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                return ''
              }}
              onPressEnter={save}
              onBlur={save}
              style={{
                width: '100%',
              }}
            />
          </Form.Item>
        )
      default:
        return (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `${title} là bắt buộc`,
              },
            ]}
          >
            <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
          </Form.Item>
        )
    }
  }

  const save = async (e) => {
    try {
      let value
      if (e.target.value.includes('₫')) {
        value = Number(e.target.value.replace(/[₫,]+/g, ''))
      } else if (e.target.value.includes('%')) {
        value = Number(e.target.value.replace(/[%,]+/g, ''))
      } else {
        value = Number(e.target.value)
      }
      // console.log("@@e.target.value",e.target.value.replace(/[₫,]+/g, ""))
      if (isNaN(value) || value == 0) {
        toggleEdit('')
        return
      }
      const values = await form.validateFields()
      if (e.target.value.includes('%')) {
        values.saleOffPrice = `${(value * record.paymentPrice) / 100} ₫`
        values.saleOffPercent = `${value} %`
      } else if (e.target.value.includes('₫')) {
        values.saleOffPercent = `${(value / record.paymentPrice) * 100} %`
        values.saleOffPrice = `${value} ₫`
      }
      toggleEdit(e.target.value)
      handleSave({ ...record, ...values })
      setError([])
    } catch (errInfo) {
      if (IS_DEBUG) {
        console.log('@@err', errInfo)
      }
      setError(errInfo.errorFields)
    }
  }

  let childNode = children

  if (editable) {
    childNode = editing ? (
      formNode()
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    )
  }
  if (IS_DEBUG) {
    console.log('@@childNode', childNode)
  }
  return <td {...restProps}>{childNode}</td>
}

const FlashSaleTable = (props) => {
  const { listProductType, onChange, setError } = props
  // const [flashSaleTable, setFlashSaleTable] = useState([])
  const [isShowProductModal, setIsShowProductModal] = useState(false)
  const [dataSource, setDataSource] = useState()

  const getProduct = () => {
    const result = []
    listProductType?.map((item) => {
      item?.products?.map((product) => {
        if (product.isSelected === true) {
          product.saleOffPrice = 0
          product.saleOffPercent = 0
          product.quantity = 1
          result.push(product)
        }
      })
    })
    if (IS_DEBUG) {
      console.log('@@result', result)
    }
    return result
  }
  // useEffect(()=>{
  //     setDataSource(getProduct())
  // }
  // ,[])

  const columnFlashSales = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 150,
      fixed: 'left',
      // editable: false,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      width: 150,
      fixed: 'left',
      // editable: false,
      render: (value) => <span style={{ fontSize: 20 }}>{value}</span>,
    },
    {
      title: 'Ảnh chi tiết',
      dataIndex: 'image',
      width: 100,
      // formItemType: "UPLOAD_IMAGE",
      render: (value) => <Avatar size={110} shape="square" src={value} />,
    },
    // {
    //   title: "Chiếu khấu cho MediaOne",
    //   dataIndex: "discount_for_mediaone",
    //   width: 100,
    //   editable: true,
    // },
    // {
    //   title: "Code",
    //   dataIndex: "code",
    //   width: 100,
    //   editable: true,
    // },
    {
      title: 'Giá nhập (đ)',
      dataIndex: 'importPrice',
      width: 100,
      render: (value) => `${toDot(value)} đ`,
    },
    {
      title: 'Giá bán',
      dataIndex: 'paymentPrice',
      width: 1,
      hideInSearch: true,
      render: (value) => `${toDot(value)} đ`,
    },
    {
      title: 'Giá giảm',
      dataIndex: 'saleOffPrice',
      // formItemType: "INPUT_NUMBER",
      // valueType: "select",
      editable: true,
      width: 100,
    },
    {
      title: 'Phần trăm giảm',
      dataIndex: 'saleOffPercent',
      // formItemType: "INPUT_NUMBER",
      // valueType: "select",
      editable: true,
      width: 100,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      // formItemType: "INPUT_NUMBER",
      // valueType: "select",
      editable: true,
      width: 100,
    },
    // {
    //     title: "Phần trăm giảm",
    //     dataIndex: "saleOffPercent",
    //     formItemType: "INPUT_NUMBER",
    //     // valueType: "select",
    //     width: 100,
    // },
  ]

  const columnProductType = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 30,
      hideInSearch: false,
    },
    {
      title: 'Tên loại sản phẩm',
      dataIndex: 'name',
      width: 200,
      hideInSearch: false,
      //   ...getColumnSearchProps('name'),
    },
    // {
    //     title: 'Ảnh',
    //     dataIndex: 'images',
    //     width: 1,
    //     hideInSearch: true,
    //     render: (value) => {
    //         return (
    //             <Image src={value?.[0]?.url} width={60} height={60} style={{ marginLeft: 10 }} />
    //         );
    //     },
    // },
    {
      title: 'Giá bán',
      width: 10,
      dataIndex: 'paymentPrice',
      hideInSearch: true,
      // valueEnum: enums.statusEnum,
      render: (value) => <span>{toDot(value)} đ</span>,
    },

    {
      title: 'Trạng thái',
      width: 20,
      dataIndex: 'isActive',
      hideInSearch: true,
      // valueEnum: enums.statusEnum,
      render: (value) => {
        if (value) {
          return <Tag color="success">Hoạt động</Tag>
        }
        return <Tag color="error">Tạm dừng</Tag>
      },
    },
  ]
  let columnsData = columnFlashSales.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        setError: setError,
        handleSave: handleSave,
        // onChange: onChange
      }),
    }
  })

  const handleSave = (row) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row.id === item.id)
    const item = newData[index]
    newData.splice(index, 1, { ...item, ...row })
    setDataSource(newData)
    if (onChange) {
      onChange(newData)
    }
  }
  if (IS_DEBUG) {
    console.log('@@getProduct', getProduct())
  }
  return (
    <>
      <Modal
        visible={isShowProductModal}
        title={'Chọn sản phẩm cho chương trình Flash Sale'}
        width={1200}
        closable={true}
        onCancel={() => setIsShowProductModal(false)}
        onOk={() => {
          setDataSource(getProduct())
          // setFlashSaleTable([])
          // setFlashSaleTable(selectedRecords.map(item => {
          //     return {
          //         name: item.name,
          //         image: item.image,
          //         importPrice: item.importPrice,
          //         saleOffPrice: 0,
          //         saleOffPercent: 0
          //     }
          // }))
          message.success('Thêm thành công !')
        }}
      >
        <Table
          rowKey={'id'}
          // rowSelection={rowSelection}
          scroll={{ x: true, y: 400 }}
          columns={columnProductType}
          dataSource={listProductType}
          expandable={{ expandedRowRender }}
        />
      </Modal>
      <Card
        // tabList={[<Button>ok</Button>, <Button>alo</Button>]}
        title="Cấu hình giá flash sale"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setIsShowProductModal(true)
            }}
          >
            Chọn sản phẩm
          </Button>
        }
        bordered={false}
      >
        <Table
          rowKey={'id'}
          components={{
            body: {
              cell: EditableCell,
              row: EditableRow,
            },
          }}
          bordered={true}
          onChange={(field, value, record, list) => {
            onChange(list)
          }}
          rowClassName={() => 'editable-row'}
          // myRowKey={"id"}
          pagination={false}
          columns={columnsData}
          dataSource={dataSource}
        />
      </Card>
    </>
  )
}

const expandedRowRender = (record) => {
  // const [selectedRowKeys, setSelectedRowKeys] = useState([])
  // console.log("@@props",selectedRowKeys)

  const rowSelection = {
    // selectedRowKeys,
    onChange: (key) => {
      record.products = record.products.map((item) => {
        if (key.includes(item.id)) {
          return { ...item, ['isSelected']: true }
        }
        return { ...item, ['isSelected']: false }
      })
      // setSelectedRowKeys(key)
    },
  }
  const columnProduct = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 20,
      fixed: 'left',
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      width: 150,
      render: (value) => <Tag color={'cyan'}>{value}</Tag>,
    },
    {
      title: 'Ảnh chi tiết',
      dataIndex: 'image',
      width: 100,
      formItemType: 'UPLOAD_IMAGE',
      render: (value) => <Avatar shape="square" size={80} src={value} />,
    },
    // {
    //   title: "Chiếu khấu cho MediaOne",
    //   dataIndex: "discount_for_mediaone",
    //   width: 100,
    //   editable: true,
    // },
    // {
    //     title: "SKU",
    //     dataIndex: "skuId",
    //     // valueType: "select",
    //     width: 100,
    // },
    // {
    //   title: "Code",
    //   dataIndex: "code",
    //   width: 100,
    //   editable: true,
    // },
    {
      title: 'Giá nhập (đ)',
      dataIndex: 'importPrice',
      formItemType: 'INPUT_NUMBER',
      width: 100,
    },
    {
      title: 'Giá bán (đ)',
      dataIndex: 'paymentPrice',
      formItemType: 'INPUT_NUMBER',
      width: 100,
    },
    // {
    //     title: "Chiều cao (cm)",
    //     dataIndex: "height",
    //     width: 100,
    //     formItemType: "INPUT_NUMBER",
    // },
    // {
    //     title: "Chiều dài (cm)",
    //     dataIndex: "length",
    //     width: 100,
    //     formItemType: "INPUT_NUMBER",
    // },
    // {
    //     title: "Cân nặng (g)",
    //     dataIndex: "weight",
    //     width: 100,
    //     formItemType: "INPUT_NUMBER",
    // },
  ]
  return (
    <Table
      pagination={false}
      bordered={true}
      rowKey={'id'}
      rowSelection={rowSelection}
      search={false}
      className="components-table-demo-nested"
      columns={columnProduct}
      dataSource={record.products}
    />
  )
}

export default FlashSaleTable
