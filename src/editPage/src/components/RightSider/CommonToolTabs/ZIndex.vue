<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-08 22:02:37
 * @LastEditors: Ammy ammy0620@aliyun.com
 * @LastEditTime: 2023-03-15 02:03:46
 * @FilePath: \XXEditor\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { ref } from 'vue';
import ButtonGroup from '@/components/common/ButtonGroup/ButtonGroup.vue';
import { usePlaygroundStore } from '@/store/module/usePlayground';
const PlaygroundStore = usePlaygroundStore();
const MenuList = [
  { name: '置于顶层', type: 'top', icon: 'zhiyudingceng' },
  { name: '置于底层', type: 'bottom', icon: 'zhiyudiceng' },
  { name: '上移', type: 'up', icon: 'shangyiyiceng' },
  { name: '下移', type: 'down', icon: 'xiayiyiceng' },
];

const activeType = ref('');
function updateActive(val) {
  // activeType.value = val;
  PlaygroundStore.setZIndex(val);
}
</script>

<template>
  <ButtonGroup :list="MenuList" :column="2" type="list" @update="updateActive" />
</template>

<style scoped lang="less">
:deep(.anticon) {
  font-size: 14px !important;
}
</style>
