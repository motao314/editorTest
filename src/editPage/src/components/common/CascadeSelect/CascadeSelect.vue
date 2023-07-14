<template>
  <div class="header" v-show="isShowSecond" @click="back">
    <i class="arrow arrow-left"></i><span class="parentName">{{ fristLabel }}</span>
  </div>
  <SelectTabs
    v-if="!isShowSecond"
    :list="list"
    :model-value="fristValue"
    type="primary"
    :config="config"
    @update:model-value="levelOneUpdate"
    @change="levelOneChange"
  ></SelectTabs>
  <div :class="['horizontal-container', { show: isShowSecond }]">
    <div class="btn-box left" :class="{ hide: !isShowPrevious }" @click="previousHandle">
      <Icon type="left" class="handle-icon"></Icon>
    </div>

    <div class="scroll-wrapper" ref="scrollWrap">
      <div class="scroll-content">
        <div
          :class="[
            'select-item',
            {
              active: item[config.value] === secondValue,
            },
          ]"
          v-for="(item, index) in secondList"
          :key="index"
          @click="selectHandle($event, item, index)"
        >
          {{ item[config.label] }}
          <div class="select-active">
            <div class="active-icon"></div>
            <div class="active-bg"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-box right" :class="{ hide: !isShowNext }" @click="nextHandle">
      <Icon type="right" class="handle-icon"></Icon>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import SelectTabs from '../SelectTabs/SelectTabs.vue';
import Icon from '../Icon/Icon.vue';

const emit = defineEmits(['update:fristValue', 'update:secondValue', 'fristChange', 'secondChange']);
const props = defineProps({
  fristValue: {
    default: '',
  },
  secondValue: {
    default: '',
  },
  list: {
    default: () => [],
    type: Array,
  },
  list2: {
    default: () => [],
    type: Array,
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
  key: {
    defult: 'id',
  },
});
const activeTagIndex = ref(0);
const isShowSecond = ref(false);

const scrollWrap = ref(null);
watch(isShowSecond, (value) => {
  if (value) {
    setTimeout(() => {
      updateTagList(0);
      showArrow();
    }, 300);
  }
});

const isShowPrevious = ref(false);
const isShowNext = ref(true);
function showArrow() {
  setTimeout(() => {
    let left = scrollWrap.value.scrollLeft;
    isShowPrevious.value = left > 0 ? true : false;
    isShowNext.value = scrollWrap.value.scrollWidth > left + scrollWrap.value.offsetWidth + 1 ? true : false;
  }, 300);
}
function previousHandle() {
  let width = scrollWrap.value.scrollLeft - scrollWrap.value.width;
  if (width <= 0) {
    isShowPrevious.value = false;
    width = 0;
  }
  updateTagList(width);
  showArrow();
}

function nextHandle() {
  let width = scrollWrap.value.scrollLeft + scrollWrap.value.offsetWidth;
  if (scrollWrap.value.scrollWidth <= width) {
    width = scrollWrap.value.scrollWidth;
    isShowNext.value = false;
  }
  updateTagList(width);
  showArrow();
}

function selectHandle(event, item, index) {
  console.log(event);
  activeTagIndex.value = index;
  let offsetLeft = event.target.offsetLeft; // 获取当前对象到其上级层左边的距离.
  let eleWidth = event.target.offsetWidth;
  let scrollX = scrollWrap.value.scrollLeft; // 设置或获取位于对象左边界和窗口中目前可见内容的最左端之间的距离
  let scrollWrapWidth = scrollWrap.value.offsetWidth;
  let allWidth = scrollWrap.value.scrollWidth;
  console.log(allWidth, scrollX, eleWidth, offsetLeft, scrollWrapWidth, 'offsetWidthoffsetWidth');
  if (offsetLeft < scrollX) {
    updateTagList(offsetLeft);
  } else if (scrollX + scrollWrapWidth > offsetLeft && offsetLeft + eleWidth > scrollX + scrollWrapWidth) {
    updateTagList(allWidth);
  }
  showArrow();
  emit('update:secondValue', item[props.config.value]);
  emit('secondChange', item);
}

function updateTagList(left) {
  scrollWrap.value.scroll({
    left,
    behavior: 'smooth', // 添加平滑滚动效果
  });
}

const getList = ref([]);
const secondList = computed(() => {
  return props.list2 || getList.value;
});
let fristLabel = ref('');
function levelOneChange(item) {
  console.log('levelOneChange', item);

  fristLabel.value = item[props.config.label];
  isShowSecond.value = true;
  getList.value = item.children;
  emit('fristChange', item);
}
const levelOneUpdate = (val, i) => {
  console.log('levelOneUpdate', val);
  emit('update:fristValue', val);
};

const back = () => {
  emit('update:secondValue', '');
  emit('update:fristValue', '');
  // emit('secondChange', '')
  emit('fristChange', '');
  activeTagIndex.value = 0;
  isShowSecond.value = false;
};
</script>

<style lang="less" scoped>
.header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #333333;
  font-weight: 700;
  font-family: PingFangSC-Medium, PingFang SC;
  font-size: 14px;
  cursor: pointer;

  .arrow {
    border-color: #333333;
  }

  .parentName {
    margin-left: 4px;
  }
}

.horizontal-container {
  width: 100%;
  display: flex;
  height: 0px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  &.show {
    height: auto;
  }

  .btn-box {
    width: 16px;
    height: 100%;
    box-sizing: border-box;
    padding-top: 5px;
    cursor: pointer;

    &.hide {
      visibility: hidden;
    }

    &.left {
      left: 0;
    }

    &.right {
      right: 0;
    }
  }
  .handle-icon {
    :deep(.anticon) {
      font-size: 16px;
      color: #848484;
    }
  }

  .scroll-wrapper {
    flex: 1;
    // width: 100%;
    white-space: nowrap;
    overflow-x: auto;
    position: relative;

    .scroll-content {
      display: inline-block;
    }

    .select-item {
      display: inline-block;
      position: relative;
      min-width: 40px;
      padding: 5px 7px;
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

      &.active {
        border: 1px solid @primary-color;
        color: @primary-color;
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
  }
}
.scroll-wrapper {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
