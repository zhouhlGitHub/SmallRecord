import axios from 'axios';
import * as qs from 'qs';
//引入 vuex
import store from '@admin/vuex';

import { Message } from 'element-ui';

import {localStore} from '@/common/storage';


let baseURL = process.env.NODE_ENV === 'development' ?
  'http://localhost:3000' : 'http://smallrecord.3tstudio.cn';

axios.defaults.baseURL = baseURL;

const MIN_RES_CODE = 200;
const MAX_RES_CODE = 300;
const CONTENT_TYPE = 'application/x-www-form-urlencoded';

const SUCCESS_CODE = 1;
const NO_LOGIN_CODE = 2;

//请求状态码是否ok
const isOk = (status) => {
  if (status >= MIN_RES_CODE && status <= MAX_RES_CODE) {
    return true;
  }
  return false;
};

//网络请求捕获错误
const requireCatch = (res) => {
  if ((typeof res === 'number' && !isOk(res)) || (res.response && !isOk(res.response.status))) {
    Message.error({ message: '系统出现错误了~' + res });
  }
  if (typeof res.code !== 'undefined' && res.code !== SUCCESS_CODE) {
    Message.warning({ message: res.message });
  }
  return Promise.reject(res);
};

/**
 * get请求
 * @param  {Object}   opts   请求对象 包括 axios 的配置参数
 * @return {Promise}         Promise
 */
export const get = (opts = {}, commit) => {
  let setting = {
    url : '',
    method: 'GET',
    params: {}
  };

  //合并对象
  setting = Object.assign(setting, opts);

  setting.params.token = localStore.get('authToken');

  return axios(setting)
    .then((res) => {
      let code = res.data.code;
      if (!isOk(res.status)) {
        return Promise.reject(res.status);
      }

      if (code === SUCCESS_CODE) {
        return res.data;
      }

      if (code === NO_LOGIN_CODE) {
        store.commit('showLogin');
      }

      return Promise.reject(res.data);
    }).catch((res) => {
      return requireCatch(res);
    });
};

/**
 * post请求
 * @param  {Object}   opts   请求对象 包括 axios 的配置参数
 * @return {Promise}         Promise
 */
export const post = (opts = {}, commit) => {
  let setting = {
    url : '',
    method: 'POST',
    headers: {
      'Content-Type': CONTENT_TYPE
    },
    data: {}
  };

  //合并对象
  setting = Object.assign(setting, opts);

  setting.data.token = localStore.get('authToken');

  //data参数序列化
  setting.data = qs.stringify(opts.data);

  return axios(setting)
    .then(res => {
      let code = res.data.code;
      if (!isOk(res.status)) {
        return Promise.reject(res.status);
      }

      if (code === SUCCESS_CODE) {
        return res.data;
      }

      if (code === NO_LOGIN_CODE) {
        store.commit('showLogin');
      }

      return Promise.reject(res.data);

    }).catch(res => {
      return requireCatch(res);
    });
};

/**
 * 文件上传
 * @param  {String} url    api地址
 * * @param  {Object}   opts   请求对象 包括 axios 的配置参数
 * @return {Promise}        Promise
 */
export const upload = (opts = {}, commit) => {
  let setting = {
    url: '',
    method: 'POST',
    headers: {
      'Content-Type': CONTENT_TYPE
    },
    data: {},
    transformRequest: [function (data) {
      let fd = new FormData();

      for (let key in data) {
        fd.append(key, data[key]);
      }

      return fd;
    }]
  };

  //合并对象
  setting = Object.assign(setting, opts);

  setting.data.token = localStore.get('authToken');;

  return axios(setting).then((res) => {
    let code = res.data.code;
    if (!isOk(res.status)) {
      return Promise.reject(res.status);
    }

    if (code === SUCCESS_CODE) {
      return res.data;
    }

    if (code === NO_LOGIN_CODE) {
      store.commit('showLogin');
    }

    return Promise.reject(res.data);

  }).catch(res => {
    return requireCatch(res);
  });
};

