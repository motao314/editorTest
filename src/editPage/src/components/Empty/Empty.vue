<template>
  <div class="wrap">
    <img :src="imageUrl" class="img" />
    <div class="desc">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/store';
import { ref, onMounted } from 'vue';

let MainStore = useMainStore();

const brandName = ref(MainStore.brand);
const props = defineProps({
  text: {
    default: '暂无素材，敬请期待～',
  },
  imageUrl: {
    default: `/assets/empty/ele/default_empty.png`,
  },
});
</script>

<style lang="less" scoped>
.wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.img {
  width: 127px;
}

.desc {
  height: 20px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: @primary-color;
  line-height: 20px;
  margin-top: 10px;
}
</style>
