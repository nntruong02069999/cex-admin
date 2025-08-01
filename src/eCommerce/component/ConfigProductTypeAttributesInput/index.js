import React, { useState, useEffect } from 'react'
import { Divider, Button, Select, Form, Row, Col } from 'antd'
import EditableProTable from '../../../components/EditableTable'
import {
  MinusCircleOutlined,
  PlusOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons'
// import ProTable, { viVNIntl, IntlProvider } from "@ant-design/pro-table";
import { nanoid } from 'nanoid'
import _ from 'lodash'
import { IS_DEBUG } from '@src/constants/constants'

const DEFAULT_KEY_1 = 1
const DEFAULT_KEY_2 = 2
const { Option } = Select
const LIMIT_ATTRIBUTE = 2
const ProductTableInput = (props) => {
  let { columns, value = [], onChange, listSelectAttributes = [] } = props
  const [dataSource, setDataSource] = useState(value)
  const [editableKeys, setEditableRowKeys] = useState(() =>
    value.map((item) => item.id)
  )
  const [attributes, setAttributes] = useState({})
  if (IS_DEBUG) {
    console.log('##columns', columns)
    console.log('@@attributes', attributes)
    console.log('@@dataSource', dataSource)
  }
  useEffect(() => {
    tranformAttributeswithValue()
    // generateProductDatas()
  }, [])

  useEffect(() => {
    onChange(dataSource)
  }, [JSON.stringify(dataSource)])

  // useEffect(()=>{
  //   generateProductDatas()
  // },[JSON.stringify(attributes)])

  const addAttributeItem = () => {
    if (Object.keys(attributes).length < LIMIT_ATTRIBUTE) {
      // let id = nanoid();
      const clone = { ...attributes }
      if (Object.keys(clone).length === 0) {
        clone[DEFAULT_KEY_1] = []
      } else if (Object.keys(clone).length === 1) {
        clone[DEFAULT_KEY_2] = []
      }
      setAttributes(clone)
    }
  }
  const removeAttributeItem = (index, attributeId) => {
    let clone = _.cloneDeep(attributes)
    delete clone[attributeId]
    setAttributes(clone)
  }

  // useEffect(()=>{

  // },JSON.stringify(attributes))

  // const generateAtrtributeValues = () => {
  //   let obj = {}
  //   if (value.length > 0) {
  //     attributes.map(attributeId => {
  //       obj[`${attributeId}`] = Array.from(new Set(value.map(product => product.attributeValues[attributeId])))
  //     })
  //   }
  //   setAttributeWithValues(obj)
  // }

  const tranformAttributeswithValue = () => {
    var result = {}
    for (let i = 0; i < value.length; i++) {
      for (const property in value[i].attributeValues) {
        if (!result[property]) {
          result[property] = []
        }
        if (!result[property].includes(value[i].attributeValues[property])) {
          result[property].push(value[i].attributeValues[property])
        }
      }
    }
    setAttributes(result)
    if (IS_DEBUG) {
      console.log('@@result', result)
    }
  }

  const generateProductDatas = (clone) => {
    let productDatas = []
    // {key:attributeId,value:[attributeValues]}
    let rows = _.cloneDeep(clone)
    if (IS_DEBUG) {
      console.log('@@rows', rows)
    }
    if (Object.keys(rows).length == 1) {
      for (let i = 0; i < Object.values(rows)[0].length; i++) {
        productDatas.push({
          id: nanoid(),
          name: Object.values(rows)[0][i],
          importPrice: 1000,
          paymentPrice: 1000,
          height: 10,
          length: 10,
          width: 10,
          isActive: true,
          weight: 10,
          numberOfProduct: 1,
          //quantity: 0,
          images: [],
          attributeValues: {
            [`${Object.keys(rows)[0]}`]: Object.values(rows)[0][i],
          },
        })
      }
    }
    if (Object.keys(rows).length == 2) {
      for (let i = 0; i < Object.values(rows)[0].length; i++) {
        for (let j = 0; j < Object.values(rows)[1].length; j++) {
          productDatas.push({
            id: nanoid(),
            name: Object.values(rows)[0][i] + ' , ' + Object.values(rows)[1][j],
            importPrice: 1000,
            paymentPrice: 1000,
            height: 10,
            length: 10,
            width: 10,
            isActive: true,
            weight: 10,
            numberOfProduct: 1,
            //quantity: 0,
            images: [],
            attributeValues: {
              [`${Object.keys(rows)[0]}`]: Object.values(rows)[0][i],
              [`${Object.keys(rows)[1]}`]: Object.values(rows)[1][j],
            },
          })
        }
      }
    }
    if (IS_DEBUG) {
      console.log('productDatas', productDatas)
    }
    setDataSource(productDatas)
  }

  return (
    <div>
      {Object.keys(attributes || {}).map((attributeItem, attributeIndex) => (
        <Row justify="center" key={attributeItem} gutter={30}>
          <Col lg={5} md={5} sm={5}>
            <Form.Item
              key={attributeItem}
              label={`Thuộc tính ${attributeIndex + 1}`}
              name={`attributes.${attributeItem}`}
              rules={[
                {
                  required: true,
                  message: 'Tên loại sản phẩm không được trống',
                },
              ]}
              initialValue={attributeItem}
            >
              <Select
                showSearch={true}
                onChange={(value) => {
                  if (IS_DEBUG) {
                    console.log(value)
                    console.log('@@attributeItem', attributeItem)
                  }
                  const clone = _.cloneDeep(attributes)
                  clone[value] = clone[attributeItem]
                  delete clone[attributeItem]
                  if (IS_DEBUG) {
                    console.log('##clone', clone)
                  }
                  setAttributes(clone)
                  generateProductDatas(clone)
                  // console.log()
                  // confirmChangeKey(attributeItem, value);
                }}
              >
                {listSelectAttributes.map((item) => (
                  <Option key={item.id} value={item.id.toString()}>
                    {item.name}
                  </Option>
                ))}
                <PlusOutlined />
              </Select>
            </Form.Item>
          </Col>
          <Col lg={1} md={1} sm={1}>
            <Form.Item label={' '}>
              <PlusCircleOutlined
              // onClick={() => setModalAttribute(true)}
              />
            </Form.Item>
          </Col>

          <Col xs={14} lg={14} xl={14} md={14} sm={14}>
            <Form.Item
              key={attributeItem}
              label={'Giá trị thuộc tính'}
              name={`attributeValues.${attributeItem}`}
              initialValue={attributes[attributeItem] || []}
            >
              <Select
                mode="tags"
                onChange={(value) => {
                  const clone = _.cloneDeep(attributes)
                  console.log('@@clone', attributes)
                  console.log('@@clone', attributeItem)
                  clone[attributeItem] = value
                  setAttributes(clone)

                  // console.log("@@clone",clone)
                  generateProductDatas(clone)
                }}
              ></Select>
            </Form.Item>
          </Col>
          <Col xs={1} xl={1} lg={1} md={1} sm={1}>
            <Form.Item label={' '}>
              <MinusCircleOutlined
                onClick={() =>
                  removeAttributeItem(attributeIndex, attributeItem)
                }
              />
            </Form.Item>
          </Col>
        </Row>
      ))}
      <Row justify="center">
        <Button
          onClick={addAttributeItem}
          // style={{ marginTop: 30, width: "80%" }}
          type="dashed"
          icon={<PlusOutlined />}
        >
          Thêm thuộc tính
        </Button>
      </Row>
      <Divider orientation="left" plain>
        Bảng sản phẩm
      </Divider>
      <Row justify="center">
        <Col lg={21} md={21} sm={21}>
          <EditableProTable
            rowKey={(record) => record.id}
            headerTitle="Danh sách sản phẩm"
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            onChange={(field, value, record, list) => {
              onChange(list)
            }}
            scroll={{ x: 1500, y: 400 }}
            editable={{
              type: 'multiple',
              editableKeys,
              actionRender: (defaultDoms) => {
                return [defaultDoms.delete]
              },
              onValuesChange: (recordList) => {
                if (IS_DEBUG) {
                  console.log('@@tot', recordList)
                }
                onChange(recordList)
                setDataSource(recordList)
              },
              onChange: setEditableRowKeys,
            }}
          />
        </Col>
      </Row>
    </div>
  )
}

export default ProductTableInput
