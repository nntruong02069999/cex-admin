import React, { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Select } from "antd";
import { connect } from 'dva';
// import dayjs from 'dayjs';
import Widget from "@src/components/Widget/index";

const Option = Select.Option;
const RESOURCE = "reportclass";
const BalanceHistory = (props) => {
  const {
    dispatch,
    // [RESOURCE]: { data },
  } = props;

  const [dataHistory, setDataHistory] = useState({});
  function handleChange(value) {
    dispatch({
      type: `${RESOURCE}/historyUser`,
      payload: {
        day: value,
      },
      callback: (data) => {
        setDataHistory(data);
      },
    });
  }
  const getDataHistory = () => {
    dispatch({
      type: `${RESOURCE}/historyUser`,
      payload: {
        day: 7,
      },
      callback: (data) => {
        setDataHistory(data);
      },
    });
  };


  useEffect(() => {
    getDataHistory();
  }, []);
  const CustomizedLabel = (props) => {

    const { x, y, stroke, value } = props;

    return (
      <text x={x + 10} y={y} dy={-5} fill={stroke} fontSize={15} textAnchor="middle">
        {value}
      </text>
    );

  };
  // const formatDate = (value) => {
  //   return dayjs(value).format("DD-MM");
  //   /* const date = new Date(value);
  //   return `${date.getMonth()}-${date.getFullYear()}` */
  // };


  return (
    <Widget styleName="gx-card-full">
      <div className="ant-row-flex gx-px-4 gx-pt-4">
        <h2 className="h4 gx-mb-3">Lịch sử đăng nhập</h2>
        <div className="gx-ml-auto">
          <Select className="gx-mb-2 gx-select-sm" defaultValue="7 Ngày trước" onChange={handleChange}>
            <Option value="7">7 ngày trước</Option>
            <Option value="30">30 ngày trước</Option>
          </Select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={dataHistory ? dataHistory.data : []}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Tooltip />
          <XAxis dataKey= "login_timestamp" />
          <defs>
            <linearGradient id="color15" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38AAE5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F5FCFD" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <Area dataKey='count' strokeWidth={2} stackId="2" stroke='#10316B' fill="url(#color15)"
            fillOpacity={1} label={CustomizedLabel}/>
        </AreaChart>
      </ResponsiveContainer>
    </Widget>
  );
};

export default connect(({ reportclass, loading }) => {
  const { data: historyUser } = reportclass;
  return ({
    historyUser,
    loading: loading.models.historyUser,
  });
})(BalanceHistory);


