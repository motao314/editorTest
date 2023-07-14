/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-03-18 16:04:20
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-03-19 16:30:04
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/common/Rule/GuideLine.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%A
 */
/**
 * @description: 创建一条水平参考线
 * @ops: 参考线配置
 *      start: 初始位置 [center 居中,start 从开始位置开始],
 *      parent: 参考线容器
 * @return {*}
 */
export class CuideLineX {
  start = (e) => {
    this.mY = e.clientY;
    this.startY = this.y;
    document.addEventListener('mousemove', this.move);
    document.addEventListener('mouseup', this.end);
  };
  move = (e) => {
    let nowY = e.clientY;
    this.setY(this.startY + (nowY - this.mY));
  };
  end = (e) => {
    document.removeEventListener('mousemove', this.move);
    document.removeEventListener('mouseup', this.end);
    this.moveEnd();
  };
  constructor(ops = { start: 'start' }) {
    let { parent, start, afterRemove } = ops;
    if (!parent) {
      return;
    }
    this.id = Date.now();
    this.line = document.createElement('div');
    this.line.className = 'cuideLineX';
    this.y = start === 'start' ? 0 : parent.clientHeight / 2 - 10;
    this.mY = 0;
    this.startY = 0;
    this.line.addEventListener('mousedown', this.start);
    this.setY(this.y);
    parent.appendChild(this.line);
    this.parent = parent;
    this.afterRemove = afterRemove;
  }
  setY(y) {
    this.y = y;
    this.line.style.transform = `translateY(${this.y}px)`;
  }
  moveEnd() {
    if (this.y <= 0 || this.y >= this.parent.clientHeight) {
      this.line.remove();
      this.afterRemove();
      return false;
    }
    return true;
  }
}

export class CuideLineY {
  start = (e) => {
    this.mX = e.clientX;
    this.startX = this.x;
    document.addEventListener('mousemove', this.move);
    document.addEventListener('mouseup', this.end);
  };
  move = (e) => {
    let nowX = e.clientX;
    this.setX(this.startX + (nowX - this.mX));
  };
  end = (e) => {
    document.removeEventListener('mousemove', this.move);
    document.removeEventListener('mouseup', this.end);
    this.moveEnd();
  };
  constructor(ops = { start: 'start' }) {
    let { parent, start, afterRemove } = ops;
    if (!parent) {
      return;
    }
    this.line = document.createElement('div');
    this.line.className = 'cuideLineY';
    this.id = Date.now();
    this.x = start === 'start' ? 0 : parent.clientWidth / 2 - 10;
    this.mX = 0;
    this.startX = 0;
    this.line.addEventListener('mousedown', this.start);
    this.setX(this.x);
    parent.appendChild(this.line);
    this.parent = parent;
    this.afterRemove = afterRemove;
  }
  setX(x) {
    this.x = x;
    this.line.style.transform = `translateX(${this.x}px)`;
  }
  moveEnd() {
    if (this.x <= 0 || this.x > this.parent.clientWidth) {
      this.line.remove();
      this.afterRemove();
      return false;
    }
    return true;
  }
}
