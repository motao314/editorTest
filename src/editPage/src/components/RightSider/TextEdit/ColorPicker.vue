<!-- 
    'color': 当前颜色
    'initColor': 项目的初始颜色
 -->
<template>
  <a-popover
    trigger="click"
    placement="bottomRight"
    overlayClassName="no-arrow no-padding"
    arrow-point-at-center
    @visibleChange="visibleChange"
  >
    <template #content>
      <div class="color-picker">
        <DetailColorPicker :color="fontColor" :initColor="initColor" @update:color="colorChange"> </DetailColorPicker>
        <SelfColorList :count="5" :round="true" :small="true" :color="fontColor" @update:color="colorChange">
          <Icon
            type="jia"
            style="display: flex; justify-content: center; align-items: center; cursor: pointer"
            @click="addColor"
          />
        </SelfColorList>
        <a-divider style="border-color: #d8d8d8; margin: 14px 0" dashed />
        <HotColorList :small="true" :color="fontColor" @update:color="colorChange"></HotColorList>
      </div>
    </template>
    <div class="color-input">
      <span class="color-value"><span style="margin-right: 5px">#</span>{{ fontColor.replace('#', '') }}</span>
      <span class="color-show" :style="{ 'background-color': fontColor }"></span>
    </div>
  </a-popover>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue';
import Icon from '@/components/common/Icon/Icon.vue';
import HotColorList from '@/components/common/ColorPicker/HotColorList.vue';
import SelfColorList from '@/components/common/ColorPicker/SelfColorList.vue';
import DetailColorPicker from '@/components/common/ColorPicker/DetailColorPicker.vue';
import { useColorStore } from '@/store/module/useColors';
import { usePlaygroundStore } from '@/store/module/usePlayground';
const colorStore = useColorStore();
const PlaygroundStore = usePlaygroundStore();
function addColor() {
  colorStore.addHistoryColor(fontColor.value);
}
const fontColor = ref('#000000');
const initColor = ref('');
function visibleChange(val) {
  if (val) {
    initColor.value = fontColor.value;
  } else {
    if (initColor.value !== fontColor.value) {
      PlaygroundStore.setClickNodeAttr('fill', fontColor.value);
    }
  }
}
function colorChange(val) {
  fontColor.value = val;
  PlaygroundStore.setClickNodeAttr('fill', val, false);
}
onMounted(() => {
  update();
});
function update() {
  let node = PlaygroundStore.clickNode[0];
  const attrs = node.attrs;
  fontColor.value = attrs?.fill || '#000000';
}
watch(
  () => PlaygroundStore.slecetTimestape,
  () => {
    update();
  },
);
</script>
<style lang="less" scoped>
.color-picker {
  width: 240px;
  padding: 13px 8px;
  height: 100%;
  display: flex;
  flex-direction: column;

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
    }
  }

  .color-more {
    background: url('./colorMore.png') no-repeat;
    background-size: cover;
    position: relative;
  }

  .color-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);

    grid-column-gap: 28px;
    grid-row-gap: 10px;

    .color-btn {
      flex-shrink: 0;
      box-sizing: border-box;
      width: 36px;
      height: 36px;
      background: #cb5a5c;
      border-radius: 50%;
      border: 1px solid #fff;
    }

    .color-btn.active,
    .line.active {
      position: relative;

      &::after {
        content: ' ';
        top: 15px;
        left: 9px;
        width: 10px;
        height: 17px;
        position: absolute;
        display: table;
        border: 2px solid #fff;
        border-top: 0;
        border-left: 0;
        transform: rotate(45deg) scale(1) translate(-50%, -50%);
        opacity: 1;
        transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
      }
    }
  }

  .color-btn.line {
    border-color: #ececec;
  }
}

.color-input {
  display: flex;
  align-items: center;
  padding: 6px 7px 6px 12px;
  height: 40px;
  background: #f7f7f7;
  border-radius: 8px;
  width: 118px;
  margin-left: 10px;

  .color-value {
    width: 59px;
    flex: none;
    font-size: 12px;
    color: #666666;
    line-height: 17px;
    margin-right: 12px;
    letter-spacing: 1px;
  }

  .color-show {
    display: inline-block;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    flex-shrink: 0;
  }
}
</style>
