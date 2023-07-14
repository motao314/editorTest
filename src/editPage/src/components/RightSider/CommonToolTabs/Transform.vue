<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-08 22:02:37
 * @LastEditors: Ammy ammy0620@aliyun.com
 * @LastEditTime: 2023-03-19 15:44:10
 * @FilePath: \XXEditor\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { ref } from 'vue';
import ButtonGroup from '@/components/common/ButtonGroup/ButtonGroup.vue';
import { usePlaygroundStore } from '@/store/module/usePlayground';
const PlaygroundStore = usePlaygroundStore();
const MenuList = [
  { name: '上移', type: 'shangyi', icon: 'shangyiyiceng' },
  { name: '下移', type: 'xiayi', icon: 'xiayiyiceng' },
  { name: '左移', type: 'zuoyi', icon: 'shangyiyiceng' },
  { name: '右移', type: 'youyi', icon: 'xiayiyiceng' },
];

function updateActive(val) {
  activeType.value = val;
  const deg = PlaygroundStore.currentUIPlayground.deg || 0;
  if (deg >= 0 && deg < 90) {
    switch (activeType.value) {
      case 'shangyi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', -1);
        break;
      case 'xiayi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', 1);

        break;
      case 'zuoyi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', -1);

        break;
      default:
        PlaygroundStore.setCurrentNodeAttrAdd('x', 1);

        break;
    }
  } else if (deg <= 90) {
    switch (activeType.value) {
      case 'shangyi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', -1);

        break;
      case 'xiayi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', 1);

        break;
      case 'zuoyi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', 1);

        break;
      default:
        PlaygroundStore.setCurrentNodeAttrAdd('y', -1);

        break;
    }
  } else if (deg <= 180) {
    switch (activeType.value) {
      case 'shangyi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', 1);

        break;
      case 'xiayi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', -1);
        break;
      case 'zuoyi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', 1);
        break;
      default:
        PlaygroundStore.setCurrentNodeAttrAdd('x', -1);
        break;
    }
  } else {
    switch (activeType.value) {
      case 'shangyi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', 1);

        break;
      case 'xiayi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', -1);
        break;
      case 'zuoyi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', -1);

        break;
      default:
        PlaygroundStore.setCurrentNodeAttrAdd('y', 1);

        break;
    }
  }
  setTimeout(() => {
    activeType.value = null;
  }, 1000);
}
</script>

<template>
  <ButtonGroup :list="MenuList" :column="2" type="list" @update="updateActive" />
</template>

<style scoped lang="less">
:deep(.anticon) {
  font-size: 14px !important;
  color: #acacac !important;
}
</style>
