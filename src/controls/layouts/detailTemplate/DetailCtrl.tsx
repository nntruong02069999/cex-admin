import React, { Component } from 'react'
import { Drawer } from 'antd'
import get from 'lodash/get'
import { helper } from '@src/controls/controlHelper'
import { FieldData } from '@src/packages/pro-component/schema/'
import Loader from '@src/components/Loading'
import HttpStatusCode from '@src/constants/HttpStatusCode'
import { ISchemaEditorProperties } from '../../editors/SchemaEditor'
import clone from 'lodash/clone'
import {
  defaultPageInfo,
  IPageEditorProps,
} from '@src/routes/default/pageManager/PageEditor'
import { COLUMN_ACTIONS_FIELD } from '../../editors/GridEditor'
import { Col, Row, Badge } from 'antd'
import moment from 'dayjs'

export interface FormCtrlProps {
  query?: any
  onClose?: (v: boolean) => void
  pageInfo?: IPageEditorProps
  drawerVisible: boolean
  record?: any
}

export interface FormCtrlState {
  data: any
  pageInfo: IPageEditorProps
  error: any
  loading: boolean
  mode: any
  fields: FieldData[]
  dataDisplay: any
}

class DetailCtrl extends Component<FormCtrlProps, FormCtrlState> {
  constructor(props: FormCtrlProps) {
    super(props)
    this.state = {
      fields: [],
      data: props.query.embed ? JSON.parse(props.query.embed) : null,
      mode: props.query.mode,
      pageInfo: props.pageInfo || defaultPageInfo,
      error: null,
      loading: true,
      dataDisplay: [],
    }
    this.formRef = React.createRef()
  }

  query: any
  formRef: any

  componentDidMount() {
    this.loadData()
  }

  static getDerivedStateFromProps(
    nextProps: FormCtrlProps,
    prevState: FormCtrlState
  ) {
    if (
      nextProps.query &&
      nextProps.query.embed &&
      JSON.parse(nextProps.query.embed) !== prevState.data
    ) {
      return { data: JSON.parse(nextProps.query.embed) }
    }
    if (
      nextProps.query &&
      nextProps.query.mode &&
      nextProps.query.mode !== prevState.mode
    ) {
      return { mode: nextProps.query.mode }
    } else return null // Triggers no change in the state
  }

  getSnapshotBeforeUpdate(prevProps: FormCtrlProps, _prevState: FormCtrlState) {
    if (prevProps?.query?.page != this.props?.query?.page) {
      return 'update'
    }
    return null
  }

  componentDidUpdate(prevProps: FormCtrlProps) {
    if (this.props.record != prevProps.record) {
      this.loadData(this.props)
    }
  }

  populateFields = (
    data: Record<string, any> = {},
    schemas: ISchemaEditorProperties[] = []
  ): FieldData[] => {
    const _fields: FieldData[] = []
    schemas.forEach((item) => {
      const _field: FieldData = {
        name: item.field,
      }
      if (data[item.field]) {
        _field.value = data[item.field]
      }
      _fields.push(_field)
    })
    return _fields
  }

  transformData = (fields: FieldData[] = []) => {
    const _data: Record<string, any> = clone(this.state.data || {})
    fields.forEach((field) => {
      const _value = field.value
      if (Array.isArray(field.name)) {
        _data[field.name[field.name.length - 1]] = _value
      } else {
        _data[field.name] = _value
      }
    })
    return _data
  }

  async loadData(props?: any) {
    if (!props) props = this.props
    let pageInfo = clone(props.pageInfo)
    if (!pageInfo) {
      pageInfo = await helper.getPage(props.query.page)
      this.setState({
        pageInfo,
        mode: props.query.mode,
      })
    }

    if (props.query.mode === 'info') {
      if (!props.query.id) {
        return this.setState({ error: 'Không có thông tin để tải dữ liệu' })
      }
      const rs: any = await helper.callPageApi(pageInfo, pageInfo.read, {
        queryInput: JSON.stringify({ id: props.query.id }),
      })
      let data = {}
      if (rs.status == HttpStatusCode.OK) {
        data = rs?.data?.data[0] ?? {}
      }
      if (props.query.embed) {
        Object.assign(data, JSON.parse(props.query.embed))
      }
      const fields = this.populateFields(data, pageInfo.schema)
      this.setState({ data, fields })
    }
    this.getInfo(pageInfo)
  }

  onClose = () => {
    this.props.onClose?.(false)
  }

  getInfo = async (pageInfo: Record<string, any>) => {
    const dataDetail = []
    const columns = pageInfo.grid.filter(
      (m: any) => m.field != COLUMN_ACTIONS_FIELD
    )
    for (let i = 0; i < columns.length; i++) {
      const gridInfo = pageInfo.grid[i]
      if (this.props.record && this.props.record[gridInfo.field]) {
        if (pageInfo.grid[i].modelSelect) {
          const rs: any = await helper.callPageApi(
            pageInfo,
            pageInfo.grid[i].modelSelectApi as string,
            {
              queryInput: JSON.stringify({
                id: this.props.record[gridInfo.field],
              }),
            }
          )
          dataDetail.push(
            <Row gutter={16} key={gridInfo.name}>
              <Col span={12}>
                <div className="nv-detail-item-wrapper">
                  <p className="nv-detail-item-label">{gridInfo.name}:</p>
                  <Badge
                    status="success"
                    text={rs && rs.data.data.length ? rs.data.data[0].name : ''}
                  />
                </div>
              </Col>
            </Row>
          )
        } else if (gridInfo.enumable) {
          const hasStatus = pageInfo.grid[i].items.find(
            (i: any) => i.value == this.props.record[gridInfo.field]
          )
          dataDetail.push(
            <Row gutter={16} key={gridInfo.name}>
              <Col span={12}>
                <div className="nv-detail-item-wrapper">
                  <p className="nv-detail-item-label">{gridInfo.name}:</p>
                  <Badge status="processing" text={hasStatus.key} />
                </div>
              </Col>
            </Row>
          )
        } else {
          switch (gridInfo.type) {
            case 'date': {
              dataDetail.push(
                <Row gutter={16} key={gridInfo.name}>
                  <Col span={12}>
                    <div className="nv-detail-item-wrapper">
                      <p className="nv-detail-item-label">{gridInfo.name}:</p>
                      <span className="nv-detail-item-content">
                        {moment(this.props.record[gridInfo.field]).format(
                          'DD/MM/YYYY'
                        )}
                      </span>
                    </div>
                  </Col>
                </Row>
              )
              break
            }
            default: {
              dataDetail.push(
                <Row gutter={16} key={gridInfo.name}>
                  <Col span={12}>
                    <div className="nv-detail-item-wrapper">
                      <p className="nv-detail-item-label">{gridInfo.name}:</p>
                      <span className="nv-detail-item-content">
                        {this.props.record[gridInfo.field]}
                      </span>
                    </div>
                  </Col>
                </Row>
              )
              break
            }
          }
        }
      }
    }
    this.setState({ dataDisplay: dataDetail })
  }

  render() {
    if (this.state.error)
      return <p className="text-danger">{this.state.error}</p>
    if (!this.state.pageInfo) return <Loader />
    return (
      <Drawer
        width={640}
        title={
          <span style={{ color: '#f09b1b' }}>{`${get(
            this.props.record || {},
            'name',
            '-'
          ).toUpperCase()}`}</span>
        }
        placement="right"
        closable={true}
        onClose={this.onClose}
        visible={this.props.drawerVisible}
      >
        {this.state.dataDisplay && this.state.dataDisplay.length
          ? this.state.dataDisplay.map((m: any) => {
              return m
            })
          : null}
      </Drawer>
    )
  }
}

export default DetailCtrl
