export interface StoreState {
  settings?: any
  auth?: any
  menu?: any
  router?: any
  chat?: any
}

export interface Pagination {
  skip: number
  limit: number
  total: number
  totalPage: number
  page: number
}