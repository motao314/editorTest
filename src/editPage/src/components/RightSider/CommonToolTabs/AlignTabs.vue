<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-08 22:02:37
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-18 14:32:05
 * @FilePath: \XXEditor\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { onMounted, ref, watch } from 'vue';
import ButtonGroup from '@/components/common/ButtonGroup/ButtonGroup.vue';
import { usePlaygroundStore } from '@/store/module/usePlayground';
const PlaygroundStore = usePlaygroundStore();
const MenuList = [
  { name: '顶部对齐', type: 'top', icon: 'shangduiqi' },
  { name: '左对齐', type: 'left', icon: 'zuoduiqi2' },
  { name: '垂直居中', type: 'yCenter', icon: 'a-juzhongduiqi22' },
  { name: '水平居中', type: 'xCenter', icon: 'juzhongduiqi2' },
  { name: '底部对齐', type: 'bottom', icon: 'diduiqi' },
  { name: '右对齐', type: 'right', icon: 'youduiqi2' },
];

const activeTypeY = ref('');
const activeTypeX = ref('');
watch(
  () => PlaygroundStore.slecetTimestape,
  () => {
    update();
  },
);
onMounted(() => {
  update();
});
function update() {
  let x = '';
  let y = '';
  const selectedNode = PlaygroundStore.selectedNode;
  let Layout = PlaygroundStore.currentStage.Layout;
  if (selectedNode.length > 1) {
    x = Layout.isMultipleNodeXAlignment(selectedNode);
    y = Layout.isMultipleNodeYAlignment(selectedNode);
  } else {
    x = Layout.isNodeXAligen(selectedNode[0]);
    y = Layout.isNodeYAligen(selectedNode[0]);
  }
  activeTypeY.value = y;
  activeTypeX.value = x;
}

function updateActive(val) {
  PlaygroundStore.nodeAlgin(val);
  switch (val) {
    case 'left':
    case 'xCenter':
    case 'right':
      activeTypeX.value = val;
      break;
    case 'top':
    case 'yCenter':
    case 'bottom':
      activeTypeY.value = val;
      break;
  }
}
</script>

<template>
  <ButtonGroup
    :active="activeTypeX"
    :active2="activeTypeY"
    :list="MenuList"
    :column="2"
    type="list"
    @update="updateActive"
  />
</template>

<style scoped lang="less">
:deep(.anticon) {
  font-size: 14px !important;
}
</style>
