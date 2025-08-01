import { Modal, DatePicker, Table } from 'antd'

import ProTable, { viVNIntl, IntlProvider } from '@ant-design/pro-table'
import { useState } from 'react'

const { RangePicker } = DatePicker

let listTimeRange = []
const PickRangeTime = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const data = [
    {
      id: 1,
      startTime: 1,
      endTime: 2,
    },
    {
      id: 2,
      startTime: 1,
      endTime: 2,
    },
  ]
  const rowSelection = {
    selectedRowKeys,
    onChange: (key, record) => {
      setSelectedRowKeys(key)
    },
  }
  const columns = [
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      width: 60,
      hideInSearch: true,
      render: () => {
        return (
          <>
            <DatePicker disabled={true} showTime />
          </>
        )
      },
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      width: 60,
      hideInSearch: true,
      render: () => {
        return (
          <>
            <DatePicker disabled={true} showTime />
          </>
        )
      },
    },
  ]
  return (
    <>
      <Modal visible={true} title={'Chọn khung giờ Flash Sale'} width={1200}>
        <IntlProvider value={viVNIntl}>
          <Table
            rowKey={'id'}
            pagination={false}
            rowSelection={rowSelection}
            search={false}
            columns={columns}
            dataSource={data}
          />
        </IntlProvider>
      </Modal>
    </>
  )
}

export default PickRangeTime
