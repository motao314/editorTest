import { Cfetch, interceptors } from './fetch';
// 这里是我项目使用到的js-cookie库，主要是为了拿到token，你们这里改成你们获取token的方式即可

import { message } from 'ant-design-vue';
import { useMainStore } from '@/store';
import queryString from 'query-string';

const loadingHandlers = {};
// window.fetch = Cfetch
/**
 * config 自定义配置项
 *  @param responseType 响应数据格式
 * @param withoutCheck 不使用默认的接口状态校验，直接返回 response
 * @param returnOrigin 是否返回整个 response 对象，为 false 只返回 response.data
 * @param isShowLoading: boolen     //是否需要显示loading动画
 * @param customHeader: object        // 自定义的请求头
 * @param showError 全局错误时，是否使用统一的报错方式
 * @param canEmpty 传输参数是否可以为空
 * @param mock 是否使用 mock 服务
 * @param timeout 接口请求超时时间，默认10秒
 */
let configDefault = {
  responseType: 'json',
  isShowLoading: false,
  showError: true,
  canEmpty: false,
  returnOrigin: false,
  withoutCheck: false,
  mock: false,
  timeout: 100000,
};

// 添加请求拦截器
interceptors.request.use((config) => {
  const { customHeader, ...conf } = config;
  // 这里是我项目使用到的js-cookie库，主要是为了拿到token，你们这里改成你们获取token的方式即可
  const localStorageToken = localStorage.getItem('Authorization');

  let MainStore = useMainStore();
  const mainStoreToken = MainStore.token;

  // console.log("fetchApi authorization Bearer", { mainStoreToken, localStorageToken });

  const newConfig = {
    ...configDefault,
    ...{
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        authorization: `Bearer ${mainStoreToken || localStorageToken}`,
        ...customHeader,
      },
      ...conf,
    },
  };

  if (newConfig.isShowLoading) {
    Object.keys(loadingHandlers).forEach((key) => {
      loadingHandlers[key]();
    });
    setTimeout(() => {
      showLoading(config.timestamp);
    });
  }

  // console.log('添加请求拦截器 configDefalut ==>', {...newConfig,timestamp:timestamp})
  return newConfig;
});

// 添加响应拦截器
interceptors.response.use(async (response, reqConfig) => {
  // console.log('拦截器response ==>',response)
  // console.log('configDefault', reqConfig)
  /**
   * ok: true
    status: 200
    statusText: "OK"
    url: "http://"
   */
  //   // HTTP 状态码 2xx 状态入口，data.code 为 200 表示数据正确，无任何错误
  if (response.ok && response.status >= 200 && response.status < 300) {
    let res = await resultReduction(response, reqConfig);
    reqConfig.isShowLoading && hideLoading(reqConfig.timestamp);
    res.status = response.status;
    return handleResult(res, reqConfig);
  } else {
    // 非 2xx 状态入口
    if (reqConfig.withoutCheck) {
      // 不进行状态状态检测
      reqConfig.isShowLoading && hideLoading(reqConfig.timestamp);
      return Promise.reject(response);
    } else {
      let err = handleFailedResult(
        {
          url: response.url,
          fetchStatus: 'error',
          netStatus: response.status,
          error: response.statusText,
        },
        reqConfig,
      );
      return Promise.reject(err);
    }
  }
});
/**
 * 统一处理后台返回的结果, 包括业务逻辑报错的结果
 * @param result
 */
function handleResult(result, reqConfig) {
  if (!result.flag && reqConfig.withoutCheck === false) {
    const errMsg = result.msg || result.message || '服务器开小差了，稍后再试吧';
    const errStr = `${errMsg}（${result.status}）`;
    message.info({ content: errStr, key: reqConfig.timestamp, duration: 2 });
    throw new Error(errStr);
  } else {
    reqConfig.isShowLoading && hideLoading(reqConfig.timestamp);
  }
  return result;
}
/**
 * 统一处fetch的异常, 不包括业务逻辑报错
 * @param result
 * ps: 通过 this.isHandleError 来判断是否需要有fetch方法来统一处理错误信息
 */
function handleFailedResult(result, reqConfig) {
  if (reqConfig.withoutCheck === false) {
    const errMsg = result.msg || result.message || '服务器开小差了，稍后再试吧';
    const errStr = `${errMsg}（${result.netStatus}）`;
    message.info({ content: errStr, key: reqConfig.timestamp, duration: 2 });
  }
  const errorMsg = `${result.url}错误：${result.error}（${result.netStatus}）`;
  return errorMsg;
}

// 结果处理，fetch请求响应结果是promise，还得处理
async function resultReduction(response, reqConfig) {
  let res = '';
  switch (reqConfig.responseType) {
    case 'json':
      res = await response.json();
      break;
    case 'text':
      res = await response.text();
      break;
    case 'blod':
      res = await response.blod();
      break;
    default:
      res = await response.json();
      break;
  }
  return res;
}
function hideLoading(timestamp, onClose) {
  if (typeof loadingHandlers[timestamp] === 'function') {
    loadingHandlers[timestamp]({ onClose });
    delete loadingHandlers[timestamp];
  }
}
function showLoading(timestamp) {
  loadingHandlers[timestamp] = message.loading({
    content: 'Loading...',
    duration: 10,
    key: timestamp,
  });
}
function request(method, path, data, config) {
  const controller = new AbortController();
  let timestamp = Date.now();
  let { signal } = controller;
  let baseParams = {
    ...configDefault,
    ...config,
    signal,
    timestamp,
  };

  let response;
  if (method === 'GET') {
    let queryStr = '';
    if (data) {
      // 对象转url参数
      queryStr = queryString.stringify(data);
    }
    response = Cfetch(`${path}?${queryStr}`, baseParams).then((res) => {
      baseParams.isFetched = true;
      return res;
    });
  } else {
    let myInit = {
      method,
      ...baseParams,
      body: data,
    };
    response = Cfetch(path, myInit).then((res) => {
      baseParams.isFetched = true;
      return res;
    });
  }

  return Promise.race([response, fetchTimeout(baseParams, controller)]);
}
/**
 * 控制Fetch请求是否超时
 * @returns {Promise}
 */
function fetchTimeout(reqConfig, controller) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!reqConfig.isFetched) {
        // 还未收到响应，则开始超时逻辑，并标记fetch需要放弃
        controller.abort();
        message.info({
          content: '网络开小差了，稍后再试吧',
          key: reqConfig.timestamp,
          duration: 2,
        });
        reject({ fetchStatus: 'timeout' });
      }
    }, reqConfig.timeout);
  });
}
// get请求方法使用封装
function get(path, data, config) {
  return request('GET', path, data, config);
}

// post请求方法使用封装
function post(path, data, config) {
  return request('POST', path, JSON.stringify(data), config);
}
// 上传请求方法使用封装
function upload(path, data, config) {
  return request('POST', path, data, {
    ...config,
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}

// put请求方法使用封装
function put(path, data, config) {
  return request('PUT', path, JSON.stringify(data), config);
}

// delete请求方法使用封装
function del(path, data, config) {
  return request('DELETE', path, JSON.stringify(data), config);
}

export default {
  fetch: Cfetch,
  get,
  post,
  put,
  delete: del,
  upload,
};
