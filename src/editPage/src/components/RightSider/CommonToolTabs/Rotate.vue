<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-08 22:02:37
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-06-08 10:37:03
 * @FilePath: \XXEditor\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { onUnmounted, ref, computed, watch, onMounted } from 'vue';
import ButtonGroup from '@/components/common/ButtonGroup/ButtonGroup.vue';

import { usePlaygroundStore } from '@/store/module/usePlayground';
import rotationNode from './rotation';
import { addImageProcess } from '@/libs/xxCanvas';
const PlaygroundStore = usePlaygroundStore();

const activeType = ref('');
let baseMenu = [
  { name: '顺时针90°', type: 'youyi', icon: 'a-shunshizhen90' },
  { name: '逆时针90°', type: 'zuoyi', icon: 'a-nishizhen90' },
];
const MenuList = ref();
watch([() => PlaygroundStore.slecetTimestape, PlaygroundStore.attrsChangeTimestape], (val, newValue) => {
  if (!PlaygroundStore.clickTargetNode?.[0]) return false;
  updateView();
});
let currentNode = null;
updateView();
function updateView() {
  currentNode = PlaygroundStore.getSelectedNode()[0];
  if (!currentNode) return;
  let menu = [...baseMenu];
  if (currentNode.getClassName() === 'Image') {
    let slcaleX = currentNode.scaleX() < 0;
    let slcaleY = currentNode.scaleY() < 0;
    let justImage = [
      { name: '左右翻转', type: 'shuiping', icon: 'zuoyoufanzhuan', selected: slcaleX },
      { name: '上下翻转', type: 'chuizhi', icon: 'shangxiafanzhuan', selected: slcaleY },
    ];
    menu = [...menu, ...justImage];
  }
  MenuList.value = menu;
}

// 原始数据
// 画布上操作后

function changeValue(deg) {
  let node = PlaygroundStore.getSelectedNode()[0];
  const attrs = rotationNode(node, deg);
  PlaygroundStore.setClickNodeRotation(attrs);
}

// 水平镜像
let loading = false;
async function shuiping() {
  if (loading) return false;
  loading = true;
  let ele = PlaygroundStore.clickNode?.[0];
  let x = ele.x();
  let y = ele.y();
  let rad = (ele.rotation() * Math.PI) / 180;
  const rcos = Math.cos(rad);
  const rsin = Math.sin(rad);
  let f = ele.scaleX() || 1;
  let attrs = {
    scaleX: -ele.scaleX(),
    x: x + f * ele.width() * rcos,
    y: y + f * ele.width() * rsin,
  };
  PlaygroundStore.setClickNodeAttrs(attrs);
  loading = false;
}
// 垂直镜像
async function chuizhi() {
  if (loading) return false;
  loading = true;
  let ele = PlaygroundStore.clickNode?.[0];
  let x = ele.x();
  let y = ele.y();
  let rad = (ele.rotation() * Math.PI) / 180;
  const rcos = Math.cos(rad);
  const rsin = Math.sin(rad);
  let f = ele.scaleY() || 1;
  let h = f * ele.height() * rcos;
  let attrs = {
    scaleY: -ele.scaleY(),
    x: x - f * ele.height() * rsin,
    y: y + f * ele.height() * rcos,
  };
  PlaygroundStore.setClickNodeAttrs(attrs);
  loading = false;
}
// 重置
function updateActive(val) {
  switch (val) {
    case 'shuiping':
      shuiping();
      updateView();
      break;
    case 'chuizhi':
      chuizhi();
      updateView();
      break;
    case 'zuoyi':
      changeValue(-90);
      // rotationHandle(currentRotate.value - 90);
      break;
    case 'youyi':
      changeValue(90);
      // rotationHandle(currentRotate.value + 90);

      break;
    default:
      break;
  }
}
</script>

<template>
  <ButtonGroup :active="activeType" :list="MenuList" :column="2" type="list" @update="updateActive" />
</template>

<style scoped lang="less">
:deep(.anticon) {
  font-size: 14px !important;
}
</style>
