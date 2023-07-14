<template>
  <!-- show: isLoadedShow, -->
  <div ref="selectEle" class="select-list-container" :class="{ primary: type === 'primary' }">
    <!-- :style="paddingStyle" -->
    <div
      class="select-item"
      :class="{ active: item[config.value] === modelValue }"
      v-for="item in showList"
      :key="item[config.value]"
      @click="changeSlect(item)"
    >
      {{ item[config.label] }}
      <div v-if="type === 'select'" class="select-active">
        <div class="active-icon"></div>
        <div class="active-bg"></div>
      </div>
    </div>
    <div v-if="isShow" @click="changeShow(false)">
      <slot name="close">
        <div class="select-item last-btn"><span>收起</span><i class="arrow arrow-top"></i></div>
      </slot>
    </div>
    <div
      v-if="!isShow && list && list.length !== showList.length"
      class="more-btn"
      ref="moreBtn"
      @click="changeShow(true)"
    >
      <slot name="more">
        <div class="select-item last-btn"><span>更多</span><i class="arrow arrow-bottom"></i></div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue';
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  list: {
    default: () => [],
    type: Array,
  },
  type: {
    type: [String],
    default: 'select', // primary 高亮，selcet 选中
  },
  config: {
    default: () => {
      return {
        label: 'label',
        value: 'value',
      };
    },
    type: Object,
  },
});
const emit = defineEmits(['update:modelValue', 'change']);
const isShow = ref(false);
const selectEle = ref(null);
const showList = computed(() => {
  if (isShow.value) {
    return props.list || [];
  } else if (!props.list) {
    return [];
  } else {
    let width = 0;
    return props.list.filter((item, i) => {
      width += 21 + item[props.config.label].length * 12;
      let maxWidth = selectEle?.value?.clientWidth - 1 || 304;
      if (width <= maxWidth && i === props.list.length - 1) {
        return true;
      } else if (width + 40 <= maxWidth) {
        return true;
      } else {
        return false;
      }
    });
  }
});
const changeShow = (value) => {
  isShow.value = value;
};
const moreBtn = ref(null);
const changeSlect = (item) => {
  emit('update:modelValue', item[props.config.value]);
  emit('change', item);
};
</script>

<style scoped lang="less">
.select-list-container {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  color: #333333;
  line-height: 28px;
  // max-height: 35px;
  // padding-right: 48px;

  .arrow {
    width: 6px;
    height: 6px;
    transform-origin: 100% 0%;
  }

  .arrow-bottom {
    transform-origin: 80% 40%;
  }

  &.hold {
    padding-right: 0;
  }

  &.show {
    max-height: 50vh;
    overflow: auto;
  }
}

.select-item {
  position: relative;
  min-width: 40px;
  padding: 0 7px;
  box-sizing: border-box;
  text-align: center;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 6px;
  border: 1px solid @border-color-base;
  background-color: #fff;
  margin-left: 5px;
  margin-bottom: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: none !important;

  &.active {
    border: 1px solid @primary-color;
    color: @primary-color;
  }

  &.last-btn {
    margin-right: 0;
    .arrow-right {
      transform: rotate(45deg) translate(2px);
    }
    .arrow-top {
      transform: rotate(-45deg) translate(1px);
    }
  }

  .select-active {
    opacity: 0;
  }

  &.active .select-active {
    opacity: 1;
  }

  &.active,
  &:hover {
    color: @primary-color;
    border: 1px solid @primary-color;

    .arrow {
      border-color: @primary-color;
    }
  }

  .active-icon {
    position: absolute;
    right: 4px;
    bottom: 2px;
    width: 4px;
    height: 8px;
    transform-origin: 50% 50%;
    transform: rotate(45deg);
    border-right: 2px solid #fff;
    border-bottom: 2px solid #fff;
    z-index: 100;
  }

  .active-bg {
    transform-origin: 50% 50%;
    height: 30px;
    width: 30px;
    transform: rotate(45deg) translate(80%, 0);
    background-color: @primary-color-bg;
    position: absolute;
    right: 0;
    bottom: 0;
  }
}

.more-btn {
  // position: absolute;
  // right: 6px;
  // top: 0;
  cursor: pointer;
  // .select-item{
  //   margin-left: 0;
  // }

  &:hover .arrow {
    border-color: @primary-color;
  }
}

.primary {
  .select-item {
    &.active {
      background-color: @primary-color-bg;
      border-color: @primary-color-bg;
      color: #fff;
    }
  }
}
</style>
