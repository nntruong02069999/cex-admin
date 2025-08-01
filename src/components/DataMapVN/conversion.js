import provinces from "./province.json"
import districts from "./district.json"
import wards from "./ward.json"
import get from 'lodash/get'
import {fnKhongDau} from "../../utils/utils"

function convertionAddress(address_components) {
    if(!address_components) return {}
    let province, district, ward
    address_components.forEach(address => {
        if(address.types.some(type => type == 'administrative_area_level_1')) {
            province = address.long_name
            return
        }
        if(address.types.some(type => type == 'administrative_area_level_2' || type == 'locality')) {
            district = address.long_name
            return
        }
        if(address.types.some(type => type == 'administrative_area_level_3' ||  type == 'sublocality_level_1' ||  type == 'route' )) {
            ward = address.long_name
            return
        }
    })
    let out = {}
    if (province) {
        let record = provinces.RECORDS.find(prov => {
            let defProvince = fnKhongDau(prov.name)
            let inProvince = fnKhongDau(province)
            let ok = (defProvince.includes(inProvince) || inProvince.includes(defProvince))
            if (ok) {
                return ok
            }
        })
        if(record) {
            out.province = record.id
        }
    }
    if (district) {
        let record = districts.RECORDS.find(distr => {
            let defDistrict = fnKhongDau(distr.name)
            let inDistrict = fnKhongDau(district)
            let ok = (inDistrict.includes(defDistrict) || defDistrict.includes(inDistrict))
            if (ok) {
                return ok
            }
        })
        if(record) {
            out.district = record.id
        }
    }
    if (ward) {
        let record = wards.RECORDS.find(w => {
            let defWard = fnKhongDau(w.name)
            let inWard = fnKhongDau(ward)
            let ok = (defWard.includes(inWard) || inWard.includes(defWard))
            if (ok) {
                return ok
            }
        })
        if(record) {
            out.ward = record.id
        }
    }
    return out
}

export default convertionAddress