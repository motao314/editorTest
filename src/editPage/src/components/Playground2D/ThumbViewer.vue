<template>
  <div class="change-status-btn" v-if="canvasLevel !== 'level-0' && layouts.length > 1">
    <Icon type="fanhui" @click="changeLevel('level-0', selectLayoutId || layoutId)"></Icon>
    <span class="text" @click="changeLevel('level-0', selectLayoutId || layoutId)">返回全部</span>
  </div>
  <div class="thumb-viewer-wrap" v-show="canvasLevel === 'level-0'">
    <div class="handle-btn left-btn" :class="{ 'empty-btn': layouts.length < 2, 'hide-btn':!isShowLeft }">
      <div class="icon-wrap" @click="scrollToTarget(-1)">
        <Icon type="shouqi"></Icon>
      </div>
    </div>
    <div>
      <a-tooltip placement="top">
        <template #title> 双击进入编辑 </template>
        <div class="title">{{ title }}</div>
        <div class="layout-list" ref="srcollList">
          <div
            class="layout-box"
            :class="{ active: layout.id === selectLayoutId }"
            v-for="layout in layouts"
            :key="layout.id"
            @dblclick.stop="changeLevel('level-1', layout.id)"
            @click.stop="selectChange(layout.id)"
            @mouseenter="hoverLayout(layout.id)"
            @mouseleave="hoverLayout(null)"
          >
            <div class="layout-item" ref="layoutEl">
              <img
                class="layout-image"
                v-show="canvasMapImg[layout.id]?.playgroundImg"
                :src="canvasMapImg[layout.id]?.playgroundImg"
                alt=""
              />
              <div class="layout-canvas"></div>
            </div>
            <div class="name" :title="layout.name">{{ layout.name }}</div>
          </div>
        </div>
      </a-tooltip>
    </div>
    <div class="handle-btn right-btn" :class="{ 'empty-btn': layouts.length < 2, 'hide-btn':!isShowRight }">
      <div class="icon-wrap" @click="scrollToTarget(1)">
        <Icon type="zhankai"></Icon>
      </div>
    </div>
  </div>
  <ThumbSelectFace v-if="canvasLevel !== 'level-0'"> </ThumbSelectFace>
</template>

<script setup>
import ThumbSelectFace from './ThumbSelectFace.vue';
import Icon from '@/components/common/Icon/Icon.vue';
import XXCanvas from '@/libs/xxCanvas/index';
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlaygroundStore } from '../../store/module/usePlayground';
import { useCharlet } from '../../store/module/useCharlet';
import { func } from 'vue-types';

let PlaygroundStore = usePlaygroundStore();
let charletStore = useCharlet();
let { layouts, canvasMap, selectLayoutId, canvasLevel, layoutId } = storeToRefs(PlaygroundStore);
let { canvasMap: canvasMapImg } = charletStore;
// console.log(canvasMapImg,999);
const title = ref('全部面纸');
const layoutEl = ref(null);
const activeIndex = ref(0);
const isShowLeft = computed(() => {
  return activeIndex.value >= 1;
});
const isShowRight = computed(() => {
  return activeIndex.value < (layouts.value.length-2) && layouts.value.length > 2;
});
const srcollList = ref(null);
// 获取适配缩放值
function getAdaptionScale({ width, height }, { width: maxWidth, height: maxHeight }) {
  let scale = 1;
  if (width / height > maxWidth / maxHeight) {
    scale = maxWidth / width;
  } else {
    scale = maxHeight / height;
  }
  return scale;
}
function createMask() {
  let list = srcollList.value.querySelectorAll('.layout-canvas');
  let layouts = PlaygroundStore.layouts;
  list.forEach((node, index) => {
    //console.log(node, PlaygroundStore.canvasMap[keys[index]].background);
    let boxSize = { width: node.clientWidth, height: node.clientHeight };
    let stage = new XXCanvas.Stage({
      container: node,
      width: boxSize.width,
      height: boxSize.height,
    });
    let bg = PlaygroundStore.canvasMap[layouts[index].id].background;
    let currentFaceList = bg.coverList;
    const scale = getAdaptionScale({ width: bg.width, height: bg.height }, boxSize);
    // console.log({ width: bg.width, height: bg.height }, boxSize, scale)
    var layer = new XXCanvas.Layer({ scaleX: scale, scaleY: scale });
    stage.absolutePosition({
      x: (boxSize.width - bg.width * scale) / 2,
      y: (boxSize.height - bg.height * scale) / 2,
    });
    let faces = currentFaceList.map((face) => {
      let node = new XXCanvas.Path({
        ...face.attrs,
        stroke: 'rgba(200,200,200,.1)',
        strokeWidth: 0.1 / scale,
        fill: 'rgba(150,150,150,.1)',
        name: 'face',
      });
      return node;
    });
    layer.add(...faces);
    stage.add(layer);
  });
}
onMounted(() => {
  // console.log(layoutEl.value[0].offsetLeft,'-----------------')
  if (!srcollList.value) {
    return;
  }
  createMask();
});
// watch(canvasLevel,()=>{
//   setTimeout(()=>{
//     if(!srcollList.value){
//       return;
//     }
//     //createMask();
//   },300);
// })
function changeLevel(level = 'level-1', id) {
  level === 'level-1' ? PlaygroundStore.goToDetail(level, id) : PlaygroundStore.goToAll(level, id);
}
function selectChange(id) {
  // console.log(PlaygroundStore.selectLayoutId,'selectChange')
  PlaygroundStore.setPlayId(id);
}
function hoverLayout(id) {
  let playground = PlaygroundStore?.currentUIPlayground;
  //console.log(playground && (playground.isDrag || playground.isSelectBox));
  if (playground && (playground.isDrag || playground.isSelectBox)) return;
  if (id == PlaygroundStore.selectLayoutId && id) return;
  PlaygroundStore?.currentStage?.activePlayChange(id ? true : false, id, true);
}
function scrollToTarget(arrow) {
  let targetPosition = srcollList.value.scrollLeft;
  if (arrow > 0) {
    targetPosition += 245;
  } else {
    targetPosition -= 245;
  }
  srcollList.value.scroll({
    left: targetPosition,
    behavior: 'smooth', // 添加平滑滚动效果
  });

  setTimeout(() => {
    activeIndex.value = Math.round(srcollList.value.scrollLeft / 120);
  }, 400);
}
</script>

<style lang="less" scoped>
.change-status-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  display: flex;
  cursor: pointer;
  :deep(.anticon) {
    color: #666666;
  }
  .text {
    margin-left: 10px;
    height: 20px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #666666;
    line-height: 20px;
  }
  &:hover {
    .text {
      color: @primary-color;
    }

    :deep(.anticon) {
      color: @primary-color;
    }
  }
}
.thumb-viewer-wrap {
  position: absolute;
  right: 10px;
  bottom: 30px;
  height: 190px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0px 0px 8px 0px rgba(221, 221, 221, 0.5);
  border-radius: 8px;
  padding: 14px 11px;
  display: flex;
  .handle-btn {
    display: grid;
    place-items: center;
    &.left-btn {
      margin-right: 6px;
    }
    &.right-btn {
      margin-left: 6px;
    }
    &.empty-btn {
      width: 18px;
    }
    .icon-wrap {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #d1d1d1;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      :deep(.anticon) {
        color: #fff;
        transform: rotate(-90deg);
        transform-origin: center center;
        font-size: 14px;
      }
      &:hover {
        background-color: #949494;
      }
    }
    &.hide-btn {
      visibility: hidden;
    }
    &.left-btn .icon-wrap {
      padding-right: 2px;
    }
    &.right-btn .icon-wrap {
      padding-left: 2px;
    }
  }
  .title {
    height: 17px;
    line-height: 17px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #666666;
    margin-bottom: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .layout-list {
    max-width: 245px;
    overflow: scroll;
    display: flex;
    flex-wrap: nowrap;
    position: relative;
    /* 隐藏竖向滚动条 */
    &::-webkit-scrollbar {
      width: 0px;
    }

    /* 隐藏横向滚动条 */
    &::-webkit-scrollbar {
      height: 0px;
    }
  }
  .layout-box {
    margin-right: 6px;
    margin-left: 6px;
    cursor: pointer;
  }
  .layout-item {
    box-sizing: content-box;
    width: 104px;
    height: 104px;
    padding: 2px;

    position: relative;
    border: 1px solid transparent;
    .svg-content,
    img {
      position: relative;
      z-index: 1;
      object-fit: contain;
      display: block;
      width: 100%;
      height: 100%;
    }
    .layout-canvas {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
    }
  }
  .layout-box {
    width: 110px;
    margin-right: 6px;
    margin-left: 6px;
    .name {
      height: 17px;
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      line-height: 17px;
      color: #666666;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      text-align: center;
      margin-top: 5px;
    }

    &.active,
    &:hover {
      .layout-item {
        border: 1px solid #ff6735;
      }
      .name {
        color: @primary-color;
      }
    }
  }
}
</style>
