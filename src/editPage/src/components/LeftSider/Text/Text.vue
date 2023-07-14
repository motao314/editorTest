<template>
  <div class="text-wrap">
    <a-button class="text-wrap-btn" type="primary" style="width: 230px" @click="addText">
      <Icon type="jia"> </Icon>
      <span>点击添加文字</span>
    </a-button>
  </div>
</template>

<script setup>
import Icon from '@/components/common/Icon/Icon.vue';
import { usePlaygroundStore } from '@/store/module/usePlayground';
import { nextTick } from 'vue';
const PlaygroundStore = usePlaygroundStore();
let adding = false;
function addText() {
  if (adding) return;
  adding = true;
  PlaygroundStore.addText('双击可以编辑文字');
  setTimeout(() => {
    adding = false;
  }, 300);
}
</script>

<style lang="less" scoped>
.text-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  .text-wrap-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: @primary-color-bg;
  }

  :deep(.anticon) {
    color: #fff !important;
    font-size: 12px;
    margin-right: 8px;
  }
}
</style>
