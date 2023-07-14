<!--
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-03-23 17:05:30
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-06-06 18:10:57
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/Loading/Loading.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

<script setup>
import { ref, computed, watch } from 'vue';
import { useLoaded } from '@/store/module/loaded';
const loadedStore = useLoaded();
const progress = computed(() => {
  let p = loadedStore.progress || 0;
  return p * 100;
});
</script>
<template>
  <div class="loadingView">
    <div class="loadingWrap">
      <div class="loadingIcon">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="text">保存中…</p>
    </div>
  </div>
</template>

<style scoped lang="less">
.loadingView {
  display: flex;
  position: relative;
  height: 100%;
  flex: 1;
  background-color: @bg-color;
  box-sizing: border-box;
  overflow: hidden;
}
.loadingWrap {
  margin: auto;
  width: 292px;
  height: 88px;
}

@keyframes loading {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.loop (@index) when (@index <= 12) {
  & > span:nth-child(@{index}) {
    transform: rotate(30deg * @index);
    animation: loading 0.6s infinite @index * 0.05s alternate linear;
  }
  .loop(@index + 1);
}
.loadingIcon {
  position: relative;
  margin: 0 auto;
  width: 55px;
  height: 55px;
  span {
    position: absolute;
    top: 0;
    left: 25px;
    width: 5px;
    height: 12px;
    background: @primary-color-bg;
    border-radius: 3px;
    transform-origin: center 22.5px;
  }
  .loop(1);
}
.text {
  text-align: center;
  margin-top: 15px;
  font-size: 12px;
  line-height: 18px;
  color: @primary-color;
}
</style>
