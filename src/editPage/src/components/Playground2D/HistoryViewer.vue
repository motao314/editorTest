<!--
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-11 23:12:52
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-26 15:43:32
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/Playground2D/HistoryViewer.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="history-viewer">
    <span class="history-viewer-back">
      <Icon type="houtui" :disabled="PlaygroundStore.undoDisabled" @click="handleUndo"></Icon>
    </span>
    <span class="history-viewer-next">
      <Icon type="qianjin" :disabled="PlaygroundStore.redoDisabled" @click="handleRedo"></Icon>
    </span>
  </div>
</template>

<script setup>
import { usePlaygroundStore } from '@/store/module/usePlayground.js';
import Icon from '@/components/common/Icon/Icon.vue';

const PlaygroundStore = usePlaygroundStore();

function handleUndo() {
  if (PlaygroundStore.undoDisabled.value) {
    console.warn('不可操作回退');
    return false;
  }
  PlaygroundStore.undoHistory();
  if (!PlaygroundStore.undoDisabled) {
    PlaygroundStore.clearFaceId();
  }
}

function handleRedo() {
  if (PlaygroundStore.redoDisabled.value) {
    console.warn('不可操作重做');
    return false;
  }
  PlaygroundStore.redoHistory();
  if (!PlaygroundStore.redoDisabled) {
    PlaygroundStore.clearFaceId();
  }
}
</script>

<style lang="less" scoped>
.history-viewer {
  position: absolute;
  width: 55px;
  top: 30px;
  right: 30px;
  display: flex;
  justify-content: space-between;

  &-back,
  &-next {
    cursor: pointer;
  }
}
</style>
