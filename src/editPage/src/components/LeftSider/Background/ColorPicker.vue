<!--
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-06 17:40:54
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-26 15:37:55
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/LeftSider/Background/ColorPicker.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<!-- 
    'color': 当前颜色
    'initColor': 项目的初始颜色
 -->
<template>
  <div class="color-picker">
    <div class="title">原始颜色</div>
    <div class="self-color">
      <div
        @click="colorChange(props.initColor)"
        class="color-btn"
        :style="{ 'background-color': props.initColor }"
        :class="{ transparent: !props.initColor || props.initColor === 'transparent' }"
      ></div>
    </div>
    <div class="title" style="margin-top: 20px">最近使用</div>
    <SelfColorList :color="color" :count="11" @update:color="colorChange"></SelfColorList>
    <div class="title" style="margin-top: 20px">热门颜色</div>
    <HotColorList :color="color" @update:color="colorChange"></HotColorList>
  </div>
</template>
<script setup>
import HotColorList from '@/components/common/ColorPicker/HotColorList.vue';
import SelfColorList from '@/components/common/ColorPicker/SelfColorList.vue';
const props = defineProps(['color', 'initColor']);
const emit = defineEmits(['update:color']);
const colorChange = (newColor) => {
  if (!newColor) {
    return;
  }
  emit('update:color', newColor);
};
</script>
<style lang="less" scoped>
.color-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;

  .title {
    line-height: 20px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    color: #666666;
    margin-bottom: 10px;
    margin-top: 10px;
  }

  .self-color {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-column-gap: 10px;
    grid-row-gap: 10px;

    .color-btn {
      height: 34px;
      border-radius: 4px;
      cursor: pointer;
      &.transparent {
        background: url(../../common/ColorPicker/icon/transparent.png) center center repeat !important;
      }
    }
  }
}
:deep(.color-list) {
  padding-right: 16px;
  flex-shrink: 0;
  overflow: visible;
}
:deep(.self-color) {
  padding-right: 16px;
  flex-shrink: 0;
}
</style>
