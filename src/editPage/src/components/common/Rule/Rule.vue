<!--
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-03-13 15:27:11
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-20 20:15:26
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/Playground2D/Rule.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="rule_layer" ref="rule_wrap">
    <div class="rule_row">
      <div title="清除参考线" class="rul_corner"></div>
      <canvas class="rule_horizontal" ref="rule_horizontal" @mousedown="guideX"></canvas>
    </div>
    <div class="rule_row2">
      <canvas class="rule_vertical" ref="rule_vertical" @mousedown="guideY"></canvas>
      <div class="guide" ref="guide"></div>
    </div>
  </div>
</template>
<script setup>
import { pxTOMM } from '../../../utils/toMM';
import { CuideLineX, CuideLineY } from './GuideLine';
import { useRule } from '@/store/module/rule.js';
import { watch, onMounted, ref, onUnmounted } from 'vue';
import ruleHIcon from './icon/rule@x3.png';
import ruleHAIcon from './icon/rule-active@x3.png';
import ruleVIcon from './icon/rule-v@x3.png';
import ruleVAIcon from './icon/rule-v-active@x3.png';
const ruleStore = useRule();
const rule_wrap = ref();
// 记录图片loading是否完成
const loadLen = ref(0);

// 水平标尺
const rule_horizontal = ref();
let ctx_horizontal;
const rele_h_icon = new Image();
rele_h_icon.onload = () => {
  loadLen.value++;
};
rele_h_icon.src = ruleHIcon;

const rele_h_a_icon = new Image();
rele_h_a_icon.onload = () => {
  loadLen.value++;
};
rele_h_a_icon.src = ruleHAIcon;

// 垂直标尺
const rule_vertical = ref();
let ctx_vertical;
const rele_v_icon = new Image();
rele_v_icon.onload = () => {
  loadLen.value++;
};
rele_v_icon.src = ruleVIcon;

const rele_v_a_icon = new Image();
rele_v_a_icon.onload = () => {
  loadLen.value++;
};
rele_v_a_icon.src = ruleVAIcon;

// 参考线的创建

const guide = ref();

const guideX = (e) => {
  let isMove = false;
  let mY = e.clientY;
  let guideLine = null;
  let move = (e) => {
    let nMY = e.clientY;
    if (!isMove) {
      guideLine = new CuideLineX({
        parent: guide.value,
        start: 'start',
        afterRemove: () => {
          console.log('???');
          ruleStore.removeLineX(guideLine);
        },
      });
      isMove = true;
    }
    let disY = nMY - mY;
    guideLine.setY(disY);
  };
  let end = (e) => {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', end);
    if (guideLine) {
      if (guideLine.moveEnd()) {
        // 添加到状态管理中
        ruleStore.addLineX(guideLine);
      }
    }
  };
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);
};

const guideY = (e) => {
  let isMove = false;
  let mX = e.clientX;
  let guideLine = null;
  let move = (e) => {
    let nMX = e.clientX;
    if (!isMove) {
      guideLine = new CuideLineY({
        parent: guide.value,
        start: 'start',
        afterRemove: () => {
          ruleStore.removeLineY(guideLine);
        },
      });
      isMove = true;
    }
    let disX = nMX - mX;
    guideLine.setX(disX);
  };
  let end = () => {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', end);
    if (guideLine) {
      if (guideLine.moveEnd()) {
        // 添加到状态管理中
        ruleStore.addLineY(guideLine);
      }
    }
  };
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);
};

// 需补充画布大小改变时的处理

// 需补充刀版旋转后的处理

watch(
  () => ruleStore.ruleData,
  (newData, oldData) => {
    //console.log(ruleStore.ruleData);
    drawRule();
  },
);
function drawRule() {
  if (!ruleStore.ruleData) {
    return;
  }
  if (!rule_horizontal.value || !rule_vertical.value || loadLen.value < 4) {
    setTimeout(() => {
      drawRule();
    }, 200);
    return;
  }
  let { x, y, left, right, top, bottom, scale } = ruleStore.ruleData;
  x = x * 3 + 60;
  y = y * 3 + 60;

  // 水平标尺
  const c_h = rule_horizontal.value;
  x = x - c_h.height; //标识盖着画布的距离修正;
  ctx_horizontal.clearRect(0, 0, c_h.width, c_h.height);
  const rule_h_Pattern = ctx_horizontal.createPattern(rele_h_icon, 'repeat-x');
  ctx_horizontal.fillStyle = rule_h_Pattern;
  ctx_horizontal.translate(x, 0);
  ctx_horizontal.fillRect(0, 0, c_h.width, c_h.height);
  if (left !== Infinity) {
    left *= 3;
    right *= 3;
    left += 60;
    right += 60;
    let selectX = left - x - c_h.height;
    let selectW = right - left;
    // 选中滑层 f9dfd4
    ctx_horizontal.fillStyle = '#f9dfd4';
    ctx_horizontal.fillRect(selectX, 0, selectW, c_h.height);
    // 选中刻度
    if (selectX < 0) {
      selectW += selectX;
      selectX = 0;
    }
    if (selectW > 0) {
      const rule_h_a_Pattern = ctx_horizontal.createPattern(rele_h_a_icon, 'repeat-x');
      ctx_horizontal.fillStyle = rule_h_a_Pattern;
      ctx_horizontal.fillRect(selectX, 0, selectW, c_h.height);
    }
  }
  // 刻度值
  let offsetXStep = 50 * 3; //一个大刻度 50 px
  let stepX = offsetXStep / scale; // 换算一个刻度代表画布的距离
  let startX = 0;
  let nubX = 0;
  ctx_horizontal.font = '30px Arial';
  ctx_horizontal.fillStyle = '#666';
  ctx_horizontal.textBaseline = 'top';
  while (startX < c_h.width - x) {
    let text = parseInt(pxTOMM(nubX / 3));
    ctx_horizontal.fillText(text, startX + 6, 6);
    startX += offsetXStep;
    nubX += stepX;
  }
  ctx_horizontal.translate(-x, 0);

  // 垂直标尺
  const c_v = rule_vertical.value;
  y = y - c_v.width; //标识盖着画布的距离修正;
  ctx_vertical.clearRect(0, 0, c_v.width, c_v.height);
  const rule_v_Pattern = ctx_vertical.createPattern(rele_v_icon, 'repeat-y');
  ctx_vertical.fillStyle = rule_v_Pattern;
  ctx_vertical.translate(0, y);
  ctx_vertical.fillRect(0, 0, c_v.width, c_v.height);
  if (top !== Infinity) {
    top *= 3;
    bottom *= 3;
    top += 60;
    bottom += 60;
    let selectY = top - y - c_v.width;
    let selectH = bottom - top;
    // 选中滑层 f9dfd4
    ctx_vertical.fillStyle = '#f9dfd4';
    ctx_vertical.fillRect(0, selectY, c_v.width, selectH);
    // 选中刻度
    if (selectY < 0) {
      selectH += selectY;
      selectY = 0;
    }
    if (selectH > 0) {
      const rule_v_a_Pattern = ctx_vertical.createPattern(rele_v_a_icon, 'repeat-y');
      ctx_vertical.fillStyle = rule_v_a_Pattern;
      ctx_vertical.fillRect(0, selectY, c_v.width, selectH);
    }
  }
  // 刻度值
  let offsetYStep = 50 * 3; //一个大刻度 50 px
  let stepY = offsetYStep / scale; // 换算一个刻度代表画布的距离
  let startY = 0;
  let nubY = 0;
  ctx_vertical.font = '30px Arial';
  ctx_vertical.fillStyle = '#666';
  ctx_vertical.textBaseline = 'middle';
  ctx_vertical.translate(15, 10);
  while (startY < c_v.height - y) {
    let text = parseInt(pxTOMM(nubY / 3)) + '';
    let textW = ctx_vertical.measureText(text).width;
    ctx_vertical.translate(0, textW);
    ctx_vertical.rotate((-90 * Math.PI) / 180);
    ctx_vertical.fillText(text, 0, 0);
    ctx_vertical.rotate((90 * Math.PI) / 180);
    ctx_vertical.translate(0, -textW);
    startY += offsetYStep;
    nubY += stepY;
    ctx_vertical.translate(0, offsetYStep);
  }
  ctx_vertical.translate(-15, -y - 10 - startY);
}

function toResize() {
  // 获取要监听的元素
  // 创建一个观察器实例并传入回调函数
  var observer = new ResizeObserver(function (entries) {
    entries.forEach(function (entry) {
      resize();
    });
  });
  // 传入目标节点
  observer.observe(rule_wrap.value);
}

function resize() {
  if (!rule_horizontal.value || !rule_vertical.value) {
    setTimeout(() => {
      resize();
    }, 100);
    return;
  }
  rule_horizontal.value.width = rule_horizontal.value.clientWidth * 3;
  rule_horizontal.value.height = rule_horizontal.value.clientHeight * 3;
  rule_vertical.value.width = rule_vertical.value.clientWidth * 3;
  rule_vertical.value.height = rule_vertical.value.clientHeight * 3;
  drawRule();
}

onMounted(() => {
  toResize();
  ctx_horizontal = rule_horizontal.value.getContext('2d');
  ctx_vertical = rule_vertical.value.getContext('2d');
  resize();
  ruleStore.addGuide(guide.value);
});
</script>
<style lang="less" scoped>
.rule_layer {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none;
  display: flex;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.rule_row {
  display: flex;
  width: 100%;
  height: 21px;
  position: relative;
  z-index: 2;
}
.rule_row2 {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
}

.rul_corner {
  flex: none;
  position: relative;
  z-index: 10;
  margin: 0 0 -10px 0;
  width: 20px;
  height: 30px;
  border-bottom: 2px solid #fff;
  border-right: 1px solid #fff;
}

.rule_horizontal {
  box-sizing: content-box;
  height: 20px;
  border-bottom: 1px solid rgba(206, 219, 236, 0.5);
  flex: 1;
  cursor: row-resize;
}

.rule_vertical {
  box-sizing: content-box;
  position: relative;
  width: 20px;
  height: 100%;
  border-right: 1px solid rgba(206, 219, 236, 0.5);
  cursor: col-resize;
  z-index: 10;
}
.guide {
  position: relative;
  flex: 1;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.rul_corner,
.rule_horizontal,
.rule_vertical {
  background: #fff;
  pointer-events: all;
}
</style>
<style>
.cuideLineX {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 1px;
  background: #fd4f00;
  cursor: row-resize;
  pointer-events: all;
}
.cuideLineY {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 100%;
  background: #fd4f00;
  cursor: col-resize;
  pointer-events: all;
}
</style>
