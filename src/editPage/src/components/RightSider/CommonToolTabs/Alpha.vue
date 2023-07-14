<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-08 22:02:37
 * @LastEditors: Ammy ammy0620@aliyun.com
 * @LastEditTime: 2023-03-15 01:07:13
 * @FilePath: \XXEditor\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { onUnmounted, ref, computed, watch } from 'vue';
import Slider from '../../common/Slider/Slider.vue';
import { usePlaygroundStore } from '@/store/module/usePlayground';
const PlaygroundStore = usePlaygroundStore();

const currentCount = computed({
  get() {
    return PlaygroundStore.selectedNode.length > 1
      ? 100
      : Number(PlaygroundStore.selectedNode[0].getAttr('opacity')) * 100 || 100;
  },
  set(val) {
    PlaygroundStore.setCurrentNodeAttr('opacity', val / 100, false);
  },
});

function change(val, isRecord = false) {
  PlaygroundStore.setCurrentNodeAttr('opacity', val / 100, isRecord);
}
</script>

<template>
  <Slider title="透明度" :modelValue="currentCount" :min="1" :max="100" :step="1" @update:modelValue="change"></Slider>
</template>

<style scoped lang="less"></style>
