<template>
  <div class="group-btns opreate-btns">
    <div class="btn hover-light rotation-btn" @click="onClickRotate"><Icon type="xuanzhuan"></Icon>旋转</div>
    <a-popover overlayClassName="no-arrow no-padding  line-popop">
      <template #content>
        <div class="type-item" @click="addLineX">横向参考线</div>
        <div class="type-item" @click="addLineY">纵向参考线</div>
        <div :class="{ 'type-item': true, 'type-item-disabled': ruleStore.lines.length <= 0 }" @click="clearLine">
          清除参考线
        </div>
      </template>
      <div class="btn hover-light"><Icon type="cankaoxian"></Icon>参考线</div>
    </a-popover>
  </div>
  <a-popover overlayClassName="no-arrow no-padding scale-popop">
    <template #content>
      <div>
        <div class="type-item" @click="setPlayScale(1)">实际大小</div>
        <div class="type-item" @click="setPlayScale(null)">最佳比例</div>
      </div>
    </template>
    <div class="scale-btn">
      <a-input
        v-model:value="scaleNum"
        type="number"
        :min="10"
        :max="500"
        @pressEnter="sureScale"
        @blur="sureScale"
        class="scale-input"
      >
        <template #prefix>
          <Icon type="jian" class="minus-btn btn" @click.stop="reduceScale"></Icon>
        </template>
        <template #suffix>
          <div style="margin-right: 18px">%</div>
          <Icon type="jia" class="add-btn btn" @click.stop="addScale"></Icon>
        </template>
      </a-input>
    </div>
  </a-popover>
</template>
<script setup>
import Icon from '@/components/common/Icon/Icon.vue';

import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store/index.js';
import { usePlaygroundStore } from '@/store/module/usePlayground.js';
import { useRule } from '@/store/module/rule.js';
const PlaygroundStore = usePlaygroundStore();
const ruleStore = useRule();
const lineTypes = [
  { id: 1, name: '横向参考线' },
  { id: 2, name: '纵向参考线' },
  { id: 3, name: '清除参考线' },
];
const scaleNum = ref(100);
const updateScale = () => {
  scaleNum.value = Math.round((PlaygroundStore.pageScaleValue.x || 1) * 100);
};
watch(
  () => PlaygroundStore.pageScaleValue,
  (val, newValue) => {
    updateScale();
  },
);
updateScale();

const clearLine = () => {
  ruleStore.clearLine();
};
const addLineX = () => {
  ruleStore.addLineXToC();
};
const addLineY = () => {
  ruleStore.addLineYToC();
};
const onClickRotate = () => {
  PlaygroundStore.currentUIPlayground.rotateLayer();
};
const reduceScale = () => {
  let scale = PlaygroundStore.getCurrentCanvasScale - 0.1;
  setPlayScale(scale < 0.1 ? 0.1 : scale);
};
const addScale = () => {
  let scale = PlaygroundStore.getCurrentCanvasScale + 0.1;
  setPlayScale(scale >= 50 ? 50 : scale);
};
const sureScale = (e) => {
  let value = e.target.value;
  if (!Number.isNaN(Number(value))) {
    value = value > 500 ? 500 : value < 10 ? 10 : value;
    value = value / 100;
  } else {
    value = null;
  }
  setPlayScale(value);
};
function setPlayScale(scale) {
  PlaygroundStore.currentStage.playAdaption(null, scale);
}
</script>

<style lang="less" scoped>
.no-arrow .ant-popover-inner-content {
  padding: 0px !important;
}

.ant-input-number-input-wrap {
  width: 100px;
}

::deep(.no-arrow .ant-popover-inner) {
  overflow: hidden;
}

.type-item {
  height: 32px;
  font-size: 12px;
  line-height: 32px;
  font-family: PingFangSC-Regular, PingFang SC;
  color: #333333;
  background: #fff;
  padding: 0 20px;
  cursor: pointer;

  &:hover {
    background: #f8f8f8;
  }
}

.type-item-disabled {
  background: none !important;
  cursor: not-allowed;
  color: #bfbfbf;
}

#bottom-px() {
  bottom: 30px;
}

.opreate-btns {
  user-select: none;
  position: absolute;
  left: 146px;
  font-size: 12px;
  padding: 5px 0 !important;
  white-space: nowrap;
  #bottom-px();
  :deep(.anticon) {
    margin-right: 5px !important;
  }
  .btn {
    width: auto !important;
    margin: 0 5px;
    padding: 0 5px;
  }
}

.group-btns {
  display: flex;
  height: 32px;
  padding: 5px;
  background-color: #fff;
  border-radius: 8px;

  .btn {
    flex: 1;
    width: 50px;
    box-sizing: border-box;
    display: grid;
    place-content: center;
    text-align: center;
    color: #666666;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    vertical-align: middle;
    position: relative;

    :deep(.anticon) {
      font-size: 12px;
      color: rgba(63, 63, 63, 1);
      margin-right: 10px;
    }

    &.rotation-btn {
      width: 65px;

      & + .btn {
        width: 75px;
      }

      :deep(.anticon) {
        font-size: 16px;
        margin-top: 2px;
      }
    }

    &:first-child {
      border-radius: 8px 0px 0px 8px;
    }

    &:last-child {
      border-radius: 0px 8px 8px 0px;
    }

    &.active {
      background: @primary-color-bg;
      color: #fff;
    }

    &.hover-light:hover {
      border-radius: 6px;
      background: @bg-hover;
      color: @primary-color;
      :deep(.anticon) {
        color: @primary-color;
      }
    }
    &::after {
      content: '';
      width: 1px;
      height: 14px;
      background-color: #d4d4d4;
      position: absolute;
      top: 50%;
      right: -5px;
      transform: translateY(-50%);
    }
    &:last-child::after {
      display: none;
    }
  }
}
:deep(.ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover) {
  border-color: transparent;
  border-right-width: 1px;
  z-index: 1;
}
.scale-btn {
  user-select: none;
  position: absolute;
  left: 40%;
  #bottom-px();

  .ant-input-prefix {
    overflow: hidden;
    user-select: none;
  }

  :deep(input.ant-input) {
    text-align: right;
    color: #3f3f3f;
  }

  .btn {
    text-align: center;
    color: #3f3f3f;
    font-size: 20px;
    line-height: 40px;
    user-select: none;
    margin-top: -3px;

    cursor: pointer;

    &:hover {
      color: @primary-color;
    }

    :deep(.anticon) {
      font-size: 12px;
      color: #3f3f3f;
      font-weight: 800;
    }

    &.add-btn {
      text-align: left;
      width: 22px;
    }

    ::deep(.ant-input-suffix) {
      margin-left: 10px;
    }

    &.minus-btn {
      width: 25px;
      text-align: right;
    }
  }

  .scale-input {
    width: 120px;
    height: 32px;
    background: #ffffff;
    box-shadow: 0px 0px 8px 0px rgba(221, 221, 221, 0.5);
    border-radius: 8px;
    opacity: 0.8;
    padding: 0px !important;

    :deep(input::-webkit-outer-spin-button),
    :deep(input::-webkit-inner-spin-button) {
      -webkit-appearance: none !important;
    }

    :deep(input[type='number']) {
      -moz-appearance: textfield;
    }
  }
}
</style>
<style>
.line-popop .ant-popover-content {
  padding-bottom: 10px;
}
.scale-popop .ant-popover-content {
  padding-bottom: 5px;
}
</style>
