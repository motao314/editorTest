/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2022-10-11 13:13:26
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-05-30 16:06:03
 * @FilePath: /project-20220906-xiaoxiang/src/XXEditor/src/libs/Transformer/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Konva from 'konva';
import { Util, Transform } from 'konva/lib/Util';
const ANCHORS_NAMES = [
  'top-left',
  'top-center',
  'top-right',
  'middle-right',
  'middle-left',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];
const TOUCH_DEVICE = 'ontouchstart' in Konva._global;

// 弧度转角度
function RadToDeg(Rad) {
  return (Rad / Math.PI) * 180;
}

// 角度转弧度
function DegToRad(deg) {
  return (deg * Math.PI) / 180;
}
// 获取中心点坐标
function getCenterPs(shap) {
  return {
    x: shap.x + shap.width / 2,
    y: shap.y + shap.height / 2,
  };
}
// 获取旋转轨迹
function getSnap(snaps, newRotationRad, tol) {
  let snapped = newRotationRad;
  for (let i = 0; i < snaps.length; i++) {
    const angle = Konva.getAngle(snaps[i]);

    const absDiff = Math.abs(angle - newRotationRad) % (Math.PI * 2);
    const dif = Math.min(absDiff, Math.PI * 2 - absDiff);

    if (dif < tol) {
      snapped = angle;
    }
  }
  return snapped;
}

// 围绕指定点旋转
function rotateAroundPoint(shape, angleRad, point) {
  const x = point.x + (shape.x - point.x) * Math.cos(angleRad) - (shape.y - point.y) * Math.sin(angleRad);
  const y = point.y + (shape.x - point.x) * Math.sin(angleRad) + (shape.y - point.y) * Math.cos(angleRad);
  return {
    ...shape,
    rotation: shape.rotation + angleRad,
    x,
    y,
  };
}

// 围绕中心点旋转
function rotateAroundCenter(shape, deltaRad) {
  const center = getCenter(shape);
  return rotateAroundPoint(shape, deltaRad, center);
}

// 获取中心点
function getCenter(shape) {
  return {
    x: shape.x + (shape.width / 2) * Math.cos(shape.rotation) + (shape.height / 2) * Math.sin(-shape.rotation),
    y: shape.y + (shape.height / 2) * Math.cos(shape.rotation) + (shape.width / 2) * Math.sin(shape.rotation),
  };
}

// 指针编号
const ANGLES = {
  'top-left': -45,
  'top-center': 0,
  'top-right': 45,
  'middle-right': -90,
  'middle-left': 90,
  'bottom-left': -135,
  'bottom-center': 180,
  'bottom-right': 135,
};

// 获取鼠标
function getCursor(anchorName, rad) {
  if (anchorName === 'rotater') {
    return 'crosshair';
  }

  if (anchorName === 'top-left') {
    return 'pointer';
  }

  if (anchorName === 'top-right') {
    return 'not-allowed';
  }

  rad += Util.degToRad(ANGLES[anchorName] || 0);
  const angle = ((Util.radToDeg(rad) % 360) + 360) % 360;

  if (Util._inRange(angle, 315 + 22.5, 360) || Util._inRange(angle, 0, 22.5)) {
    // TOP
    return 'ns-resize';
  } else if (Util._inRange(angle, 45 - 22.5, 45 + 22.5)) {
    // TOP - RIGHT
    return 'nesw-resize';
  } else if (Util._inRange(angle, 90 - 22.5, 90 + 22.5)) {
    // RIGHT
    return 'ew-resize';
  } else if (Util._inRange(angle, 135 - 22.5, 135 + 22.5)) {
    // BOTTOM - RIGHT
    return 'nwse-resize';
  } else if (Util._inRange(angle, 180 - 22.5, 180 + 22.5)) {
    // BOTTOM
    return 'ns-resize';
  } else if (Util._inRange(angle, 225 - 22.5, 225 + 22.5)) {
    // BOTTOM - LEFT
    return 'nesw-resize';
  } else if (Util._inRange(angle, 270 - 22.5, 270 + 22.5)) {
    // RIGHT
    return 'ew-resize';
  } else if (Util._inRange(angle, 315 - 22.5, 315 + 22.5)) {
    // BOTTOM - RIGHT
    return 'nwse-resize';
  } else {
    // how can we can there?
    Util.error('Transformer has unknown angle for cursor detection: ' + angle);
    return 'pointer';
  }
}

/**
 * @description: 重构选框
 * @return {*}
 */
class XXTransformer extends Konva.Transformer {
  className = 'Transformer';
  XXName = 'transformer';
  _batchChangeChild(selector, attrs) {
    const anchor = this.findOne(selector);
    anchor?.setAttrs(attrs);
  }
  /**
   * @description: 更新相关按钮的坐标信息
   * @return {*}
   */
  update() {
    const attrs = this._getNodeRect(); // 获取元素的相关属性：x、y、width、height、rotation
    this.rotation(Util._getRotation(attrs.rotation)); // 旋转
    const width = attrs.width;
    const height = attrs.height;
    const enabledAnchors = this.enabledAnchors();
    const resizeEnabled = this.resizeEnabled();
    const padding = this.padding();
    const anchorSize = this.anchorSize();
    enabledAnchors.indexOf = (key) => {
      return enabledAnchors.findIndex((item) => item.name === key);
    };
    enabledAnchors.findItem = (key) => {
      return enabledAnchors.find((item) => item.name === key);
    };
    this.find('._anchor').forEach((node) => {
      const name = node.name().split(' ');
      const size = getSize(name[0]);
      if (node.className !== 'Circle') {
        node.setAttrs({
          width: size.width,
          height: size.height,
          offsetX: size.width / 2,
          offsetY: size.height / 2,
          cornerRadius: this.anchorCornerRadius(),
        });
      } else {
        node.setAttrs({
          width: size.width,
          height: size.height,
        });
      }
      if (!name[2]) {
        node.setAttrs({
          stroke: this.anchorStroke(),
          strokeWidth: this.anchorStrokeWidth(),
          fill: this.anchorFill(),
        });
      }
    });
    const topLeftSize = getSize('top-left');
    this._batchChangeChild('.top-left', {
      x: 0,
      y: 0,
      offsetX: topLeftSize.width / 2 + padding,
      offsetY: topLeftSize.height / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('top-left') >= 0,
    });

    const topCenterSize = getSize('top-center');
    this._batchChangeChild('.top-center', {
      x: width / 2,
      y: 0,
      offsetY: topCenterSize.height / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('top-center') >= 0,
    });

    const topRightSize = getSize('top-right');
    this._batchChangeChild('.top-right', {
      x: width,
      y: 0,
      offsetX: topRightSize.width / 2 - padding,
      offsetY: topRightSize.height / 2 + padding,
      visible: enabledAnchors.indexOf('top-right') >= 0,
    });

    const middleLeftSize = getSize('middle-left');
    this._batchChangeChild('.middle-left', {
      x: 0,
      y: height / 2,
      offsetX: middleLeftSize.width / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('middle-left') >= 0,
    });

    const middleRightSize = getSize('middle-right');
    this._batchChangeChild('.middle-right', {
      x: width,
      y: height / 2,
      offsetX: -middleRightSize.width / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('middle-right') >= 0,
    });
    const bottomLeftSize = getSize('bottom-left');
    this._batchChangeChild('.bottom-left', {
      x: 0,
      y: height,
      // x: width / 2,
      // y: -Util._sign(height) - padding,
      offsetX: bottomLeftSize.width / 2 + padding,
      offsetY: bottomLeftSize.height / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-left') >= 0,
    });
    const bottomCenterSize = getSize('bottom-center');
    this._batchChangeChild('.bottom-center', {
      x: width / 2,
      y: height,
      offsetY: -bottomCenterSize.height / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-center') >= 0,
    });
    const bottomRightSize = getSize('bottom-right');
    this._batchChangeChild('.bottom-right', {
      x: width,
      y: height,
      offsetX: bottomRightSize.width / 2 - padding,
      offsetY: bottomRightSize.height / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-right') >= 0,
    });
    const rotaterSize = getSize('rotater');
    this._batchChangeChild('.rotater', {
      x: width / 2,
      y: height + rotaterSize.height + 20,
      visible: this.rotateEnabled(),
    });

    this._batchChangeChild('.back', {
      width: width,
      height: height,
      visible: this.borderEnabled(),
      stroke: this.borderStroke(),
      strokeWidth: this.borderStrokeWidth(),
      dash: this.borderDash(),
      x: 0,
      y: 0,
    });
    this.getLayer()?.batchDraw();
    function getSize(name) {
      return (
        enabledAnchors.findItem(name)?.size || {
          width: anchorSize,
          height: anchorSize,
        }
      );
    }
  }
  /**
   * @description: 生成整个选框
   * @return {*}
   */
  _createElements() {
    this._createBack();
    ANCHORS_NAMES.forEach(
      function (name) {
        this._createAnchor(name);
      }.bind(this),
    );

    this._createAnchor('rotater');
  }
  /**
   * @description: 生成选中时的线框
   * @return {*}
   */
  _createBack() {
    const padding = this.padding();
    const back = new Konva.Rect({
      name: 'back',
      x: -padding,
      y: -padding,
      width: this.width() + padding * 2,
      height: this.height() + padding * 2,
      // draggable: true,
      // dragDistance: 0,
      stroke: this.borderStroke(),
      sceneFunc(ctx) {
        const tr = this.getParent();
        const padding = tr.padding();
        ctx.beginPath();
        ctx.rect(-padding, -padding, this.width() + padding * 2, this.height() + padding * 2);
        ctx.moveTo(this.width() / 2, -padding);
        // if (tr.rotateEnabled()) {
        //   ctx.lineTo(
        //     this.width() / 2,
        //     -tr.rotateAnchorOffset() * Util._sign(this.height()) - padding
        //   );
        // }
        ctx.fillStrokeShape(this);
      },
      hitFunc: (ctx, shape) => {
        if (!this.shouldOverdrawWholeArea()) {
          return;
        }
        const padding = this.padding();
        ctx.beginPath();
        ctx.rect(-padding, -padding, shape.width() + padding * 2, shape.height() + padding * 2);
        ctx.fillStrokeShape(shape);
      },
    });
    this.add(back);
    // this._proxyDrag(back);
    // do not bubble drag from the back shape
    // because we already "drag" whole transformer
    // so we don't want to trigger drag twice on transformer
    back.on('touchstart', (e) => {
      e.cancelBubble = true;
    });
    back.on('dragstart', (e) => {
      e.cancelBubble = true;
    });
    back.on('dragmove', (e) => {
      e.cancelBubble = true;
    });
    back.on('dragend', (e) => {
      e.cancelBubble = true;
    });
    // force self update when we drag with shouldOverDrawWholeArea setting
    this.on('dragmove', (e) => {
      this.update();
    });
  }

  /**
   * @description: 创建快捷操作按钮
   * @param {*} name
   * @return {*}
   */
  _createAnchor(name) {
    let anchor = null;
    const item = this.enabledAnchors().find((item) => item.name === name);
    if (item?.content) {
      anchor = item.content;
    } else {
      anchor = new Konva.Shape({
        stroke: 'rgb(0, 161, 255)',
        fill: 'white',
        strokeWidth: 1,
        name: name + ' _anchor',
        // dragDistance: 0,
        // make it draggable,
        // so activating the anchor will not start drag&drop of any parent
        // draggable: true,
        hitStrokeWidth: TOUCH_DEVICE ? 10 : 'auto',
      });
    }
    const self = this;
    // 按钮按下时的处理
    anchor.on('mousedown', function (e) {
      self._handleMouseDown(e);
      e.cancelBubble = true;
    });
    // anchor.on('dragstart', (e) => {
    //     anchor.stopDrag();
    //     e.cancelBubble = true;
    // });
    // anchor.on('dragend', (e) => {
    //     e.cancelBubble = true;
    // });

    // add hover styling
    anchor.on('mouseover', (e) => {
      // e.cancelBubble = true;
      const rad = Konva.getAngle(this.rotation());
      const cursor = getCursor(name, rad);
      anchor?.getStage()?.content && (anchor.getStage().content.style.cursor = cursor);
      this._cursorChange = true;
    });
    anchor.on('mouseout', (e) => {
      // e.cancelBubble = true;
      anchor.getStage().content && (anchor.getStage().content.style.cursor = 'default');
      this._cursorChange = false;
    });
    this.add(anchor);
  }
  /**
   * @description: 快捷操作按钮按下时的处理
   * @param {*} e
   * @return {*}
   */
  _handleMouseDown(e) {
    this._movingAnchorName = e.target.name().split(' ')[0];
    const anchorNode = this.findOne('.' + this._movingAnchorName);
    // console.log(anchorNode,this._movingAnchorName);
    const stage = anchorNode?.getStage();
    if (!stage) {
      return;
    }
    const attrs = this._getNodeRect(); // 元素的可视尺寸
    const width = attrs.width;
    const height = attrs.height;

    // 斜边长度，用于后续计算缩放
    const hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    this.sin = Math.abs(height / hypotenuse);
    this.cos = Math.abs(width / hypotenuse);
    document.addEventListener('mousemove', this._handleMouseMove);
    document.addEventListener('mouseup', this._handleMouseUp, true);
    this._transforming = true;

    const ap = e.target.getAbsolutePosition(); // 元素位置
    const pos = e.target.getStage().getPointerPosition(); // 鼠标在画布中的坐标

    this._anchorDragOffset = {
      x: pos.x - ap.x,
      y: pos.y - ap.y,
    };
    // 如果是旋转则记下初始时的旋转值
    if (this._movingAnchorName === 'rotater') {
      // 鼠标在画布中的位置：pos
      // 元素在画布中的位置：this.getAbsolutePosition()
      // 元素的相对于画布的宽度：
      // console.log("本身",this.width(),this.height());
      // console.log("client",this.getClientRect(),this._getNodeRect());
      // console.log("画布缩放",this.getLayer().scaleX());
      // console.log("元素位置",this.getAbsolutePosition());
      // console.log("鼠标位置",pos);
      const elAp = this.getClientRect();
      this._rotateCenter = {
        // 旋转中心点坐标
        x: elAp.x + elAp.width / 2,
        y: elAp.y + elAp.height / 2,
      };
      const disX = pos.x - this._rotateCenter.x;
      const disY = pos.y - this._rotateCenter.y;
      this._startRad = Math.atan2(disY, disX);
      this._startDeg = this.rotation();
    }
    if (this._movingAnchorName !== 'top-left') {
      this._fire('transformstart', { evt: e.evt, target: this.getNode() });
      this._nodes.forEach((target) => {
        target._fire('transformstart', { evt: e.evt, target });
      });
    }
  }

  // 获取围绕中心点旋转之后，新的坐标值
  rotates(rotation) {
    const node = this;
    const degToRad = Math.PI / 180;
    const rotatePoint = ({ x, y }, deg) => {
      const rcos = Math.cos(deg * degToRad);
      const rsin = Math.sin(deg * degToRad);
      return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
    };
    const topLeft = { x: -node.width() / 2, y: -node.height() / 2 };
    const current = rotatePoint(topLeft, node.rotation());
    const rotated = rotatePoint(topLeft, rotation);
    const dx = rotated.x - current.x;
    const dy = rotated.y - current.y;
    return {
      x: node.x() + dx,
      y: node.y() + dy,
      width: node.width(),
      height: node.height(),
      rotation: Konva.getAngle(rotation),
    };
  }
  // 指针移动时快捷按钮的相关处理
  _handleMouseMove(e) {
    let x, y, newHypotenuse;
    const anchorNode = this.findOne('.' + this._movingAnchorName);
    if (this._movingAnchorName === 'top-left') {
      return;
    }
    // console.log(anchorNode,this._movingAnchorName);
    const stage = anchorNode?.getStage();
    if (!stage) {
      return;
    }
    stage.setPointersPositions(e); // 将鼠标坐标设置给画布

    const pp = stage.getPointerPosition();
    let newNodePos = {
      // 元素应该在的新位置
      x: pp.x - this._anchorDragOffset.x,
      y: pp.y - this._anchorDragOffset.y,
    };
    const oldAbs = anchorNode.getAbsolutePosition();

    if (this.anchorDragBoundFunc()) {
      newNodePos = this.anchorDragBoundFunc()(oldAbs, newNodePos, e);
    }
    anchorNode.setAbsolutePosition(newNodePos);
    const newAbs = anchorNode.getAbsolutePosition();

    // console.log(oldAbs, newNodePos, newAbs);
    // 如果元素没有移动
    if (oldAbs.x === newAbs.x && oldAbs.y === newAbs.y) {
      return;
    }
    // 旋转
    // rotater is working very differently, so do it first
    if (this._movingAnchorName === 'rotater') {
      const disX = pp.x - this._rotateCenter.x;
      const disY = pp.y - this._rotateCenter.y;
      const nowRad = Math.atan2(disY, disX);
      // 这些计算没有问题。
      const nowDeg = this._startDeg + RadToDeg(nowRad - this._startRad);
      // 添加旋转
      const shape = this.rotates(nowDeg);
      // this._startRad = nowRad;
      // this._startDeg = nowDeg;
      this._fitNodesInto(shape, e);
      return;
    }
    const keepProportion = this.keepRatio() || e.shiftKey;
    var centeredScaling = this.centeredScaling() || e.altKey;

    if (this._movingAnchorName === 'top-left') {
    } else if (this._movingAnchorName === 'top-center') {
      this.findOne('.top-left').y(anchorNode.y());
    } else if (this._movingAnchorName === 'top-right') {
    } else if (this._movingAnchorName === 'middle-left') {
      this.findOne('.top-left').x(anchorNode.x());
    } else if (this._movingAnchorName === 'middle-right') {
      this.findOne('.bottom-right').x(anchorNode.x());
    } else if (this._movingAnchorName === 'bottom-left') {
    } else if (this._movingAnchorName === 'bottom-center') {
      this.findOne('.bottom-right').y(anchorNode.y());
    } else if (this._movingAnchorName === 'bottom-right') {
      if (keepProportion) {
        const comparePoint = centeredScaling
          ? {
              x: this.width() / 2,
              y: this.height() / 2,
            }
          : {
              x: this.findOne('.top-left').x(),
              y: this.findOne('.top-left').y(),
            };

        newHypotenuse = Math.sqrt(
          Math.pow(anchorNode.x() - comparePoint.x, 2) + Math.pow(anchorNode.y() - comparePoint.y, 2),
        );

        const reverseX = this.findOne('.bottom-right').x() < comparePoint.x ? -1 : 1;

        const reverseY = this.findOne('.bottom-right').y() < comparePoint.y ? -1 : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this.findOne('.bottom-right').x(comparePoint.x + x);
        this.findOne('.bottom-right').y(comparePoint.y + y);
      }
    } else {
      console.error(new Error('Wrong position argument of selection resizer: ' + this._movingAnchorName));
    }

    var centeredScaling = this.centeredScaling() || e.altKey;
    // 中心点缩放
    if (centeredScaling) {
      const topLeft = this.findOne('.top-left');
      const bottomRight = this.findOne('.bottom-right');
      const topOffsetX = topLeft.x();
      const topOffsetY = topLeft.y();

      const bottomOffsetX = this.getWidth() - bottomRight.x();
      const bottomOffsetY = this.getHeight() - bottomRight.y();

      bottomRight.move({
        x: -topOffsetX,
        y: -topOffsetY,
      });

      topLeft.move({
        x: bottomOffsetX,
        y: bottomOffsetY,
      });
    }

    const absPos = this.findOne('.top-left').getAbsolutePosition();

    x = absPos.x;
    y = absPos.y;

    const width = this.findOne('.bottom-right').x() - this.findOne('.top-left').x();

    const height = this.findOne('.bottom-right').y() - this.findOne('.top-left').y();

    this._fitNodesInto(
      {
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: Konva.getAngle(this.rotation()),
      },
      e,
    );
  }
  // 指针抬起时的处理
  _handleMouseUp(e) {
    this._removeEvents(e);
  }
  // 指针抬起后，删除相关事件处理
  _removeEvents(e) {
    if (this._transforming) {
      this._transforming = false;
      document.removeEventListener('mousemove', this._handleMouseMove);
      document.removeEventListener('touchmove', this._handleMouseMove);
      document.removeEventListener('mouseup', this._handleMouseUp, true);
      document.removeEventListener('touchend', this._handleMouseUp, true);
      const node = this.getNode();
      this._fire('transformend', { evt: e, target: node });

      if (node) {
        this._nodes.forEach((target) => {
          target._fire('transformend', { evt: e, target });
        });
      }
      this._movingAnchorName = null;
    }
  }

  /**
   * @description: 快操作按钮移动后，根据按钮的移动距离，让元素进行相关变化
   * @param {*} newAttrs
   * @param {*} evt
   * @return {*}
   */
  _fitNodesInto(newAttrs, evt) {
    const oldAttrs = this._getNodeRect();
    const minSize = 1;
    if (Util._inRange(newAttrs.width, -this.padding() * 2 - minSize, minSize)) {
      this.update();
      return;
    }
    if (Util._inRange(newAttrs.height, -this.padding() * 2 - minSize, minSize)) {
      this.update();
      return;
    }

    const allowNegativeScale = this.flipEnabled();
    const t = new Transform();
    t.rotate(Konva.getAngle(this.rotation()));
    if (this._movingAnchorName && newAttrs.width < 0 && this._movingAnchorName.indexOf('left') >= 0) {
      const offset = t.point({
        x: -this.padding() * 2,
        y: 0,
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      newAttrs.width += this.padding() * 2;
      this._movingAnchorName = this._movingAnchorName.replace('left', 'right');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    } else if (this._movingAnchorName && newAttrs.width < 0 && this._movingAnchorName.indexOf('right') >= 0) {
      const offset = t.point({
        x: this.padding() * 2,
        y: 0,
      });
      this._movingAnchorName = this._movingAnchorName.replace('right', 'left');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.width += this.padding() * 2;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    }
    if (this._movingAnchorName && newAttrs.height < 0 && this._movingAnchorName.indexOf('top') >= 0) {
      const offset = t.point({
        x: 0,
        y: -this.padding() * 2,
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      this._movingAnchorName = this._movingAnchorName.replace('top', 'bottom');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    } else if (this._movingAnchorName && newAttrs.height < 0 && this._movingAnchorName.indexOf('bottom') >= 0) {
      const offset = t.point({
        x: 0,
        y: this.padding() * 2,
      });
      this._movingAnchorName = this._movingAnchorName.replace('bottom', 'top');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    }

    if (this.boundBoxFunc()) {
      const bounded = this.boundBoxFunc()(oldAttrs, newAttrs);
      if (bounded) {
        newAttrs = bounded;
      } else {
        Util.warn('boundBoxFunc returned falsy. You should return new bound rect from it!');
      }
    }

    // base size value doesn't really matter
    // we just need to think about bounding boxes as transforms
    // but how?
    // the idea is that we have a transformed rectangle with the size of "baseSize"
    const baseSize = 10000000;
    const oldTr = new Transform();
    oldTr.translate(oldAttrs.x, oldAttrs.y);
    oldTr.rotate(oldAttrs.rotation);
    oldTr.scale(oldAttrs.width / baseSize, oldAttrs.height / baseSize);

    const newTr = new Transform();
    newTr.translate(newAttrs.x, newAttrs.y);
    newTr.rotate(newAttrs.rotation);
    newTr.scale(newAttrs.width / baseSize, newAttrs.height / baseSize);
    // now lets think we had [old transform] and n ow we have [new transform]
    // Now, the questions is: how can we transform "parent" to go from [old transform] into [new transform]
    // in equation it will be:
    // [delta transform] * [old transform] = [new transform]
    // that means that
    // [delta transform] = [new transform] * [old transform inverted]
    const delta = newTr.multiply(oldTr.invert());

    this._nodes.forEach((node) => {
      // for each node we have the same [delta transform]
      // the equations is
      // [delta transform] * [parent transform] * [old local transform] = [parent transform] * [new local transform]
      // and we need to find [new local transform]
      // [new local] = [parent inverted] * [delta] * [parent] * [old local]
      const parentTransform = node.getParent().getAbsoluteTransform();
      const localTransform = node.getTransform().copy();
      // skip offset:
      localTransform.translate(node.offsetX(), node.offsetY());
      // console.log(parentTransform,localTransform);
      const newLocalTransform = new Transform();
      newLocalTransform
        .multiply(parentTransform.copy().invert())
        .multiply(delta)
        .multiply(parentTransform)
        .multiply(localTransform);

      const attrs = newLocalTransform.decompose();
      node.setAttrs(attrs);
      this._fire('transform', { evt: evt, target: node });
      node._fire('transform', { evt: evt, target: node });
      node.getLayer()?.batchDraw();
    });
    this.rotation(Util._getRotation(newAttrs.rotation));
    this._resetTransformCache();
    this.update();
    this.getLayer().batchDraw();
  }
}

export default XXTransformer;
