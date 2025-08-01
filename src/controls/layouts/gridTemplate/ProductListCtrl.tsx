/* eslint-disable no-restricted-globals */
import { useRef, useState, useEffect } from 'react';
import { connect } from 'dva';
import {
  // Form,
  Button,
  Tooltip,
  Drawer,
  Image,
  Col,
  Row,
  Typography,
  Tag,
  Input,
  Space,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { routerRedux } from 'dva/router';
import ProTable from '@src/packages/pro-table/Table';
// import PageHeaderWrapper from '../../../components/PageHeaderWrapper';
// import ResizableTitle from '../../../components/ResizableTitle';
import Lget from 'lodash/get';
// import defaultAvatar from '../../../assets/img/brand/placeholder.png';
import { helper } from '../../../controls/controlHelper';
import _ from 'lodash';
import { toDot } from '@src/util/utils';
import { IS_DEBUG } from '@src/constants/constants';

const { Title } = Typography;

const RESOURCE = 'productType';
const getValue = (obj: any) =>
  Object.keys(obj)
    .map((key) => obj[key])
    .join(',');

const ImagePreview = (props: any) => {
  const [indexActive, setIndexActive] = useState(0);
  useEffect(() => {
    if (!props.images[indexActive]) {
      setIndexActive(0);
    }
  }, [props.images]);

  return (
    <Row>
      <Col span={16}>
        <Image
          width={175}
          height={175}
          src={props.images[indexActive] || null}
        />
      </Col>
      <Col span={8}>
        {props.images.map((i: any, idx: any) => (
          <img
            onClick={() => setIndexActive(idx)}
            key={idx}
            style={{
              width: 50,
              height: 50,
              border:
                idx == indexActive ? '1px solid #007bff' : '1px solid #eeeeee',
              marginTop: 2,
            }}
            src={i}
          />
        ))}
      </Col>
    </Row>
  );
};

const TableList = (props: any) => {
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
  const [visible, setVisible] = useState<boolean>(false);
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

  // const getQuantity = (record) => {
  //   let a = record?.products?.reduce((a, b) => (a?.quantity || 0) + (b?.quantity || 0))
  //   if (typeof a == 'number') return a
  //   return 0
  // }

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
    dispatchAction(
      'fetch',
      {
        ...params,
        queryInput: queryInput,
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

  const handleUpdateClick = (record: any) => {
    dispatchAction(
      'loadForm',
      {
        type: 'E',
        id: record.id,
      },
      () => {
        dispatch(
          routerRedux.push({
            pathname: `/form?page=${queryParams.get('page')}&id=${record.id}`,
          })
        );
        window.location.reload();
      }
    );
  };

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
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      fixed: 'left',
      hideInSearch: false,
      render: (val: any) => {
        return (
          <Typography.Text
            code={false}
            copyable={{
              text: val,
            }}
            underline={false}
          >
            <Tooltip title={val}>{val}</Tooltip>
          </Typography.Text>
        );
      },
    },
    {
      title: 'Ảnh',
      dataIndex: 'images',
      width: 1,
      hideInSearch: true,
      render: (value: any) => {
        return (
          <Image
            src={value?.[0]?.url}
            width={60}
            height={60}
            style={{ marginLeft: 10 }}
          />
        );
      },
    },
    {
      title: 'Tên loại sản phẩm',
      dataIndex: 'name',
      width: 100,
      hideInSearch: false,
      render: (value: any, record: any) => {
        return (
          <div
            onClick={() => {
              setProductTypeSelectValue(value);
              setProductTypeSelect(record);
              setVisible(true);
            }}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                margin: '0 10px',
              }}
            >
              <div>
                <Typography.Link
                  onClick={() => {
                    setProductTypeSelectValue(value);
                    setProductTypeSelect(record);
                    setVisible(true);
                  }}
                >
                  {value?.toUpperCase()}
                </Typography.Link>
              </div>
            </div>
          </div>
        );
      },
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Giá bán',
      width: 10,
      dataIndex: 'paymentPrice',
      hideInSearch: true,
      // valueEnum: enums.statusEnum,
      render: (value: any) => <span>{toDot(value)} đ</span>,
    },

    {
      title: 'Trạng thái',
      width: 20,
      dataIndex: 'state',
      hideInSearch: true,
      // valueEnum: enums.statusEnum,
      render: (value: any) => {
        if (value) {
          return <Tag color='success'>Hoạt động</Tag>;
        }
        return <Tag color='error'>Tạm dừng</Tag>;
      },
    },
    {
      title: 'Thao tác',
      width: 20,
      fixed: 'right',
      render: (record: any) => (
        <>
          <Button
            type='primary'
            size={'middle'}
            onClick={() => handleUpdateClick(record)}
          >
            Sửa
          </Button>
          &nbsp;
          {/* <Button size={"middle"} danger>Xóa</Button> */}
        </>
      ),
    },
  ];

  const [columns, setColumns] = useState<any>(columnsData);
  const [productTypeSelect, setProductTypeSelect] = useState<any>([]);
  const [productTypeSelectValue, setProductTypeSelectValue] =
    useState<any>(null);
  const [productSelectActive, setProductSelectActive] = useState<any>({});

  useEffect(() => {
    if (IS_DEBUG) {
      console.log('@@the money1', productTypeSelect);
    }

    if ((Lget(productTypeSelect, 'products', []) || []).length) {
      setProductSelectActive(Lget(productTypeSelect, 'products', [])[0]);
    }
  }, [productTypeSelect]);

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
          search={true}
          form={{
            initialValues:
              sessionStorage.getItem('isReset') === 'true' ? {} : formValues,
            preserve: false,
          }}
          tableClassName='gx-table-responsive'
          dateFormatter='string'
          headerTitle={'Danh sách loại sản phẩm'}
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
              Thêm mới
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

      {/* CHI TIẾT SẢN PHẨM */}
      <Drawer
        title='Chi tiết thông tin sản phẩm'
        placement='right'
        closable={false}
        visible={visible}
        width={720}
        onClose={() => setVisible(false)}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Title level={4}>{productTypeSelectValue}</Title>
        <div style={{ height: 20 }} />
        <Row>
          <Col span={10}>
            <ImagePreview images={[productSelectActive?.image] || []} />
          </Col>
          <Col span={14}>
            <Row>
              <Col span={8}>
                <div>Phân loại: </div>
              </Col>
              <Col span={16}>
                <div style={{ fontWeight: 600 }}>
                  {productSelectActive.name}
                </div>
              </Col>
            </Row>

            <Row>
              <Col span={8}>
                <div>Giá sản phẩm: </div>
              </Col>
              <Col span={16}>
                <div style={{ fontWeight: 600 }}>
                  {helper.toDot(productSelectActive.paymentPrice)} vnđ
                </div>
              </Col>
            </Row>

            <Row>
              <Col span={8}>
                <div>Giá gốc: </div>
              </Col>
              <Col span={16}>
                <div
                  style={{ fontWeight: 600, textDecoration: 'line-through' }}
                >
                  {helper.toDot(productSelectActive.importPrice)} vnđ
                </div>
              </Col>
            </Row>
            {/* <Row>
                            <Col span={8} >
                                <div>Kho: </div>
                            </Col>
                            <Col span={16} >
                                <div style={{ fontWeight: '600' }}>{helper.toDot(productSelectActive.quantity)}</div>
                            </Col>
                        </Row> */}
            <Row>
              <Col span={8}>
                <div>Khối lượng: </div>
              </Col>
              <Col span={16}>
                <div style={{ fontWeight: 600 }}>
                  {productSelectActive.weight / 1000} kg
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        <div style={{ height: 20 }} />
        <Row>
          <Col span={6}>Các loại sản phẩm: </Col>
          <Col span={18}>{productTypeSelect.description}</Col>
        </Row>
        <div style={{ height: 20 }} />
        <Row>
          <Col span={6}>Các loại sản phẩm: </Col>
          <Col span={18}>
            {(Lget(productTypeSelect, 'products', []) || []).map(
              (i: any, idx: number) => (
                <Button
                  type={i.id == productSelectActive.id ? 'primary' : 'default'}
                  onClick={() => setProductSelectActive(i)}
                  style={{ marginLeft: 5, marginTop: 5 }}
                  key={idx}
                  size='middle'
                >
                  {' '}
                  {i.name}{' '}
                </Button>
              )
            )}
          </Col>
        </Row>
        <div style={{ height: 20 }} />
        <Row>
          <Col span={6}>Chọn hành động: </Col>
          <Col span={18}>
            <Button
              type='default'
              onClick={() => {
                handleUpdateClick(productTypeSelect);
              }}
              style={{ marginLeft: 5 }}
              size='middle'
            >
              {' '}
              Chỉnh Sửa{' '}
            </Button>
            <Button
              type='primary'
              onClick={() => {}}
              style={{ marginLeft: 5 }}
              size='middle'
              danger
            >
              {' '}
              Xoá sản phẩm{' '}
            </Button>
          </Col>
        </Row>
      </Drawer>
      {/* ĐỒNG BỘ KIOTVIEW */}
    </>
  );
};

export default connect(({ productType, loading }: any) => ({
  productType,
  loading: loading.models.productType,
}))(TableList);
