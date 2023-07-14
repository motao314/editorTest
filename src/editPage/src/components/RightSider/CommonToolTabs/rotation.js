/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-07 10:43:03
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-26 15:45:26
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/RightSider/CommonToolTabs/rotation.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

/**
 * @description: 围绕元素中心点进行旋转
 * @param {*} shape 元素的矩形(含实际width，实际height，x,y,rotation)
 * @param {*} deltaRad 要旋转的弧度
 * @return {*} 围绕这中心点旋转后的 x，y，width，height，rotation 弧度
 */

// 围绕指定点旋转
function rotateAroundPoint(shape, angleRad, point) {
  const x = point.x + (shape.x - point.x) * Math.cos(angleRad) - (shape.y - point.y) * Math.sin(angleRad);
  const y = point.y + (shape.x - point.x) * Math.sin(angleRad) + (shape.y - point.y) * Math.cos(angleRad);
  return {
    rotation: shape.rotation + angleRad,
    x,
    y,
  };
}
// 角度转弧度
function getRad(angle) {
  return (Math.PI * angle) / 180;
}
// 弧度转角度
function getAngle(rad) {
  return (rad * 180) / Math.PI;
}
// 围绕中心点旋转 Group
function aroundGroup(node, stepDeg) {
  let { x, y, width, height, rotation = 0, scaleX = 1, scaleY = 1 } = node.attrs;
  let reletiveNode = node.getParent().getClassName() === 'Group' ? node.getParent() : node.getLayer();
  const elAp = node.getClientRect({ relativeTo: reletiveNode });
  let rotateCenter = {
    // 旋转中心点坐标
    x: elAp.x + elAp.width / 2,
    y: elAp.y + elAp.height / 2,
  };
  rotation = getRad(rotation); // 转为弧度
  // 计算出如果围绕中心点旋转后应该有的相应参数
  const afterRotationAttr = rotateAroundPoint({ x, y, rotation, scaleX, scaleY }, getRad(stepDeg), rotateCenter);
  // console.log('围绕中心点旋转 Group', afterRotationAttr);
  afterRotationAttr.rotation = getAngle(afterRotationAttr.rotation); // 换算会角度
  return afterRotationAttr;
}
export default aroundGroup;
