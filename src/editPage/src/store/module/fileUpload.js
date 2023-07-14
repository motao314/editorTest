// import OSS from 'ali-oss'

import fetchApi from '@/api/fetchApi';

import { GET_ALIOSS_CONFIG } from '@/api/API.config';

export default class FileUpload {
  constructor(options = {}) {
    this.uploadDirConfig = {
      // 上传的目录配置
      svg: 'materials/svg/',
      default: 'materials/images/',
    };

    this.fileLists = [];
    // 上传过的列表
    this.uploadedLists = [];
    // 当前上传完成的数量
    this.curCompleteNum = 0;

    // 最大上传并发 先控制两个
    this.maxFetchNum = options.maxFetchNum || 2;
    // 当前上传的数量
    this.curFetchNum = 0;

    // 上传完一个的回调
    this.callback = '';
    // 完成所有上传的回调
    this.endCallback = '';
    // 批量上传的文件类型
    this.uploadType = '';
  }

  /**
   * 获取上传配置
   * dir 需要上传到指定目录的字符串
   */
  // getUploadConfig(dir) {
  //     return fetchApi.get(GET_ALIOSS_CONFIG, {
  //         path: dir
  //     }).then(res => {
  //         if (res.flag) {
  //             return res.data
  //         }
  //         return res.flag;
  //     });
  // }
  getUploadConfig(dir, save = false) {
    if (window.ALIOSS) {
      let timer = window.ALIOSS.timer;
      if (Date.now() - timer < 120000) {
        return Promise.resolve(window.ALIOSS.data);
      }
    }
    if (!window.ALIOSSFn) {
      window.ALIOSSFn = fetchApi
        .get(GET_ALIOSS_CONFIG, {
          path: dir,
        })
        .then((res) => {
          if (res.flag) {
            window.ALIOSSFn = null;
            window.ALIOSS = {
              timer: Date.now(),
              data: res.data,
            };
            return res.data;
          }
          return res.flag;
        });
    }
    return window.ALIOSSFn;
  }

  getUploadFormParams(params) {
    let formData = new FormData();
    Object.keys(params).map((keyname) => {
      formData.append(keyname, params[keyname]);
    });
    return formData;
  }

  /**
   * 返回上传的文件类型的目录
   * @param {*} type
   * @returns
   */
  getUploadDirType(type) {
    let result = this.uploadDirConfig[type || 'default'];

    return result || this.uploadDirConfig['default'];
  }

  /**
   * 单个上传
   * @param {*} file 上传的文件
   * @param {*} type 上传的文件的类型
   * @returns
   */
  async upload(file, type = 'default') {
    let dir = this.getUploadDirType(type);
    // 每次都获取一次配置
    let config = await this.getUploadConfig(dir);
    return new Promise((resolve, reject) => {
      let params = {
        name: file.name,
        key: config.dir + '${filename}',
        policy: config.policy,
        OSSAccessKeyId: config.accessId,
        success_action_status: '200', //让服务端返回200,不然，默认会返回204
        callback: config.callback,
        signature: config.signature,
        file: file,
      };
      // let formData = this.getUploadFormParams(params)
      let formData = new FormData();
      Object.keys(params).map((keyname) => {
        formData.append(keyname, params[keyname]);
      });
      fetchApi.upload(config.host, formData).then((res) => {
        //console.log('上传响应', res)
        resolve(res);
      });
    });
  }

  /**
   * 批量上传
   * @param {*} type  文件类型--暂时支持同一类型批量
   * @param {*} fileLists  文件列表
   * @param {*} callback 每上传完一个的回调
   * @param {*} end 最终上传完的回调
   */
  start(type, fileLists, callback, end) {
    this.fileLists = fileLists;
    this.callback = callback;
    this.endCallback = end;
    this.uploadType = type;

    this.goOnUpload();
  }

  goOnUpload() {
    while (this.curFetchNum < this.maxFetchNum) {
      let isComplete = this.isCompleteAll();
      if (isComplete) {
        return false;
      }

      let file = this.fileLists.splice(0, 1)[0];
      this.uploadedLists.push(file);
      this.upload(file, this.uploadType).then((res) => {
        if (this.callback) {
          let aa = this.callback(res, file).then(() => {
            //console.log('完成一个上传开始下一个222')
            this.curCompleteNum++;
            this.next();
          });
          //console.log('完成一个上传开始下一个111', aa)
        }
      });
      this.curFetchNum++;
    }
  }

  next() {
    let isComplete = this.isCompleteAll();
    if (isComplete) {
      if (this.curCompleteNum === this.uploadedLists.length) {
        this.finish();
      }
      return false;
    }
    this.curFetchNum -= 1;
    this.curFetchNum = this.curFetchNum <= 0 ? 0 : this.curFetchNum;
    // 上传完成一个就继续加
    this.goOnUpload();
  }

  finish() {
    this.endCallback && this.endCallback();
    this.curFetchNum = 0;
    this.uploadType = '';
  }

  isCompleteAll() {
    return this.fileLists.length <= 0;
  }
}
