import { Component } from 'react';
import { helper } from '@src/controls/controlHelper';
import queryString from 'qs';
import ListCtrl from '@src/controls/layouts/gridTemplate/ListCtrl';
import Loader from '@src/components/Loading';
import { IPageEditorProps } from '../pageManager/PageEditor';
import * as GridTemplate from '@src/controls/layouts/gridTemplate';

export interface ListViewerProps {
  location?: any;
}

export interface ListViewerState {
  data: any;
  pageInfo: IPageEditorProps | null;
  error: any;
  columns: Array<any>;
  modelSelect: Record<string, any>;
  modelSelectIds: Record<string, any>;
  currentFilter: Record<string, any>;
  tbl: any;
  modalQuery: Record<string, any>;
  isShowModal: boolean;
  tblFilter: Array<any>;
  currentModal: any;
  query?: any;
  mode?: any;
  loading?: boolean;
}
class ListViewer extends Component<ListViewerProps, ListViewerState> {
  query: any;

  constructor(props: ListViewerProps) {
    super(props);
    this.query = queryString.parse(props.location.search, {
      ignoreQueryPrefix: true,
    });
    this.state = {
      data: [],
      pageInfo: null,
      error: null,
      columns: [],
      modelSelect: {},
      modelSelectIds: {},
      currentFilter: {},
      tbl: null,
      modalQuery: {},
      isShowModal: false,
      tblFilter: [],
      currentModal: null,
    };
  }

  itemsPerPage = 10;
  pageInfo = null;

  componentDidMount() {
    this.init(this.props);
  }

  getSnapshotBeforeUpdate(
    _prevProps: ListViewerProps,
    _prevState: ListViewerState
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
    _prevProps: ListViewerProps,
    _prevState: ListViewerState,
    snapshot: any
  ) {
    if (snapshot !== null) {
      this.init(this.props);
    }
  }

  async init(props: any) {
    this.setState({ pageInfo: null });
    this.query = queryString.parse(props.location.search, {
      ignoreQueryPrefix: true,
    });
    const pageInfo = await helper.getPage(this.query.page);
    if (!pageInfo) return helper.alert('Không tìm được trang');
    this.pageInfo = pageInfo;
    if (!Array.isArray(pageInfo.buttons)) pageInfo.buttons = [];
    if (!Array.isArray(pageInfo.grid)) pageInfo.grid = [];
    this.setState({
      query: this.query,
      pageInfo,
      mode: this.query.mode,
      loading: false,
    });
  }

  render() {
    const { pageInfo } = this.state;
    if (!(this.state.query && this.state.pageInfo)) return <Loader />;
    if (
      pageInfo &&
      pageInfo.settings &&
      pageInfo.settings.grid &&
      pageInfo.settings.grid.layout
    ) {
      const GridTemplateComp = (GridTemplate as any)[
        pageInfo.settings.grid.layout
      ];
      if (GridTemplateComp) {
        return (
          <GridTemplateComp
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
    return <ListCtrl query={this.state.query} pageInfo={this.state.pageInfo} />;
  }
}

export default ListViewer;
