/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-01 13:43:26
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-26 14:45:15
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/common/ImageList/ImageDrag.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
function getClientRect(img) {
  let rect = img.getBoundingClientRect();
  return rect;
}
export default function imgDrag({ add, addPos }) {
  let isMove = false;
  let target = null;
  let shadowImage = null;
  let targetItem = null;
  let startPoint = {}; //摁下时鼠标坐标
  let startRect = {}; //摁下时img坐标
  let timer = null;
  let move = (e) => {
    let nowPoint = {
      x: e.clientX,
      y: e.clientY,
    };
    let dis = {
      x: nowPoint.x - startPoint.x,
      y: nowPoint.y - startPoint.y,
    };
    if (!isMove && (Math.abs(dis.x) > 5 || Math.abs(dis.y) > 5)) {
      isMove = true;
      shadowImage = target.cloneNode();
      shadowImage.className = 'shadowImg';
      shadowImage.style.cssText = `
                left: ${startRect.x}px;
                top: ${startRect.y}px;
                width: ${startRect.width}px;
                height: ${startRect.height}px;
            `;
      document.body.appendChild(shadowImage);
      target.style.opacity = '0';
    }
    if (isMove) {
      shadowImage.style.left = dis.x + startRect.x + 'px';
      shadowImage.style.top = dis.y + startRect.y + 'px';
    }
  };
  let end = () => {
    if (!isMove) {
      if (!timer) {
        //防抖
        add(target, targetItem); //正常添加
      }
      timer = setTimeout(() => {
        timer = null;
      }, 500);
    } else {
      addPos(shadowImage, targetItem); //指定位置添加
      target.style.opacity = '1';
      shadowImage.remove();
    }
    isMove = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', end);
  };
  let start = (e, item) => {
    targetItem = item;
    target = e.target.className === 'img-wrap' ? e.target.querySelector('img') : e.target;
    isMove = false;
    startRect = getClientRect(target);
    startPoint = {
      x: e.clientX,
      y: e.clientY,
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', end);
    e.preventDefault();
  };
  return start;
}
