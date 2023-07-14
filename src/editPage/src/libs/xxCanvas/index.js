/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2022-10-13 12:08:14
 * @LastEditors: Ammy ammy0620@aliyun.com
 * @LastEditTime: 2023-03-20 22:37:53
 * @FilePath: /project-20220906-xiaoxiang/src/XXEditor/src/libs/xxcanvas/xxCanvas.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 画布结构
 * stage->layer->单个元素text image，多个元素group,背景图层 backgorund，背景图层高亮图层 backgoundLight)
 * tranformer->1.单个的，2.成组（内部元素点击，外层样式虚线） 3.禁用的状态（无操作按钮）
 */

import Konva from 'konva/lib/index';
import { Image, Text, Group } from './Element/index.js';
import Transformer from './Transformer/index';
import TextTransformer from './Transformer/TextTransformer';
export * from './utils/common';
const XXCanvas = { ...Konva, Image, Group, Text, Transformer, TextTransformer };
/**
 * @description: 配置像素比
 * @param {*} pixelRatio
 * @return {*}
 */
export function setKonvaRatio(pixelRatio) {
  XXCanvas.pixelRatio = pixelRatio;
}
export default XXCanvas;
