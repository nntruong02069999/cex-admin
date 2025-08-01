/* eslint-disable import/no-anonymous-default-export */
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import get from 'lodash/get';
import HttpStatusCode from '@src/constants/HttpStatusCode';
import local from './local';
import { message } from 'antd';
axios.defaults.baseURL = `${process.env.REACT_APP_URL || ''}/api`;

type RequestType = {
  url: string;
  options?: AxiosRequestConfig;
  noti?: boolean;
};

export interface IApiResponse<T>
  extends Omit<AxiosResponse<T>, 'statusText' | 'headers' | 'config'> {}

export interface IBodyError {
  errorCode: number;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default <T extends {} | []>(
  args: RequestType
): Promise<IApiResponse<T> | undefined> => {
  const {
    url,
    options = {
      method: 'get',
      headers: {},
    },
  } = args;
  let headers = {
    ...options.headers,
  };
  if (local.get('token')) {
    headers = {
      Authorization: `Bearer ${local.get('token')}`,
    };
  }
  if (!options.method) {
    options.method = 'get';
  }
  if (
    options.method.toLowerCase() === 'post' ||
    options.method.toLowerCase() === 'put' ||
    options.method.toLowerCase() === 'patch' ||
    options.method.toLowerCase() === 'delete'
  ) {
    if (options.data instanceof FormData) {
      headers = Object.assign(headers, {
        ...options.headers,
        // 'Accept': 'application/json',
      });
    } else {
      headers = Object.assign(headers, {
        ...options.headers,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      // options.data = JSON.stringify(options.data);
    }
  }

  const resAxios: Promise<IApiResponse<T> | undefined> = axios({
    url,
    /* transformRequest: [function (data, headers) {
      return data;
    }],
    transformResponse: [function (data) {
      return JSON.parse(data);
    }], */
    timeout: 1000 * 60 * 5, // current: 5' default is `0` (no timeout)
    ...options,
    headers,
  })
    .then((res) => {
      const apiResponse: IApiResponse<T> = {
        status: res?.status,
        data: res?.data,
      };
      let currentToken = local.get('token');
      if (
        currentToken &&
        res.headers?.accesstoken &&
        currentToken !== res.headers?.accesstoken
      ) {
        local.set('token', res.headers.accesstoken);
      }
      return apiResponse;
    })
    .catch(function (error: any) {
      let bodyError: IBodyError;
      if (axios.isCancel(error)) {
        console.warn('Request canceled', error.message);
        bodyError = {
          errorCode: HttpStatusCode.REQUEST_CANCEL,
          message: 'Request canceled',
        };
        const apiResponse: IApiResponse<any> = {
          status: HttpStatusCode.REQUEST_CANCEL,
          data: bodyError,
        };
        return apiResponse;
      } else {
        let status = HttpStatusCode.UNKNOW_ERROR;
        if (error.response) {
          if (error.response.status === 403) {
            message.destroy();
            message.error('Phiên làm việc hết hạn, vui lòng đăng nhập lại');
            if (window._store) {
              window._store.dispatch({
                type: 'auth/userSignOut',
              });
            }
            return;
          }
          let msg = 'Đã có lỗi xảy ra';
          try {
            msg = JSON.parse(error.response.data).message;
          } catch (err) {
            msg = get(error, 'response.data.message', 'Đã có lỗi xảy ra');
          }
          try {
            status = error.response.status;
            bodyError = {
              errorCode: error.response.data.code || HttpStatusCode.NOTFOUND,
              message: msg,
            };
          } catch (e) {
            bodyError = {
              errorCode: HttpStatusCode.UNKNOW_ERROR,
              message: 'Lỗi không xác định, vui lòng thử lại sau.',
            };
            status = HttpStatusCode.UNKNOW_ERROR;
          }
          if (error.response.status === HttpStatusCode.UNAUTHORIZED) {
            // TODO: return or redirect
            const apiResponse: IApiResponse<any> = {
              status: error.response.status,
              data: bodyError,
            };
            return apiResponse;
          }
          if (error.response.status === HttpStatusCode.NOTFOUND) {
            bodyError.message = error.response.data || 'NOT FOUND';
          }
        } else if (error.request) {
          console.error('error.request ', error.request);
          try {
            status = error.request.status;
          } catch (e) {
            status = HttpStatusCode.BAD_REQUEST;
          }
          bodyError = {
            errorCode: HttpStatusCode.BAD_REQUEST,
            message: 'Hệ thống backend xảy ra lỗi',
          };
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error', error.message);
          bodyError = {
            errorCode: HttpStatusCode.BAD_REQUEST,
            message: error.message || 'Lỗi gọi api lấy dữ liệu',
          };
          status = HttpStatusCode.BAD_REQUEST;
        }
        const apiResponse: IApiResponse<any> = {
          status,
          data: bodyError,
        };
        return apiResponse;
      }
    });

  return resAxios;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const instance = <T extends {} | []>(
  baseURL: string,
  args: RequestType
): Promise<IApiResponse<T> | undefined> => {
  const instanceAxios = axios.create({
    baseURL: `${baseURL}`,
  });
  const {
    url,
    options = {
      method: 'get',
      headers: {},
    },
  } = args;
  let headers = {
    ...options.headers,
  };
  /* if (local.get('token')) {
    headers = {
      Authorization: `Bearer ${local.get('token')}`,
    };
  } */
  if (!options.method) {
    options.method = 'get';
  }
  if (
    options.method.toLowerCase() === 'post' ||
    options.method.toLowerCase() === 'put' ||
    options.method.toLowerCase() === 'patch' ||
    options.method.toLowerCase() === 'delete'
  ) {
    if (options.data instanceof FormData) {
      headers = Object.assign(headers, {
        ...options.headers,
        // 'Accept': 'application/json',
      });
    } else {
      headers = Object.assign(headers, {
        ...options.headers,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      // options.data = JSON.stringify(options.data);
    }
  }

  const resAxios: Promise<IApiResponse<T> | undefined> = instanceAxios({
    url,
    /* transformRequest: [function (data, headers) {
      return data;
    }],
    transformResponse: [function (data) {
      return JSON.parse(data);
    }], */
    timeout: 1000 * 60 * 5, // current: 5' default is `0` (no timeout)
    ...options,
    headers,
  })
    .then((res) => {
      const apiResponse: IApiResponse<T> = {
        status: res?.status,
        data: res?.data,
      };

      return apiResponse;
    })
    .catch(function (error) {
      let bodyError: IBodyError;
      if (axios.isCancel(error)) {
        console.warn('Request canceled', error.message);
        bodyError = {
          errorCode: HttpStatusCode.REQUEST_CANCEL,
          message: 'Request canceled',
        };
        const apiResponse: IApiResponse<any> = {
          status: HttpStatusCode.REQUEST_CANCEL,
          data: bodyError,
        };
        return apiResponse;
      } else {
        let status = HttpStatusCode.UNKNOW_ERROR;
        if (error.response) {
          console.error('error.response.data ', error.response.data);
          console.error('error.response.status ', error.response.status);
          console.error('error.response.headers ', error.response.headers);
          let msg = 'Đã có lỗi xảy ra';
          try {
            msg = JSON.parse(error.response.data).message;
          } catch (err) {
            msg = get(error, 'response.data.message', 'Đã có lỗi xảy ra');
          }
          try {
            status = error.response.status;
            bodyError = {
              errorCode: error.response.data.code || HttpStatusCode.NOTFOUND,
              message: msg,
            };
          } catch (e) {
            bodyError = {
              errorCode: HttpStatusCode.UNKNOW_ERROR,
              message: 'Lỗi không xác định, vui lòng thử lại sau.',
            };
            status = HttpStatusCode.UNKNOW_ERROR;
          }
          if (error.response.status === HttpStatusCode.UNAUTHORIZED) {
            // TODO: return or redirect
            const apiResponse: IApiResponse<any> = {
              status: error.response.status,
              data: bodyError,
            };
            return apiResponse;
          }
          if (error.response.status === HttpStatusCode.NOTFOUND) {
            bodyError.message = error.response.data || 'NOT FOUND';
          }
        } else if (error.request) {
          console.error('error.request ', error.request);
          try {
            status = error.request.status;
          } catch (e) {
            status = HttpStatusCode.BAD_REQUEST;
          }
          bodyError = {
            errorCode: HttpStatusCode.BAD_REQUEST,
            message: 'Hệ thống backend xảy ra lỗi',
          };
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error', error.message);
          bodyError = {
            errorCode: HttpStatusCode.BAD_REQUEST,
            message: error.message || 'Lỗi gọi api lấy dữ liệu',
          };
          status = HttpStatusCode.BAD_REQUEST;
        }
        const apiResponse: IApiResponse<any> = {
          status,
          data: bodyError,
        };
        return apiResponse;
      }
    });

  return resAxios;
};

export const upload = async (url: string, formData: FormData) => {
  // url = `${(window as any).host}${url}`
  url = `${process.env.REACT_APP_IMAGE_URI}${url}`;
  const option = {
    method: 'PUT', // or 'PUT'
    body: formData,
    headers: {
      Authorization: `Bearer ${local.get('token') || 'customer'}`,
    },
  };
  if ((window as any).debug) console.debug(`[POST]`, url, option);
  const res = await fetch(url, option);
  const rs = await res.json();
  if (res.status !== 200) {
    console.info('upload res: ', res);
    throw rs;
  }
  if ((window as any).debug) console.debug(`[RESPONSE]`, url, rs);
  return rs;
};
