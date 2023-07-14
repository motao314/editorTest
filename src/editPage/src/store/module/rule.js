/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2022-09-30 23:35:20
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-26 15:28:29
 * @FilePath: /project-20220906-xiaoxiang/src/XXEditor/src/store/module/useColors.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { CuideLineX, CuideLineY } from '../../components/common/Rule/GuideLine';
import { defineStore } from 'pinia';
import lodash from 'lodash';
// 用于对应用中的颜色进行管理

function getOverLine(selectedNodes) {
  let left = Infinity;
  let right = 0;
  let top = Infinity;
  let bottom = 0;
  selectedNodes.forEach((item) => {
    //console.log(item.getClientRect());
    let { x, y, width, height } = item.getClientRect();
    left = Math.min(x, left);
    right = Math.max(x + width, right);
    top = Math.min(y, top);
    bottom = Math.max(y + height, bottom);
  });
  return { left, right, top, bottom };
}

export const useRule = defineStore('rule', {
  state: () => {
    return {
      stage: null,
      guide: null, //参考线外框
      uiPlayground: null,
      showRule: true, //是否显示标尺
      scale: 1,
      x: 0, //当前画布距离左侧距离
      y: 0, //当前画布距离顶部距离
      scale: 0, //当前画布的像素值和屏幕的像素值的比例
      // width: 0,// 画布宽度
      // height: 0,//画布高度
      left: 0, //选中区域x轴开始位置
      right: 0, //选中区域x轴结束位置
      top: 0, //选中区域y轴开始位置
      bottom: 0, //选中区域y轴结束位置
      lineX: [],
      lineY: [],
      initOver: false,
      timer: null,
      isUpdate: false, //是否存在未更新
    };
  },
  getters: {
    ruleData() {
      if (!this.showRule || !this.stage || !this.initOver) {
        return null;
      }
      //    let x = 0, //当前画布距离左侧距离
      //    y = 0, //当前画布距离顶部距离
      //    scale = 0,//当前画布的像素值和屏幕的像素值的比例
      //    width = 0,// 画布宽度
      //    height = 0,//画布高度
      //    left = 0,//选中区域x轴开始位置
      //    right = 0,//选中区域x轴结束位置
      //    top = 0,//选中区域y轴开始位置
      //    bottom = 0;//选中区域y轴结束位置
      let { x, y, scale, left, right, top, bottom } = this;
      return {
        x,
        y,
        scale,
        left,
        right,
        top,
        bottom,
      };
    },
    lines() {
      return [this.lineX, this.lineY].flat(Infinity);
    },
  },
  actions: {
    // 添加 stage
    addStage(stage) {
      // stage = stage.stage;
      this.uiPlayground = stage.findOne('Playground');
      //console.log(this.stage.width(),this.stage.height());
      // 画布大小
      //console.log(this.uiPlayground.width(),this.uiPlayground.height());
      // 内容区域大小
      //console.log(this.uiPlayground.getLayerRect());
      // 获取画布旋转角度
      //console.log(this.uiPlayground.deg);
      // 画布缩放比例
      //console.log(this.uiPlayground.scale().x);
      // 获取画布位置
      //console.log(this.uiPlayground.getAbsolutePosition());
      this.resetData();
      this.stage = stage;
      this.onStageEvent();
    },
    // 计算标尺相关尺寸
    resetData() {
      if (!this.stage?._stageInfo) {
        return;
      }
      // console.log("rule - update");
      let playground = this.uiPlayground;
      let deg = playground.deg || 0;
      this.scale = playground.scale().x;
      // console.log(this.scale,'this.scale')
      let { x, y } = playground.getAbsolutePosition();
      let { actualSize } = this.stage._stageInfo;
      let selectNodes = playground.selectNodes;
      let layerWidth = actualSize.width * this.scale;
      let layerHeight = actualSize.height * this.scale;
      let left, right, top, bottom;

      if (selectNodes.length > 0) {
        //console.log(selectNodes);
        let overLine = getOverLine(selectNodes);
        left = overLine.left;
        right = overLine.right;
        top = overLine.top;
        bottom = overLine.bottom;
      } else {
        left = Infinity;
        right = Infinity;
        top = Infinity;
        bottom = Infinity;
      }
      if (deg == 90) {
        this.x = x - layerHeight;
        this.y = y;
      } else if (deg == 180) {
        this.x = x - layerWidth;
        this.y = y - layerHeight;
      } else if (deg === 270) {
        this.x = x;
        this.y = y - layerWidth;
      } else {
        this.x = x;
        this.y = y;
      }
      this.left = left;
      this.right = right;
      this.top = top;
      this.bottom = bottom;
    },
    //更新标尺，做节流处理
    update() {
      if (this.timer) {
        this.isUpdate = true;
      }
      this.resetData();
      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.isUpdate) {
          this.isUpdate = false;
          this.update();
        }
      }, 20);
    },
    // 添加画布相关事件监听
    onStageEvent() {
      this.uiPlayground.on(
        'Change',
        lodash.throttle(
          () => {
            this.update();
          },
          30,
          {
            trailing: true,
          },
        ),
      );
      this.uiPlayground.on('init', () => {
        this.initOver = true;
        this.resetData();
        this.onEventSelect();
        this.onEventAttrChange();
        this.onEventDegChange();
        this.onEventScaleChange();
      });
    },
    // 监听画布选中状态变化
    onEventSelect() {
      this.uiPlayground.on('selectChange', ({ typeName, target, nodes, ignoreScroll }) => {
        //console.log(target);
        //console.log('ui🙂所有选中selectChange', typeName, target, nodes, ignoreScroll);
        this.uiPlayground.fire('Change', { typeName, target, nodes });
      });
    },
    // 监听画布元素的属性发生变化
    onEventAttrChange() {
      this.uiPlayground.on('nodedrag', ({ typeName, target, nodes }) => {
        //console.log('ui 🙌属性改变attrsChange', typeName, target, nodes);
        this.uiPlayground.fire('Change', { typeName, target, nodes });
      });
      this.uiPlayground.on('attrsChange', ({ typeName, target, nodes }) => {
        //console.log('ui 🙌属性改变attrsChange', typeName, target, nodes);
        this.uiPlayground.fire('Change', { typeName, target, nodes });
      });
      this.uiPlayground.on('selectChange', ({ typeName, target, nodes }) => {
        //console.log('ui 🙌属性改变attrsChange', typeName, target, nodes);
        this.uiPlayground.fire('Change', { typeName, target, nodes });
      });
      this.uiPlayground.on('layerMove', () => {
        this.uiPlayground.fire('Change');
      });
    },
    // 监听画布旋转
    onEventDegChange() {
      this.uiPlayground.on('degChange', ({ typeName, target, nodes }) => {
        this.uiPlayground.fire('Change', { typeName, target, nodes });
        //console.log('ui 🙌属性改变degChange', typeName, target, nodes);
      });
    },
    // 监听画布缩放
    onEventScaleChange() {
      this.uiPlayground.on('scaleChange', ({ currentTarget, newVal, type }) => {
        //console.log('ui 🙌属性改变scaleChange', currentTarget,newVal,type);
        this.uiPlayground.fire('Change', {
          typeName: 'scaleChange',
          target: currentTarget,
          value: newVal,
        });
      });
    },
    //添加参考线外框
    addGuide(guide) {
      this.guide = guide;
    },
    //添加一条横向参考线，在中间
    addLineXToC() {
      if (!this.guide) {
        return;
      }
      let Line = new CuideLineX({
        parent: this.guide,
        start: 'center',
        afterRemove: () => {
          this.removeLineX(Line);
        },
      });
      this.addLineX(Line);
    },
    //添加一条纵向参考线，在中间
    addLineYToC() {
      if (!this.guide) {
        return;
      }
      let Line = new CuideLineY({
        parent: this.guide,
        start: 'center',
        afterRemove: () => {
          this.removeLineY(Line);
        },
      });
      this.addLineY(Line);
    },
    //添加一条横向参考线
    addLineX(LineX) {
      this.lineX.push(LineX);
    },
    //添加一条横向参考线
    addLineY(LineY) {
      this.lineY.push(LineY);
    },
    removeLineX(LineX) {
      this.lineX = this.lineX.filter((item) => LineX.id !== item.id);
    },
    removeLineY(LineY) {
      this.lineY = this.lineY.filter((item) => LineY.id !== item.id);
    },
    // 清空参考线
    clearLine() {
      this.lines.forEach((item) => {
        item.line.remove();
      });
      this.lineX.length = 0;
      this.lineY.length = 0;
    },
  },
});
