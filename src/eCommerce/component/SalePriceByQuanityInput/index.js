import React, { useContext, useState, useEffect, useRef } from 'react'
import { Table, InputNumber, Button, Popconfirm, Form } from 'antd'

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
    dataSource,
    handleSave,
    setError,
    ...restProps
  } = props
  const [editing, setEditing] = useState(false)
  const [listError, setListError] = useState([])
  const inputRef = useRef(null)
  console.log('@@listError', listError)
  console.log('a@@props', props)
  useEffect(() => {
    if (editing) {
      inputRef.current.focus()
    }
  }, [editing])

  const form = useContext(EditableContext)

  const toggleEdit = (value) => {
    setEditing(!editing)
    console.log('@@ao', dataIndex, value)
    form.setFieldsValue({
      [dataIndex]: value || record[dataIndex],
    })
  }
  const getPrevNode = (currentKey) => {
    let obj = dataSource.filter((item) => item.key == currentKey - 1)
    console.log('@@obj', obj)
    return obj[0]
  }
  const formNode = () => {
    switch (dataIndex) {
      case 'price':
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
                  // console.log("@@obj",getPrevNode(record.key))
                  if (value < 1000) {
                    return Promise.reject(
                      new Error('Giá tiền phải lớn hơn 1000đ')
                    )
                  }
                  if (
                    record.key > 1 &&
                    value >= getPrevNode(record.key).price
                  ) {
                    return Promise.reject(
                      new Error('Giá hiện tại phải nhỏ hơn giá trước đó')
                    )
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
          </Form.Item>
        )
      case 'countMax':
        return (
          <Form.Item
            style={{
              margin: 0,
            }}
            dependencies={['countMin']}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `${title} là bắt buộc`,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  console.log('@@wait for me', getPrevNode(record.key))
                  if (getFieldValue('countMax') < 2) {
                    return Promise.reject(new Error('Số lượng phải hơn 1'))
                  }

                  if (getFieldValue('countMin') >= value) {
                    return Promise.reject(
                      new Error('Mua tối đa phải lớn hơn mua tối thiểu')
                    )
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
          </Form.Item>
        )
      case 'countMin':
        return (
          <Form.Item
            style={{
              margin: 0,
            }}
            dependencies={['countMax']}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `${title} là bắt buộc`,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  console.log('@@wait for me', getPrevNode(record.key))
                  console.log('@@ getFieldValue', getFieldValue('countMax'))
                  if (value < 2) {
                    return Promise.reject(new Error('Mua tối thiểu lớn hơn 1'))
                  }
                  if (value >= getFieldValue('countMax')) {
                    return Promise.reject(
                      new Error('Mua tối thiểu phải nhỏ hơn mua tối đa')
                    )
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
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
      let value = Number(e.target.value)
      console.log('@@e.target.value', value)
      if (isNaN(value) || value == 0) {
        toggleEdit('')
        return
      }
      const values = await form.validateFields()
      toggleEdit(e.target.value)
      handleSave({ ...record, ...values })
      setListError([])
      setError([])
    } catch (errInfo) {
      console.log('@@err', errInfo)
      setError(errInfo.errorFields)
      setListError(errInfo.errorFields)
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
  console.log('@@childNode11', childNode)
  return <td {...restProps}>{childNode}</td>
}

const SalePriceByQuanityInput = (props) => {
  console.log('!@@props', props)
  const columns = [
    {
      title: 'Từ (sản phẩm)',
      dataIndex: 'countMin',
      width: '30%',
      editable: true,
    },
    {
      title: 'Đến (sản phẩm)',
      dataIndex: 'countMax',
      editable: true,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      editable: true,
    },
    {
      title: 'Thao tác',
      dataIndex: 'operation',
      render: (_, record) =>
        record.key === dataSource.length ? (
          <Popconfirm
            title="Bạn có chắc có muốn xóa?"
            onConfirm={() => handleDelete(record.key)}
          >
            <a>Xóa</a>
          </Popconfirm>
        ) : null,
    },
  ]

  let { value = [], onChange, setError } = props
  let [dataSource, setDataSource] = useState(value || [])
  let [count, setCount] = useState(value.length + 1)

  console.log('@@value', dataSource)
  let columnsData = columns.map((col) => {
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
        dataSource: dataSource,
        setError: setError,
        handleSave: handleSave,
        // onChange: onChange
      }),
    }
  })

  const handleDelete = (key) => {
    if (key > 1) {
      let newDatasouce = dataSource
        .filter((item) => item.key !== key)
        .filter((item) => item.key !== key - 1)
      let newState = {
        ...dataSource.filter((item) => item.key === key - 1)[0],
        ['disabled']: false,
      }
      newDatasouce.push(newState)
      setDataSource(newDatasouce)
      setCount(count - 1)
    } else {
      setDataSource(dataSource.filter((item) => item.key !== key))
      setCount(count - 1)
    }
    if (onChange) {
      onChange(dataSource.filter((item) => item.key !== key))
    }
  }
  const handleAdd = () => {
    let newData
    if (dataSource.length > 0) {
      newData = {
        key: count,
        countMin: dataSource[dataSource.length - 1].countMax + 1 || 2,
        countMax: dataSource[dataSource.length - 1].countMax + 2 || 3,
        price: dataSource[dataSource.length - 1].price - 1 || 1000,
      }
    } else {
      newData = {
        key: count,
        countMin: 2,
        countMax: 3,
        price: 1000,
      }
    }
    let dataSourceTemp = dataSource.map((item) => {
      return { ...item, ['disabled']: true }
    })
    setCount(count + 1)
    setDataSource([...dataSourceTemp, newData])
    if (onChange) {
      onChange([...dataSourceTemp, newData])
    }
  }
  const handleSave = (row) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row.key === item.key)
    const item = newData[index]
    newData.splice(index, 1, { ...item, ...row })
    console.log('newData', newData)
    setDataSource(newData)
    if (onChange) {
      onChange(newData)
    }
  }
  return (
    <div>
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        Thêm khoảng giá
      </Button>
      <Table
        rowKey={'key'}
        components={{
          body: {
            row: EditableRow,
            cell: EditableCell,
          },
        }}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columnsData}
      />
    </div>
  )
}

export default SalePriceByQuanityInput
