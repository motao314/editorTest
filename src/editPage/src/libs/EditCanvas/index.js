/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2022-10-13 14:18:02
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-05-09 21:18:19
 * @FilePath: /project-20220906-xiaoxiang/src/XXEditor/src/libs/canvasEdit/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import XXCanvas from '../xxCanvas/index';
import { Playground } from './Playground/index';
import { Background } from './Background/index';
import { TopCover } from './TopCover/index.js';
import AlignmentLayout from './Layout/AlignLayout';
/**
 * @description: 创建刀版画布
 * @return {*}
 */
class EditCanvas extends XXCanvas.Stage {
  currentStatusLevel = 'level-0'; // 'level-0' 全局(整个画布) ，'level-1' 详情 (单刀版)， 'level-2'  详情的详情(选面),'level-3 选中节点 ... 可扩展
  currentPlayId = null; // level-0 全局状态下 无id
  currentFaceId = null; // level-0，level-1，全局状态下/未选中面时  无id,
  titleSizeStyle = {
    fontSize: 16,
    top: 34,
  };
  _stageInfo = {
    defaultPlayId: '', // 默认的放置区域id
    playInfoMap: {}, // 各个画布的宽高大小原点信息
    displayPadding: {}, // 左右最小留白
    actualMargin: 20, // 各个画布之间的间距
    actualSize: {
      // 画布的实际总宽高
      height: 0,
      width: 0,
    },
    displayAllSize: {
      // 整个操作区间 屏幕总宽
      width: '',
      height: '',
    },
    displaySize: {
      // 画布的屏幕总宽高
      height: 0,
      width: 0,
    },
  }; // 初始化信息
  activeBorderColor = '#FF6735';
  activePadding = 5;
  strokeWidth = 1.5;
  constructor({ container, width, height, playList, ...options }) {
    super({ container, width, height });
    this.init({ width, height, playList, ...options });
    this.initEvent();
  }

  /**
   * @description: 获取背景层容器
   * @return {*}
   */
  get UIBackground() {
    this.setDefultPlay();
    return this.findOne('#Background-' + this.currentPlayId);
  }
  /**
   * @description: 获取素材层容器
   * @return {*}
   */
  get UIPlayground() {
    return this.findOne('Playground');
  }
  /**
   * @description: 获取刀线层容器
   * @return {*}
   */
  get UILightBackground() {
    this.setDefultPlay();
    return this.findOne('#TopCover-' + this.currentPlayId);
  }
  /**
   * @description: 现在选中的高亮大小及其原点
   * @return {*}
   */
  get currentActiveSize() {
    if (this.currentPlayId) {
      return this._stageInfo.playInfoMap[this.currentPlayId];
    } else {
      return { ...this._stageInfo.actualSize, originPoint: { x: 0, y: 0 } };
    }
  }

  // 初始化画布
  /**
   *
   * @param {*} background  ={width:刀版图宽，height:刀版图高,coverList:面的路径信息，holeList：孔的路径信息，}
   * @param {*} playground  ={width:刀版图宽，height:刀版图高}
   * @param {*} width  整个画布的宽
   * @param {*} height  整个画布的高
   * @param {*} padding  画布最少需要的上下左右 空隙（但元素可拖到此处） gap<1 為百分比,>1固定值
   *
   * @returns
   */
  init({ playList, width, height, padding, currentStatusLevel, currentPlayId, needAdaptSize }) {
    // console.log(playList,'画布初始化开始咯~~~~~')
    if (!playList) return;
    if (this.UIPlayground) this.UIPlayground.destroyChildren();
    if (playList.length <= 1) {
      this.currentStatusLevel = 'level-1';
      this.currentPlayId = playList[0].id;
    }
    if (currentStatusLevel) {
      this.currentStatusLevel = currentStatusLevel;
    }

    if (currentPlayId) {
      this.currentPlayId = currentPlayId;
    }
    let allGaps = this.currentStatusLevel === 'level-1' ? 0 : padding.gaps;

    //   获取缩放值
    let LayerDisplay = {
      width: width - padding.left - padding.right - allGaps,
      height: height - padding.left - padding.right,
    };
    let LayerAllActual = {
      width: playList.reduce((item1, item2) => {
        return item1 + item2.background.width;
      }, 0),
      height: Math.max(
        ...playList.map((item) => {
          return item.background.height;
        }),
      ),
    };
    let layerScale = this.getAdaptionScale(LayerAllActual, LayerDisplay);
    // 获取 刀版与刀版的间隙
    let actualMargin = allGaps > 0 ? padding.gaps / (playList.length - 1) / layerScale : 0;
    let allBackground = []; // 所有背景刀版Group
    let allTopCover = []; // 所有选中面刀版Group
    let playgroundAllNode = []; // 所有的设计元素
    let playInfoMap = {}; // 画布原点信息保存
    let currentPoint = { x: 0, y: 0 };
    let defaultPlayId;
    playList.forEach((item, i) => {
      if (i === 0) {
        defaultPlayId = item.id;
      }
      let { background, playground } = item;
      let width = background.width;
      const { coverList, holeList, ...bgInfo } = background;
      const backgroundInfo = {
        children: [...coverList],
        ...bgInfo,
        attrs: {
          x: currentPoint.x,
          playId: item.id,
          actualSize: {
            width: width,
            height: background.height,
          },
          name: 'Background-item',
        },
        id: 'Background-' + item.id,
        layer: this.UIPlayground,
      };
      let UIBackground = new Background(backgroundInfo);
      UIBackground.x(currentPoint.x);
      allBackground.push(UIBackground);
      const lightInfo = {
        children: [...holeList, ...coverList],
        attrs: {
          x: currentPoint.x,
          playId: item.id,
          actualSize: {
            width: width,
            height: background.height,
          },
        },
        id: 'TopCover-' + item.id,
      };
      const UITopCover = new TopCover(lightInfo);
      UITopCover.x(currentPoint.x);
      allTopCover.push(UITopCover);
      const children =
        currentPoint.x === 0 && currentPoint.x === 0
          ? playground.children
          : playground.children.map((item) => {
              item.attrs.x = (item.attrs.x || 0) + currentPoint.x;
              // item.attrs.parentPlayId = item.id;
              return item;
            });
      playgroundAllNode = [...playgroundAllNode, ...children];
      playInfoMap[item.id] = {
        originPoint: { ...currentPoint },
        width: width,
        height: background.height,
      };
      currentPoint = {
        x: currentPoint.x + width + actualMargin,
        y: 0,
      };
    });
    const UIBackground = new XXCanvas.Group({
      id: 'Background',
    });
    UIBackground.add(...allBackground);
    const UILightPlayground = new XXCanvas.Group({
      id: 'TopCover',
    });
    UILightPlayground.add(...allTopCover);
    let playInfo = {
      children: playgroundAllNode,
      attrs: {
        scaleX: layerScale,
        scaleY: layerScale,
      },
    };
    let UIPlayground = null;
    if (!this.UIPlayground) {
      UIPlayground = new Playground(playInfo);
      this.add(UIPlayground);
      UIPlayground.initEvent();
      /*
            临时代码：用于给没有添加字体设置的素材，添加默认字体，如果现有数据都被修正后，可以删除
            */
      const texts = UIPlayground.find('Text');
      texts.forEach((text) => {
        if (!text.attrs.fontFamilyId) {
          text.setAttrs({
            fontFamily: '"字由点字典黑55J"',
            fontFamilyId: '714506',
          });
        }
      });
      this.Layout = new AlignmentLayout({ playground: UIPlayground });
      // 初始化画布事件

      this.UIPlayground.on('scaleChange', () => {
        this.setAdaptTitleSize();
        this.setAdaptLineSize();
      });
      this.UIPlayground.on('rotationChange', () => {
        this.setAdaptTitleSize();
      });
    } else {
      UIPlayground = this.UIPlayground;
      this.UIPlayground.setAttrs(playInfo.attrs);
      this.UIPlayground.init(playInfo.children);
    }
    this.setStageInfo({
      playInfoMap: playInfoMap,
      displayPadding: padding,
      actualMargin: actualMargin,
      actualSize: {
        height: LayerAllActual.height,
        width: LayerAllActual.width + actualMargin * (playList.length - 1),
      },
      displaySize: {
        ...LayerDisplay,
      },
      displayAllSize: {
        width,
        height,
      },
      initScale: layerScale,
      defaultPlayId,
    });
    UIPlayground.add(UIBackground);
    UIPlayground.add(UILightPlayground);
    UIBackground.moveToBottom();
    setTimeout(() => {
      // if (needAdaptSize) {
      this.playAdaption({ width, height, padding });
      // }
      this.UIPlayground.fire('init', {});
      this.emitStatusChange('init');
      // console.log(playList,'画布初始化结束咯~~~~~')
      this.UIPlayground.initSnapDraggable();
    }, 100);
  }
  setAdaptLineSize() {
    if (!this.currentPlayId) return;
    this.find('.play-select-rect').forEach((node) => {
      if (!node.visible()) return false;
      let scale = this.UIPlayground.scaleX();
      let padding = this.activePadding / scale;
      let { width, height, originPoint } = this._stageInfo.playInfoMap[this.currentPlayId];
      let newSize = {
        width: width + padding * 2,
        height: height + padding * 2,
        strokeWidth: this.strokeWidth / scale > 1 ? this.strokeWidth / scale : 1,
        x: originPoint.x - padding,
        y: originPoint.y - padding,
      };
      node.setAttrs(newSize);
    });
  }
  // 设置画布上 的布局参数
  setStageInfo(data) {
    this._stageInfo = { ...this._stageInfo, ...data };
  }

  // 适配标题大小
  setAdaptTitleSize() {
    let deg = this.UIPlayground.rotation();
    let height = this._stageInfo.actualSize.height;
    this.find('.title').forEach((node) => {
      let obj = {};
      // 获取需要更新的大小值
      let scale = this.UIPlayground.scaleX() || 1;
      Object.keys(this.titleSizeStyle).forEach((key) => {
        obj[key] = this.titleSizeStyle[key] / scale;
      });
      if (obj.fontSize > 100) {
        obj.fontSize = 100;
      }
      let backgroundItem = node.getParent();
      let width = backgroundItem.attrs.actualSize.width;
      obj.rotation = -deg;
      let gap = this._stageInfo.actualMargin;
      let w = obj.fontSize * node.text().length * 1.1;
      if (deg > 0 && deg <= 90) {
        obj.x = -obj.top;
        obj.y = height;
      } else if (deg > 90 && deg <= 180) {
        obj.x = width;
        obj.y = height + obj.top;
      } else if (deg > 180 && deg <= 270) {
        obj.x = width + obj.top;
        obj.y = 0;
      } else {
        obj.x = 0;
        obj.y = -obj.top;
      }
      obj.width = w;
      delete obj.top;
      // console.log(obj,'rotation')
      node.setAttrs(obj);
    });
  }
  // 获取适配缩放值
  getAdaptionScale({ width, height }, { width: maxWidth, height: maxHeight }) {
    let values = this.changeValue(maxWidth, maxHeight);
    maxWidth = values.value1;
    maxHeight = values.value2;
    let scale = 1;
    if (width / height > maxWidth / maxHeight) {
      scale = maxWidth / width;
    } else {
      scale = maxHeight / height;
    }
    return scale;
  }
  changeValue(value1, value2) {
    let deg = this.UIPlayground?.rotation();
    deg = deg % 360;
    if (deg === 90 || deg === 270 || deg === -90 || deg === -270) {
      let d = value1;
      value1 = value2;
      value2 = d;
    }
    return { value1, value2, deg };
  }
  // 刀版图适配 画布(0,0)原点-> 刀版图的左上角 交点
  playAdaption(newStyle, scale) {
    let width, height, padding, maxWidth, maxHeight;
    if (newStyle) {
      width = newStyle.width;
      height = newStyle.height;
      padding = newStyle.padding;
      maxWidth = width - padding.left - padding.right;
      maxHeight = height - padding.top - padding.bottom;
      this.width(width);
      this.height(height);
      this.setStageInfo({
        displaySize: {
          width: maxWidth,
          height: maxHeight,
        },
        displayAllSize: {
          width: width,
          height: height,
        },
        padding,
      });
    }
    let centerPoint = {
      x: this._stageInfo.actualSize.width / 2,
      y: this._stageInfo.actualSize.height / 2,
    };

    scale = scale || this.getAdaptionScale(this._stageInfo.actualSize, this._stageInfo.displaySize);
    this.setCenterPlayScale(centerPoint, scale);
  }
  // 选面适配
  faceAdaption(faceId) {
    let displaySize = this._stageInfo.displaySize;
    let face = this.UIBackground.paths.find((cover) => cover.attrs.id === faceId);
    let scale = this.getAdaptionScale(face, displaySize);
    let facePosition = {
      x: face.left + face.width / 2,
      y: face.top + face.height / 2,
    };
    this.setCenterPlayScale(facePosition, scale);
  }
  getAdaptionPosCenter(centerPoint) {}
  // 设置画布 已 某个点 为中心
  setCenterPlayScale(centerPoint, scale) {
    this.UIPlayground.scale({ x: scale, y: scale });
    this.UIPlayground.fire('layerScaleChange', {
      newVal: { x: scale, y: scale },
      target: this.UIPlayground,
    });
    let deg = this.UIPlayground?.rotation();
    deg = deg % 360;
    let positionX = 0;
    let positionY = 0;
    const { displayAllSize, actualSize } = this._stageInfo;
    if (deg === 90) {
      positionX = displayAllSize.width / 2 + (actualSize.height - centerPoint.y) * scale;
      positionY = displayAllSize.height / 2 - centerPoint.x * scale;
    } else if (deg === 180) {
      positionX = displayAllSize.width / 2 + centerPoint.x * scale;
      positionY = displayAllSize.height / 2 + centerPoint.y * scale;
    } else if (deg === 270) {
      positionX = displayAllSize.width / 2 - centerPoint.y * scale;
      positionY = displayAllSize.height / 2 + centerPoint.x * scale;
    } else {
      positionX = displayAllSize.width / 2 - centerPoint.x * scale;
      positionY = displayAllSize.height / 2 - centerPoint.y * scale;
    }
    this.UIPlayground.x(positionX);
    this.UIPlayground.y(positionY);
  }
  // 清楚画布选中
  clearStageSelect(disabledEmitUI) {
    this.clearPlayActive(disabledEmitUI);
    this.UIPlayground.clearTransformer(disabledEmitUI);
  }
  /**
   * @description: 初始化画布事件
   * @return {*}
   */
  initEvent() {
    // 点击画布清除选中
    this.on('mousedown', (e) => {
      //     // console.log(e.target);
      e.target.className === 'Stage' && this.UIPlayground.clearTransformer();
    });
    // 在移动端阻止掉画布上的PC事件
    // this.stage.content.addEventListener('touchstart', (e) => {
    //     e.preventDefault();
    // }, { passive: false });
    // 在PC端阻止右键菜单
    window.addEventListener(
      'contextmenu',
      (e) => {
        // 添加自定义菜单
        e.preventDefault();
      },
      { passive: false },
    );
  }
  // 修改状态时抛出的事件
  emitStatusChange(target = 'currentPlayId', disabledEmitUI = false) {
    !disabledEmitUI &&
      this.fire('playStatusChange', {
        level: this.currentStatusLevel,
        currentPlayId: this.currentPlayId,
        currentFaceId: this.currentFaceId,
        target,
      });
  }
  // 模式切换
  setLevel(level, playId, disabledEmitUI = false) {
    if (level === 'level-1' && !playId) return;
    this.currentStatusLevel = level || 'level-0';
    this.currentPlayId = playId || '';
    this.emitStatusChange('level', disabledEmitUI);
  }

  //  选中画布区域 默认是在 全局模式下  // 加高亮
  setCurrentPlaygroundId(id, needClear) {
    if (this.currentPlayId === id) return;
    if (needClear) this.clearStageSelect();
    this.currentPlayId = id || '';
    this.currentFaceId = '';
    if (id) {
      if (this.currentStatusLevel !== 'level-0') return;
      this.activePlayChange(true, id, false);
    }
    this.emitStatusChange('currentPlayId');
  }
  /**
   *
   * @param {*} status 是否展示
   * @param {*} isSolid 是否是实线
   * @param {*} id 高亮的palyId
   */
  activePlayChange(status, id, isHover) {
    if (this.currentStatusLevel !== 'level-0') return;
    let classname = 'play-select-rect-' + (isHover ? 'dash' : 'solid');
    if (status) {
      let node = this.find('.' + classname)?.[0];
      let scale = this.UIPlayground.scaleX();
      let padding = this.activePadding / scale;
      let { width, height, originPoint } = this._stageInfo.playInfoMap[id || this.currentPlayId];
      let newSize = {
        width: width + padding * 2,
        height: height + padding * 2,
        stroke: this.activeBorderColor,
        strokeWidth: this.strokeWidth / scale > 1 ? this.strokeWidth / scale : 1,
        x: originPoint.x - padding,
        y: originPoint.y - padding,
        dash: isHover ? [padding, padding] : [],
      };
      if (node) {
        node.show();
        node.setAttrs(newSize);
      } else {
        let rect = new XXCanvas.Rect({
          name: 'play-select-rect ' + classname,
          ...newSize,
        });
        this.findOne('#Background').add(rect);
      }
    } else {
      if (isHover) {
        this.find('.play-select-rect-dash').forEach((node) => {
          node.hide();
        });
        return;
      }
      this.clearPlayActive();
    }
  }
  // 清空选中状态
  clearPlayActive(disabledEmitUI) {
    this.find('.play-select-rect').forEach((node) => {
      node.hide();
    });
    if (!disabledEmitUI) {
      if (this.currentStatusLevel === 'level-0') this.currentPlayId = null;
      this.emitStatusChange('clearStatus', disabledEmitUI);
    }
  }
  // = 'fillImage'
  getBackground(attrs, playId) {
    if (!playId) {
      this.setDefultPlay();
    }
    let Backgorund = this.findOne('#Background-' + this.currentPlayId);
    let attrsNew = {};
    if ('fillImage' in attrs) {
      attrsNew.fillImage = Backgorund.getAttr('fillImage');
    }
    if ('fillColor' in attrs) {
      attrsNew.fillColor = Backgorund.getAttr('fillColor');
    }
    return attrsNew;
  }
  // 'fillImage fillColor'
  setBackground(attrs, playId) {
    if (!playId) {
      this.setDefultPlay();
      playId = this.currentPlayId;
    }

    let Backgorund = this.findOne('#Background-' + playId);
    let arr = [];
    let attrName = [];
    if ('fillImage' in attrs) {
      arr.push(Backgorund.setBackgroundImage(attrs['fillImage']));
      attrName.push('fillImage');
    }
    if ('fillColor' in attrs) {
      arr.push(Backgorund.setBackgroundColor(attrs['fillColor']));
      attrName.push('fillColor');
    }
    return Promise.all(arr).then((res) => {
      this.fire('backgroundChange', { target: playId, value: attrs });
    });
  }
  // -------------- 面 -----------
  setFaceLight(playId, coverId) {
    this.findOne('#TopCover-' + (playId || this.currentPlayId))?.setLightCover(coverId);
  }
  setFaceHover(playId, coverId) {
    this.findOne('#TopCover-' + playId || this.currentPlayId)?.setHoverCover(coverId);
  }
  //  选中面 默认是在 单刀版模式下
  setFaceId(parentId, id, level) {
    if (!parentId && !id) {
      this.currentFaceId = '';
      this.currentStatusLevel = 'level-1';
      this.playAdaption({
        ...this._stageInfo.displayAllSize,
        padding: this._stageInfo.displayPadding,
      });
    } else {
      this.currentPlayId = parentId;
      this.currentFaceId = id;
      this.currentStatusLevel = level || 'level-2';
      this.faceAdaption(id);
    }
    this.setFaceLight(parentId, id);
    this.emitStatusChange();
  }

  getFaceNodeReact(playId, id) {
    return this.findOne('#TopCover-' + playId)
      .findOne('#' + id)
      .getClientRect({ relativeTo: this.UIBackground });
  }

  // 设置节点 所属的PlayId，且返回PlayId
  setNodePlayId(node, isClearPlayActive) {
    let { x, y, width, height } = node.getClientRect({
      relativeTo: this.UIPlayground,
    });
    let center = {
      x: x + width / 2,
      y: y + height / 2,
    };
    let info = this._stageInfo;

    let parentPlayId = null;
    let minDistance = null;
    Object.keys(info.playInfoMap).forEach((key) => {
      let item = info.playInfoMap[key];
      let { x, y } = item.originPoint;
      let points = [
        item.originPoint,
        { x: x + item.width, y },
        { x: x, y: y + item.height },
        { x: x + item.width, y: y + item.height },
      ];
      points.forEach((p) => {
        let dx = Math.abs(p.x - center.x);
        let dy = Math.abs(p.y - center.y);
        let distance = Math.pow(dx, 2) + Math.pow(dy, 2);

        if (!minDistance || distance < minDistance) {
          parentPlayId = key;
          minDistance = distance;
        }
      });
    });

    // let playId = Object.keys(info.playInfoMap).find((key) => {
    //     let item = info.playInfoMap[key]
    //     let isIn = (center.x >= item.originPoint.x
    //         && center.x <= item.originPoint.x + item.width
    //         && center.y >= item.originPoint.y
    //         && center.y <= item.originPoint.y + item.height)
    //     return isIn
    // })
    // let parentPlayId = playId ? playId : isNeedDefult ? info.defaultPlayId : ''
    node.setAttrs({
      parentPlayId: parentPlayId,
    });
    if (!isClearPlayActive) {
      if (parentPlayId !== this.currentPlayId) {
        this.activePlayChange(true, parentPlayId);
      }
    } else {
      this.clearPlayActive();
    }
    return parentPlayId;
  }
  // 获取每个元素的json数据
  getEveryPlayChildren() {
    let palyChidrenMap = {};
    this.UIPlayground.nodeElements.map((node) => {
      let playId = node.getAttr('parentPlayId') || this._stageInfo.defaultPlayId;
      if (!palyChidrenMap[playId]) palyChidrenMap[playId] = [];
      let info = this.getNodeJson(node);
      info.attrs.x = info.attrs.x - this._stageInfo.playInfoMap[playId].originPoint.x;
      palyChidrenMap[playId].push(info);
      return info;
    });
    return palyChidrenMap;
  }
  // 获取元素的json数据
  getNodeJson(item, isNeedZIndex) {
    const itemAttr = { ...item.getAttrs() };
    if (isNeedZIndex) {
      itemAttr.zIndex = item.zIndex();
    }
    const ele = { attrs: itemAttr, className: item.getClassName() };
    const rect = item.getClientRect({ relativeTo: this.UIPlayground });
    ele.attrs.left = rect.x;
    ele.attrs.top = rect.y;
    ele.attrs.zIndex = item.zIndex();
    if (item.getClassName() === 'Group') {
      ele.attrs.width = rect.width;
      ele.attrs.height = rect.height;
      ele.children = [...item.getChildren()]
        .filter((childItem) => childItem.className === 'Text' || childItem.className === 'Image')
        .map((child) => {
          return this.getNodeJson(child);
        });
    }
    return ele;
  }

  // 选中默认刀版
  setDefultPlay() {
    if (!this.currentPlayId) {
      this.setCurrentPlaygroundId(this._stageInfo.defaultPlayId);
    }
  }
}

export default EditCanvas;
