import { defineStore } from 'pinia';
import { LAYERS_MODE } from '@/utils/constant';
import { useMainStore } from '@/store';
import XXCanvas from '@/libs/xxCanvas';
import { addImageProcess } from '@/libs/xxCanvas/utils/common';
import Historys from './historys';
import { useCharlet } from './useCharlet';
import { message } from 'ant-design-vue';
import { nanoid } from 'nanoid';

export const usePlaygroundStore = defineStore('layersData', {
  state: () => {
    return {
      // 初始化 转换出的数据
      // 模型列表
      models: [],
      // 部件列表
      boxs: [],
      // 刀版列表
      layouts: [],
      // 图层数据
      layers: [],
      // ------------ 初始化后 不动上面的所有数据-------------
      Image3d: null, // 3d盒型图
      image3dId: null,
      // 当前 部件id
      boxId: null,
      // 当前 刀版id   当为 layoutId时，则是进入到了 详情
      layoutId: '',
      // 现在展示的 状态
      canvasLevel: 'level-0',
      // 选中的刀版Id
      selectLayoutId: '',
      // 选中的面Id
      selectFaceId: null,
      // obverse正 reverse反
      boxsImageMap: {
        boxId: {
          imageUrl: '',
        },
      },
      // 刀版图画布数据
      canvasMap: {
        layoutId: {
          playgroundId: '', // 刀版设计内容id
          background: {
            fillColor: null, // 背景颜色
            fillImage: null, // 背景图片
          }, // 背景实时数据
          playground: {
            children: [], // 操作画布 图层 实时数据
          },
          playgroundImg: {
            image2DId: null, // 2d生成的含设计的图 id
            image2DUrl: null, // 2d生成的含设计的图 url
          },
          coverPreviewMap: [
            // 有效面缩略图
            {
              coverId: '',
              coverName: '',
              imageUrl: '', // 缩略图地址
              imageId: '', // 缩略图id
            },
          ],
          nodePreviewMap: [
            // 带工艺的图层
            {
              craftId: '', // 工艺id
              imageUrl: '', // 缩略图地址
              imageId: '', // 缩略图id
              craftName: '', // 工艺名称
            },
          ],
          scale: 1, // 画布缩放比例
        },
        all: {
          canvas: null, // 始终在这个位置拿画布   konva画布实
          playground: {
            children: [],
          },
        },
      },
      currentUIHistory: null, // 始终这个历史记录实例
      selectedAllNode: [], // 页面选中的所有元素(含锁定，组合为一个元素)
      clickTargetNode: [], // 页面最后点击时的元素（含组内点击元素含锁定元素)

      // 拷贝的属性
      nodesAttrsCopy: [],
      // 历史记录的长度
      historyLength: 0,
      // 历史记录的当前位置
      historyCurIndex: -1,
      // 组的缩略图
      // groupThumbnails: new Set(),
      slecetTimestape: Date.now(),
      nodesChangeTimestape: Date.now(),
      attrsChangeTimestape: Date.now(),
      canvasContainerStyle: {},
      // 鼠标右键相关信息
      mouseMenuInfos: {
        visibled: false, // 打开右键菜单
        position: {
          // 右键的位置
          x: 0,
          y: 0,
        },
        isElement: false,
      },
      // 画布当前缩放值
      pageScaleValue: { x: 1, y: 1 },
      // 舞台当前的位置
      pagePosition: {},
      // 裁剪图片的弹窗控制
      cutImageInfos: {
        visibled: false,
        cutImageDatas: '',
      },
      isRenderEnd: false,
    };
  },
  getters: {
    currentSelectedNodeIsLock() {
      let nodes = this.selectedAllNode;
      let isLock = false;
      if (nodes && nodes.length > 0) {
        isLock = nodes[0].getAttr('lock');
      }
      return isLock;
    },

    // 页面点击时的元素（含组内点击元素不含锁定)
    clickNode() {
      return this.clickTargetNode.filter((node) => {
        return !node.getAttr('lock');
      });
    },
    selectedNode() {
      return this.getSelectedNode().filter((node) => {
        return !node.getAttr('lock');
      });
    },
    currentBackgroundImg() {
      return this.canvasMap?.[this.layoutId]?.background?.img;
    },
    // 当前画布的所有图层列表 操作数据
    currentLayerList() {
      return this.canvasMap?.[this.layoutId || 'all']?.playground?.children || [];
    },
    // 现在画布的缩放比列
    getCurrentCanvasScale() {
      // console.log('%c 现在展示 🙂currentCanvasMap刀版图层数据', '#2323bc', this.currentUIPlayground?.UIPlayground?.scaleX() || 1);
      return this.pageScaleValue?.x || 1;
    },
    // 现在的刀版图层数据
    currentCanvasMap() {
      //console.log(this.layoutId, '现在展示 🙂currentCanvasMap刀版图层数据', this.selectLayoutId, '-------');
      return this.canvasMap[this.layoutId || this.selectLayoutId] || null;
    },
    // 现在操作的画布
    currentUIPlayground() {
      return this.canvasMap['all']?.canvas?.UIPlayground || null;
    },

    // 现在整个编辑器satage
    currentStage() {
      return this.canvasMap['all']?.canvas || null;
    },

    // 是否可以解组
    isNeedUnbind() {
      if (this.selectedNode && this.selectedNode.length === 1) {
        return this.selectedNode[0].getClassName() === 'Group';
      } else {
        return false;
      }
    },
    // 是否需要合组
    isNeedBind() {
      return this.selectedNode.length > 1;
    },
    // 是否多选
    isMultiple() {
      return this.currentUIPlayground?.isMultiple;
    },
    undoDisabled() {
      return this.historyLength <= 0 || (this.historyLength > 0 && this.historyCurIndex < 0);
    },
    redoDisabled() {
      return this.historyCurIndex >= this.historyLength - 1;
    },
  },
  actions: {
    resetHistory() {
      // 历史记录的长度
      this.historyLength = 0;
      // 历史记录的当前位置
      this.historyCurIndex = -1;
      this.currentUIHistory.reset();
    },
    /**
     * 设置裁剪相关信息
     * @param {*} infos
     */
    setCutImageVisibledInfos(infos) {
      Object.keys(infos).map((keyname) => {
        this.cutImageInfos[keyname] = infos[keyname];
      });
    },
    // 设置右键信息
    setMouseMenuInfos(infos) {
      Object.keys(infos).map((keyname) => {
        this.mouseMenuInfos[keyname] = infos[keyname];
      });
    },
    // 获取画布 布局样式
    getPadding(displaySize, level) {
      if (displaySize) this.canvasContainerStyle = displaySize;
      let { width, height } = this.canvasContainerStyle;
      level = level || this.canvasLevel;
      let i = level === 'level-0' ? 0.05 : 0.15;
      let gaps = level === 'level-0' ? width * (1 - i * 2) * 0.2 : 0;
      const padding = {
        left: width * i,
        right: width * i,
        top: height * i,
        bottom: height * i,
        gaps,
      };
      return padding;
    },
    // 重绘
    clearAndDraw(level, id, playList) {
      let padding = this.getPadding(this.canvasContainerStyle, level);
      this.currentStage.init({
        ...this.canvasContainerStyle,
        padding: padding,
        playList,
        currentStatusLevel: level,
        currentPlayId: id,
        needAdaptSize: true,
      });
    },
    // 返回全局
    goToAll(level, id, isCharlet = true) {
      isCharlet && useCharlet().getCharlet(true);
      let playList = this.layouts.map((item) => {
        return {
          playground: this.canvasMap[item.id].playground,
          id: item.id,
          background: {
            ...this.canvasMap[item.id].background,
            name: this.canvasMap[item.id].name,
          },
        };
      });
      this.clearAndDraw(level, '', playList);
      this.resetHistory();
    },
    // 进入详情
    goToDetail(level, playId) {
      //console.log(level);
      this.getLevel0JSON();
      let { playground, id, background } = this.canvasMap[playId];
      this.clearAndDraw(level, playId, [
        {
          playground,
          id,
          background: {
            ...background,
            name: this.canvasMap[playId].name,
          },
        },
      ]);
      this.resetHistory();
    },
    //  全局状态下需要去获取的元素
    getLevel0JSON() {
      let playNodeMap = this.currentStage.getEveryPlayChildren();
      this.layouts.forEach((layout) => {
        let playId = layout.id;
        this.canvasMap[playId].playground.children = playNodeMap[playId] || [];
      });
    },
    // 设置3d缩略图
    setBoxPreview(boxsImageMap, Image3d) {
      this.boxsImageMap = boxsImageMap;
      // console.log(boxsImageMap, Image3d);
      if (!Image3d && this.boxs.length === 1) {
        Image3d = this.boxsImageMap?.[this.boxs[0]?.id]?.imageUrl;
      }
      this.Image3d = Image3d || null;
      // let img = new Image();
      // img.src = Image3d;
      // document.body.appendChild(img);
    },

    /**
     * 切换图层选中/去选中状态
     * @param {String} layer 点击的图层id
     * @param {Boolean} isSelect 是否选中
     * @returns
     */
    toggleSelected(id, isSelect) {
      // 选中
      if (!isSelect) {
        this.currentUIPlayground.addTransfomerById(id, false, 'select', true);
      } else {
        this.currentUIPlayground.removeTransformerById(id);
      }
    },
    // 选面高亮
    setLightBackgroud(layoutId, faceId) {
      this.currentStage?.setFaceId(layoutId, faceId);
    },
    // 选刀版
    setPlayId(id) {
      this.currentStage.setCurrentPlaygroundId(id, true);
    },
    /* ---------------- 左侧面板  画布 的操作 -------------------------- */
    beforeAddNodeReturn() {
      const MainStore = useMainStore();
      let type = MainStore.LeftSideType;
      if (type !== 'BoxType' && type !== 'Template') {
        if (!MainStore.templateId || !MainStore.templateId.trim()) {
          message.warn('请先选择盒型 / 模板。');
          return true;
        }
      }
      return false;
    },
    // 加组
    addGroup(data, isRecord = true) {
      if (this.beforeAddNodeReturn()) return;
      // console.log(data, '复合元素数据');
      if (data.displaySize) {
        let scale = this.currentUIPlayground.scaleX();
        let nowDisplayW = data.attrs.width * scale;
        let nowScale = data.displaySize.width / nowDisplayW;
        data.attrs.scaleX = nowScale;
        data.attrs.scaleY = nowScale;
      }
      data.attrs.id = nanoid();
      const node = new XXCanvas.Group(data, this.currentUIPlayground);
      return new Promise((resolve, reject) => {
        this.currentUIPlayground.addChildToCenter(node);
        resolve(true);
      });
    },
    /**
     * 加图片
     * @param {String} url 图片地址previewUrl
     * @param {String} srcId 图片地址Id
     * @param {String} materialId 图片id
     * @param {String} materialDesc 图片名称
     * @param {String} displaySize 在页面大小，加入画布视觉也是这个大小
     *
     */
    async addImage({ url, srcId, materialId, materialDesc, displaySize }, isRecord = true) {
      // console.log('addImage----------------', { url, srcId, materialId, materialDesc, displaySize });

      if (this.beforeAddNodeReturn()) return;
      // console.log('addImage', { url, srcId, materialId, materialDesc, displaySize });

      return addImageProcess(url)
        .then((image) => {
          // 素材默认显示的大小为整个刀版的1/3。即按照素材的长度为刀版默认长度的1/3，宽度自适应适配。
          let scale = this.currentUIPlayground.scaleX();
          const height = displaySize.height / scale;
          const width = displaySize.width / scale;
          const attrs = {
            image,
            url,
            srcId,
            materialId,
            materialDesc,
            height,
            width,
          };
          attrs.originData = { ...attrs };
          const newImage = new XXCanvas.Image(attrs);
          newImage.setAttrs({
            x: 0,
            y: 0,
          });
          requestAnimationFrame(() => {
            this.currentUIPlayground.addChildToCenter(newImage);
          });
          //this.addRecord(null, isRecord, 'add')([newImage]);
        })
        .catch((err) => {
          console.warn(err);
          alert(url + '图片不允许访问');
        });
    },
    /**
     * 指定位置加图片
     * @param {String} url 图片地址previewUrl
     * @param {String} srcId 图片地址Id
     * @param {String} materialId 图片id
     * @param {String} materialDesc 图片名称
     * @param {String} displayRect 在页面位置大小，加入画布视觉也是这个大小
     *
     */
    async addImgToPos(config) {
      if (this.beforeAddNodeReturn()) return;
      this.currentUIPlayground.addImgToPos(config);
    },
    async addGroupToPos(config) {
      if (this.beforeAddNodeReturn()) return;
      this.currentUIPlayground.addGroupToPos(config);
    },
    // 加文字
    addText(text, isRecord = true) {
      if (this.beforeAddNodeReturn()) return;
      let fontSize = 75;
      const layerRect = this.currentUIPlayground.getLayerRect();
      fontSize = Math.round(fontSize * (layerRect.width / 1000));
      fontSize = Math.min(fontSize);
      const width = text.length * fontSize > fontSize * 8 ? fontSize * 8 : text.length * fontSize;
      const options = {
        text: text || '请输入文字',
        fontSize,
        width,
        fill: '#000000',
        lineHeight: 1.5,
        align: 'center',
        fontFamily: '字由点字典黑55J',
        fontFamilyId: '714506',
      };
      options.originData = { ...options };
      const child = new XXCanvas.Text(options);
      this.currentUIPlayground.addChildToCenter(child);
      this.addRecord(null, isRecord, 'add')([child]);
    },

    //  画布背景操作 fillImage fillColor
    setBackground(attrs, isRecord = true) {
      if (this.beforeAddNodeReturn()) return;
      const oldAttrs = this.currentStage.getBackground(attrs);
      let playId = this.selectLayoutId;
      this.addRecord(
        [{ background: { ...oldAttrs, playId } }],
        isRecord,
        'edit',
        'background',
      )([{ background: { ...attrs, playId } }]);
      return this.currentStage.setBackground(attrs, playId);
    },

    // ----------------右侧侧面板  对设计元素操作------------------------
    // 成组
    tofreezeGroup() {
      this.currentUIPlayground.tofreezeGroup(this.selectedNode);
    },
    // 解组
    toUnfreezeGroup() {
      this.currentUIPlayground.toUnfreezeGroup(this.getSelectedNode()[0]);
    },

    // 对齐
    nodeAlgin(typeName, isRecord = true) {
      if (!this.selectedNode || !this.selectedNode[0]) {
        // console.error('没有选中 图层');
        return false;
      }

      let addAfterRecord = this.addRecord(this.selectedNode, isRecord);
      if (this.selectedNode.length > 1) {
        this.currentStage.Layout.nodesAlgin(this.selectedNode, typeName);
      } else {
        this.currentStage.Layout.nodeAlginToLayer(this.selectedNode[0], typeName);
      }

      addAfterRecord(this.selectedNode);
      addAfterRecord = null;
    },
    /*设置层级*/
    setZIndex(type = 'add', isRecord = true) {
      // zIndex 越大越在后面
      let nodes = this.getSelectedNode();
      let addAfterRecord = this.addRecord(nodes, isRecord, 'edit');
      let num = type === 'up' && type === 'top' ? 1 : -1;
      //  先升序排练，再从最底下的往上面 提高层次
      nodes
        .sort((a, b) => {
          return num > 0 ? b.zIndex() - a.zIndex() : a.zIndex() - b.zIndex();
        })
        .forEach((item) => {
          let findLayerIndex = this.currentLayerList.findIndex((node) => node.attrs.id === item.id());
          switch (type) {
            case 'up':
              if (findLayerIndex < this.currentLayerList.length - 1) {
                let index = this.currentLayerList[findLayerIndex + 1].attrs.zIndex;
                item.zIndex(index);
              }
              break;
            case 'down':
              if (findLayerIndex > 0) {
                let index = this.currentLayerList[findLayerIndex - 1].attrs.zIndex;
                item.zIndex(index);
              }
              break;
            case 'top':
              item.zIndex(this.currentLayerList[this.currentLayerList.length - 1].attrs.zIndex);

              break;
            case 'bottom':
              item.zIndex(this.currentLayerList[0].attrs.zIndex);

              break;
            default:
              break;
          }
        });
      addAfterRecord(this.selectedNode);
      addAfterRecord = null;
      this.getLayerNodes();
    },

    /**
     * 现在选中的图层 ->每个图层设置多个属性 统一值
     * @param {Object} attrs 属性值映射值
     * @param {Boolean} isRecord 是否加入历史记录
     * @param {Boolean} nodes 目标元素
     */
    setCurrentNodeAttrs(attrs, isRecord = true, nodes) {
      const nodeList = nodes || this.selectedNode;
      let addAfterRecord = this.addRecord(this.nodeList, isRecord, 'edit');
      nodeList.forEach((node) => {
        node.setAttrs(attrs);
      });
      addAfterRecord(this.nodeList);
      addAfterRecord = null;
      this.currentUIPlayground.fire('attrsChange', {
        typeName: 'attr',
        target: nodeList,
        isRecord: false,
      });
    },
    /**
     * 现在选中的图层 -> 每个图层设置属性 累加值
     * @param {String} attrName 属性方法名
     * @param {Number} value 之前的基础上 增加的值
     * @param {Boolean} isRecord 是否加入历史记录
     */
    setCurrentNodeAttrAdd(attrName, value, isRecord = true) {
      let nodes = this.getSelectedNode();
      //let addAfterRecord = this.addRecord(nodes, isRecord, 'edit');
      let isMove = false;
      nodes.forEach((node) => {
        if (!node.attrs.lock) {
          const newValue = node[attrName]() + value;
          node[attrName](newValue);
          isMove = true;
        }
      });
      if (isMove) {
        // addAfterRecord(nodes);
        // addAfterRecord = null;
        this.currentUIPlayground.fire('attrsChange', {
          typeName: 'setCurrentNodeAttrAdd',
          target: nodes,
        });
      }
    },
    /**
     * 现在选中的图层 ->每个图层设置属性 设置相同的值
     * @param {String} attrName 属性方法名
     * @param {Number} value 设置相同的值
     * @param {Boolean} isRecord 是否加入历史记录
     */
    setCurrentNodeAttr(attrName, value, isRecord = true) {
      let nodes = this.selectedNode;
      let addAfterRecord = null;
      if (isRecord) {
        addAfterRecord = this.addRecord(nodes, isRecord, 'edit');
      }
      nodes.forEach((node) => {
        node[attrName](value);
      });
      isRecord && addAfterRecord(this.selectedNode);
      addAfterRecord = null;
      this.currentUIPlayground.fire('attrsChange', {
        typeName: 'attr',
        target: nodes,
      });
    },

    // 设置点击的目标元素属性
    setClickNodeAttr(attr, val, isRecord = true) {
      const node = this.clickNode[0];
      // console.log('当前元素', node);
      if (node) {
        let addAfterRecord = null;
        // if (isRecord) {
        //     addAfterRecord = this.addRecord([node], isRecord, 'edit');
        // }
        node.setAttr(attr, val);
        // isRecord && addAfterRecord([node]);
        // addAfterRecord = null;
        this.currentUIPlayground.fire('attrsChange', {
          typeName: 'setClickNodeAttr',
          target: [node],
          isRecord,
        });
      }
    },
    // 设置横竖排
    setClickNodeWriteMode(mode, isRecord = true) {
      const node = this.clickNode[0];
      // console.log('当前元素', node);
      if (node) {
        let addAfterRecord = this.addRecord([node], isRecord, 'edit');
        this.currentUIPlayground.clearTransformer();
        node.writeMode(mode);
        this.currentUIPlayground.addTransformer(node);
        addAfterRecord([node]);
        addAfterRecord = null;
        // this.getLayerNodes();
        this.currentUIPlayground.fire('attrsChange', {
          typeName: 'attr',
          target: [node],
        });
      }
    },
    // 设置 但前点击的元素属性，争对 组内元素 设置
    setClickNodeAttrs(obj, isRecord = true) {
      const node = this.clickNode[0];
      // console.log('当前元素', node.getAttr('url'));
      if (node) {
        let addAfterRecord = this.addRecord([node], isRecord, 'edit');
        node.setAttrs(obj);
        addAfterRecord([node]);
        addAfterRecord = null;
        this.currentUIPlayground.fire('attrsChange', {
          typeName: 'attr',
          target: [node],
          isRecord: false,
        });
      }
      // console.log('设置属性', obj);
      // console.log('设置后的节点是否已经改掉', this.clickNode[0].getAttr('url'));
    },
    // 旋转当前点击元素
    setClickNodeRotation(obj, isRecord = true) {
      let node = this.getSelectedNode()[0];
      if (node) {
        let addAfterRecord = this.addRecord([node], isRecord, 'edit');
        node.setAttrs(obj);
        addAfterRecord([node]);
        addAfterRecord = null;
        this.currentUIPlayground.fire('attrsChange', {
          typeName: 'attr',
          target: [node],
          isRecord: false,
        });
      }
    },
    //获取当前画布的选中元素，经过组的过滤
    getSelectedNode() {
      if (!this.currentUIPlayground) {
        return [];
      }
      let selectNode = this.currentUIPlayground.selectNodes;
      selectNode = selectNode.map((node) => {
        if (node.parent.className === 'Group') {
          return node.parent;
        }
        return node;
      });
      return Array.from(new Set(selectNode));
    },
    /* ---------------- 监听画布事件-------------------------- */
    // 获取画布图层 信息
    getLayerNodes(isOntime = true) {
      const nodes = this.currentUIPlayground.nodeElements;
      if (!this.canvasMap[this.layoutId || 'all'].playground) {
        this.canvasMap[this.layoutId || 'all'].playground = {};
      }
      this.canvasMap[this.layoutId || 'all'].playground.children = nodes.map((node) => {
        return this.currentStage.getNodeJson(node);
      });
      isOntime && this.copyNodeAttrs();
      //console.log('%c Line:388 🌮 现在画布上的元素', 'color:#2eafb0', this.canvasMap[this.layoutId].playground.children);
    },
    onStageEvent() {
      this.onEventSelect();
      this.onEventNodesChange();
      this.onEventAttrChange();
      this.onEventMultipleChange();
      this.onPlayStatusChange();
      this.onStageBackgroundChange();
    },
    onStageBackgroundChange() {
      this.currentStage.on('backgroundChange', ({ target, value }) => {
        Object.keys(value).forEach((key) => {
          this.canvasMap[target].background[key] = value[key];
        });
        // const MainStore = useMainStore();
        // MainStore.onAutoSave()
      });
    },
    onPlayStatusChange() {
      this.currentStage.on('playStatusChange', ({ level, currentPlayId, currentFaceId, target }) => {
        // console.log("change", level);
        this.selectLayoutId = currentPlayId;
        this.selectFaceId = currentFaceId;
        this.canvasLevel = level;
        this.layoutId = level === 'level-0' ? '' : currentPlayId;
      });
    },

    // 单多选切换
    onEventMultipleChange() {
      this.currentUIPlayground.on('multipleStatusChange', ({ typeName, target, nodes, value }) => {
        // console.log('ui 🙌单多选改变multipleStatusChange', typeName, target, nodes);
      });
    },
    // 画布选中元素事件
    onEventSelect() {
      this.currentUIPlayground.on('clickAgain', (e) => {
        // console.log('🤳再次点击clickAgain', e);
        // if (e.typeName === 'Image') {
        // console.log('单选状态下 点击第二次进入 替换 图片');
        // } else if (e.typeName === 'Text') {
        // console.log('单选状态下 点击第二次进入 编辑文字');
        //
        // }
      });
      this.currentUIPlayground.on('selectChange', ({ typeName, target, nodes, ignoreScroll }) => {
        this.slecetTimestape = Date.now();
        this.clickTargetNode = target;
        this.selectedAllNode = nodes;
        //console.log('💕点击的元素', this.clickNode);
        // console.log('🐱‍🚀选中的所有元素', this.selectedAllNode);
        // console.log('🤷‍♀️选中的过滤锁定的元素', this.selectedNode);
        // this.copyNodeAttrs()
      });

      this.currentUIPlayground.on('mouseMenu', ({ typeName, target, nodes, isElement, evt }) => {
        // console.log('ui🙂鼠标右键 mouseMenu', typeName, target, nodes, isElement, evt);

        // 获取右键的菜单位置
        let clientX = evt.clientX;
        let clientY = evt.clientY;
        let isTitle = target.name() == 'title';
        // 多选的话暂时不出来（包小盒同步）
        if (this.isMultiple || isTitle) {
          return false;
        }
        this.setMouseMenuInfos({
          visibled: true,
          position: {
            x: clientX,
            y: clientY,
          },
          isElement,
        });
      });

      this.currentUIPlayground.on('layerScaleChange', (e) => {
        // console.log('scaleChange',e)
        // if(typeName === 'scaleChange') { // 不知道从哪里触发两次，一个typeName undefined 一个是scaleChange，暂时先这样兼容一下
        this.pageScaleValue = e.newVal;
        // }
      });
      this.currentUIPlayground.on('nodedrag', ({ typeName, target, nodes, position }) => {
        // console.log('缩放',typeName,target, nodes)
        if (typeName === 'drag' || typeName === 'transform') {
          // console.log(nodes.getAttr('scaleX'))
          this.pagePosition = position;
        }
      });
    },

    // 画布上元素操作后改变样式事件
    onEventAttrChange() {
      /**
       * attrsChange 事件返回的信息明细
       * @param {String} typeName 类型
       * dragend :拖动结束，变动的属性：x y
       * transformend: 拉伸，旋转结束， 变动的属性：scaleX，scaleY,rotation,skewX,skewY
       * nodesAlign:对齐，变动属性 x y
       * lock:锁定，变动的属性：lock
       * @param {Array} target 操作的元素
       * @param {Array} nodes 画布上的元素
       */

      this.currentUIPlayground.on('attrsChange', ({ typeName, target, nodes, isRecord = true }) => {
        // 可优化{ typeName: 'transforme', target: [node], nodes: this.nodeElements }
        if (typeName !== 'lock' && typeName !== 'editText' && isRecord) {
          // 属性改变之前的记录
          let targetOldData = [];
          target.map((tItem) => {
            let targetItem = this.nodesAttrsCopy.find((item) => {
              return tItem.id() === item.id;
            });
            if (targetItem) {
              targetOldData.push({
                attrs: targetItem,
              });
            }
          });
          // 锁定这个动作不需要记录
          // 文字输入过程中不需要保存
          //console.log(targetOldData,target);
          this.addRecord(targetOldData, true, 'edit')(target);
        }
        this.copyNodeAttrs();
        this.getLayerNodes();
        // const MainStore = useMainStore();
        // MainStore.onAutoSave()
        this.attrsChangeTimestape = Date.now();
      });

      // 元素开始拖拽
      this.currentUIPlayground.on('nodedragstart', ({ typeName, target, nodes, isRecord = true }) => {
        //console.log("dragsrart");
        this.copyNodeAttrs();
      });
    },

    // 组内图片全部加载完成
    // onEventImagesLoaded() {
    //     this.currentUIPlayground.on('onAllImagesLoaded', ({ id }) => {
    //         setTimeout(() => {
    //             this.groupThumbnails.add(id);
    //         }, 100);
    //     });
    // },
    //  画布上 元素 数量变化事件
    onEventNodesChange() {
      /**
       * nodesChange 事件返回的信息明细
       * @param {String} typeName 类型
       * add:增加，target返回的是增加的元素
       * delete:删除，target返回的是删除的元素
       * clone:删除，target返回的是复制出来放到画布的元素
       * toUnfreeze :解组，target返回的是解组后的元素
       * tofreeze: 组合，target返回的是组合后的元素
       * @param {Array} target 操作后元素
       * @param {Array} nodes 画布上的元素
       */
      this.currentUIPlayground.on('nodesChange', ({ nodes, typeName, target }) => {
        this.getLayerNodes();
        if (typeName === 'delete') {
          this.addRecord(target, true, 'del')();
          this.clickTargetNode = [];
          this.selectedAllNode = [];
        }
        if (typeName === 'clone') {
          this.addRecord(null, true, 'add')(target);
        }
        if (typeName === 'add') {
          this.addRecord(null, true, 'add')(target);
        }
        // const MainStore = useMainStore();
        // MainStore.onAutoSave()
        this.nodesChangeTimestape = Date.now();
      });
    },

    /** ********************* 历史记录 ********************** **/
    /**
     * 复制一份当前节点的副本
     * 兼容画布上的操作数据记录
     */
    copyNodeAttrs() {
      const nodes = this.currentUIPlayground.nodeElements;
      this.nodesAttrsCopy = this.getAttrsByNodes(nodes);
      //console.log('复制的节点数据', nodes,this.nodesAttrsCopy);
    },
    /**
     * 获取指定节点的属性数据
     * @param {*} nodes 节点
     * @param {*} nodeDataType 历史数据类型 node 节点 background 背景
     *      nodeDataType 如果是背景图片类型则直接返回nodes当作属性
     */
    getAttrsByNodes(nodes = [], nodeDataType = 'node') {
      const result =
        nodeDataType === 'node'
          ? nodes.map((nodeItem) => {
              // console.log('复制节点属性--', nodeItem)
              let oj = { ...nodeItem.attrs };
              oj.opacity = 1;
              return JSON.parse(JSON.stringify(oj));
            })
          : nodes;
      return result;
    },
    /**
     * 记录历史
     * @param {*} oldNodes 需要记录的节点
     * @param {*} isRecord 是否需要记录
     * @param {*} logType 记录类型 add 新增 del 删除 edit 编辑
     * @param {*} nodeDataType 历史数据类型 node 节点 background 背景
     */
    addRecord(oldNodes, isRecord, logType = 'edit', nodeDataType = 'node') {
      const oldAttrs = this.getAttrsByNodes(oldNodes || [], nodeDataType);

      return (newNodes) => {
        const newAttrs = this.getAttrsByNodes(newNodes, nodeDataType);

        if (isRecord) {
          switch (logType) {
            case 'add':
              this.currentUIHistory.pushAddLog(newAttrs, nodeDataType);
              break;
            case 'del':
              this.currentUIHistory.pushDelLog(oldAttrs, nodeDataType);
              break;
            case 'edit':
              this.currentUIHistory.push(oldAttrs, newAttrs, {
                logType,
                dataType: nodeDataType,
              });
              break;
          }
          //console.log('-----记录历史数据', oldAttrs, newAttrs);
        }
        this.updateHistoryInfos();
      };
    },
    updateHistoryInfos() {
      this.historyLength = this.currentUIHistory.length();
      this.historyCurIndex = this.currentUIHistory.getCursorIndex();
      // console.log('更新历史数据信息----', this.historyLength, this.historyCurIndex);
    },
    undoHistory() {
      const log = this.currentUIHistory.back();
      if (log.logType === 'add') {
        this.currentUIPlayground.clearTransformer(true);
      }
      // console.log(log);
      this.renderHistory(log, 'undo');
    },
    redoHistory() {
      const log = this.currentUIHistory.next();
      if (log.logType === 'del') {
        this.currentUIPlayground.clearTransformer(true);
      }
      this.renderHistory(log, 'redo');
    },
    /**
     *
     * @param {*} nodeDatas 需要渲染的历史数据
     * @param {*} stepType 操作历史记录的动作-前进还是后退
     */
    renderHistory(nodeDatas, stepType) {
      if (!nodeDatas) {
        console.warn('没有渲染的历史数据', nodeDatas);
        return false;
      }

      const dataType = nodeDatas.dataType; // node节点 background 背景
      const logType = nodeDatas.logType; // 增删改三种类型
      const attrs = nodeDatas.nodeData || {}; // 记录的历史数据
      const layoutId = attrs[0].parentPlayId; // 当时所在的刀板
      //console.log('需要渲染的历史数据 ', layoutId,nodeDatas);
      switch (dataType) {
        case 'node':
          if (logType === 'edit') {
            this.setArrtsToPlayground(attrs);
          }
          if (logType === 'add') {
            if (stepType === 'undo') {
              // 原来是新增，那么现在回退就需要删除
              this.delNodesOnPlayground(attrs);
            } else {
              // 原来是新增，那么现在撤销回退就需要重新添加
              this.addNodesOnPlayground(attrs);
            }
          }
          if (logType === 'del') {
            if (stepType === 'undo') {
              // 原来是删除，那么现在回退就需要新增
              this.addNodesOnPlayground(attrs);
            } else {
              // 原来是删除，那么现在撤销回退就需要重新删除
              this.delNodesOnPlayground(attrs);
            }
          }
          // 选中刀板
          this.setPlayId(layoutId);
          break;
        case 'background':
          this.udpateBackground(attrs, false);
          break;
      }

      this.updateHistoryInfos();
    },

    // 清除选面
    clearFaceId() {
      if (this.selectFaceId) {
        this.selectFaceId = null;
        this.setLightBackgroud();
      }
    },
    /**
     * 重新渲染背景属性
     * @param {*} attrs
     */
    udpateBackground(attrs = [], isRecord = false) {
      const { background } = attrs[0];
      const { playId, ...backgroundAttrs } = background;
      this.setBackground(backgroundAttrs, isRecord);
    },
    /**
     * 设置制定节点的相关属性
     * @param {*} attrs
     */
    setArrtsToPlayground(attrs) {
      const allNodes = this.currentUIPlayground.nodeElements;
      attrs.forEach(async (attrsItem) => {
        const historyNodeId = attrsItem.id;
        let playgroundNodeItem = null;
        allNodes.forEach((playgroundNode) => {
          if (playgroundNode.id() === historyNodeId) {
            playgroundNodeItem = playgroundNode;
          } else {
            // console.log(playgroundNode, 'playgroundNode');
            playgroundNode.getClassName() === 'Group' &&
              [...playgroundNode.getChildren()].forEach((child) => {
                if (child.id() === historyNodeId) {
                  playgroundNodeItem = child;
                }
              });
          }
        });
        const isImg = !!attrsItem.url; // 不是图片就是文字
        const isDiffrentImg = attrsItem.url !== playgroundNodeItem.getAttr('url');
        if (isImg && isDiffrentImg && playgroundNodeItem) {
          //console.log('更新了图片地址------',attrsItem.url,isDiffrentImg,playgroundNodeItem.getAttr('url'))
          let selectHeight = playgroundNodeItem.height();
          // 如果是图片换链接了，需要
          const image = await addImageProcess(attrsItem.url);
          // 如果选中了图片，那么是替换
          const width = (selectHeight / image.height) * image.width;
          this.setClickNodeAttrs(
            {
              ...attrsItem,
              width,
              image: image,
              url: attrsItem.url,
              srcId: attrsItem.id,
              materialDesc: attrsItem.name,
              materialId: attrsItem.materialId,
            },
            false,
          );
          attrsItem.loading = false;
        } else {
          if (isImg) {
            //console.log('重新渲染的数据----',attrsItem)
            delete attrsItem.image;
          }
          playgroundNodeItem && playgroundNodeItem.setAttrs(attrsItem);
        }
        !playgroundNodeItem && console.warn('没有历史记录的节点：', historyNodeId);
      });
    },
    //删除选中元素
    delSelectedNodes() {
      let nodes = this.currentUIPlayground.selectNodes;
      this.currentUIPlayground.clearTransformer(true);
      nodes.forEach((node) => node.destroy());
      this.currentUIPlayground.selectNodes.length = 0;
      this.currentUIPlayground.fire('nodesChange', {
        typeName: 'delete',
        target: nodes,
        nodes: this.currentUIPlayground.nodeElements,
      });
    },
    delNodesOnPlayground(attrs) {
      const allNodes = this.currentUIPlayground.nodeElements;
      attrs.forEach((attrsItem) => {
        const historyNodeId = attrsItem.id;

        const playgroundNodeItem = allNodes.find((playgroundNode) => {
          return playgroundNode.id() === historyNodeId;
        });
        playgroundNodeItem && playgroundNodeItem.remove();

        !playgroundNodeItem && console.warn('没有找到删除对象');
      });

      this.getLayerNodes();
    },
    addNodesOnPlayground(attrs) {
      let nodes = attrs.map((attrsItem) => {
        return new Promise(async (resolve) => {
          const isImg = !!attrsItem.url; // 不是图片就是文字
          let newNode;
          if (isImg) {
            let url = attrsItem.url;
            const image = await addImageProcess(url);
            const attrs = {
              url,
              image,
              width: attrsItem.width,
              height: attrsItem.height,
              srcId: attrsItem.id,
              materialDesc: attrsItem.name,
              materialId: attrsItem.materialId,
            };

            attrsItem = { ...attrsItem, ...attrs };
            newNode = new XXCanvas.Image(attrsItem);
            resolve(newNode);
            //this.currentUIPlayground.addChild(newNode)
          } else {
            newNode = new XXCanvas.Text(attrsItem);
            resolve(newNode);
            //this.currentUIPlayground.addChildToCenter(newNode);
          }
        });
        // 添加完之后更新一下需要更新一下最新的ID
        // const allNodes = this.currentUIPlayground.nodeElements;
        // const lastNode = allNodes[allNodes.length - 1];
        // attrsItem.id = lastNode.id();
      });

      Promise.all(nodes).then((res) => {
        let nodes = this.currentUIPlayground.addNodes(res, false, true);
        nodes.forEach((node, index) => {
          attrs[index].id = node.id();
        });
      });

      this.getLayerNodes();
    },
    /** ********************* 画布初始化相关 ****************** **/
    /**
     * 初始化历史记录
     */
    initCurrentHistory() {
      let history = new Historys();
      this.currentUIHistory = history;
      // console.log('初始化画布的历史记录', this.currentUIHistory);
    },
    /**
     * @description: 初始画布
     * @param {Object} canvas 画布实例
     */
    setCurrentCanvas(canvas) {
      this.canvasMap['all'] = {
        ...this.canvasMap['all'],
        canvas,
        scale: canvas.UIPlayground.scaleX(),
      };
      this.getLayerNodes();
      this.onStageEvent();
      this.copyNodeAttrs();
      this.initCurrentHistory();
      this.isRenderEnd = true;

      // console.log('已经初始化数据的刀版图', this.canvasMap);
    },
    setCanvasMapItem(id, obj) {
      this.canvasMap[id] = { ...this.canvasMap[id], ...obj };
      // console.log('替换后的', id, this.canvasMap[id]);
    },
    /**
     * @description: 初始化数据
     * @param {Array} models 模型列表
     * @param {Array} layouts 刀版列表
     */
    init({ models, layouts, boxs, canvasMap }) {
      // console.log('%c 🍬 models', 'color:#6ec1c2', models);
      // console.log('%c 🍬 layouts', 'color:#6ec1c2', layouts);
      // console.log('%c 🍬 boxs', 'color:#6ec1c2', boxs);
      // console.log('%c 🍬 canvasMap', 'color:#6ec1c2', JSON.parse(JSON.stringify(canvasMap)));
      this.models = models;
      this.layouts = layouts;
      this.boxs = boxs;
      this.canvasMap = canvasMap;
      if (layouts.length <= 1) {
        this.layoutId = layouts[0].id;
        this.canvasLevel = 'level-1';
      } else {
        this.layoutId = '';
        this.canvasLevel = 'level-0';
      }
    },
    getReserve() {
      const layout = this.layouts.find((item) => item.parentId === this.boxId && item.id !== this.layoutId);
      return layout || null;
    },
  },
});
