/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-03-25 22:15:24
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-06-19 14:16:35
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srcstore/module/useCharlet.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineStore } from 'pinia';
import { usePlaygroundStore } from './usePlayground';
import { useMainStore } from '@/store';
// 对全局的 loading 状态进行管理
export const useCharlet = defineStore('charlet', {
  state: () => {
    return {
      init: false,
      stage: null, //画布 的 stage
      canvasMap: {}, //存贮各个刀版相关的贴图
      timer: null,
      isUpdate: false, //是否在更新中
    };
  },
  getters: {
    // 获取3d贴图
    charlet() {
      if (!this.stage || !this.init) {
        return null;
      }
      return { ...this.canvasMap };
    },
  },
  actions: {
    // 更新画布的stage
    setStage(stage) {
      this.stage = stage;
      this.onEvents();
    },
    //初始化贴图
    initCharlet(view3dData) {
      this.canvasMap = {};
      for (let s in view3dData) {
        let { nodePreviewMap, playgroundImg } = view3dData[s];
        this.canvasMap[s] = { nodePreviewMap: [], playgroundImg: '' };
      }
      this.init = true;
    },
    // 清空截图数据
    clearCharlet() {
      this.canvasMap = {};
    },
    get3dCharlet() {
      const PlaygroundStore = usePlaygroundStore();
      const oldLevel = PlaygroundStore.canvasLevel;
      let isUpdateCanvas = false;
      if (oldLevel === 'level-2') {
        //先清除高亮
        // 调用 goAll();
        PlaygroundStore.setLightBackgroud();
        if (PlaygroundStore.layouts.length > 1) {
          PlaygroundStore.goToAll('level-0', 0, false);
        } else {
          PlaygroundStore.goToAll('level-1', 0, false);
        }
        isUpdateCanvas = true;
      } else if (oldLevel === 'level-1') {
        if (PlaygroundStore.layouts.length > 1) {
          PlaygroundStore.goToAll('level-0', 0, false);
          isUpdateCanvas = true;
        }
      }
      return new Promise((resolve) => {
        setTimeout(
          () => {
            useCharlet()
              .forceCharlet(1)
              .then((res) => {
                resolve(res);
              });
          },
          isUpdateCanvas ? 500 : 0,
        );
      });
    },
    //强制更新 state: 1 进入3d强制截取设计图，2 手动保存强制截取 所有截图
    async forceCharlet(state = 1) {
      if (!this.stage) {
        return;
      }
      this.isUpdate = true;
      let playgroundStore = usePlaygroundStore();
      let canvasMap = playgroundStore.canvasMap;
      let playground = this.stage.findOne('Playground');
      let level = this.stage.currentStatusLevel;
      let is3d = true;
      let isSava = state == 2;
      let newCanvasMap = { ...this.canvasMap };
      if (level === 'level-0') {
        //多刀版状态截图
        let res = await playground.getLevel0Charlet(canvasMap, is3d, isSava);
        for (let id in this.canvasMap) {
          res[0] &&
            (playgroundStore.canvasMap[id].playgroundImg.image2DUrl = newCanvasMap[id].playgroundImg = res[0][id]);
          res[1] && (playgroundStore.canvasMap[id].nodePreviewMap = newCanvasMap[id].nodePreviewMap = res[1][id]);
          res[2] && (playgroundStore.canvasMap[id].coverPreviewMap = res[2][id]);
        }
        this.isUpdate = false;
        this.canvasMap = newCanvasMap;
        return Promise.resolve(res);
      } else {
        // 单刀版状态截图
        let layoutId = playgroundStore.layoutId;
        if (!layoutId) {
          layoutId = Object.keys(canvasMap)[0];
        }
        let coverList = canvasMap[layoutId].background.coverList;
        let canvas = {};
        let res = await playground.getCharlet(coverList, is3d, isSava);
        //res[0] 设计图
        //res[1] 工艺图
        //res[2] 面的缩略图
        res[0] && (playgroundStore.canvasMap[layoutId].playgroundImg.image2DUrl = canvas.playgroundImg = res[0]);
        if (res[1]) {
          const nodePreviewMap = Object.keys(res[1]).map((k) => {
            const nodecraft = res[1][k];
            return {
              craftId: nodecraft.id,
              craftName: nodecraft.craftDesc,
              imageUrl: nodecraft.url,
              imageId: '',
            };
          });
          playgroundStore.canvasMap[layoutId].nodePreviewMap = canvas.nodePreviewMap = nodePreviewMap;
        }
        res[0] && (playgroundStore.canvasMap[layoutId].coverPreviewMap = res[2]);
        this.canvasMap[layoutId] = canvas;
        this.isUpdate = false;
        return Promise.resolve(res);
      }
    },
    // 更新多刀版所需缩略图
    getCharlet() {
      let playgroundStore = usePlaygroundStore();
      let canvasMap = playgroundStore.canvasMap;
      let playground = this.stage.findOne('Playground');
      let level = this.stage.currentStatusLevel;
      // console.log(level,"更新缩略图");
      if (level === 'level-0') {
        //多刀版状态截图
        return playground.getLevel0Charlet(canvasMap).then((res) => {
          for (let id in this.canvasMap) {
            this.canvasMap[id].playgroundImg = res[0][id];
          }
        });
      } else {
        let layoutId = playgroundStore.layoutId;
        if (!layoutId) {
          layoutId = Object.keys(canvasMap)[0];
        }
        let coverList = canvasMap[layoutId].background.coverList;
        return playground.getCharlet(coverList).then((res) => {
          this.canvasMap[layoutId].playgroundImg = res[0];
        });
      }
    },
    // 防抖处理，防止短时间内，多次更新截图
    setCharlet() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (this.drag) {
          this.setCharlet();
          return;
        }
        this.getCharlet();
        useMainStore().onAutoSave();
      }, 1000);
    },
    // 添加事件监听，用户更新贴图
    onEvents() {
      let playground = this.stage.findOne('Playground');
      playground.on('init', () => {
        this.getCharlet();
        this.stage.on('backgroundChange', (e) => {
          // console.log(e);
          // console.log(111, "background");
          this.setCharlet();
        });
        playground.on('nodedrag', () => {
          this.setCharlet();
        });
        playground.on('nodesChange', ({ typeName }) => {
          if (typeName !== 'tofreeze' && typeName !== 'toUnfreeze') {
            this.setCharlet();
          }
        });
        playground.on('attrsChange', (ev) => {
          let { typeName } = ev;
          if (typeName === 'editText') {
            return;
          }
          this.setCharlet();
        });
        playground.on('nodedragstart', (ev) => {
          this.drag = true;
        });
        playground.on('nodedragend', (ev) => {
          this.drag = false;
        });
      });
    },
  },
});
