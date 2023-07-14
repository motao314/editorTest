<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-08 22:02:37
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-26 15:44:54
 * @FilePath: \XXEditor\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { ref, watch } from 'vue';
import Icon from '@/components/common/Icon/Icon.vue';
import Transform from './Transform.vue';
import RotateTabs from './Rotate.vue';
import AlignTabs from './AlignTabs.vue';
import Alpha from './Alpha.vue';
import ZIndex from './ZIndex.vue';
import { usePlaygroundStore } from '@/store/module/usePlayground';
const PlaygroundStore = usePlaygroundStore();
const activeType = ref();
const commonMenu = ref([]);
const base = [
  { text: '对齐', type: 'duiqi', icon: 'duiqi', slotName: 'duiqi' },
  // { text: '移动', type: 'yidong', icon: 'tihuantupian' },
  // { text: '透明度', type: 'toumingdu', icon: 'beijing' },
  { text: '复制', type: 'fuzhi', icon: 'fuzhituceng' },
  { text: '删除', type: 'shanchu', icon: 'shanchu' },
];
const justSingle = [
  { text: '层级', type: 'cengji', icon: 'tuceng11', slotName: 'cengji' },
  { text: '旋转', type: 'xuanzhuan', icon: 'xuanzhuan2', slotName: 'xuanzhuan' },
];
const lock = [{ text: '锁定', type: 'suoding', icon: 'suoding' }];
const unlock = [{ text: '解锁', type: 'jiesuo', icon: 'suoding', selected: true }];
// 是否有详情展示
function initTabs() {
  commonMenu.value = [...base];
  let node = PlaygroundStore.clickTargetNode?.[0];
  if (PlaygroundStore.selectedAllNode.length > 1) {
    // commonMenu.value = [...commonMenu.value]
  } else if (PlaygroundStore.clickTargetNode?.length === 1) {
    let type = node?.getClassName();
    if (type === 'Text' || type === 'Image' || type === 'Group') {
      commonMenu.value = [...commonMenu.value, ...justSingle];
    }
    if (PlaygroundStore.selectedAllNode[0].getAttr('lock')) {
      commonMenu.value.forEach((item) => {
        item.disabled = true;
      });
      commonMenu.value = [...commonMenu.value, ...unlock];
    } else {
      commonMenu.value.forEach((item) => {
        item.disabled = false;
      });
      commonMenu.value = [...commonMenu.value, ...lock];
    }
  }
}
initTabs();
watch(
  () => {
    return PlaygroundStore.slecetTimestape;
  },
  () => {
    initTabs();
  },
);
function updateActive(item) {
  if (item.disabled) return;
  if (activeType.value === item.type) return;
  activeType.value = '';

  switch (item.type) {
    case 'fuzhi':
      PlaygroundStore.currentUIPlayground.cloneSelectedNodeToLayer();
      break;
    case 'shanchu':
      PlaygroundStore.currentUIPlayground.deleteSelectedNode();
      break;

    case 'suoding': {
      PlaygroundStore.currentUIPlayground.changeSelectedNodeLock(true);
      break;
    }
    case 'jiesuo': {
      PlaygroundStore.currentUIPlayground.changeSelectedNodeLock(false);

      break;
    }
    default:
      activeType.value = item.type;
      break;
  }
}
</script>

<template>
  <div class="icon-list">
    <a-popover
      v-for="item in commonMenu"
      :key="item.icon"
      trigger="click"
      placement="bottom"
      overlayClassName="no-arrow no-padding"
    >
      <template #content>
        <div class="content-wrap" v-if="activeType && item.type === activeType">
          <ZIndex v-if="item.type === 'cengji'"></ZIndex>
          <AlignTabs v-if="item.type === 'duiqi'"></AlignTabs>
          <Transform v-if="item.type === 'tuceng'"></Transform>
          <RotateTabs v-if="item.type === 'xuanzhuan'"></RotateTabs>
          <Alpha v-if="item.type === 'toumingdu'"></Alpha>
        </div>
      </template>
      <a-tooltip placement="topLeft">
        <template #title>
          <div>{{ item.text }}</div>
        </template>
        <div class="tab-item" :class="{ disabled: item.disabled, active: item.selected }">
          <Icon :type="item.icon" :disabled="item.disabled" color="#fff" @click="updateActive(item)" />
        </div>
      </a-tooltip>
    </a-popover>
  </div>
</template>
<style></style>
<style scoped lang="less">
.icon-list {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 14px;
  overflow: hidden;

  .tab-item {
    flex: 1;
    cursor: pointer;
    height: 34px;
    line-height: 34px;
    border-radius: 8px;
    margin-right: 1px;
    :deep(.anticon) {
      color: #3f3f3f;
    }
    &:not(.disabled) {
      &:hover,
      &.active {
        :deep(.anticon) {
          color: @primary-color !important;
        }

        background-color: @bg-hover;
      }
    }

    &.disabled {
      cursor: not-allowed;
      :deep(.anticon) {
        color: #bdbdbd;
      }
    }
  }
}

.content-wrap {
  width: 230px;
  margin: 0 auto;
}
</style>
