import React, { useState, useEffect, useMemo } from 'react'
import Select from '../index'
import districtData from '../../DataMapVN/district.json'
import { fnKhongDau } from '../../../util/helpers'
const ProvinceSelect = (props) => {
  const { ...rest } = props
  const [val, setVal] = useState([])
  /* const [data, setData] = useState(districtData.RECORDS.map(i => ({ key: i.id, value: i.name, label: i.name })));

  useEffect(() => {
    if (props.province) {
      setVal([]);
      setData(origin => (
        districtData.RECORDS
          .filter(i => {
            if (i.province == props.province) {
              return true;
            }
            return false;
          })
          .map(i => ({ key: i.id, value: i.name, label: i.name }))
      ));
    }
  }, [props.province]); */
  const data = useMemo(() => {
    if (props.province) {
      return districtData.RECORDS.filter((i) => {
        if (i.province == props.province) {
          return true
        }
        return false
      }).map((i) => ({ key: i.id, value: i.name, label: i.name }))
    }
    return districtData.RECORDS.map((i) => ({
      key: i.id,
      value: i.name,
      label: i.name,
    }))
  }, [props.province])

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

export default ProvinceSelect
