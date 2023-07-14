// noinspection JSCheckFunctionSignatures
import XXCanvas from '@/libs/xxCanvas/index';
import { addImageProcess } from '@/libs/xxCanvas/utils/common';
import { nanoid } from 'nanoid';
import { usePlaygroundStore } from '../../../store/module/usePlayground';
import { useMainStore } from '@/store';
import { themeMap } from '@/assets/less/theme';

// 背景图层类
export class Background extends XXCanvas.Group {
  className = 'Background';
  titleFill = '';
  titleLineHeight = 1.4;

  backgroundColor = '';
  borderColor = '#1E1F1F';
  rootPathId = 'cover-0';
  texture = ''; // 刀版材质
  paths = [];
  imageNum = 0;

  constructor(options) {
    super({ attrs: options.attrs });
    this.initData(options);
    this.initBackgound(options);
    let MainStore = useMainStore();
    this.titleFill = themeMap[MainStore.brand].primary_color;
  }
  // 初始化背景（材质、背景颜色，背景图片）
  initBackgound(options) {
    options.fillColor && this.setBackgroundColor(options.fillColor);
    options.fillImage && this.setBackgroundImage(options.fillImage);
    options.texture && this.setBackgroundTexture(options.texture);

    this.fire('onLoad', { target: 'Background' });
  }

  // 设置材质
  setBackgroundTexture(imgTexture) {
    this.setBackgroundImage(imgTexture, 'cover-texture');
  }

  // color 背景颜色，没有值就是清空
  setBackgroundColor(color) {
    const colorPath = this.findOne('#cover-color');
    this.setAttr('fillColor', color);
    colorPath?.fill(color || null);
  }

  // 设置背景图片/刀版材质
  async setBackgroundImage(url, coverId) {
    coverId = coverId || this.rootPathId;
    const rootSvg = this.findOne('#' + coverId);
    // rootSvg?.moveToTop();
    if (url && rootSvg) {
      rootSvg.fillPatternImage(null);
      try {
        this.setAttr('fillImage', url);
        const imgeObj = typeof url === 'string' ? await addImageProcess(url) : url;
        const backgroundWidth = this.getAttr('width');
        const imgeWidth = imgeObj.width;
        const scale = imgeWidth > backgroundWidth ? backgroundWidth / imgeWidth : 1;
        imgeObj.crossOrigin = 'Anonymous';
        rootSvg.fillPatternImage(imgeObj);
        rootSvg.fillPatternScale({
          x: scale,
          y: scale,
        });
        return true;
      } catch (err) {
        return err;
      }
    } else {
      this.setAttr('fillImage', null);
      rootSvg?.fillPatternImage(null);
      return false;
    }
  }

  // 清空背景 颜色及图片
  clearBackground() {
    this.setBackgroundColor('rgba(0,0,0,0)');
    this.setBackgroundImage(null);
  }
  // 获取背景相关节点
  getNodes() {
    const nodes = [];
    this.paths.forEach(async (item) => {
      item.attrs = {
        ...item.attrs,
        stroke: '',
        fill: '',
        name: item.className === 'Path' ? 'cover' : '',
      };
      const node = new Konva[item.className](item.attrs);
      nodes.push(node);
      if (item.attrs.id === 'cover-0') {
        const nodeCopy = node.clone({
          id: 'cover-color',
          fill: this.backgroundColor,
        });
        nodes.unshift(nodeCopy);
        if (this.texture) {
          const nodeCopy2 = node.clone({ id: 'cover-texture' });
          nodes.unshift(nodeCopy2);
        }
      }
    });
    return nodes;
  }

  initEvent() {
    this.on('tap', () => {
      //this.getLayer().draggable(true);
    });
  }

  // 初始化背景相关图层
  initData({ children, backgroundColor, width, height, texture, name, id, playId, attrs }) {
    //console.log(attrs,'--------')
    if (name) {
      let text = new XXCanvas.Text({
        name: 'title',
        lineHeight: this.titleLineHeight,
        text: name,
        playId: attrs?.playId,
        // wrap: 'none',
        // ellipsis: true,
        width: attrs?.width,
        fill: this.titleFill,
        listening: true,
      });
      text.on('mouseover', (e) => {
        const state = this.getStage();
        if (state.currentStatusLevel !== 'level-0') {
          return;
        }
        const rect = text.getClientRect();
        const container = state.container();
        let titleTootip = container.querySelector('.titleTootip');
        if (!titleTootip) {
          titleTootip = document.createElement('div');
          titleTootip.className = 'titleTootip';
          titleTootip.innerHTML = '双击进入编辑器';
          container.appendChild(titleTootip);
        }
        titleTootip.style.left = rect.x + 'px';
        titleTootip.style.top = rect.y - 40 + 'px';
        titleTootip.style.display = 'block';
        container.style.cursor = 'pointer';
        state.activePlayChange(true, e.target.attrs.playId, true);
      });
      text.on('mouseout', (e) => {
        const container = this.getStage().container();
        let titleTootip = container.querySelector('.titleTootip');
        if (titleTootip) {
          titleTootip.style.display = 'none';
        }
        this.getStage().activePlayChange(false, e.target.attrs.playId, true);
      });
      text.on('mousedown', (e) => {
        if (!e.evt.shiftKey) {
          e.cancelBubble = true;
        }
      });
      text.on('dblclick', (e) => {
        const state = this.getStage();

        if (state.currentStatusLevel !== 'level-0') {
          return;
        }
        e.cancelBubble = true;
        usePlaygroundStore().goToDetail('level-1', attrs?.playId);
        const container = state.container();
        let titleTootip = container.querySelector('.titleTootip');
        if (titleTootip) {
          titleTootip.style.display = 'none';
        }

        //this.getStage().setCurrentPlaygroundId(e.target.attrs.playId)
      });
      text.on('click', (e) => {
        const state = this.getStage();
        if (state.currentStatusLevel !== 'level-0') {
          return;
        }
        const layer = this.getLayer();
        e.cancelBubble = true;
        layer.clearTransformer();
        this.getStage().setCurrentPlaygroundId(e.target.attrs.playId);
      });
      this.add(text);
    }
    if (texture) this.texture = texture;
    this.paths = children;
    this.setAttrs({ width: width, height: height, id: id || nanoid() });
    if (backgroundColor) {
      this.backgroundColor = backgroundColor;
    }
    if (this.paths) {
      const nodes = this.getNodes();
      if (nodes.length > 0) {
        this.add(...nodes);
      }
    }
  }
}
