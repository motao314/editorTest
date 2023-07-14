<!--
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-03-23 17:05:30
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-23 14:30:08
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/Loading/Loading.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLoaded } from '@/store/module/loaded';
import { useMainStore } from '@/store';
let MainStore = useMainStore();
const loadedStore = useLoaded();
const progress = ref(0);
watch(
  () => loadedStore.showView,
  (newVal) => {
    if (newVal === '3d') {
      progress.value = 0;
    }
  },
);
watch(
  () => [loadedStore.progress, loadedStore.showView],
  (newVal) => {
    let p = loadedStore.progress || 0;
    p = p.toFixed(0);
    progress.value = p * 100;
  },
);

const brandName = ref(MainStore.brand);
</script>
<template>
  <div class="loadingView">
    <div class="loadingWrap">
      <div class="progress">
        <div class="progress-bg"></div>
        <div class="progress-now" :style="{ width: progress + '%' }">
          <div :class="`progress-icon ${brandName}`"></div>
        </div>
      </div>
      <p class="progress_text">加载中…{{ progress ? progress : 0 }}%</p>
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
  height: 44px;
}
.progress {
  position: relative;
  height: 8px;
}
.progress-bg {
  height: 8px;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid @primary-color;
}
.progress-now {
  width: 50%;
  position: absolute;
  left: 0;
  top: 0;
  height: 10px;
  height: 8px;
  background: linear-gradient(145deg, @primary-color-bg 0%, @primary-color-bg 100%);
  border-radius: 4px;
}
.progress-icon {
  position: absolute;
  right: 0;
  top: -49px;
  width: 46px;
  height: 45px;
  background-size: contain;
  transform: translate(18px, 0);
  &.ele {
    background-image: url(/assets/brand/ele_loadingIcon.png);
  }
  &.zhulaoda {
    background-image: url(/assets/brand/zhulaoda_loadingIcon.png);
  }
}
.progress_text {
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 20px;
  color: @primary-color;
  text-align: center;
}
</style>
