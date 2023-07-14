<!--
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-07 10:43:03
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-11 11:20:26
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/RightSider/ImageEdit/ImageEdit.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <div class="title"><span>尺寸</span><span>(单位:mm)</span></div>
    <div class="size-wrap">
      <a-input
        v-model:value="width"
        size="large"
        type="number"
        :disabled="isLock"
        @blur="changeAttr('width', $event)"
        @pressEnter="changeAttr('width', $event)"
      >
        <template #suffix>
          <span class="unit">宽</span>
        </template>
      </a-input>
      <Icon type="lianjie" style="margin: 0 4px" class="lianjie-icon"></Icon>
      <a-input
        v-model:value="height"
        size="large"
        type="number"
        :disabled="isLock"
        @blur="changeAttr('height', $event)"
        @pressEnter="changeAttr('width', $event)"
      >
        <template #suffix>
          <span class="unit">高</span>
        </template>
      </a-input>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/common/Icon/Icon.vue';
import { ref, watch } from 'vue';
import { pxTOMM, mmToPX } from '../../../utils/toMM';
import { usePlaygroundStore } from '@/store/module/usePlayground';
const PlaygroundStore = usePlaygroundStore();

watch(
  () => [PlaygroundStore.slecetTimestape, PlaygroundStore.attrsChangeTimestape],
  (val, newValue) => {
    if (!PlaygroundStore.clickTargetNode?.[0]) return false;
    updateWidthHeight();
  },
);
let width = ref('');
let height = ref('');
let isLock = ref(true);
let scaleX = 1;
let scaleY = 1;
updateWidthHeight();
function updateWidthHeight() {
  let node = PlaygroundStore.clickTargetNode?.[0];
  let parent = node.getParent();
  if (parent.className === 'Group') {
    scaleX = parent.scaleX() || 1;
    scaleY = parent.scaleY() || 1;
  } else {
    scaleX = node.scaleX() || 1;
    scaleY = node.scaleY() || 1;
  }
  let attr = node?.getAttrs() || {};
  let h = (attr?.height ? attr.height : 0) * scaleY;
  let w = (attr?.width ? attr.width : 0) * scaleX;
  height.value = Math.abs(Math.round(pxTOMM(h)));
  isLock.value = attr?.lock || false;
  width.value = Math.abs(Math.round(pxTOMM(w)));
}

function changeAttr(attr, event) {
  let scale = attr === 'width' ? scaleX : scaleY;
  let val = Number(event.target.value) / scale;
  val = mmToPX(val);
  // console.log(attr,event);
  PlaygroundStore.setClickNodeAttr(attr, val);
}
</script>

<style lang="less" scoped>
.title {
  margin-bottom: 10px;
  height: 20px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  color: #333333;
  line-height: 20px;
  span:last-child {
    height: 17px;
    font-size: 12px;
    color: #999999;
    line-height: 17px;
    vertical-align: baseline;
  }
}

:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none !important;
}
:deep(input[type='number']) {
  -moz-appearance: textfield;
}
.size-wrap {
  display: flex;
  align-items: center;

  :deep(.ant-input-affix-wrapper) {
    background-color: #f7f7f7;
    border: none;
    // border-radius: 8px;

    .ant-input {
      background-color: #f7f7f7;
    }
  }
}
.lianjie-icon {
  :deep(.anticon) {
    font-size: 12px;
  }
}
</style>
