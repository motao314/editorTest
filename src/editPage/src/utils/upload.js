/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-02 13:59:28
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-16 21:35:17
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srcutils/upload.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import {
//     API_WX_UPLOADIMAGE // 图片上传
// } from '@/api/API.config';

// import ApiServer from '@/api/ApiServer';

// data:base64图片格式字符串
// filename：文件名称

export function isBase64(str) {
  if (str === '' || str.trim() === '') {
    return false;
  }
  try {
    return str.includes('base64');
  } catch (err) {
    return false;
  }
}
export function dataURLtoFile(dataurl, filename, fileType) {
  // console.log(isBase64(dataurl))
  if (!isBase64(dataurl)) return null;
  // 获取到base64编码
  const arr = dataurl.split(',');
  // 将base64编码转为字符串
  const bstr = window.atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n); // 创建初始化为0的，包含length个元素的无符号整型数组
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {
    type: fileType || 'image/png',
  });
}
// export function uploadBase64(imageStr, { imageWidth, imageHeight, imageName }) {
//     const str = dataURLtoFile(imageStr, imageName);// base64图片格式转文件流
//     const formData = new FormData();
//     formData.append('file', str);
//     // console.log(formData);
//     // 编辑点击确定
//     return ApiServer.UpLoad(API_WX_UPLOADIMAGE, formData, {
//         assetType: 'Image',
//         bl: true,
//         height: Number.parseInt(imageWidth),
//         width: Number.parseInt(imageHeight)
//     });

// }
