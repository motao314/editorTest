/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-03-14 17:14:56
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-27 10:57:35
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srcutils/loadFont.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { useMainStore } from '@/store';
if (!window.customFonts) {
  window.customFonts = ['字由点字典黑55J'];
}
// 加载字体
function loadFont(name, url) {
  name = name.split('.')[0];
  name = name.replace(/\s+/g, '');
  const {
    originData: { xmmFontDTOEnList, xmmFontDTOCnList },
  } = useMainStore();
  const fonts = [...xmmFontDTOEnList, ...xmmFontDTOCnList];
  url = fonts.filter((item) => {
    return item.fontPath === url;
  })[0]?.fontOssPath;
  if (!url) {
    return;
  }
  return new Promise((resolve, reject) => {
    // 浏览器是否支持
    if (!document.fonts) {
      reject(new Error('抱歉，当前浏览器兼容性较差，会影响操作体验，请更换最新版谷歌浏览器进行操作'));
    }
    // 字体已经安装
    if (window.customFonts.includes(name)) {
      return resolve(true);
    }
    // 加载字体
    const fontface = new FontFace(name, `url(${encodeURI(url)})`);
    document.fonts.add(fontface);
    fontface
      .load()
      .then(() => {
        // 字体加载完毕，可使用
        window.customFonts.push(name);
        resolve(true);
      })
      .catch((err) => {
        // 字体加载失败
        reject(err);
      });
  });
}

export default loadFont;
