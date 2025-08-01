/* eslint-disable no-restricted-globals */
import { useRef, useState, useEffect } from 'react';
import { connect } from 'dva';
import {
  // Form,
  Button,
  Input,
  Space,
  Image,
  // Col, Row,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { routerRedux } from 'dva/router';
import ProTable from '@src/packages/pro-table/Table';
// import PageHeaderWrapper from '../../../components/PageHeaderWrapper';
// import ResizableTitle from '../../../components/ResizableTitle';
// import defaultAvatar from '../../../assets/img/brand/placeholder.png';
import { helper } from '../../../controls/controlHelper';
import { toDot } from '@src/util/utils';
import _ from 'lodash';
import { IS_DEBUG } from '@src/constants/constants';

const RESOURCE = 'flashSale';
const getValue = (obj: any) =>
  Object.keys(obj)
    .map((key) => obj[key])
    .join(',');

const FlashSaleListCtrl = (props: any) => {
  // const [form] = Form.useForm();
  const searchInput = useRef<any>();
  const actionRef = useRef();
  const queryParams = new URLSearchParams(
    `?${location.href.split('?')[1]}`
  ) as any;
  // const [selectedRows, setSelectedRows] = useState([]);
  // const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // const [skip, setSkip] = useState(0);
  const [limit] = useState(
    process.env.REACT_APP_PAGESIZE &&
      !Number.isNaN(process.env.REACT_APP_PAGESIZE)
      ? Number(process.env.REACT_APP_PAGESIZE)
      : 10
  );
  // const [total, setTotal] = useState(0);
  // const [anchor, setAnchor] = useState('');
  // const [setCurrent] = useState<number>(1);
  const [listSearch, setListSearch] = useState({});
  // const [visibleKiotviet, setVisibleKiotviet] = useState(false)
  // const [partnerId, setPartnerId] = useState();
  //   const [setIsReset] = useState<boolean>(false);
  const tableChange = helper.getTableChange(RESOURCE);
  const [formValues] = useState(() => {
    return tableChange?.formValues || {};
  });

  const [pagination, setPagination] = useState({
    pageSize: limit,
    simple: true,
    itemRender: (type: any, originalElement: any) => {
      if (type === 'prev') {
        return <a>Trước&nbsp;&nbsp;</a>;
      }
      if (type === 'next') {
        return <a>Sau</a>;
      }
      return originalElement;
    },
  });

  const {
    dispatch,
    [RESOURCE]: { data },
    loading,
  } = props;

  const dispatchAction = (type: any, payload: any, callback: any) => {
    if (callback) {
      dispatch({
        type: `${RESOURCE}/${type}`,
        payload,
        callback,
      });
    } else {
      dispatch({
        type: `${RESOURCE}/${type}`,
        payload,
      });
    }
  };

  useEffect(() => {
    if (tableChange && tableChange.pagination) {
      const pagi = Object.assign(pagination, tableChange.pagination || {});
      const defaultCurrent = pagi.current || 1;
      setPagination((origin: any) => ({
        ...origin,
        ...pagi,
        defaultCurrent,
        skip: Number(pagi.current) - 1,
        limit: Number(pagi.pageSize),
      }));
    }
    const queryInput = {};
    dispatchAction(
      'fetch',
      {
        skip: (tableChange?.pagination?.current || 1) - 1,
        limit,
        queryInput: queryInput,
        sort: JSON.stringify([{ id: 'desc' }]),
        ...(tableChange?.formValues || {}),
      },
      null
    );
  }, []);

  useEffect(() => {
    const pagi = Object.assign(pagination, (data && data.pagination) || {});
    const defaultCurrent = pagi.current || 1;
    setPagination((origin) => ({
      ...origin,
      ...pagi,
      defaultCurrent,
      skip: Number(pagi.current) - 1,
      limit: Number(pagi.pageSize),
    }));
  }, [data]);

  const handleStandardTableChange = (
    pagination: any,
    filtersArg: any,
    sorter: any
  ) => {
    if (IS_DEBUG) {
      console.log('@@filtersArg', filtersArg);
    }

    const filters = Object.keys(filtersArg).reduce((obj: any, key: any) => {
      const newObj = { ...obj };
      if (filtersArg[key] !== null) newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    if (filters && filters.category) {
      const filCate = filters.category;
      filters.categories = filCate;
      delete filters.category;
    }

    const params = {
      ...formValues,
      ...filters,
      current: Number(pagination.current),
      // skip: (Number(pagination.current) - 1) * Number(pagination.pageSize),
      skip: (Number(pagination.current) - 1) * 10,
      limit: Number(pagination.pageSize),
      // anchor
    };
    if (sorter.field) {
      params.sorter = {
        [sorter.field]: sorter.order === 'ascend' ? 'ASC' : 'DESC',
      };
    }
    // setCurrent(pagination.current);
    helper.setTableChange(RESOURCE, {
      pagination,
      filtersArg,
      sorter,
      formValues,
    });
    setPagination((origin) => ({
      ...origin,
      current: Number(pagination.current),
      // skip: (Number(pagination.current) - 1) * Number(pagination.pageSize),
      skip: Number(pagination.current) - 1,
      limit: Number(pagination.pageSize),
    }));
    const queryInput = _.omit(params, ['limit', 'skip', 'current', 'sort']);
    if (IS_DEBUG) {
      console.log('@@params', queryInput);
    }

    dispatchAction(
      'fetch',
      {
        ...params,
        queryInput: { productName: ' di,ghe' },
        sort: JSON.stringify([{ id: 'desc' }]),
      },
      null
    );
  };

  // const handleSelectRows = (keys, rows) => {
  //   setSelectedRows(rows)
  //   setSelectedRowKeys(keys)
  //   /* if (keys.length > 0) {
  //     triggerChange(rows.map(i => i.id));
  //   } */
  // };

  //   const handleSearch = () => {
  //     form.validateFields().then(fieldsValue => {
  //       console.log('handleSearch -> fieldsValue', fieldsValue);
  //       let values = {
  //         current: 1,
  //         skip: 0,
  //         limit,
  //         start_at:[],
  //         end_at:null,
  //         fromDate:"",
  //       };
  //       Object.keys(fieldsValue).forEach(key => {
  //         if (fieldsValue[key] !== null && fieldsValue[key] !== undefined) {
  //           values[key] = fieldsValue[key]
  //         }
  //       })
  //       if (fieldsValue.fromDate) {
  //         const fromDate = fieldsValue.fromDate.set({ 'hour': 0, 'minute': 0, 'second': 0 }).valueOf()
  //         values.start_at = [fromDate]
  //       }
  //       if (fieldsValue.toDate) {
  //         const toDate = fieldsValue.toDate.set({ 'hour': 23, 'minute': 59, 'second': 59 }).valueOf()
  //         values.end_at = toDate
  //       }
  //       delete values.fromDate;
  //       delete values.toDate;
  //       const quantity = values.quantity;
  //       delete values.quantity;
  //       if (fieldsValue.quantity) {
  //         values.typeQuantity = quantity.typeQuantity;
  //         if (quantity.typeQuantity !== 'range') {
  //           values.quantity = Number(quantity.fromQuantity)
  //         } else {
  //           values.quantity = [Number(quantity.fromQuantity), Number(quantity.toQuantity)]
  //         }
  //       }
  //       let formValues = omit(values, ["current", "skip", "limit"]);
  //       if (sessionStorage.getItem('isReset') === 'true') {
  //         setIsReset(false);
  //         sessionStorage.setItem('isReset', false);
  //         formValues = {};
  //         values = pick(values, ["current", "skip", "limit"]);
  //       }
  //       setFormValues(formValues);
  //       helper.setTableChange(RESOURCE, {
  //         ...tableChange,
  //         pagination: {
  //           ...tableChange.pagination,
  //           current: 1,
  //           skip: 0,
  //           limit,
  //         },
  //         formValues
  //       });
  //       setPagination(origin => ({
  //         ...origin,
  //         current: 1,
  //         skip: 0,
  //         limit,
  //       }));
  //       dispatchAction('fetch', {
  //         ...values
  //       });
  //     }).catch(err => {
  //       console.log("$$err", err)
  //       if (err) return;
  //     });
  //   };

  const handleSearchFilter = (
    selectedKeys: any,
    confirm: any,
    dataIndex: any
  ) => {
    setListSearch({
      ...listSearch,
      [`search_${dataIndex}`]: selectedKeys[0],
    });
    confirm();
  };

  const getColumnSearchProps = (dataIndex: any) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearchFilter(selectedKeys, confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearchFilter(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm, dataIndex)}
            size='small'
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput.current.select());
      }
    },
    onFilter: (record: any) => record,
  });

  const handleReset = (clearFilters: any, confirm: any, dataIndex: any) => {
    clearFilters();
    setListSearch({
      ...listSearch,
      [`search_${dataIndex}`]: '',
    });
    confirm();
  };

  const handleAddClick = () => {
    dispatchAction(
      'loadForm',
      {
        type: 'A',
      },
      () => {
        dispatch(
          routerRedux.push({
            pathname: `/form?page=${queryParams.get('page')}&id=add`,
          })
        );
        window.location.reload();
      }
    );
  };

  // const handleUpdateClick = (record: any) => {
  //     dispatchAction('loadForm', {
  //         type: 'E',
  //         id: record.id
  //     }, () => {
  //         dispatch(routerRedux.push({ pathname: `/form?page=${queryParams.get("page")}&id=${record.id}` }));
  //         window.location.reload()
  //     })
  // };

  const handleResize =
    (index: number) =>
    (e: any, { size }: any) => {
      setColumns((origin: any) => {
        const nextColumns = [...origin];
        nextColumns[index] = {
          ...nextColumns[index],
          width: size.width,
        };
        return nextColumns;
      });
    };
  const columnsData = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      width: 1,
      hideInSearch: true,
      ...getColumnSearchProps('productName'),
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      width: 1,
      hideInSearch: true,
      render: (value: any) => {
        return (
          <Image
            src={value}
            width={60}
            height={60}
            style={{ marginLeft: 10 }}
          />
        );
      },
    },

    {
      title: 'Giá bán',
      dataIndex: 'normalPrice',
      width: 1,
      hideInSearch: true,
      render: (value: any) => `${toDot(value)} đ`,
    },
    {
      title: 'Giá flashSale',
      dataIndex: 'flashPrice',
      width: 1,
      hideInSearch: true,
      render: (value: any) => `${toDot(value)} đ`,
    },
    {
      title: 'Khung giờ',
      dataIndex: 'message',
      width: 1,
      hideInSearch: true,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      width: 1,
      hideInSearch: true,
    },
  ];

  const [columns, setColumns] = useState<any>(columnsData);
  if (IS_DEBUG) {
    console.log('@@data.list', data.list);
  }

  const getColumns = (): Array<any> => {
    return columns.map((col: any, index: any) => {
      /* if (tableChange && tableChange.formValues) {
              Object.keys(tableChange.formValues).forEach(key => {
                if (col.dataIndex == key) {
                  col.initialValue = tableChange.formValues[key];
                }
              });
            } */
      return {
        ...col,
        onHeaderCell: (column: any) => ({
          width: column.width,
          onResize: handleResize(index),
        }),
      };
    });
  };

  return (
    <>
      {/* <Row>
                <Col xs={24} sm={24} lg={24} xl={{ span: 20, offset: 2 }} xxl={{ span: 18, offset: 3 }}> */}
      <div>
        <ProTable
          type='table'
          rowKey='id'
          bordered
          search={false}
          form={{
            initialValues:
              sessionStorage.getItem('isReset') === 'true' ? {} : formValues,
            preserve: false,
          }}
          tableClassName='gx-table-responsive'
          dateFormatter='string'
          headerTitle={
            <span>
              <ThunderboltFilled />
              Danh sách sản phẩm đăng ký FlashSale
            </span>
          }
          // components={{
          //   header: {
          //     cell: ResizableTitle,
          //   },
          // }}
          toolBarRender={({}) => [
            <Button
              key={1}
              icon={<PlusOutlined />}
              type='primary'
              onClick={() => handleAddClick()}
            >
              Thêm FlashSale
            </Button>,
          ]}
          //   onReset={() => {
          //     setIsReset(true);
          //     sessionStorage.setItem('isReset', true);
          //     // setFormValues({})
          //     helper.setTableChange(RESOURCE, {
          //       pagination: {
          //         current: 1,
          //         skip: 0,
          //         limit,
          //       },
          //       filtersArg: {}, sorter: {}, formValues: {}
          //     });
          //   }}
          actionRef={actionRef}
          // formRef={form}
          dataSource={data && data.list}
          pagination={pagination}
          columns={getColumns()}
          loading={loading}
          // scroll={{ x: 1500 /*, y: 300 */ }}
          onChange={handleStandardTableChange}
          //   onSubmit={handleSearch}
        />
      </div>
      {/* </Col>
            </Row> */}

      {/* ĐỒNG BỘ KIOTVIEW */}
    </>
  );
};

export default connect(({ flashSale, loading }: any) => ({
  flashSale,
  loading: loading.models.flashSale,
}))(FlashSaleListCtrl);
