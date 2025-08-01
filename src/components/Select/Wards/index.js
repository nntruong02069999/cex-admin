import React, { useState, useEffect, useMemo } from 'react'
import Select from '../index'
import wardData from '../../DataMapVN/ward.json'
import { fnKhongDau } from '../../../util/helpers'
const WardSelect = (props) => {
  const { ...rest } = props
  const [val, setVal] = useState([])
  // const [data, setData] = useState((origin) => (
  //   wardData.RECORDS.map(i => ({ key: i.id, value: i.name, label: i.name }))
  // ));
  const data = useMemo(() => {
    if (props.district) {
      return wardData.RECORDS.filter((i) => {
        if (i.district == props.district) {
          return true
        }
        return false
      }).map((i) => ({ key: i.id, value: i.name, label: i.name }))
    }
    return wardData.RECORDS.map((i) => ({
      key: i.id,
      value: i.name,
      label: i.name,
    }))
  }, [props.district])

  /* useEffect(() => {
    if (props.district) {
      setVal([]);
      setData(origin => (
        wardData.RECORDS
          .filter(i => {
            if (i.district == props.district) {
              return true;
            }
            return false;
          })
          .map(i => ({ key: i.id, value: i.name, label: i.name }))
      ));
    }
  }, [props.district]); */

  useEffect(() => {
    if (props.value) {
      setVal((_origin) => {
        const iFind = (data || []).find((i) => props.value == i.key)
        if (iFind) {
          return iFind
        }
        return props.value
      })
    } else {
      setVal([])
    }
  }, [data, props.value])

  return (
    <React.Fragment>
      {data && (
        <Select
          data={data}
          {...rest}
          value={val}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            fnKhongDau(option.children.toLowerCase()).indexOf(
              fnKhongDau(input.toLowerCase())
            ) >= 0
          }
        />
      )}
    </React.Fragment>
  )
}

export default WardSelect
