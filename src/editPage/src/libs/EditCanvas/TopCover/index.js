/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2022-11-17 21:44:32
 * @LastEditors: Ammy ammy0620@aliyun.com
 * @LastEditTime: 2023-03-29 22:48:20
 * @FilePath: /project-20220906-xiaoxiang/src/XXEditor/src/libs/EditCanvas/TopCover/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// noinspection JSCheckFunctionSignatures
import XXCanvas from '../../xxCanvas';
// 刀线类用于生成刀版对应的刀线层
export class TopCover extends XXCanvas.Group {
  className = 'TopCover';
  backgroundColor = '#fff';
  emptyBackgroundColor = '#EFEFEF';
  borderColor = '#1E1F1F';
  rootPathId = 'cover-0';
  emptyNodeName = 'hole';
  lightbackgroundColor = 'rgba(0, 0, 0, 0.3000)';
  hoverbackgroundColor = 'rgba(241, 56, 72, 0.3)';
  actualSize = null;
  constructor(options) {
    super();
    this.init(options);
  }

  /**
   * @description: 用于设置高亮面
   * @param {*} coverId 需设置高亮面的id，设置为null则清除高亮面
   * @return {*}
   */
  setLightCover(coverId) {
    [...this.getChildren()]
      .filter((item) => item.attrs.type === 'COVER')
      .forEach((item) => {
        if (!coverId || coverId === this.rootPathId || item.id() === this.rootPathId || item.id() === coverId) {
          item.fill('');
        } else {
          item.fill(this.lightbackgroundColor);
        }
      });
  }
  setHoverCover(coverId) {
    if (coverId) {
      this.findOne('#' + coverId).fill(this.hoverbackgroundColor);
    } else {
      coverId = this.getStage().currentFaceId;
      [...this.getChildren()]
        .filter((item) => item.attrs.type === 'COVER')
        .forEach((item) => {
          if (!coverId || coverId === this.rootPathId || item.id() === this.rootPathId || item.id() === coverId) {
            item.fill('');
          } else {
            item.fill(this.lightbackgroundColor);
          }
        });
    }
  }
  /**
   * @description: 获取所有刀线的面
   * @param {*} children
   * @return {*} 所有面的数组
   */
  getNodes(children) {
    const nodes = [];
    children.forEach((item) => {
      const isHole = item.attrs.type !== 'COVER';
      item.attrs = {
        ...item.attrs,
        stroke: this.borderColor,
        fill: isHole ? this.emptyBackgroundColor : '',
        listening: false,
      };
      const node = new Konva[item.className](item.attrs);
      nodes.push(node);
    });
    return nodes;
  }
  /**
   * @description: 初始化刀线层
   * @param {*} options 面的配置信息
   * @return {*}
   */

  init({ children, actualSize, id }) {
    const nodes = this.getNodes(children || []);
    if (nodes.length > 0) {
      this.add(...nodes);
    }
    this.actualSize = actualSize;
    this.setAttrs({ id: id });
  }
}
