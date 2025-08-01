import { useEffect, useRef } from 'react'
import { parse, stringify } from 'qs'
import dayjs from 'dayjs'
import XLSX from 'xlsx'

export function fromExcelDate(excelDate: any, date1904: any) {
  const daysIn4Years = 1461
  const daysIn70years = Math.round(25567.5 + 1) // +1 because of the leap-year bug
  const daysFrom1900 = excelDate + (date1904 ? daysIn4Years + 1 : 0)
  const daysFrom1970 = daysFrom1900 - daysIn70years
  const secondsFrom1970 = daysFrom1970 * (3600 * 24)
  const utc = new Date(secondsFrom1970 * 1000)
  // return !isNaN(utc) ? utc : null;
  return utc ?? null
}

export function toExcelDate(date: any, date1904: any) {
  if (isNaN(date)) return null
  const daysIn4Years = 1461
  const daysIn70years = Math.round(25567.5 + 1) // +1 because of the leap-year bug
  const daysFrom1970 = date.getTime() / 1000 / 3600 / 24
  const daysFrom1900 = daysFrom1970 + daysIn70years
  const daysFrom1904Jan2nd = daysFrom1900 - daysIn4Years - 1
  return Math.round(date1904 ? daysFrom1904Jan2nd : daysFrom1900)
}

export const usePrevious = (state: any) => {
  const ref = useRef()

  useEffect(() => {
    ref.current = state
  })

  return ref.current
}

/* list of supported file types */
export const SheetJSFT = [
  'xlsx',
  'xlsb',
  'xlsm',
  'xls',
  'xml',
  'csv',
  'txt',
  'ods',
  'fods',
  'uos',
  'sylk',
  'dif',
  'dbf',
  'prn',
  'qpw',
  '123',
  'wb*',
  'wq*',
  'html',
  'htm',
]
  .map((x) => `.${x}`)
  .join(',')

/* generate an array of column objects */
export const make_cols = (refstr: any) => {
  const o = []
  const C = XLSX.utils.decode_range(refstr).e.c + 1
  for (let i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i }
  return o
}

const pad = (n: any) => (n < 10 ? `0${n}` : n)

export const formatTimeClock = (t: any) => {
  const hours = t.getUTCHours()
  const minutes = t.getUTCMinutes()
  const seconds = t.getUTCSeconds()
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export const getValue = (obj: any) =>
  Object.keys(obj)
    .map((key) => obj[key])
    .join(',')

export const formatDate = (value: any) => {
  return dayjs(value).format('DD-MM-YYYY')
}

export const camelToPascalCase = (v: any) => {
  let ret = ''
  let i = 0
  for (let s of v) {
    s = i === 0 ? s.toUpperCase() : s
    ret += s
    i += 1
  }
  return ret
}

export function fixedZero(val: any) {
  return val * 1 < 10 ? `0${val}` : val
}

export function getTimeDistance(type: any) {
  const now = new Date()
  const oneDay = 1000 * 60 * 60 * 24

  if (type === 'today') {
    now.setHours(0)
    now.setMinutes(0)
    now.setSeconds(0)
    return [dayjs(now), dayjs(now.getTime() + (oneDay - 1000))]
  }

  if (type === 'week') {
    let day = now.getDay()
    now.setHours(0)
    now.setMinutes(0)
    now.setSeconds(0)

    if (day === 0) {
      day = 6
    } else {
      day -= 1
    }

    const beginTime = now.getTime() - day * oneDay

    return [dayjs(beginTime), dayjs(beginTime + (7 * oneDay - 1000))]
  }

  if (type === 'month') {
    const year = now.getFullYear()
    const month = now.getMonth()
    const nextDate = dayjs(now).add(1, 'months')
    const nextYear = nextDate.year()
    const nextMonth = nextDate.month()

    return [
      dayjs(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      dayjs(
        dayjs(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() -
          1000
      ),
    ]
  }

  const year = now.getFullYear()
  return [dayjs(`${year}-01-01 00:00:00`), dayjs(`${year}-12-31 23:59:59`)]
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1])
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query)
  if (search.length) {
    return `${path}?${search}`
  }
  return path
}

/* eslint no-useless-escape:0 */
const reg =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/

export function isUrl(path: any) {
  return reg.test(path)
}

export function formatVnd(val: any) {
  const v = val * 1
  if (!v || Number.isNaN(v)) return ''

  let result = val
  if (val > 10000) {
    result = Math.floor(val / 10000)
    result = (
      <span>
        {result}
        <span
          style={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            marginLeft: 2,
          }}
        >
          đ
        </span>
      </span>
    )
  }
  return result
}

export const formatNumber = (value: any) => {
  // eslint-disable-next-line no-param-reassign
  if (Number.isNaN(value)) return 0
  value += ''
  const list = value.split('.')
  const prefix = list[0].charAt(0) === '-' ? '-' : ''
  let num = prefix ? list[0].slice(1) : list[0]
  let result = ''
  while (num.length > 3) {
    result = `,${num.slice(-3)}${result}`
    num = num.slice(0, num.length - 3)
  }
  if (num) {
    result = num + result
  }
  return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`
}

export const fnKhongDau = (str: any) => {
  let strReturn = str
  strReturn = strReturn.toLowerCase()
  strReturn = strReturn.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  strReturn = strReturn.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  strReturn = strReturn.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  strReturn = strReturn.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  strReturn = strReturn.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  strReturn = strReturn.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  strReturn = strReturn.replace(/đ/g, 'd')
  // strReturn = strReturn.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g, "-");
  // strReturn = strReturn.replace(/-+-/g, " ");
  // strReturn = strReturn.replace(/^\-+|\-+$/g, "");
  // strReturn = strReturn.replace('-', ' ');
  return strReturn
}

export const textToDash = (str: any) => {
  let strReturn = str
  strReturn = strReturn.toLowerCase()
  strReturn = strReturn.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  strReturn = strReturn.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  strReturn = strReturn.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  strReturn = strReturn.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  strReturn = strReturn.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  strReturn = strReturn.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  strReturn = strReturn.replace(/đ/g, 'd')
  strReturn = strReturn.replace(
    /!|@|\$|%|\”|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g,
    '-'
  )
  // strReturn = strReturn.replace(/-+-/g, "-");
  strReturn = strReturn.replace(/^\-+|\-+$/g, '-')
  strReturn = strReturn.replace(/-+/, '-')
  return strReturn
}

export const getRandomInt = (min: any, max: any) => {
  return Math.floor(Math.random() * (max - min)) + min
}

export const camelCaseToDash = (v: any) => {
  let ret = '',
    prevLowercase = false,
    prevIsNumber = false
  // eslint-disable-next-line prefer-const
  for (let s of v) {
    const isUppercase = s.toUpperCase() === s
    const isNumber = !isNaN(s)
    if (isNumber) {
      if (prevLowercase) {
        ret += '-'
      }
    } else {
      if (isUppercase && (prevLowercase || prevIsNumber)) {
        ret += '-'
      }
    }
    ret += s
    prevLowercase = !isUppercase
    prevIsNumber = isNumber
  }
  return ret.replace(/-+/g, '-').toLowerCase()
}

const baseUrlUpload = process.env.REACT_APP_URL
  ? process.env.REACT_APP_URL
  : window.location.origin

export const uploadImage = async (file: any) => {
  // const arrType = file.type.split('/');
  const fro = new FormData()
  fro.append('images', file)
  const getFileName = await fetch(baseUrlUpload + '/api/file/v2/upload-image', {
    method: 'POST',
    body: fro,
  })
  if (getFileName.status !== 200) throw getFileName
  return getFileName.json()
}

export const setSearchParam = (key: any, value: any) => {
  if (!window.history.pushState) {
    return
  }

  if (!key) {
    return
  }

  const url = new URL(window.location.href)
  const params = new window.URLSearchParams(window.location.search)
  if (value === undefined || value === null) {
    params.delete(key)
  } else {
    params.set(key, value)
  }

  url.search = params.toString()
  // url = url.toString()
  window.history.replaceState({ url: url }, '', url.toString())
}

export const getTableChange = (resource: any) => {
  const tableChangeStr = sessionStorage.getItem(`${resource}_tableChange`)
  if (tableChangeStr) return JSON.parse(tableChangeStr)
  return JSON.parse('{}')
}

export const setTableChange = (resource: any, obj: any) => {
  sessionStorage.setItem(`${resource}_tableChange`, JSON.stringify({ ...obj }))
}

export function useOutsideMenu(ref: any, callback: any) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])
}

export const random = (max: number) => {
  return Math.floor(Math.random() * max)
}
