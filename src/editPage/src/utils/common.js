function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isPC() {
  return !isMobile();
}
function isWin() {
  const userAgent = window.navigator.userAgent;

  const isWindows = /Win(?:dows)?\s?([^do]{2})\s?(\d+\.\d+)?/;

  return isWindows.test(userAgent);
}
function isMac() {
  const userAgent = window.navigator.userAgent;

  const isMac = /Mac OS X (\d+[._]\d+[._]\d+)[^)]*/;

  return isMac.test(userAgent);
}
export const ISMOBILE = isMobile;
export const ISPC = isPC;
export const ISMAC = isMac;

const imageMimeTypes = {
  bmp: 'image/bmp',
  gif: 'image/gif',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  webp: 'image/webp',
};

/**
 * 根据文件后缀名返回图片的mime格式
 * @param {} extension
 * @returns
 */
export const GET_IMAGE_MIMETYPE_BY_EXTENSION = (extension) => {
  return imageMimeTypes[extension];
};

/**
 * 从URL获取文件的后缀名
 * @param {*} url
 * @returns
 */
export const GET_FILE_EXTENSION_BY_URL = (url) => {
  return url.substring(url.lastIndexOf('.') + 1);
};
/**
 * 从URL获取文件名
 * @param {*} url
 * @returns
 */
export const GET_FILE_NAME_BY_URL = (url) => {
  return url.substring(url.lastIndexOf('/') + 1);
};

/**
 * 从文件名中获取文件名称（没后缀）
 * @param {*} fileName
 * @returns
 */
export const GET_FILE_NAME_IN_NO_EXTENSION = (fileName) => {
  const name = fileName.split('.')[0];
  return name;
};

/**
 * url中获取参数
 * @param {*} name, url
 * @returns
 */
export const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
