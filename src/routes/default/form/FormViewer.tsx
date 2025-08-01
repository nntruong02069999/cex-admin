import { Component } from 'react';
import queryString from 'qs';
import FormCtrl from '@src/controls/layouts/schemaTemplate/FormCtrl';
import { Card, Col, Row } from 'antd';
import { IPageEditorProps } from '../pageManager/PageEditor';
import { helper } from '@src/controls/controlHelper';
import * as SchemaTemplate from '@src/controls/layouts/schemaTemplate';
import Loader from '@src/components/Loading';

export interface FormViewerProps {
  location?: any;
}

export interface FormViewerState {
  query: any;
  data: any;
  pageInfo: IPageEditorProps | null;
  mode?: any;
  error?: any;
  loading?: boolean;
}
export default class FormViewer extends Component<
  FormViewerProps,
  FormViewerState
> {
  constructor(props: FormViewerProps) {
    super(props);
    const query = queryString.parse(props.location.search, {
      ignoreQueryPrefix: true,
    });
    this.state = {
      query,
      data: query.embed ? JSON.parse(query.embed) : null,
      pageInfo: null,
      error: null,
    };
  }

  query: any;

  componentDidMount() {
    this.init(this.props);
  }

  static getDerivedStateFromProps(
    nextProps: FormViewerProps,
    prevState: FormViewerState
  ) {
    if (nextProps.location && nextProps.location.search != prevState.query) {
      return {
        query: queryString.parse(nextProps.location.search, {
          ignoreQueryPrefix: true,
        }),
      };
    } else return null; // Triggers no change in the state
  }

  getSnapshotBeforeUpdate(
    _prevProps: FormViewerProps,
    _prevState: FormViewerState
  ) {
    const curQuery = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    const prevQuery = queryString.parse(_prevProps.location.search, {
      ignoreQueryPrefix: true,
    });
    if (curQuery?.page != prevQuery?.page) {
      return 'update';
    }
    return null;
  }

  componentDidUpdate(
    _prevProps: FormViewerProps,
    _prevState: FormViewerState,
    snapshot: any
  ) {
    if (snapshot !== null) {
      this.init(this.props);
    }
  }

  // eslint-disable-next-line react/no-deprecated
  /* componentWillReceiveProps(next: any) {
    this.setState({
      query: queryString.parse(next.location.search, {
        ignoreQueryPrefix: true,
      }),
    })
  } */

  async init(props: FormViewerProps) {
    this.setState({ pageInfo: null });
    this.query = queryString.parse(props.location.search, {
      ignoreQueryPrefix: true,
    });
    const pageInfo = await helper.getPage(this.query.page);
    if (!pageInfo) return helper.alert('Không tìm được trang');
    this.setState({
      query: this.query,
      pageInfo,
      mode: this.query.mode,
      loading: false,
    });
  }

  render() {
    const { pageInfo } = this.state;
    if (!(this.state.query && pageInfo)) return <Loader />;
    if (
      pageInfo &&
      pageInfo.settings &&
      pageInfo.settings.schema &&
      pageInfo.settings.schema.layoutCtrl
    ) {
      const TemplateComp = (SchemaTemplate as any)[
        pageInfo.settings.schema.layoutCtrl
      ];
      if (TemplateComp) {
        return (
          <TemplateComp
            query={this.state.query}
            pageInfo={this.state.pageInfo}
          />
        );
      }
      return (
        <>
          <h1>Template không tồn tại</h1>
        </>
      );
    }
    return (
      <Row>
        <Col span={24}>
          <Card>
            <FormCtrl query={this.state.query} pageInfo={pageInfo} />
          </Card>
        </Col>
      </Row>
    );
  }
}
