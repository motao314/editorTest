<template>
  <div class="list-wrap">
    <div class="bigTitle">{{ bigTitle }}</div>
    <div class="title">{{ title }}</div>
    <div class="list" :class="[type, { extend: isShow, 'list-cloumn-2': column === 2, 'list-cloumn-3': column === 3 }]">
      <div class="list-item" v-for="item in list" :style="styleObj" :key="config.value ? item[config.value] : item">
        {{ config.label ? item[config.label] : item }}
      </div>
    </div>
    <div class="extend-btn" @click="changeVisibleHandle" v-if="isShowArrow">
      {{ isShow ? '收起' : '更多' }} <i :class="['arrow', isShow ? 'arrow-top' : 'arrow-bottom']"></i>
    </div>
  </div>
</template>
<script setup>
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
let emit = defineEmits('changeVisible');
const props = defineProps({
  type: {
    type: String,
    default: 'text', // around
  },
  bigTitle: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  list: {
    default: () => [],
    type: Array,
  },
  column: {
    type: Number,
    default: 1,
  },
  row: {
    type: Number,
    default: 1,
  },
  config: {
    default: () => {
      return {};
    },
    type: Object,
  },
});
let isShow = ref(false);
function changeVisibleHandle() {
  isShow.value = !isShow.value;
}
let styleObj = computed(() => {
  return props.column ? { width: 100 / props.column + '%' } : {};
});

let isShowArrow = computed(() => {
  if (props.row * props.column) {
    return props.list.length > props.row * props.column;
  }
  let length = 0;
  props.list.map((item) => {
    let str = props.config.label ? props.item[props.config.label] : item;
    length += str.length * 12 + 28;
  });
  return length > 204 * 2;
});
</script>

<style scoped lang="less">
.bigTitle {
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 800;
  color: #333333;
  line-height: 20px;
  margin-bottom: 14px;
}
.extend-btn {
  font-size: 12px;
  text-align: center;
  padding-top: 12px;
  cursor: pointer;
}
.list-wrap {
  .title {
    font-size: 12px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 800;
    color: #333333;
    line-height: 22px;
    margin-bottom: 8px;
  }
  .list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-content: start;
    color: #666;
    max-height: 48px;
    overflow: hidden;
    transition: all 0.2s ease-in-out;
    &.around {
      max-height: 63px;
    }
    &.extend {
      max-height: 1000px;
      transition: all 0.2s ease-in-out;
    }
    &.around .list-item {
      height: 26px;
      line-height: 26px;
      padding: 0 9px;
      background: #f7f7f7;
      border-radius: 4px;
      margin-right: 5px;
      width: auto;
      white-space: nowrap;
    }

    .list-item {
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      color: #666666;
      line-height: 20px;
      margin-bottom: 5px;
      position: relative;
      white-space: nowrap;
    }
    &.text .list-item {
      &::after {
        content: '';
        height: 10px;
        border-right: 1px solid #d6d6d6;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        margin-right: 5px;
        margin-left: 5px;
      }
      &:last-child::after {
        display: none;
      }
    }
    &.list-cloumn-2 .list-item {
      &:nth-child(2n-1) {
        padding-right: 10px;
      }
      // &:nth-child(2n){
      //   text-align: right;

      // }
      &::after {
        padding-left: 15px;
      }
      &:nth-child(2n) {
        padding-left: 15px;
        &::after {
          display: none;
        }
      }
    }
    &.list-cloumn-3 .list-item {
      &:nth-child(3n-2) {
        padding-right: 10px;
      }
      &:nth-child(3n-1) {
        text-align: center;
        padding-right: 10px;
      }
      &:nth-child(3n) {
        text-align: right;
        &::after {
          display: none;
        }
      }
    }
  }
}
</style>
