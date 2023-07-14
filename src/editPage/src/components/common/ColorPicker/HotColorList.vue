<template>
  <div class="color-list" :class="{ small: small }">
    <div
      v-for="(itemColor, index) in colors"
      :key="index"
      :class="[
        'color-btn',
        {
          active: isActive(itemColor, color),
          line: isLine(itemColor),
          transparent: isTransparent(itemColor),
        },
      ]"
      :style="{ background: itemColor }"
      @click="colorChange(itemColor)"
    >
      <Icon v-if="isActive(itemColor)" type="xuanzhong3" class="select-icon"></Icon>
    </div>
    <slot></slot>
  </div>
</template>
<script setup>
import Icon from '@/components/common/Icon/Icon.vue';

import tinycolor from 'tinycolor2';
import { onMounted, reactive, ref, watch } from 'vue';
import { useColorStore } from '@/store/module/useColors';
import { storeToRefs } from 'pinia';
const props = defineProps(['color', 'small']);
const emit = defineEmits(['update:color']);

const colorStore = useColorStore();
const { historyColors, colors } = colorStore;
const show = ref(false);
console.log(colorStore, colors, 'hitColorList');
function formatColor(color) {
  if (!color || !(typeof color === 'string' && color?.trim())) {
    color = 'transparent';
  }
  return color !== 'transparent' ? tinycolor(color).toHex() : color;
}
const isLine = (itemColor) => {
  return formatColor(itemColor) === formatColor('#fff');
};
const isActive = (itemColor) => {
  return formatColor(itemColor) === formatColor(props.color || 'transparent');
};
const isTransparent = (itemColor) => {
  return itemColor === 'transparent';
};

const colorChange = (newColor) => {
  if (!newColor) {
    return;
  }
  colorStore.addHistoryColor(newColor);
  emit('update:color', newColor);
};
</script>
<style lang="less" scoped>
.title {
  line-height: 20px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  color: #666666;
  margin-bottom: 10px;
  margin-top: 10px;
}

.transparent {
  background: url(./icon/transparent.png) center center repeat !important;
}

.color-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-column-gap: 21px;
  justify-content: space-between;
  grid-row-gap: 10px;
  align-content: start;
  flex: 1;
  overflow: auto;

  .color-btn {
    flex-shrink: 0;
    box-sizing: border-box;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #fff;
    cursor: pointer;
    :deep(.anticon) {
      display: none;
      color: #fff;
      top: 20%;
      left: 20%;
      position: absolute;
      font-weight: 800;
    }
  }

  &.small {
    grid-template-columns: repeat(6, 1fr) !important;

    grid-column-gap: 10px !important;

    .color-btn {
      width: 25px;
      height: 25px;
      margin: auto;
    }
    :deep(.anticon) {
      font-size: 16px;
    }
  }

  .color-btn.active {
    position: relative;

    :deep(.anticon) {
      display: block;
    }
    &.line {
      :deep(.anticon) {
        color: #3f3f3f;
      }
      border: 1px solid #eee;
    }
    &.transparent {
      :deep(.anticon) {
        color: #3f3f3f;
      }
    }
  }
}

.color-btn.line {
  border-color: #ececec;
}
</style>
