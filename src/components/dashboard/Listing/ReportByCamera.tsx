import { Component } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  // YAxis,
  Cell,
  CartesianGrid,
} from 'recharts'
import Widget from '@src/components/Widget/index'
import { Form, Button } from 'antd'
import { helper } from '@src/controls/controlHelper'
import Loader from '@src/components/Loading'
import DatePickerComponent from '@src/packages/pro-component/components/DatePicker'
import dayjs from 'dayjs'
import Widgets from '@src/packages/pro-component/schema/Widgets'

export interface ReportByCameraProps {
  location?: any
}

export interface ReportByCameraState {
  error?: any
  loading?: boolean
  data: any
  fromDate: any
  toDate: any
  factoryId: any
}

const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink']

const getPath = (x: any, y: any, width: any, height: any) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${
    y + height / 3
  }
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${
    x + width
  }, ${y + height}
  Z`
}

const TriangleBar = (props: any) => {
  const { fill, x, y, width, height } = props
  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />
}

export default class ReportBySlot extends Component<
  ReportByCameraProps,
  ReportByCameraState
> {
  constructor(props: ReportByCameraProps) {
    super(props)

    this.state = {
      error: null,
      loading: true,
      data: null,
      fromDate: dayjs().subtract(3, 'month').toDate(),
      toDate: new Date(),
      factoryId: 1,
    }
  }

  componentDidMount() {
    this.init()
  }

  async init() {
    const dataDash = await this.requestData()
    this.setState({
      loading: false,
      data: dataDash?.data,
    })
  }

  async requestData() {
    const dataDash = await helper.callPublicApi(
      'report-by-camera',
      '/api/admin/cms-report-get-cam',
      'POST',
      {
        fromDate: this.state.fromDate?.valueOf(),
        toDate: this.state.toDate?.valueOf(),
        factoryId: this.state.factoryId,
      }
    )
    return dataDash
  }

  handleChangeFromDate = async (value: any) => {
    this.setState({ fromDate: value })
  }

  handleChangeToDate = async (value: any) => {
    this.setState({ toDate: value })
  }

  handleChangeFactory = async (value: any) => {
    this.setState({ factoryId: value })
  }

  handleSubmit = async () => {
    this.init()
  }

  render() {
    const { data } = this.state
    if (!data) return <Loader />
    return (
      <Widget>
        <div className="gx-dealclose-header">
          <div>
            <h2 className="h2 gx-mb-2">
              Lượt lấy stream theo buồng sửa (<b>{data?.total}</b> lượt)
            </h2>
          </div>
          <div className="gx-dealclose-header-right">
            <Form
              layout="inline"
              className="gx-form-inline-label-up gx-form-inline-currency"
            >
              <Form.Item label="Xưởng" className="gx-form-item-three-fourth">
                <Widgets.SingleSelect
                  schema={{
                    modelSelectField: 'id$$ID,name$$Tên xưởng',
                    pageId: process.env.REACT_APP_PAGE_SETTING_ID,
                    api: 'find_factory',
                  }}
                  value={this.state.factoryId}
                  onChange={this.handleChangeFactory}
                />
              </Form.Item>
              <Form.Item label="Từ ngày" className="gx-form-item-three-fourth">
                <DatePickerComponent
                  showTime
                  value={
                    this.state.fromDate ? dayjs(this.state.fromDate) : dayjs()
                  }
                  onChange={(e) => {
                    this.handleChangeFromDate(e)
                  }}
                  disabled={false}
                />
              </Form.Item>
              <Form.Item label="Đến ngày" className="gx-form-item-three-fourth">
                <DatePickerComponent
                  showTime
                  value={this.state.toDate ? dayjs(this.state.toDate) : dayjs()}
                  onChange={(e) => {
                    this.handleChangeToDate(e)
                  }}
                  disabled={false}
                />
              </Form.Item>
              <Form.Item className="gx-d-block gx-mb-1">
                <Button
                  className="gx-mb-0"
                  type="primary"
                  onClick={this.handleSubmit}
                >
                  Áp dụng
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={550}>
          <BarChart
            data={data?.data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <Tooltip />
            <XAxis
              dataKey="slot"
              type="category"
              allowDataOverflow={true}
              padding="no-gap"
            />
            {/* <YAxis /> */}
            <CartesianGrid strokeDasharray="3 3" />
            <Bar
              dataKey="cnt"
              name="Lượt lấy"
              stackId="a"
              fill="#4BB543"
              barSize={15}
              shape={<TriangleBar />}
              label={{ position: 'top' }}
            >
              {data?.data.map((entry: any, index: any) => (
                <Cell key={`cell-${index}`} fill={colors[index % 20]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Widget>
    )
  }
}
