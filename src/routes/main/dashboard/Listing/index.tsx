import { Component } from 'react'
import { Col, Row } from 'antd'
// import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import { helper } from '@src/controls/controlHelper'
import Auxiliary from '@src/util/Auxiliary'
// import ChartCard from '@src/components/dashboard/Listing/ChartCard'
// import { citiesData, propertiesData, visitsData } from '../dataMetric'
import ReportByFactory from '@src/components/dashboard/Listing/ReportByFactory'
import ReportBySlot from '@src/components/dashboard/Listing/ReportBySlot'
import ReportByCamera from '@src/components/dashboard/Listing/ReportByCamera'
// import Loader from '@src/components/Loading'

export interface ListingProps {
  location?: any
}

export interface ListingState {
  error?: any
  loading?: boolean
  data: any
}

export default class ListingViewer extends Component<
  ListingProps,
  ListingState
> {
  constructor(props: ListingProps) {
    super(props)

    this.state = {
      error: null,
      loading: true,
      data: null,
    }
  }

  componentDidMount() {}

  async init() {
    const dataDash = await helper.callPublicApi(
      'get-dashboard',
      '/api/admin/get-dashboard',
      'POST',
      {}
    )
    this.setState({
      loading: false,
      data: dataDash?.data,
    })
  }

  render() {
    return (
      <Auxiliary>
        <Row gutter={24}>
          <Col
            xl={24}
            lg={24}
            md={24}
            sm={24}
            xs={24}
            className="gx-order-lg-2"
          >
            <ReportByFactory />
          </Col>
          <Col
            xl={24}
            lg={24}
            md={24}
            sm={24}
            xs={24}
            className="gx-order-lg-2"
          >
            <ReportBySlot />
          </Col>
          <Col
            xl={24}
            lg={24}
            md={24}
            sm={24}
            xs={24}
            className="gx-order-lg-2"
          >
            <ReportByCamera />
          </Col>
        </Row>
      </Auxiliary>
    )
  }
}
