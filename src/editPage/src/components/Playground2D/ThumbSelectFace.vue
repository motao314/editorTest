<template>
  <div class="change-status-btn" v-if="canvasLevel === 'level-2'">
    <Icon type="fanhui" @click="clearFace"></Icon>
    <span class="text" @click="clearFace">返回全部面</span>
  </div>
  <div class="thumb-wrap" v-if="canvasLevel !== 'level-0'">
    <div class="title">{{ layoutName }}</div>
    <div class="layout-item-wrap">
      <div class="layout-item" ref="faceBox"></div>
      <img v-if="layoutImg" :src="layoutImg" />
    </div>
    <div class="name">{{ hoverName || faceName }}</div>
  </div>
</template>

<script setup>
import Icon from '@/components/common/Icon/Icon.vue';
import XXCanvas from '@/libs/xxCanvas/index';
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlaygroundStore } from '../../store/module/usePlayground';
import { useCharlet } from '../../store/module/useCharlet';
let PlaygroundStore = usePlaygroundStore();
let { canvasLevel, layoutId } = storeToRefs(PlaygroundStore);

const charletStore = useCharlet();
const currentFaceList = computed(() => PlaygroundStore.currentCanvasMap?.background?.coverList);
const faceName = computed(() => {
  //console.log(PlaygroundStore.currentCanvasMap,currentFaceList.value, 'PlaygroundStore.currentCanvasMap',PlaygroundStore.selectFaceId)
  let face = currentFaceList.value?.find((item) => item.attrs.id === PlaygroundStore.selectFaceId);
  return face?.attrs?.surfaceName || '全部面';
});
const layoutName = computed(() => {
  return PlaygroundStore.currentCanvasMap.name;
});
//console.log(charletStore,PlaygroundStore.layoutId,"imgsrc");
const layoutImg = computed(() => {
  return charletStore.canvasMap[PlaygroundStore.layoutId]?.playgroundImg;
});

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

const faceBox = ref(null);
const stage = ref(null);
let hoverName = ref('');
function clearFace() {
  stage.value.find('.face').forEach((element) => {
    element.fill('rgba(235,235,235,.3)');
  });
  PlaygroundStore.setLightBackgroud();
}
function bindEvent(node) {
  node.on('dblclick', (e) => {
    let faceId = e.target.getAttr('id');
    PlaygroundStore.setLightBackgroud(layoutId.value, faceId);
    stage.value.find('.face').forEach((element) => {
      if (element.getAttr('id') !== faceId) {
        element.fill('rgba(235,235,235,.3)');
      }
    });
  });

  // 监听圆形形状的hover事件
  node.on('mouseover', function (e) {
    node.fill('rgba(241,56.72,.3)');
    let faceId = e.target.getAttr('id');
    PlaygroundStore.currentStage.setFaceHover(layoutId.value, faceId);
    hoverName.value = e.target.getAttr('surfaceName');
  });

  node.on('mouseout', (e) => {
    let faceId = e.target.getAttr('id');
    PlaygroundStore.currentStage.setFaceHover(layoutId.value);
    if (e.target.attrs.id === PlaygroundStore.selectFaceId) return;
    node.fill('rgba(235,235,235,.3)');
    hoverName.value = '';
  });
}
onMounted(() => {
  let boxSize = { width: faceBox.value.clientWidth, height: faceBox.value.clientHeight };
  stage.value = new XXCanvas.Stage({
    container: faceBox.value,
    width: boxSize.width,
    height: boxSize.height,
  });
  let bg = PlaygroundStore.currentCanvasMap?.background;
  const scale = getAdaptionScale({ width: bg.width, height: bg.height }, boxSize);
  var layer = new XXCanvas.Layer({ scaleX: scale, scaleY: scale });
  stage.value.absolutePosition({
    x: (boxSize.width - bg.width * scale) / 2,
    y: (boxSize.height - bg.height * scale) / 2,
  });
  let faces = currentFaceList.value.map((face) => {
    let node = new XXCanvas.Path({
      ...face.attrs,
      stroke: '#fff',
      strokeWidth: 1.5 / scale,
      fill: 'rgba(235,235,235,.3)',
      name: 'face',
      listening: true,
    });
    bindEvent(node);
    return node;
  });
  layer.add(...faces);
  stage.value.add(layer);
});
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
.thumb-wrap {
  position: absolute;
  right: 10px;
  bottom: 30px;
  height: 190px;
  background: #ffffff;
  box-shadow: 0px 0px 8px 0px rgba(221, 221, 221, 0.5);
  border-radius: 8px;
  padding: 14px 0;
  opacity: 0.8;
  text-align: center;
  padding: 14px 18px 16px;
  width: 147px;
  height: 190px;
  box-sizing: border-box;

  .title {
    height: 17px;
    line-height: 17px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #666666;
    margin-bottom: 7px;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .layout-item-wrap {
    position: relative;
    width: 110px;
    height: 110px;
    img {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  .layout-item {
    position: relative;
    z-index: 2;
    width: 110px;
    height: 110px;
    cursor: pointer;
  }

  .name {
    height: 17px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    line-height: 17px;
    color: @primary-color;
    margin-top: 7px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
