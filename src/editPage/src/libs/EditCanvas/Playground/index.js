import XXCanvas from '../../xxCanvas';
import SnapDraggable from '../Layout/SnapDraggable.js';
import {
  elNormalTransformer,
  elTopLockTransformer,
  elBorder,
  elsNormalTransformer,
  groupElTransformer,
} from '../transformer.config.js';
import { nanoid } from 'nanoid';
import aroundGroup from './rotation.js';
import CutImage from '../CutImage/CutImage';
function shuiping(ele) {
  let x = ele.x();
  let y = ele.y();
  let rad = (ele.rotation() * Math.PI) / 180;
  const rcos = Math.cos(rad);
  const rsin = Math.sin(rad);
  let f = ele.scaleX() || 1;
  let attrs = {
    scaleX: -ele.scaleX(),
    x: x + f * ele.width() * rcos,
    y: y + f * ele.width() * rsin,
  };
  ele.setAttrs(attrs);
}
// 垂直镜像
function chuizhi(ele) {
  let x = ele.x();
  let y = ele.y();
  let rad = (ele.rotation() * Math.PI) / 180;
  const rcos = Math.cos(rad);
  const rsin = Math.sin(rad);
  let f = ele.scaleY() || 1;
  let h = f * ele.height() * rcos;
  let attrs = {
    scaleY: -ele.scaleY(),
    x: x - f * ele.height() * rsin,
    y: y + f * ele.height() * rcos,
  };
  ele.setAttrs(attrs);
}

/**
 * @description: 选中元素的文本内容
 * @param {*} el 要选中的元素
 * @return {*}
 */
function selectText(el) {
  if (document.selection) {
    let range = document.body.createTextRange();
    range.moveToElementText(el);
    range.select();
  } else if (window.getSelection) {
    let range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }
}

function insertHtmlAtCaret(html) {
  let sel, range;
  let ss = window.getSelection() || null;
  if (ss) {
    sel = ss;
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents && range.deleteContents();
      var el = document.createElement('div');
      el.innerHTML = html;
      var frag = document.createDocumentFragment(),
        node,
        lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  } else if (document.selection && document.selection.type != 'Control') {
    document.selection.createRange().pasteHTML(html);
  }
}

// 去格式粘贴 仅删除样式  保留换行
//换行
function replaceBr(key) {
  key = key.replace(/<\/?.+?>/g, '<br/>');
  key = key.replace(/[\r\n]/g, '<br/>');
  return key;
}

/**
 * @description: 将div的innerHTML格式化为文本格式
 * @return text 格式化后的问题
 */
function formatText(t) {
  t = t.split('<div><br></div>').join('\n').split('<br>').join('\n');
  t = t.split('<div>');
  if (t[0] === '') {
    t.shift();
  }
  t = t.map((item) => {
    let newT = item.split('</div>');
    if (newT.length <= 1 || newT[1] === '') {
      return newT[0];
    }
    return newT.join('\n');
  });
  t = t.join('\n').split('&nbsp;').join(' ');
  t = t.replace(/&lt;/g, '<');
  t = t.replace(/&gt;/g, '>');
  t = t.replace(/&amp;/g, '&');
  return t;
}
/**
 * @description: 获取刀版或有工艺元素的图片
 * @param {*} node
 * @return {*} Promise
 */
function getThumbanils(node, rect, scale = 1, isFilter = false) {
  rect.width = Math.ceil(rect.width);
  rect.height = Math.ceil(rect.height);
  node.scale({ x: scale, y: scale });
  let url = '';
  try {
    if (isFilter) {
      const nodes = node.find('.node');
      nodes.forEach((item) => {
        let blur = 2.5;
        let scale = item.scale();
        let nowScale = Math.max(scale.x, scale.y);
        blur = blur / nowScale;
        item.setAttrs({
          shadowColor: 'red',
          shadowBlur: blur,
          shadowOffset: { x: 0, y: 0 },
          shadowOpacity: 1,
        });
        // console.log(item,"工艺",blur);
      });
    }
    url = node.toDataURL();
  } catch (res) {
    // alert("贴图生成失败，请联系管理员");
    console.log(res);
  }
  const img = new Image();
  const width = rect.width * scale;
  const height = rect.height * scale;
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const imageNode = new XXCanvas.Image({
        image: img,
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
        crop: {
          x: 0,
          y: 0,
          width: width,
          height: height,
        },
      });
      imageNode.setAttrs({
        width: width,
        height: height,
      });
      if (isFilter) {
        // imageNode.cache();
        // imageNode.filters([Konva.Filters.RGBA]);
        // imageNode.red(0);
        // imageNode.green(0);
        // imageNode.blue(0);
      }
      const layerURL = imageNode.toDataURL();
      resolve(layerURL);
      imageNode.destroy();
    };
    img.src = url;
  });
}
/**
 * @description: 裁剪图片
 * @param {*} img 要被裁剪的图片  rect 裁剪区域
 * @return {*} base64
 */
function cutImage(img, rect) {
  const imageNode = new XXCanvas.Image({
    image: img,
    x: 0,
    y: 0,
    width: img.width,
    height: img.height,
    crop: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
  });
  imageNode.setAttrs({
    width: rect.width,
    height: rect.height,
  });
  let url = imageNode.toDataURL();
  imageNode.destroy();
  return url;
}

// "0a5KZ9GvXlbmsd9NnX0oF"
// "0a5KZ9GvXlbmsd9NnX0oF"

/**
 * @description: 通过id判断一组元素中是否包含某个元素
 * @param {*} nodes、node
 * @return {*} true|false
 */
function diffNode(nodes, node) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].attrs.id == node.attrs.id) {
      return true;
    }
  }
  return false;
}

export class Playground extends XXCanvas.Layer {
  className = 'Playground';

  initScale = 1; // 适配后的初始缩放值
  addSpace = 10; // 复制元素的间距
  _isMultiple = false;
  dragDomNode = null;
  selectNodes = [];
  copyNodes = null;
  constructor(options) {
    // console.log(options,'options')
    super(options);
    this.init(options?.children || []);
  }

  // 多选
  get isMultiple() {
    return this._isMultiple;
  }

  set isMultiple(val) {
    this._isMultiple = val;
    this.fire('multipleStatusChange', { value: val });
  }

  // 所有图层元素
  get nodeElements() {
    const nodes = this.getChildren().filter((child) => {
      return this.isElement(child);
    });
    // console.log('所有图层元素nodeElements',nodes)

    return nodes;
  }

  // 获取当前选中的图层
  get selectedNodes() {
    // let transformList = this.getChildren().filter(child => {
    //     return child.getClassName() === 'Transformer' || child.getClassName() === 'TextTransformer';
    // }).map(item => {
    //     return item.nodes().filter(item => item.getParent.className !== 'Group');
    // });
    // // console.log('获取当前选中的图层selectedNodes',transformList)
    // transformList = [...transformList];
    // const nodes = transformList.flat(Infinity);
    // return nodes || [];
    return this.selectNodes;
  }

  get topCoverNode() {
    return this.findOne('#TopCover');
  }
  // 获取画布现在的大小
  get getLayerRect() {
    return this.getStage()._stageInfo.actualSize;
  }
  // 截图时，没有 stage 勿删
  getLayerRect() {
    const background = this.findOne('Background');
    const { width, height } = background.attrs;
    return { width, height };
  }
  // 全选
  selectCurrentPlayAllNode() {
    let stage = this.getStage();
    let nodes = null;
    if (stage.currentStatusLevel !== 'level-0') {
      nodes = this.selectedNodes;
    } else {
      if (!stage.currentPlayId) {
        stage.setDefultPlay();
      }
      nodes = this.nodeElements.filter((node) => node.getAttr('parentPlayId') === stage.currentPlayId);
    }
    elsNormalTransformer(this, nodes);
    this.fire('selectChange', {
      typeName: 'all',
      target: nodes,
      nodes: this.selectedNodes,
    });
  }

  // node是否是图层元素
  isElement(node) {
    return node.name() === 'node';
  }

  add(...nodes) {
    super.add(...nodes);
    const children = this.getChildren();
    const len = children.length;
    const nodeLen = nodes.length;
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].zIndex(len - nodeLen + i);
    }
  }

  init(children = []) {
    const nodes = children.map((node) => {
      const data = { ...node.attrs, name: 'node' };
      if (node.className === 'Group') {
        data.children = node.children;
      }
      return new XXCanvas[node.className](data, this);
    });
    if (nodes.length > 0) {
      this.add(...nodes);
    }
  }
  // 获取最小缩放比例
  get _minScale() {
    return 0.1;
  }

  // 获取最大缩放比例
  get _maxScale() {
    return 5;
  }

  // 鼠标右键
  initMouseMenu() {
    // 鼠标右键
    this.on('contextmenu', (e) => {
      const target = e.target;
      e.cancelBubble = true;
      // console.log('Playground 点击-----右键', target, target.name());
      let isElement = this.isElement(target);
      let evt = e.evt;
      let isTitle = target && target.name() == 'title';
      // if (e.target.id() === targetNode?.id()) {
      if (!isTitle) {
        this.addTransformer(target);
      }
      let stage = this.getStage();
      let playId = stage.setNodePlayId(e.target);
      stage.setCurrentPlaygroundId(playId);
      // }

      this.fire('mouseMenu', {
        typeName: 'mouseMenu',
        target: target,
        nodes: [target],
        isElement,
        evt,
      });
      // if(this.isElement(target)) {

      // } else {

      // }
    });
  }

  // 初始化滚动缩放
  initWheelScale() {
    const step = 1.02;
    // 滚轮缩放
    const wheelScaleEvent = (e) => {
      e.evt.preventDefault();
      e.evt.stopPropagation();
      const maxScale = this._maxScale;
      const minScale = this._minScale;
      const oldScale = this.scaleX();
      const pointer = this.getRelativePointerPosition();
      const oldPointer = {
        // 原始鼠标位置
        x: pointer.x * oldScale,
        y: pointer.y * oldScale,
      };
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      let newScale = direction > 0 ? oldScale * step : oldScale / step;
      if (newScale > maxScale) {
        newScale = maxScale;
      } else if (newScale < minScale) {
        newScale = minScale;
      }
      this.scale({ x: newScale, y: newScale });
      this.fire('layerScaleChange', {
        newVal: { x: newScale, y: newScale },
        target: this,
      });
      const newPointer = {
        // 新的鼠标位置
        x: pointer.x * newScale,
        y: pointer.y * newScale,
      };
      const offsetX = newPointer.x - oldPointer.x;
      const offsetY = newPointer.y - oldPointer.y;
      if (this.deg === 90) {
        // console.log(offsetX,offsetY);
        this.position({
          y: this.y() - offsetX,
          x: this.x() + offsetY,
        });
      } else if (this.deg === 180) {
        // console.log(offsetX,offsetY);
        this.position({
          x: this.x() + offsetX,
          y: this.y() + offsetY,
        });
      } else if (this.deg === 270) {
        // console.log(offsetX,offsetY);
        this.position({
          y: this.y() + offsetX,
          x: this.x() - offsetY,
        });
      } else {
        this.position({
          x: this.x() - offsetX,
          y: this.y() - offsetY,
        });
      }
      // this.fire("scaleChange", { typeName: 'wheelScale', target: this,  value: newScale })
    };
    // 滚轮移动
    const wheelMoveEvent = (e) => {
      e.evt.preventDefault();
      e.evt.stopPropagation();
      let x = this.x();
      const direction = e.evt.deltaY > 0 ? -10 : 10;
      this.x(x + direction);
      this.fire('layerMove', {
        typeName: 'layerWheelMove',
        target: [this],
        nodes: this,
      });
    };

    this.getStage().on('wheel', (e) => {
      if (e.evt.shiftKey) {
        wheelMoveEvent(e);
      } else {
        wheelScaleEvent(e);
      }
    });
  }

  getSelectedNodeToBottom() {
    return this.getNodeToBottomDistance(...this.selectedNodes);
  }

  getNodeToBottomDistance(...nodes) {
    const stageHeight = this.getStage().height();
    const stageY = this.getStage().y();
    const absolutePosition = this.getStage().absolutePosition();
    let maxY = 0;
    nodes.forEach((node) => {
      const attr = node.getClientRect({ relativeTo: this.getStage() });
      const nodeY = attr.y + attr.height;
      maxY = Math.max(nodeY, maxY);
    });

    const allHeight = maxY + stageY > stageHeight ? stageHeight : maxY + stageY;
    const toBottomDistance = stageHeight - allHeight;
    return toBottomDistance;
  }

  // 进行刀版图旋转
  rotates() {
    const node = this;
    const rotation = this.deg;
    const degToRad = Math.PI / 180;
    const rotatePoint = ({ x, y }, deg) => {
      const rcos = Math.cos(deg * degToRad);
      const rsin = Math.sin(deg * degToRad);
      return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
    };
    let { width, height } = this.getStage()._stageInfo.actualSize;
    const scale = this.scale();
    width *= scale.x;
    height *= scale.y;
    // current rotation origin (0, 0) relative to desired origin - center (node.width()/2, node.height()/2)
    const topLeft = { x: -width / 2, y: -height / 2 };
    const current = rotatePoint(topLeft, node.rotation());
    const rotated = rotatePoint(topLeft, rotation);
    const dx = rotated.x - current.x;
    const dy = rotated.y - current.y;
    node.rotation(rotation);
    node.x(node.x() + dx);
    node.y(node.y() + dy);
    this.fire('degChange', {
      typeName: 'degChange',
      target: [this],
      nodes: this,
    });
  }

  // 旋转刀版图
  rotateLayer() {
    if (!this.deg) {
      this.deg = 0;
    }
    this.deg = this.deg % 360;
    this.deg += 90;
    this.rotates();
  }

  // --------画布拖拽--------------
  initDrag() {
    this.isDrag = false;
    window.addEventListener('keydown', (e) => {
      let tags = ['INPUT', 'TEXTAREA'];
      if (tags.includes(e.target.tagName) || e.target.className === 'editTextare') {
        return;
      }
      if (e.keyCode === 32) {
        this.isDrag = true;
        this.getStage().content.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.keyCode === 32) {
        this.isDrag = false;
        this.getStage().content.style.cursor = 'auto';
      }
    });
    this.startPoint = null; //摁下时鼠标位置
    this.startPosition = null; //摁下时刀版位置
    this._dragLayerMove = this._dragLayerMove.bind(this);
    this._dragEnd = this._dragEnd.bind(this);
    this.getStage().on('mousedown.drag', (e) => {
      if (!this.isDrag) {
        return;
      }
      // this.clearTransformer(); 放到satge上了，否则 空白区域触发不了
      this._dragLayerStart(e);
    });
  }
  _dragLayerStart(e) {
    this.startPoint = {
      x: e.evt.clientX,
      y: e.evt.clientY,
    };
    this.startPosition = {
      x: this.x(),
      y: this.y(),
    };
    document.addEventListener('mousemove', this._dragLayerMove);
    document.addEventListener('mouseup', this._dragEnd);
  }

  _dragLayerMove(e) {
    const nowPoint = {
      x: e.clientX,
      y: e.clientY,
    };
    const disPoint = {
      x: nowPoint.x - this.startPoint.x,
      y: nowPoint.y - this.startPoint.y,
    };
    const nowPosition = {
      x: this.startPosition.x + disPoint.x,
      y: this.startPosition.y + disPoint.y,
    };
    this.x(nowPosition.x);
    this.y(nowPosition.y);
    this.fire('layerMove', { typeName: 'drag', target: [this], nodes: this });
  }
  _dragEnd() {
    document.removeEventListener('mousemove', this._dragLayerMove);
    document.removeEventListener('mouseup', this._dragEnd);
    if (this._isDrag) {
      this.fire('layerMove', {
        typeName: 'dragend',
        target: [this],
        nodes: this,
      });
    }
  }
  // 初始化参考线
  initSnapDraggable() {
    SnapDraggable.call(this);
  }

  // 设置多个选中
  selectNodes(nodes, disabledEmitUI) {
    nodes.forEach((node) => {
      this.addTransformer(node, true);
    });
    !disabledEmitUI &&
      this.fire('selectChange', {
        typeName: 'select',
        target: nodes,
        nodes: this.selectedNodes,
      });
  }
  // 加多个元素到画布上
  addNodes(nodes, disabledEmitUI, isNeedTranfomer) {
    if (!nodes.length) {
      return;
    }
    this.add(...nodes);
    nodes.forEach((node) => {
      node.name('node');
      !node.id() && node.id(nanoid());
    });
    if (isNeedTranfomer) {
      if (nodes.length > 1) {
        this.multipleSelectNodes(nodes);
      } else {
        this.addTransformer(nodes[0]);
      }
    }
    this.topCoverNode?.moveToTop();
    !disabledEmitUI &&
      this.fire('nodesChange', {
        typeName: 'add',
        target: nodes,
        nodes: this.nodeElements,
      });
    !disabledEmitUI &&
      isNeedTranfomer &&
      this.fire('nodesChange', {
        typeName: 'add',
        target: nodes,
        nodes: this.nodeElements,
      });
    return nodes;
  }

  // 加单个元素
  addChild(node, disabledEmitUI) {
    node.name('node');
    if (!node.id()) {
      node.id(nanoid());
    }
    this.add(node);
    this.addTransformer(node, false, 'add');
    this?.topCoverNode?.moveToTop();
    let stage = this.getStage();
    let playId = stage.setNodePlayId(node);
    stage.setCurrentPlaygroundId(playId);
    !disabledEmitUI &&
      this.fire('nodesChange', {
        typeName: 'add',
        target: [node],
        nodes: this.nodeElements,
      });
  }
  // 添加img 到指定地方，指定大小
  addGroupToPos({ groupInfo, displayRect }) {
    let stageClient = this.getStage().container().getBoundingClientRect();
    // 距离画布左上角的坐标
    let x = displayRect.x - stageClient.x;
    let y = displayRect.y - stageClient.y;
    if (x < 0 || y < 0) {
      return;
    }
    let layerPos = this.getAbsolutePosition();
    let deg = this.deg || 0;
    let stage = this.getStage();
    // 距离画布左上角可视坐标
    let nodeX, nodeY;
    if (deg == 90) {
      nodeX = y - layerPos.y;
      nodeY = layerPos.x - x - displayRect.width;
    } else if (deg == 180) {
      nodeX = layerPos.x - x - displayRect.width;
      nodeY = layerPos.y - y - displayRect.height;
    } else if (deg == 270) {
      nodeX = layerPos.y - y - displayRect.height;
      nodeY = x - layerPos.x;
    } else {
      nodeX = x - layerPos.x;
      nodeY = y - layerPos.y;
    }
    let scale = this.scaleX();
    x = nodeX / scale;
    y = nodeY / scale;
    const width = displayRect.width / scale;
    let nowScale = width / groupInfo.attrs.width;
    let group = new XXCanvas.Group(groupInfo, this.currentUIPlayground);
    group.setAttrs({
      id: nanoid(),
      x,
      y,
      scaleX: nowScale,
      scaleY: nowScale,
    });
    this.add(group);
    const newAttrs = aroundGroup(group, -deg, this);
    group.setAttrs(newAttrs);
    this.addTransformer(group, false, 'add');
    let playId = stage.setNodePlayId(group);
    group.parentPlayId = playId;
    stage.setCurrentPlaygroundId(playId);
    this.fire('nodesChange', {
      typeName: 'add',
      target: [group],
      nodes: this.nodeElements,
    });
    this.topCoverNode.moveToTop();
  }
  // 添加img 到指定地方，指定大小
  addImgToPos({ image, url, srcId, materialId, materialDesc, displayRect }) {
    image.crossOrigin = 'anonymous';
    let stageClient = this.getStage().container().getBoundingClientRect();
    // 距离画布左上角的坐标
    let x = displayRect.x - stageClient.x;
    let y = displayRect.y - stageClient.y;
    if (x < 0 || y < 0) {
      return;
    }

    let layerPos = this.getAbsolutePosition();
    let deg = this.deg || 0;
    let stage = this.getStage();
    // 距离画布左上角可视坐标
    let nodeX, nodeY;
    if (deg == 90) {
      nodeX = y - layerPos.y;
      nodeY = layerPos.x - x - displayRect.width;
    } else if (deg == 180) {
      nodeX = layerPos.x - x - displayRect.width;
      nodeY = layerPos.y - y - displayRect.height;
    } else if (deg == 270) {
      nodeX = layerPos.y - y - displayRect.height;
      nodeY = x - layerPos.x;
    } else {
      nodeX = x - layerPos.x;
      nodeY = y - layerPos.y;
    }
    let scale = this.scaleX();
    x = nodeX / scale;
    y = nodeY / scale;
    const width = displayRect.width / scale;
    const height = displayRect.height / scale;
    const attrs = {
      image,
      url,
      x,
      y,
      srcId,
      materialId,
      materialDesc,
      height,
      width,
    };
    attrs.originData = { ...attrs };
    const newImage = new XXCanvas.Image(attrs);
    newImage.setAttrs({
      name: 'node',
      id: nanoid(),
    });
    this.add(newImage);
    const newAttrs = aroundGroup(newImage, -deg, this);
    newImage.setAttrs(newAttrs);
    this.addTransformer(newImage, false, 'add');
    let playId = stage.setNodePlayId(newImage);
    newImage.parentPlayId = playId;
    stage.setCurrentPlaygroundId(playId);
    this.fire('nodesChange', {
      typeName: 'add',
      target: [newImage],
      nodes: this.nodeElements,
    });
    this.topCoverNode.moveToTop();
  }
  // 画布截图
  setCutImage() {
    let stageClient = this.getStage().container().getBoundingClientRect();
    let node = this.selectNodes[0];
    if (!node) {
      return;
    }
    let nodeScale = node.scale();
    let { image, width, height } = node.attrs;
    let rotation = node.getAbsoluteRotation();
    let scale = node.getAbsoluteScale();
    let { x, y } = node.getAbsolutePosition();
    let container = this.getStage().container();
    let mirror = { x: false, y: false };
    if (nodeScale.x < 0 || nodeScale.y < 0) {
      let newNode = node.clone({ opacity: 0 });
      node.getParent().add(newNode);
      if (nodeScale.x < 0) {
        mirror.x = true;
        shuiping(newNode);
      }
      if (nodeScale.y < 0) {
        mirror.y = true;
        chuizhi(newNode);
      }
      rotation = newNode.getAbsoluteRotation();
      scale = newNode.getAbsoluteScale();
      let pos = newNode.getAbsolutePosition();
      x = pos.x;
      y = pos.y;
      newNode.destroy();
    }
    let clientWidth = width * scale.x;
    let clientHeight = height * scale.y;
    if (this.deg == 90) {
      x = x - clientWidth;
    } else if (this.deg == 180) {
      x = x - clientWidth;
      y = y - clientHeight;
    } else if (this.deg == 270) {
      y = y - clientHeight;
    }
    x = stageClient.x + x;
    y = stageClient.y + y;
    let config = {
      image,
      mirror,
      rotation,
      scale,
      x,
      y,
      clientWidth,
      clientHeight,
      container,
      node,
      layer: this,
    };
    this.clearTransformer(true);
    node.hide();
    new CutImage(config);
  }
  // 加元素到中间
  addChildToCenter(node) {
    let stage = this.getStage();
    stage.setDefultPlay();
    const { width, height, originPoint } = stage.currentActiveSize;
    let nodeDeg = node.rotation() || 0;
    if (nodeDeg < 0) {
      nodeDeg = 360 + nodeDeg;
    }
    const stageDeg = this.deg || 0;
    let nodeScale = node.attrs.scaleX || 1;
    const nodeHeight = node.height() * nodeScale;
    const nodeWidth = node.width() * nodeScale;
    if (stageDeg === 270) {
      node.x(originPoint.x + width / 2 + nodeHeight / 2);
      node.y(originPoint.y + height / 2 - nodeWidth / 2);
    } else if (stageDeg === 180) {
      node.x(originPoint.x + width / 2 + nodeWidth / 2);
      node.y(originPoint.y + height / 2 + nodeHeight / 2);
    } else if (stageDeg === 90) {
      node.x(originPoint.x + width / 2 - nodeHeight / 2);
      node.y(originPoint.y + height / 2 + nodeWidth / 2);
    } else {
      node.x(originPoint.x + width / 2 - nodeWidth / 2);
      node.y(originPoint.y + height / 2 - nodeHeight / 2);
    }
    let id = node.id() || nanoid();
    node.setAttrs({
      name: 'node',
      id,
      rotation: -stageDeg,
      parentPlayId: stage.currentPlayId,
    });
    const attrs = aroundGroup(node, nodeDeg, this);
    this.add(node);
    node.setAttrs(attrs);
    this.fire('nodesChange', {
      typeName: 'add',
      target: [node],
      nodes: this.nodeElements,
    });
    this.addTransformer(node, false, 'add');
    this.topCoverNode.moveToTop();
  }
  // 剪切
  cutSelectedNode() {
    this.copyNodes = this.deleteSelectedNode();
  }
  // 删除多个元素  返回所删除元素
  deleteSelectedNode(nodes, disabledEmitUI) {
    if (!nodes) nodes = this.getSelectedNodes();
    if (!nodes) return [];
    nodes.forEach((node) => node.remove());
    this.clearTransformer(disabledEmitUI);
    !disabledEmitUI &&
      this.fire('nodesChange', {
        typeName: 'delete',
        target: nodes,
        nodes: this.nodeElements,
      });

    return nodes;
  }
  // 切换选择节点的 锁定状态
  changeSelectedNodeLock(status, nodes) {
    if (!nodes) nodes = this.getSelectedNodes();
    let currentLock = status !== undefined ? status : !nodes.every((node) => node.getAttr('lock'));

    this.clearTransformer(true);
    nodes.forEach((node) => {
      node.setAttr('lock', currentLock);
      this.addTransformer(node, true, 'lock');
    });
    this.fire('attrsChange', {
      typeName: 'lock',
      target: nodes,
      nodes: this.nodeElements,
    });
    this.fire('selectChange', {
      typeName: 'lock',
      target: nodes,
      nodes: this.selectedNodes,
    });
  }
  // 锁定元素
  setLock(id, val) {
    // this.clearTransformer(true);
    const node = this.getChildById(id);
    node.setAttr('lock', !!val);
    this.fire('attrsChange', {
      typeName: 'lock',
      target: [node],
      nodes: this.nodeElements,
    });
  }

  // 根据id获取节点
  getChildById(id) {
    return this.find('#' + id)[0];
  }
  // 粘贴节点
  stickCopyNodeToLayer() {
    if (this.copyNodes && Array.isArray(this.copyNodes) && this.copyNodes.length > 0) {
      this.cloneSelectedNodeToLayer(this.copyNodes);
    }
    this.copyNodes = null;
  }
  // 复制节点 且加入画布  不传Nodes 去当前选中元素
  cloneSelectedNodeToLayer(nodes) {
    if (!nodes) nodes = this.cloneSelectedNode();
    this.clearTransformer(true);
    let stage = this.getStage();
    let infoMap = stage._stageInfo.playInfoMap;
    let nowPlayId = stage.currentPlayId;
    //console.log(nodes,nowPlayId,infoMap,"要粘贴的元素");
    if (nowPlayId) {
      nodes.forEach((node) => {
        let { parentPlayId } = node.attrs;
        if (parentPlayId !== nowPlayId) {
          node.attrs.parentPlayId = nowPlayId;
          let disX = infoMap[nowPlayId].originPoint.x - infoMap[parentPlayId].originPoint.x;
          node.x(node.x() + disX);
        }
      });
    }
    this.addNodes(nodes, true, true);
    this.fire('selectChange', {
      typeName: 'clone',
      target: nodes,
      nodes: this.selectedNodes,
    });
    this.fire('nodesChange', {
      typeName: 'clone',
      target: nodes,
      nodes: this.nodeElements,
    });
    return nodes;
  }
  // 克隆元素 返回Nodes
  cloneSelectedNode() {
    const nodes = this.getSelectedNodes().map((item) => {
      const getNew = (old) => {
        const x = old.x();
        const y = old.y();

        return old.clone({
          x: x + this.addSpace / this.scaleX(),
          y: y + this.addSpace / this.scaleY(),
          draggable: false,
          lock: false,
          name: 'node',
          id: nanoid(),
        });
      };
      const cloneItem = getNew(item);
      if (item.className === 'Group') {
        //     cloneItem.removeChildren();
        cloneItem.getChildren().forEach((node) => {
          node.id(nanoid());
        });
        //     cloneItem.add(child);
      }
      return cloneItem;
    });
    this.copyNodes = nodes;
    return nodes;
  }

  // 清除 node的选中
  removeTransformer(node, disabledEmitUI) {
    const transfomer = this.getMyTranfomer(node);
    node.draggable(false);
    if (transfomer) {
      transfomer.nodes([]);
      transfomer.remove();
      transfomer.destroy();
    }
    this.selectNodes = this.selectNodes.filter((item) => {
      return item.id() !== node.id();
    });
    !disabledEmitUI &&
      this.fire('selectChange', {
        typeName: 'remove',
        target: node,
        nodes: this.selectedNodes,
      });
  }

  // 根据id 清除选中
  removeTransformerById(id, disabledEmitUI) {
    const node = this.getChildById(id);
    this.removeTransformer(node, disabledEmitUI);
  }

  // 清空画布上的选中
  clearTransformer(disabledEmitUI) {
    [...this.getChildren()].forEach((element) => {
      if (element.getClassName() === 'Transformer' || element.getClassName() === 'TextTransformer') {
        if (element.name() === 'border') {
          return;
        }
        element.nodes([]);
        element.remove();
        element.destroy();
      }
    });
    this.find('.Transformer').forEach((item) => {
      item.remove();
      item.destroy();
    });
    this.selectNodes.forEach((item) => {
      item.selected = false;
      item.draggable(false);
    });
    this.selectNodes = [];
    if (!disabledEmitUI) this.fire('selectChange', { typeName: 'clear', target: [], nodes: [] });
  }

  // 获取当前元素对应的 transformer
  getMyTranfomer(node) {
    return this.getChildren()
      .filter((child) => {
        return child.getClassName() === 'Transformer' || child.getClassName() === 'TextTransformer';
      })
      .find((item) => {
        return item.nodes().some((item1) => {
          return (node.id && item1.id() === node.id()) || item1.id() === node;
        });
      });
  }

  // 根据id选中节点
  addTransfomerById(id, disabledEmitUI, type, ignoreScroll = false) {
    const node = this.getChildById(id);
    // console.log(disabledEmitUI, '获取到的节点');
    this.addTransformer(node, disabledEmitUI, type, ignoreScroll);
  }

  // 加tranfomer
  addTransformer(targetNode, disabledEmitUI, type = 'select', ignoreScroll) {
    // console.log('------targetNode.getParent():', targetNode,targetNode.getParent(), disabledEmitUI, type = 'select', ignoreScroll)
    if (!targetNode) {
      return;
    }
    const nodeParent = targetNode.getParent();
    if (!nodeParent) {
      return;
    }
    // 是否是复合元素
    const isNeedGetParent = targetNode?.getClassName() !== 'Group' && nodeParent.getClassName() === 'Group';
    // 实际拖动元素
    const draggableNode = isNeedGetParent ? nodeParent : targetNode;
    // 判断是否锁定

    const isLock = draggableNode.getAttr('lock');
    // const isTitle = draggableNode.name() == 'title'
    // 获取 可以移动的元素
    // draggableNode.draggable(!isLock && !this.isMultiple);

    // 出现选中高亮操作
    const MyTranfomer = this.getMyTranfomer(draggableNode, targetNode);
    // 单选
    const typeName = draggableNode.getClassName();
    // console.log(typeName, '----加选框');
    // MyTranfomer?.target.id() === targetNode.id() 判断 当前高组高亮的元素  是否时点击的元素，不可通过节点全等判断，只能根据id判断
    //console.log(draggableNode,targetNode);
    if (isLock) {
      this.clearTransformer(true);
      elTopLockTransformer(this, draggableNode);
      draggableNode.selected = true;
      this.selectNodes = [draggableNode];
    } else if (
      (MyTranfomer && typeName !== 'Group') ||
      (typeName === 'Group' && MyTranfomer?.target?.id() === targetNode.id()) ||
      (typeName === 'Rect' && typeName === 'Transformer' && MyTranfomer?.target?.id() !== targetNode?.target?.id())
    ) {
      if (typeName === 'Rect') {
        targetNode = targetNode.target;
      }
      this.fire('clickAgain', {
        typeName: targetNode.getClassName(),
        target: targetNode,
        nodes: this.selectedNodes,
      });
      return false;
    } else {
      this.clearTransformer(true);
      // if(isTitle) return false
      switch (typeName) {
        case 'Text':
          // 单元素选区添加(正常功能状态) - 文字
          elNormalTransformer(this, draggableNode);
          break;
        case 'Image':
          // 单元素选区添加(正常功能状态) - 非文字
          elNormalTransformer(this, draggableNode);
          break;
        case 'Group':
          // 点击组时
          if (targetNode.getClassName() === 'Group') {
            // 单元素选区添加(正常功能状态) - 非文字
            elNormalTransformer(this, draggableNode);
          } else {
            // 点击组内元素时
            groupElTransformer(this, draggableNode, targetNode);
            targetNode.selected = true;
          }
          break;
      }
      this.selectNodes = [targetNode];
      draggableNode.selected = true;
    }
    // 禁止向外抛事件
    if (disabledEmitUI || (MyTranfomer && MyTranfomer?.target === targetNode)) {
      return false;
    }
    this.fire('selectChange', {
      typeName: type,
      target: [targetNode],
      nodes: this.selectedNodes,
      ignoreScroll,
    });
    this.nodeTransfomerEvent(draggableNode);
  }

  // 鼠标移入的外框
  addBorder(targetNode) {
    const nodeParent = targetNode.getParent();
    // 是否是复合元素
    const isNeedGetParent = targetNode.getClassName() !== 'Group' && nodeParent.getClassName() === 'Group';
    // 实际拖动元素
    const draggableNode = isNeedGetParent ? nodeParent : targetNode;
    // 判断是否锁定

    // 判断是否锁定
    //const isLock = draggableNode.getAttr('lock');

    // 获取类型，考虑是否是组合
    const typeName = draggableNode.getClassName();

    if (targetNode.getClassName() === 'Group') {
      //元素本身就是组合
      // 单元素选区添加(正常功能状态) - 非文字
      !targetNode.selected && elBorder(this, targetNode);
    } else if (typeName === 'Group') {
      // 元素在组合内
      // 点击组内元素时
      !draggableNode.selected && elBorder(this, draggableNode);
      !targetNode.selected && elBorder(this, targetNode);
    } else {
      !targetNode.selected && elBorder(this, targetNode);
    }
  }

  // 删除外框
  removeBorder(targetNode) {
    const nodeParent = targetNode.getParent();
    // 是否是复合元素
    const isNeedGetParent = targetNode.getClassName() !== 'Group' && nodeParent.getClassName() === 'Group';
    // 实际拖动元素
    const draggableNode = isNeedGetParent ? nodeParent : targetNode;
    // 判断是否锁定

    // 判断是否锁定
    //const isLock = draggableNode.getAttr('lock');

    // 获取类型，考虑是否是组合
    const typeName = draggableNode.getClassName();

    if (!targetNode.tr) {
      return;
    }
    if (targetNode.getClassName() === 'Group') {
      //元素本身就是组合
      // 单元素选区添加(正常功能状态) - 非文字
      targetNode.tr.nodes([]);
      targetNode.tr.destroy();
      targetNode.tr = null;
    } else if (typeName === 'Group') {
      // 元素在组合内
      // 点击组内元素时
      if (draggableNode.tr) {
        draggableNode.tr.nodes([]);
        draggableNode.tr.destroy();
        draggableNode.tr = null;
      }
      targetNode.tr.nodes([]);
      targetNode.tr.destroy();
      targetNode.tr = null;
    } else {
      targetNode.tr.nodes([]);
      targetNode.tr.destroy();
      targetNode.tr = null;
    }
  }
  // 清除所有外框
  clearBorder() {
    const borders = this.find('.border');
    borders.forEach((item) => {
      item.nodes([]);
      item.destroy();
    });
  }
  // 元素需要监听的 画布操作改变 x y width height scale 事件
  nodeTransfomerEvent(node) {
    node.off('transform.drag');
    node.on('transformstart.drag', (e) => {
      // console.log("transformstart");
      this.fire('nodedragstart', {
        typeName: 'transformstart',
        target: [node],
        nodes: this.nodeElements,
      });
    });
    node.off('transform.drag');
    node.on('transform.drag', (e) => {
      this.fire('nodedrag', {
        typeName: 'transform',
        target: [node],
        nodes: this.nodeElements,
      });
    });
    node.off('transformend.drag');
    node.on('transformend.drag', (e) => {
      e.cancelBubble = true;
      // console.log('transformend.drag');
      this.fire('attrsChange', {
        typeName: 'transformend',
        target: [node],
        nodes: this.nodeElements,
      });
      this.fire('nodedragend', {
        typeName: 'transformend',
        target: [node],
        nodes: this.nodeElements,
      });
    });
  }
  /**
   * @description: 元素复选
   * @return {*}
   */
  multipleSelectNodes(selectBoxs) {
    let stage = this.getStage();
    // 排除组合和组内元素都被选中的情况
    selectBoxs = selectBoxs.map((node) => {
      if (node.parent.className === 'Group') {
        return node.parent;
      }
      return node;
    });
    selectBoxs = Array.from(new Set(selectBoxs));
    // console.log(selectBoxs, "元素复选");
    if (stage.currentStatusLevel === 'level-0') {
      if (selectBoxs.length < 1) {
        stage.currentPlayId = null;
        stage.clearPlayActive(true);
      } else if (selectBoxs.length > 0 && !stage.currentPlayId) {
        let id = selectBoxs[0].attrs.parentPlayId;
        stage.currentPlayId = id;
        stage.activePlayChange(true);
      }
      let id = stage.currentPlayId;
      selectBoxs = selectBoxs.filter((item) => item.attrs.parentPlayId == id);
    }
    if (selectBoxs.length < 1) {
      return [];
    }
    this.clearTransformer(true);
    if (selectBoxs.length === 1) {
      this.addTransformer(selectBoxs[0], true);
    } else {
      selectBoxs.forEach((item) => (item.selected = true));
      elsNormalTransformer(this, selectBoxs);
    }
    this.selectNodes = selectBoxs;
    this.fire('selectChange', {
      typeName: 'select',
      target: selectBoxs,
      nodes: this.selectedNodes,
    });
    return selectBoxs;
  }
  /**
   * @description: 初始化素材层的相关事件
   * @return {*}
   */
  initEvent() {
    this.editText();
    let stage = this.getStage();
    /**
     * 画布中 向外抛事件
     *this.fire('myCus', {typeName:'woshi zidi ')};
     *
     *  画布 接收事件
     * this.on('myCus', (e) => {
     *        console.log('%c 🍋 Nodes', 'color:#e41a6a', e);
     *  });
     **/
    let selectBox = [];
    const multiple = (target) => {
      if (selectBox.includes(selectBox)) {
        selectBox = selectBox.filter((item) => target !== item);
      } else {
        selectBox.push(target);
      }
      selectBox = this.multipleSelectNodes(selectBox);
    };
    const isDragNode = (e) => {
      if (this.selectNodes.length === 1 && !e.evt.shiftKey) {
        let boundRect = stage.container().getBoundingClientRect();
        let nodeRect = this.selectNodes[0].getClientRect();
        let rect = {
          x: e.evt.clientX - boundRect.x,
          y: e.evt.clientY - boundRect.y,
          width: 1,
          height: 1,
        };
        return XXCanvas.Util.haveIntersection(nodeRect, rect);
      }
      return false;
    };
    // 多选检测
    window.addEventListener('keydown', (e) => {
      if (e.keyCode == 16) {
        selectBox = this.selectNodes.concat();
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.keyCode == 16) {
        selectBox = [];
      }
    });
    // 清除元素选中
    this.getStage().on('mousedown', (e) => {
      if (this.isSelectBox) {
        this.isSelectBox = false;
        return;
      }
      this.fire('clickEmpty', e);
      this.getStage().clearStageSelect();
    });
    //元素选中
    this.off('mousedown.selected');
    this.on('mousedown.selected', function (e) {
      if (this.isSelectBox || this.isDrag) {
        return;
      }
      const target = e.target;
      if (target.name().indexOf('_anchor') >= 0) {
        e.cancelBubble = true;
        return false;
      } else if (isDragNode(e)) {
        e.cancelBubble = true;
        this.isHotArea = true;
        this.nodeDrag(e);
      } else if (this.isElement(target)) {
        e.cancelBubble = true;
        this.removeBorder(target);
        if (e.evt.shiftKey) {
          multiple(target);
        } else {
          if (!this.selected) {
            this.clearTransformer(false);
            this.addTransformer(target);
            let playId = stage.setNodePlayId(e.target);
            stage.setCurrentPlaygroundId(playId);
          }
          this.nodeDrag(e);
        }
      }
    });
    // 鼠标移入
    this.on('mouseover', function (e) {
      const target = e.target;
      if (target.name().indexOf('_anchor') >= 0) {
        e.cancelBubble = true;
        return;
      }
      if (this.isSelectBox || this.isDrag || this.isNodeMove) {
        this.clearBorder();
        return;
      }
      // if(isDragNode(e)){
      //     return;
      // }
      this.getStage().content.style.cursor = 'auto';
      if (this.isElement(target)) {
        this.addBorder(target);
      }
    });
    // 鼠标移出
    this.on('mouseout', function (e) {
      const target = e.target;
      if (this.isElement(target)) {
        if (!target.selected) {
          this.removeBorder(target);
        }
      }
    });
    // 鼠标抬起
    this.on('mouseup.selected', (e) => {
      if (this.isHotArea) {
        if (!this.isNodeMove) {
          const target = e.target;
          if (this.isElement(target)) {
            e.cancelBubble = true;
            this.removeBorder(target);
            this.addTransformer(target);
            let playId = stage.setNodePlayId(e.target);
            stage.setCurrentPlaygroundId(playId);
          }
        }
      }
      this.isHotArea = false;
    });

    // 右键
    this.initMouseMenu();

    // 初始化拖拽
    this.initDrag();

    // 滚轮缩放
    this.initWheelScale();

    // 框选
    this.boxSelection();
    // //  拖拽增加元素
    // this.initDragAddNode()
  }
  nodeDrag(e) {
    let dragNode = this.selectNodes[0];
    this.isNodeMove = false;
    // console.log(dragNode.getParent().getClassName());
    if (dragNode.getParent().getClassName() === 'Group') {
      dragNode = dragNode.getParent();
    }
    // console.log(dragNode);
    if (this.selectNodes.length !== 1 || dragNode.attrs.lock) {
      return;
    }
    const touch = this.getRelativePointerPosition();
    let startPoint = {
      x: touch.x,
      y: touch.y,
    };
    let startPosition = {
      x: dragNode.x(),
      y: dragNode.y(),
    };
    let move = (e) => {
      const touch = this.getRelativePointerPosition();
      const nowPoint = {
        x: touch.x,
        y: touch.y,
      };
      const disPoint = {
        x: nowPoint.x - startPoint.x,
        y: nowPoint.y - startPoint.y,
      };
      if (!this.isNodeMove) {
        if (Math.abs(disPoint.x) > 3 || Math.abs(disPoint.y) > 3) {
          this.isNodeMove = true;
          this.fire('nodedragstart', {
            typeName: 'dragstart',
            target: [dragNode],
            nodes: this.nodeElements,
          });
        }
        return;
      }
      const nowPosition = {
        x: startPosition.x + disPoint.x,
        y: startPosition.y + disPoint.y,
      };
      dragNode.x(nowPosition.x);
      dragNode.y(nowPosition.y);
      this.fire('nodedrag', {
        typeName: 'drag',
        target: [dragNode],
        nodes: this.nodeElements,
      });
    };
    document.addEventListener('mousemove', move);
    document.addEventListener(
      'mouseup',
      () => {
        document.removeEventListener('mousemove', move);
        if (this.isNodeMove) {
          let stage = this.getStage();
          let playId = stage.setNodePlayId(dragNode);
          stage.setCurrentPlaygroundId(playId);
          this.fire('attrsChange', {
            typeName: 'nodedragend',
            target: [dragNode],
            nodes: this.nodeElements,
          });
          this.fire('nodedragend', {
            typeName: 'nodedragend',
            target: [dragNode],
            nodes: this.nodeElements,
          });
        }
        this.isNodeMove = false;
      },
      { once: true },
    );
  }
  editText() {
    const stage = this.getStage();
    function cloneAttrs(Textarea, Text) {
      // create textarea over canvas with absolute position
      // first we need to find position for textarea
      // how to find it?
      // at first lets find position of text node relative to the stage:
      var textPosition = Text.getAbsolutePosition();
      var scale = Text.getAbsoluteScale().x;
      // then lets find position of stage container on the page:
      var stageBox = stage.container().getBoundingClientRect();
      // so position of textarea will be the sum of positions above:
      var areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y,
      };
      let deg = Text.getAbsoluteRotation();
      Textarea.style.top = areaPosition.y + 'px';
      Textarea.style.left = areaPosition.x + 'px';
      Textarea.style.width = Text.width() + 'px';
      Textarea.style.height = Text.height() + 'px';
      Textarea.style.lineHeight = Text.lineHeight();
      Textarea.style.fontFamily = Text.fontFamily();
      Textarea.style.fontSize = Text.fontSize() + 'px';
      Textarea.style.color = Text.fill();
      Textarea.style.textAlign = Text.align();
      Textarea.style.writingMode = Text.writeMode() === 'horizontal' ? 'horizontal-tb' : 'vertical-rl';
      Textarea.style.transform = `scale(${scale}) rotate(${deg}deg)`;
    }
    this.on('dblclick', (e) => {
      if (e.target.getClassName() !== 'Text') return;
      let textNode = e.target;
      let startText = textNode.text();
      let textarea = document.createElement('div');
      textarea.style.whiteSpace = 'pre-wrap';
      let inputEvent = () => {
        let innerText = textarea.innerHTML;
        // console.log('innerText', innerText );
        const formatedText = formatText(innerText);
        // console.log('formatedText', formatedText );
        textNode.text(formatedText);
        cloneAttrs(textarea, textNode);
        this.fire('attrsChange', {
          typeName: 'editText',
          target: [textNode],
          nodes: this.nodeElements,
        });
      };
      textarea.textContent = startText;
      textarea.contentEditable = 'true';
      textarea.style.position = 'absolute';
      textarea.style.outline = 'none';
      textarea.style.padding = '0px';
      textarea.style.zIndex = '100';
      textarea.style.transformOrigin = 'left top';
      textarea.className = 'editTextare';
      cloneAttrs(textarea, textNode);
      document.body.appendChild(textarea);
      textNode.opacity(0);
      textarea.addEventListener('paste', (event) => {
        if (event.clipboardData || event.originalEvent) {
          var clipboardData = event.clipboardData || window.clipboardData;
          var val = clipboardData.getData('text/plain');
          var str = replaceBr(val);
          event.preventDefault();
          insertHtmlAtCaret(str);
          inputEvent();
        }
      });
      textarea.addEventListener('input', inputEvent);
      this.off('Change.text');
      this.on('Change.text', () => {
        cloneAttrs(textarea, textNode);
      });
      textarea.addEventListener('focusin', () => {
        //console.log("in");
      });
      textarea.addEventListener('focusout', () => {
        inputEvent();
        textNode.opacity(1);
        this.off('Change.text');
        textarea.remove();
        this.fire('attrsChange', {
          typeName: 'editTextEnd',
          target: [textNode],
          nodes: this.nodeElements,
        });
      });
      selectText(textarea);
    });
  }
  // 获取鼠标相对于刀版的坐标
  pos(event) {
    let { x, y } = this.getAbsolutePosition();
    let scale = this.getAbsoluteScale().x;
    if (event) {
      var px = event.clientX;
      var py = event.clientY;
      let rect = this.getStage().container().getBoundingClientRect();
      px = px - rect.x;
      py = py - rect.y;
    } else {
      var { x: px, y: py } = this.getStage().getPointerPosition();
    }
    let deg = this.deg;
    let x2, y2;
    if (deg == 90) {
      y2 = (x - px) / scale;
      x2 = (py - y) / scale;
    } else if (deg == 180) {
      x2 = (x - px) / scale;
      y2 = (y - py) / scale;
    } else if (deg == 270) {
      y2 = (px - x) / scale;
      x2 = (y - py) / scale;
    } else {
      x2 = (px - x) / scale;
      y2 = (py - y) / scale;
    }
    return { x: x2, y: y2 };
  }
  /**
   * @description: 组合
   * @param {Array} children 需要编组元素的id数组
   * @return {*} new Group
   */
  boxSelection() {
    let x1, y1, x2, y2;
    let RectBox = null;
    let stage = this.getStage();
    let selectBoxs = [];
    let boxMove = (e) => {
      let { x, y } = this.pos(e);
      x2 = x;
      y2 = y;
      if (!this.isSelectBox) {
        this.isSelectBox = true;
        this.clearBorder();
        RectBox = new Konva.Rect({
          fill: 'rgba(0,0,255,0.1)',
          stroke: '#EB0C0C',
          strokeWidth: 1,
        });
        RectBox.setAttrs({
          x: x1,
          y: y1,
          width: 0,
          height: 0,
        });
        this.add(RectBox);
      }
      RectBox.setAttrs({
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      });
      let nodes = this.find('.node');
      let box = RectBox.getClientRect();
      this.clearTransformer(true);
      selectBoxs.length = 0;

      // 筛选掉锁定元素
      nodes = nodes.filter((item) => {
        return !item.getAttr('lock');
      });

      nodes.forEach((node) => {
        let intersected = XXCanvas.Util.haveIntersection(box, node.getClientRect());
        node.selected = false;
        if (intersected) {
          selectBoxs.push(node);
        }
      });
      selectBoxs = this.multipleSelectNodes(selectBoxs);
    };
    let boxEnd = (e) => {
      document.removeEventListener('mousemove', boxMove);
      document.removeEventListener('mouseup', boxEnd);
      if (RectBox) {
        RectBox.destroy();
        RectBox = null;
        this.isSelectBox = false;
      }
    };
    // 框选
    stage.on('mousedown.selectBox', (e) => {
      if (this.isDrag || e.target.selected) {
        return;
      }
      let { x, y } = this.pos();
      x2 = x1 = x;
      y2 = y1 = y;

      //开启多选
      this.isSelectBox = false;
      document.addEventListener('mousemove', boxMove);
      document.addEventListener('mouseup', boxEnd);
    });
  }

  /**
   * @description: 组合
   * @param {Array} children 需要编组元素的id数组
   * @return {*} new Group
   */
  tofreezeGroup(nodes, disabledEmitUI) {
    if (!arguments) return;
    let needFreezeNodes = nodes.map((item) => {
      item.setAttr('oldZIndex', item.zIndex());
      if (item.getClassName() === 'Group') {
        const groupChildren = this.toUnfreezeGroup(item, false, false) || [];
        return groupChildren;
      } else {
        return item;
      }
    });
    const layer = this.getLayer();
    const layerRect = layer.getAbsolutePosition();
    let x = Infinity;
    let y = Infinity;
    const layerScale = layer.scale();
    needFreezeNodes = needFreezeNodes.flat(Infinity);
    let needNodes = needFreezeNodes.map((item) => {
      const rect = item.getAbsolutePosition();
      x = Math.min(x, rect.x - layerRect.x);
      y = Math.min(y, rect.y - layerRect.y);
      return item.clone({ draggable: false });
    });
    x = x / layerScale.x;
    y = y / layerScale.y;
    const _childrenZIndex = Math.max(...nodes.map((item) => item.zIndex()));
    // console.log(needNodes, 'needNodesneedNodesneedNodes');
    const _newGroup = new XXCanvas.Group({ x, y });
    needNodes.forEach((item) => {
      item.attrs.x = item.attrs.x - x;
      item.attrs.y = item.attrs.y - y;
    });
    needNodes = needNodes.sort((n1, n2) => {
      return n1.attrs.oldZIndex - n2.attrs.oldZIndex;
    });
    _newGroup.add(...needNodes);
    _newGroup.id(nanoid());
    this.clearTransformer(true);
    this.isMultiple = false;
    // console.log(this);
    this.addChild(_newGroup, true);
    _newGroup.zIndex(_childrenZIndex);
    _newGroup.resetWidth();
    needFreezeNodes.forEach((item) => {
      item.remove();
      item.destroy();
    });
    if (!disabledEmitUI) {
      this.fire('selectChange', {
        typeName: 'tofreeze',
        target: [_newGroup],
        nodes: this.selectedNodes,
      });
      this.fire('nodesChange', {
        typeName: 'tofreeze',
        target: [_newGroup],
        nodes: this.nodeElements,
      });
    }

    return _newGroup;
  }

  getSelectedNodes() {
    let selectBoxs = this.selectNodes;
    selectBoxs = selectBoxs.map((node) => {
      if (node.parent.className === 'Group') {
        return node.parent;
      }
      return node;
    });
    selectBoxs = Array.from(new Set(selectBoxs));
    return selectBoxs;
  }
  /**
   * @description: 解组
   * @param {*} id 组元素
   * @return {*}
   */
  toUnfreezeGroup(node, disabledEmitUI, isNeedTranfomer = true) {
    if (!node || node.getClassName() !== 'Group') return;
    this.clearTransformer(true);
    const zIndex = node.zIndex();
    let children = node.getChildren();
    const nodes = children.map((item, index) => {
      const LayerScale = item.getLayer().scaleX();
      const LayerRotation = item.getLayer().rotation();
      const Rotation = item.getAbsoluteRotation();
      const Scale = item.getAbsoluteScale();
      if (item.attrs.oldZIndex === undefined) {
        item.attrs.oldZIndex = index;
      }
      return item.clone({
        rotation: Rotation - LayerRotation,
        scaleX: Scale.x / LayerScale,
        scaleY: Scale.y / LayerScale,
      });
    });
    this.addNodes(nodes, true, false);
    if (isNeedTranfomer) {
      this.multipleSelectNodes(nodes);
    }
    children = children.sort((n1, n2) => {
      return n2.attrs.oldZIndex - n1.attrs.oldZIndex;
    });
    children.forEach((item) => {
      const Position = item.absolutePosition();
      const newItem = nodes.filter((n) => n.id() === item.id())[0];
      newItem.absolutePosition(Position);
      newItem.zIndex(zIndex);
    });
    node.destroy();
    if (!disabledEmitUI) {
      this.fire('selectChange', {
        typeName: 'toUnfreeze',
        target: nodes,
        nodes: this.selectedNodes,
      });
      this.fire('nodesChange', {
        typeName: 'toUnfreeze',
        target: nodes,
        nodes: this.nodeElements,
      });
    }
    return nodes;
  }

  /**isMultiple
   * @description: 组的缩略图生成
   * @param {*} id
   * @return {*}
   */
  getGroupThumbnails(id) {
    let node = this.getChildById(id);
    if (node?.className !== 'Group') {
      return;
    }
    node = node.clone(true);
    node.children.forEach((item) => {
      if (item.name() === 'Transformer') {
        item.destroy();
      }
    });
    node.setAttrs({
      x: 0,
      y: 0,
      rotation: 0,
      // scaleX: 1,
      // scaleY: 1
    });
    const { scaleX = 1, scaleY = 1 } = node.getAttrs();
    const { width, height } = node.getClientRect();

    // 重新计算缩放值，等比输出140*140的缩略图
    let tmpScale = 1;
    let tmpScaleX = 1;
    let tmpScaleY = 1;
    if (width > 140) {
      tmpScaleX = 140 / width;
    }
    if (height > 140) {
      tmpScaleY = 140 / height;
    }
    tmpScale = Math.min(tmpScaleX, tmpScaleY);
    const newScaleX = tmpScale * scaleX;
    const newScaleY = tmpScale * scaleY;
    node.setAttrs({
      scaleX: newScaleX,
      scaleY: newScaleY,
    });

    const thumbnail = node.toDataURL();
    // console.log('%c Line:980 🌰 thumbnail', 'color:#2eafb0', thumbnail, node.getAttrs());
    return thumbnail;
  }
  /**
   * @description: 清除辅助线
   * @return {*}
   */
  clearSanpDraggable() {
    this.find('.guid-line').forEach((l) => l.destroy());
  }

  /**
   * @description: 获取刀版设计图
   * @param {*} id
   * @return {*}
   */
  async getLayerImage(ops) {
    let { layer, scale = 2, showCover = false, size } = ops;
    let rect;
    if (size) {
      rect = size;
    } else {
      rect = layer.getLayerRect();
    }
    /*
            隐藏刀线
        */
    if (!showCover) {
      layer.find('TopCover').forEach((l) => l.hide());
    } else {
      layer.find('TopCover').forEach((l) => l.show());
    }
    const layerUrl = await getThumbanils(layer, rect, scale);
    return layerUrl;
  }
  /**
   * @description: 获取工艺贴图
   * @param {*} nodes 使用该工艺的元素
   * @param {*} layer
   * @param {*} rect 刀版大小
   * @return {*}
   */
  async getCraftImage(nodes, layer, rect) {
    const children = layer.find('.node');
    for (let i = 0; i < children.length; i++) {
      if (diffNode(nodes, children[i])) {
        children[i].show();
      } else {
        children[i].hide();
      }
    }
    const url = await getThumbanils(layer, rect, 2, true);
    return url;
  }

  /**
   * @description: 获取工艺设计图
   * @param {*} id
   * @return {*}
   */
  async getCraftImageList(layer, size) {
    const craftList = {};
    const craftUrlList = {};
    let rect;
    if (size) {
      rect = size;
    } else {
      rect = layer.getLayerRect();
    }

    // 清除背景
    layer.find('Background').forEach((l) => l.opacity(0));

    // 处理组合问题，组合本身不应该有工艺
    layer.getChildren().forEach((item) => {
      if (item.id() !== 'TopCover' && item.id() !== 'Background' && item.className === 'Group') {
        layer.toUnfreezeGroup(item, false, false);
      }
    });
    const nodes = layer.find('.node');
    nodes.forEach((node) => {
      let { craftDesc, craftId } = node.attrs;
      if (!craftDesc) {
        return;
      }
      craftDesc = craftDesc.split(',');
      craftId = craftId.split(',');
      craftId.forEach((id, index) => {
        const desc = craftDesc[index];
        if (!craftList[id]) {
          craftList[id] = [];
        }
        craftList[id].push(node);
        craftUrlList[id] = {
          id: id,
          craftDesc: desc,
        };
      });
    });
    return new Promise(async (resolve) => {
      const keys = Object.keys(craftList);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const url = await this.getCraftImage(craftList[k], layer, rect);
        craftUrlList[k].url = url;
        // const img = new Image();
        // img.src = url;
        // img.alt = craftUrlList[k].craftDesc;
        // document.body.appendChild(img);
      }
      // 恢复背景
      layer.find('Background').forEach((l) => l.opacity(1));
      resolve(craftUrlList);
    });
  }
  // clone当前节点
  cloneLayer() {
    let selectNodes = [...this.selectNodes];
    this.clearTransformer(true);
    const layer = this.clone({ rotation: 0, x: 0, y: 0 });
    if (selectNodes.length > 1) {
      elsNormalTransformer(this, selectNodes);
      this.selectNodes = selectNodes;
    } else if (selectNodes.length == 1) {
      this.addTransformer(selectNodes[0], true);
    }
    //  清除选中框
    layer.find('.play-select-rect').forEach((node) => {
      node.destroy();
    });
    // 清除标题
    layer.find('.title').forEach((l) => l.destroy());
    // 清除辅助线
    layer.clearSanpDraggable();

    // 处理背景和刀线
    const bg = this.find('Background');
    const cloneBg = layer.find('Background');
    const cover = this.find('TopCover');
    const cloneCover = layer.find('TopCover');
    bg.forEach((item, index) => {
      cloneBg[index].setAttrs(bg[index].attrs);
      cloneCover[index].setAttrs(cover[index].attrs);
    });

    return layer;
  }
  // 获取面的缩略图
  getCoverImage(cover, layerImg) {
    const { left, top, width, height } = cover;
    const { id, surfaceName } = cover.attrs;
    let scaleX = 1;
    let scaleY = 1;
    let scale = 1;
    if (width > 100) {
      scaleX = 100 / width;
    }
    if (height > 100) {
      scaleY = 100 / height;
    }
    scale = Math.min(scaleX, scaleY);
    const imageNode = new XXCanvas.Image({
      image: layerImg,
      x: 0,
      y: 0,
      width: width,
      height: height,
      scaleX: scale,
      scaleY: scale,
      crop: {
        x: left,
        y: top,
        width: width,
        height: height,
      },
    });
    const url = imageNode.toDataURL();
    imageNode.destroy();
    return {
      coverId: id,
      coverName: surfaceName,
      imageUrl: url, // 缩略图地址
      imageId: '', // 缩略图id
    };
  }

  // 获取面的缩略图列表
  async getCoverImageList(covers, layerUrl) {
    const layerImg = new Image();
    covers = covers.filter((item) => {
      return item.attrs.id !== 'cover-0';
    });
    return new Promise((resolve) => {
      layerImg.onload = () => {
        const coverImages = covers.map((cover) => {
          return this.getCoverImage(cover, layerImg);
        });
        resolve(coverImages);
      };
      layerImg.src = layerUrl;
    });
  }
  // 多刀版状态下,截图分割
  cutLevel0Image(imgUrl, scale) {
    const stageInfo = this.getStage()._stageInfo;
    return new Promise((res) => {
      let imgLayer = new Image();
      imgLayer.onload = function () {
        let layers = {};
        for (let k in stageInfo.playInfoMap) {
          let r = stageInfo.playInfoMap[k];
          let { width, height } = r;
          let { x, y } = r.originPoint;
          x = x * scale;
          y = y * scale;
          width = width * scale;
          height = height * scale;
          let url = cutImage(imgLayer, { x, y, width: width, height: height });
          // let img2 = new Image();
          // img2.src = url;
          // document.body.appendChild(img2);
          layers[k] = url;
        }
        res(layers);
      };
      imgLayer.src = imgUrl;
    });
  }
  //多刀版状态截取缩略图
  async getLevel0Charlet(canvasMap, is3d = false, isSava = false) {
    const stageInfo = this.getStage()._stageInfo;
    let scale = isSava || is3d ? 2 : 0.4;
    let { actualSize } = stageInfo;
    // 不在复制刀版，从当前刀版截图
    let layer = this.cloneLayer();
    // 全局设计图
    // if(scale === .4){
    //     var layerUrl = await this.getLayerImage({ layer, size: actualSize,scale;
    // } else {
    const layerUrl = await this.getLayerImage({
      layer,
      size: actualSize,
      scale,
    });
    //}
    const layerImgs = this.cutLevel0Image(layerUrl, scale);
    // 工艺设计图
    if (is3d || isSava) {
      const craftUrls = await this.getCraftImageList(layer);
      var craftImgs = {};
      for (let id in stageInfo.playInfoMap) {
        craftImgs[id] = [];
      }
      for (let id in craftUrls) {
        let item = craftUrls[id];
        let imgs = await this.cutLevel0Image(item.url, 2);
        for (let i in imgs) {
          craftImgs[i].push({
            craftId: id,
            craftName: craftUrls[id].craftDesc,
            imageId: '',
            imageUrl: imgs[i],
          });
        }
      }
      if (!isSava) {
        layer.destroy();
        return Promise.all([layerImgs, craftImgs]);
      }
    }

    // 面截图
    if (isSava) {
      const coverLayerUrl = await this.getLayerImage({
        layer,
        size: actualSize,
        scale: 1,
      });
      const coverLayerImgs = await this.cutLevel0Image(coverLayerUrl, 1);
      const coverListImgs = {};
      for (let id in coverLayerImgs) {
        let covers = canvasMap[id].background.coverList;
        coverListImgs[id] = await this.getCoverImageList(covers, coverLayerImgs[id]);
      }
      layer.destroy();
      return Promise.all([layerImgs, craftImgs, coverListImgs]);
    }
    layer.destroy();
    return Promise.all([layerImgs]);
    //return Promise.all([layerImgs, craftImgs]);
  }
  //单刀版状态截取缩略图
  async getCharlet(coverList, is3d, isSava) {
    let layer = this.cloneLayer();
    let scale = isSava || is3d ? 2 : 0.4;
    const url = await this.getLayerImage({ layer, scale });

    if (is3d) {
      var craftUrls = await this.getCraftImageList(layer);
      if (!isSava) {
        layer.destroy();
        return Promise.all([url, craftUrls]);
      }
    }
    if (isSava) {
      const covers = [...coverList];
      const coverUrl = await this.getLayerImage({ layer, scale: 1 });
      const cover = await this.getCoverImageList(covers, coverUrl);
      //return Promise.reject();
      layer.destroy();
      return Promise.all([url, craftUrls, cover]);
    }
    layer.destroy();
    return Promise.all([url]);
  }
}
