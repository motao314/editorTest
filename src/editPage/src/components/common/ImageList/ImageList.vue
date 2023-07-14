<template>
  <div
    v-if="list.length"
    :class="['list img-list-wrap', 'column-' + cloumn]"
    :style="listGridStyle"
    @scroll="listSrcoll"
  >
    <slot name="before"></slot>

    <div
      :class="['list-item', { loading: item.loading, selected: item.selected || modelValue === item[config.value] }]"
      v-for="(item, index) in list"
      :key="item[config.value] || index"
    >
      <div class="img-wrap" :style="imgStyle" @mousedown="draggable ? mdHandle($event, item) : null">
        <img
          :src="item[config.url]"
          @click="draggable ? null : selectHandler($event.target, item)"
          crossorigin="anonymous"
        />
        <div class="checkbox-box"></div>
        <!-- -->
        <div v-if="item.loading" class="loadding-icon">
          <a-spin :indicator="indicator" />
        </div>
      </div>
      <div class="item-name" v-if="item[config.label]" :style="imgStyle">
        {{ item[config.label] }}
      </div>

      <!-- focus -->
      <a-popover
        v-model:visible="item.show"
        placement="rightTop"
        :trigger="detailTrigger === 'mouseenter' ? 'hover' : detailTrigger"
        :alignConfig="{ offset: [100, 200] }"
        :overlayClassName="'no-arrow no-out-padding no-padding detail-popover ' + popClassName"
      >
        <template #content>
          <div class="detail-inner" @mouseleave="leave(item, index)" @mouseenter="enter(item, index)">
            <slot :item="item"></slot>
          </div>
        </template>
        <a-button
          v-if="showDetail"
          type="text"
          class="detail-btn"
          @mouseleave="leave(item, index)"
          @mouseenter="enter(item, index)"
          @[detailTrigger].stop="clickDetail(item, index)"
          >...</a-button
        >
      </a-popover>
    </div>
  </div>
  <!--   -->
  <div class="list-end" v-if="isLoading">
    <a-spin>正在加载中...</a-spin>
  </div>
  <div v-if="!isLoading && isLoaded && !list.length" class="empty-wrap">
    <Empty :text="emptyText" :image-url="`/assets/empty/${brandName}/default_empty.png`"></Empty>
  </div>
  <!-- <div v-else-if="isLoaded" class="list-end isover">已加载完成</div> -->
</template>

<script setup lang="ts">
import { nanoid } from 'nanoid';
import { computed, ref, h } from 'vue';
import { LoadingOutlined } from '@ant-design/icons-vue';
import Empty from '@/components/Empty/Empty.vue';
import { usePlaygroundStore } from '@/store/module/usePlayground';
import imgDrag from './ImageDrag';
import { useMainStore } from '@/store';
import { message } from 'ant-design-vue';
const MainStore = useMainStore();
const brandName = ref(MainStore.brand);
let PlaygroundStore = usePlaygroundStore();

const emit = defineEmits(['update:modelValue', 'change', 'srcollEnd', 'clickDetail']);
const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px',
  },
  spin: true,
});
function listSrcoll(e) {
  // 变量scrollTop是滚动条滚动时，距离顶部的距离
  const scrollTop = e.target.scrollTop;
  // 变量windowHeight是可视区的高度
  const clientHeight = e.target.clientHeight;
  // 变量scrollHeight是滚动条的总高度
  const scrollHeight = e.target.scrollHeight;
  // 滚动条到底部的条件
  const distance = scrollHeight - scrollTop - clientHeight;
  if (distance <= 200 && !props.isLoaded && !props.isLoading) {
    emit('srcollEnd', e);
  }
}

const props = defineProps({
  popClassName: {
    type: String,
  },
  detailTrigger: {
    type: String,
    // default: 'focus'
    default: 'click',
  },
  showDetail: {
    type: Boolean,
    default: true,
  },
  isAddToPlayground: {
    type: Boolean,
    default: false,
  },
  needDownload: {
    type: Boolean,
    default: true,
  },
  emptyText: {
    type: [String],
    default: '暂无素材，敬请期待～',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isLoaded: {
    type: Boolean,
    default: false,
  },
  imgStyle: {
    type: Object,
    default: () => {},
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  draggable: {
    type: Boolean,
    default: true, // true 可以拖拽
  },
  list: {
    default: () => [],
    type: Array,
  },
  config: {
    default: () => {
      return {
        label: 'name',
        value: 'id',
        url: 'url',
      };
    },
    type: Object,
  },
  cloumn: {
    default: 2,
    type: Number,
  },
});

function getSize(ele) {
  // let width = ele.naturalWidth;
  // let height = ele.naturalHeight;
  let maxWidth = ele.offsetWidth;
  let maxHeight = ele.offsetHeight;
  // let scale =  (width / height > maxWidth / maxHeight) ?(maxWidth / width):maxHeight / height
  // console.log(scale,'scale',ele,maxWidth,maxHeight)
  // return  {width:width*scale,height:height*scale}
  return { width: maxWidth, height: maxHeight };
}
const selectHandler = (target, item) => {
  if (props.needDownload) {
    item.loading = true;
  }
  emit('update:modelValue', item[props.config.value]);
  emit('change', { ...item, displaySize: getSize(target) });
};
const listGridStyle = computed(() => {
  let str = new Array(props.cloumn).fill('1fr').join(' ');
  return { 'grid-template-columns': str };
});
// image,url, srcId, materialId, materialDesc, displayRect
function dragend(target, item) {
  if (Number(item.groupId) === -1) {
    const content = item?.designCompositeElementExtDTO?.content;
    if (!content) {
      message.warn('此元素不符合规定，请选择其他');
      return false;
    }
    const groupInfo = JSON.parse(content);
    groupInfo.attrs.url = item.previewUrl;
    groupInfo.attrs.srcId = item.previewFid || item.sourceUrl;
    groupInfo.attrs.materialDesc = item.materialName;
    groupInfo.attrs.materialId = item.id;
    let minY = Infinity;
    let minX = Infinity;
    groupInfo.children.forEach((node) => {
      node.attrs.id = nanoid();
      minY = Math.min(minY, node.attrs.y);
      minX = Math.min(minX, node.attrs.x);
    });
    groupInfo.children.forEach((item, index) => {
      item.attrs.y = item.attrs.y - minY;
      item.attrs.x = item.attrs.x - minX;
    });
    let config = {
      groupInfo,
      displayRect: target.getBoundingClientRect(),
    };
    PlaygroundStore.addGroupToPos(config);
  } else {
    let config = {
      image: target,
      url: item.previewUrl || item.sourceUrl,
      srcId: item.previewFid,
      materialDesc: item.materialName,
      materialId: item.id,
      displayRect: target.getBoundingClientRect(),
    };
    PlaygroundStore.addImgToPos(config);
  }
}
function clickDetail(item, index) {
  item.show = !item.show;
  emit('clickDetail', { detail: item, index });
}

const mdHandle = imgDrag({ addPos: dragend, add: selectHandler });

const timer = ref({});
const leave = (item, index) => {
  clearTimeout(timer.value[index]);
  timer.value[index] = setTimeout(() => {
    item.show = false;
  }, 300);
};
const enter = (item, index) => {
  clearTimeout(timer.value[index]);
};
</script>
<style scoped lang="less">
.empty-wrap {
  flex: 1;
  padding-right: 15px;
}
.list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-content: start;
  flex: 1;
  overflow-y: auto;
  padding-left: 4px;
  padding-top: 4px;
  margin-top: 10px;
  padding-bottom: 20px;
  margin-left: -4px;
}

.list-item {
  grid-row-start: auto;
  box-sizing: border-box;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  line-height: 17px;
  position: relative;
  // margin-right: 4px;
  margin-right: 7px;
  cursor: pointer;

  .img-wrap {
    display: flex;
    width: 100%;
    height: 140px;
    color: #666666;
    position: relative;
    border-radius: 8px;
    margin-bottom: 8px;
    img {
      margin: auto;
      display: block;
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  &.selected {
    .checkbox-box {
      position: absolute;
      bottom: 6px;
      right: 6px;
      display: block;
      width: 21px;
      height: 21px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid @primary-color;
      border-radius: 4px;
      border-collapse: separate;
      transition: all 0.3s;
      z-index: 1100;
      &::after {
        content: ' ';
        top: 8px;
        left: 5px;
        width: 6px;
        height: 12px;
        position: absolute;
        display: table;
        border: 2px solid @primary-color;
        border-top: 0;
        border-left: 0;
        transform: rotate(45deg) scale(1) translate(-50%, -50%);
        opacity: 1;
        transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
      }

      .img-wrap {
        padding: 5px;
        border: 1px solid @primary-color;
        background-color: #fff;
        position: relative;
      }
    }
    .img-wrap {
      &::after {
        right: -3px;
        top: -3px;
        left: -3px;
        bottom: -3px;
        border: 1px solid @primary-color;
        border-radius: 8px;
        display: block;
        position: absolute;
        z-index: 1000;
        content: '';
        pointer-events: none;
      }
    }
  }
  .loadding-icon {
    position: absolute;
    bottom: 6px;
    right: 6px;
    display: block;
    width: 21px;
    height: 21px;
    // background: rgba(255, 255, 255, 0.9);
  }

  .item-name {
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    color: #666666;
    line-height: 12px;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail-btn {
    display: none;
    position: absolute;
    right: 5px;
    top: 5px;
    width: 22px;
    line-height: 4px;
    height: 15px;
    color: #fff;
    border-radius: 4px;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.5);
    font-size: 17px;
    cursor: pointer;
    z-index: 1000;
    padding: 0;
    :deep(span) {
      margin-top: -7px;
      margin-left: 2px;
      display: block;
      letter-spacing: 1px;
    }
  }

  &.loading {
    // .loadding-icon{
    //   display: block;
    // }
    // .img-wrap {
    //   &::after{
    //    display: block;
    //   }
    //  }
  }
  &:hover {
    .detail-btn {
      display: block;
    }
    .img-wrap {
      &::before {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 10;
        border-radius: 8px;
        pointer-events: none;
        background-color: rgba(0, 0, 0, 0.1);
        display: block;
      }
    }
  }

  &.active {
    border: 1px solid @primary-color;
  }
}

.loadding.isover {
  font-size: #333;
  text-align: center;
  line-height: 16px;
  background-color: #fff;
}
.list-end {
  text-align: center;
  font-size: 10px;
  overflow: hidden;
}

.detail-popover .detail-inner {
  padding: 16px 12px 16px 17px;
}
</style>

<style>
.shadowImg {
  position: fixed;
  z-index: 100;
  cursor: move;
  user-select: none;
}
.detail-popover .ant-popover-content {
  margin-left: 10px;
  margin-top: -6px;
  max-width: 220px;
}
</style>
