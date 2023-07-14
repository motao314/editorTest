/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-03-07 14:42:00
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-06-08 16:07:32
 * @FilePath: /code/pc-editor/srclibs/EditCanvas/Playground/rotation.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * @description: 围绕元素中心点进行旋转
 * @param {*} shape 元素的矩形(含实际width，实际height，x,y,rotation)
 * @param {*} deltaRad 要旋转的弧度
 * @return {*} 围绕这中心点旋转后的 x，y，width，height，rotation 弧度
 */
function rotateAroundCenter(shape, deltaRad) {
  const center = getCenter(shape);
  console.log(center, '7777~~~~');
  // console.log('中心点', center);
  return rotateAroundPoint(shape, deltaRad, center);
}

// 获取中心点
function getCenter(shape) {
  console.log(shape, '888~~~~');
  return {
    x: shape.x + (shape.width / 2) * Math.cos(shape.rotation) + (shape.height / 2) * Math.sin(-shape.rotation),
    y: shape.y + (shape.height / 2) * Math.cos(shape.rotation) + (shape.width / 2) * Math.sin(shape.rotation),
  };
}
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
function aroundGroup(node, stepDeg, rectTo) {
  let { x, y, width, height, rotation = 0, scaleX = 1, scaleY = 1 } = node.attrs;
  // if (node.getClassName() === 'Group') {
  const rect = node.getClientRect({ relativeTo: rectTo });

  width = rect.width;
  height = rect.height;

  // }
  // console.log(x, y, width, height, rotation, scaleX, scaleY);
  rotation = getRad(rotation); // 转为弧度
  // 计算出如果围绕中心点旋转后应该有的相应参数
  const afterRotationAttr = rotateAroundCenter({ x, y, width, height, rotation, scaleX, scaleY }, getRad(stepDeg));
  // console.log('围绕中心点旋转 Group', afterRotationAttr);
  afterRotationAttr.rotation = getAngle(afterRotationAttr.rotation); // 换算会角度
  return afterRotationAttr;
}
export default aroundGroup;
