/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2022-10-17 17:13:39
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-01-10 16:44:39
 * @FilePath: /project-20220906-xiaoxiang/src/XXEditor/src/libs/xxcanvas/Element/Group.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import konva from 'konva';
import { Text } from './Text.js';
import { Image } from './Image.js';
import { _registerNode } from 'konva/lib/Global';
const classMap = {
  Text: Text,
  Image: Image,
  Path: Konva.Path,
  Circle: Konva.Circle,
};
/**
 * @description: 复合素材生成
 * @return {*}
 */
export class Group extends konva.Group {
  /**
   *
   * @param {Object} options 配置 同konva
   *
   * @param {Array} options.children   子元素，子元素可为 konva配置数据， 也可以为一个shape节点
   *
   * @param {Object} _ref playground实例
   */

  constructor(options = {}, _ref) {
    super(options);
    this.init(options, _ref);
  }
  /**
   * @description: 根据组内元素大小，重置组的宽高
   * @return {*}
   */
  resetWidth() {
    const nodes = this.getChildren();
    let width = 0;
    let height = 0;
    const groupRect = this.getClientRect();
    nodes.forEach((item) => {
      const rect = item.getClientRect();
      width = Math.max(rect.x - groupRect.x + rect.width, width);
      height = Math.max(rect.y - groupRect.y + rect.height, height);
    });
    this.width(width / this.getLayer().scale().x);
    this.height(height / this.getLayer().scale().y);
    // console.log(this.width());
  }
  /**
   * @description: 组的初始化
   * @param {*} children 组内元素
   * @param {*} id 组的id
   * @param {*} _ref
   * @return {*}
   */
  init({ children, id }, _ref) {
    if (!children || (children && children.length <= 0)) return;

    // 组中图片数量
    let imgNum = 0;
    // 加载完成图片数量
    let loadedImgNum = 0;
    // 图片加载完成回调
    const callback = (cb) => {
      loadedImgNum += 1;
      // console.log('%c [ callback ]-57', 'font-size:13px; background:pink; color:#bf2c9f;', cb, imgNum, loadedImgNum);
      // 所有图片加载完成
      if (imgNum === loadedImgNum && _ref) {
        // console.log('%c [ 所有图片加载完成 ]-61', 'font-size:13px; background:pink; color:#bf2c9f;');
        _ref.fire('onAllImagesLoaded', { id });
      }
    };

    const eles = children.map((element) => {
      if (element.getClassName) {
        return element;
      }

      if (element.className === 'Image') {
        imgNum += 1;
      }
      element.attrs.callback = callback;
      return new classMap[element.className](element.attrs);
    });

    this.add(...eles);
  }
}

Group.prototype.className = 'Group';
_registerNode(Group);
