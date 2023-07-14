<template>
  <div>
    <icon-font :type="'icon-' + type" :class="{ disabled: disabled }" />
  </div>
</template>

<script setup>
import { createFromIconfontCN } from '@ant-design/icons-vue';
const props = defineProps(['type', 'disabled']);
const IconFont = createFromIconfontCN({
  scriptUrl: '/iconfont/iconfont.js',
});
</script>

<style lang="less" scoped>
:deep(.anticon) {
  font-size: 20px;
  color: #000;
}
.disabled {
  cursor: not-allowed;
  &.anticon {
    color: #b2b2b2;
  }
}
</style>
