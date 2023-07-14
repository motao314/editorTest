<script setup>
import Operate from './Operate.vue';
import ThumbViewer from './ThumbViewer.vue';
import Rule from '../common/Rule/Rule.vue';
import { useRule } from '@/store/module/rule.js';
import { useCharlet } from '@/store/module/useCharlet';
import { ref, toRaw, onMounted, onBeforeUnmount, watch } from 'vue';
import { useMainStore } from '@/store/index.js';
import { usePlaygroundStore } from '@/store/module/usePlayground.js';
import { setKonvaRatio } from '@/libs/xxCanvas/index';
import EditCanvas from '@/libs/EditCanvas/index';
import HistoryViewer from './HistoryViewer.vue';
import { useRoute } from 'vue-router';
import { useLoaded } from '@/store/module/loaded';
const useLoadedStore = useLoaded();

const route = useRoute();
const emit = defineEmits(['clickEmpty']);
const MainStore = useMainStore();
const PlaygroundStore = usePlaygroundStore();

onMounted(() => {
  MainStore.setUrlParams(route.query);
  Init();
});
function Init() {
  isLoading.value = false;
  //console.log(MainStore.templateId,MainStore.designId,'MainStore.templateId',route.query)
  if (!MainStore.templateId) return;
  MainStore.getOriginData().then(() => {
    newCanvas();
    isLoading.value = true;
  });
}

async function newCanvas() {
  setKonvaRatio(window.devicePixelRatio);
  let size = getContainerSize();
  let padding = PlaygroundStore.getPadding(size);
  let dataMap = toRaw(PlaygroundStore.canvasMap);

  let playgroundList = toRaw(PlaygroundStore.layouts).map((item) => {
    let obj = dataMap[item.id];
    return {
      playground: obj.playground,
      id: item.id,
      background: { ...obj.background, name: item.name },
    };
  });
  // 设置画布像素比
  const stage = new EditCanvas({
    container: konvaWrap.value,
    padding: padding,
    playList: playgroundList,
    ...size,
  });
  PlaygroundStore.setCurrentCanvas(stage);
  // 添加辅助线
  stage.UIPlayground.initSnapDraggable();
  useRule().addStage(stage);
  useCharlet().setStage(stage);
  boxResize();
}
let konvaWrap = ref(null);

function boxResize() {
  // 获取要监听的元素
  // 创建一个观察器实例并传入回调函数
  var observer = new ResizeObserver(function (entries) {
    entries.forEach(function (entry) {
      requestAnimationFrame(resizeCanvas);
    });
  });
  // 传入目标节点
  observer.observe(konvaWrap.value);
}
function getContainerSize() {
  const ele = konvaWrap.value;
  if (!ele) {
    return;
  }
  let clientWidth = ele.clientWidth;
  let clientHeight = ele.clientHeight;
  let size = {
    width: clientWidth,
    height: clientHeight,
  };
  return size;
}
function resizeCanvas() {
  if (!konvaWrap.value) return;
  let size = getContainerSize();
  let padding = PlaygroundStore.getPadding(size);
  PlaygroundStore.currentStage.playAdaption({
    ...size,
    padding,
  });
}

let copyNodes = null;
const moveTimer = ref(0);
function updateActive(activeType) {
  const deg = PlaygroundStore.currentUIPlayground.deg || 0;
  if (deg >= 0 && deg < 90) {
    switch (activeType) {
      case 'shangyi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', -1.89);
        break;
      case 'xiayi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', 1.89);
        break;
      case 'zuoyi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', -1.89);
        break;
      default:
        PlaygroundStore.setCurrentNodeAttrAdd('x', 1.89);
        break;
    }
  } else if (deg <= 90) {
    switch (activeType) {
      case 'shangyi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', -1.89);
        break;
      case 'xiayi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', 1.89);
        break;
      case 'zuoyi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', 1.89);
        break;
      default:
        PlaygroundStore.setCurrentNodeAttrAdd('y', -1.89);
        break;
    }
  } else if (deg <= 1.898) {
    switch (activeType) {
      case 'shangyi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', 1.89);
        break;
      case 'xiayi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', -1.89);
        break;
      case 'zuoyi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', 1.89);
        break;
      default:
        PlaygroundStore.setCurrentNodeAttrAdd('x', -1.89);
        break;
    }
  } else {
    switch (activeType) {
      case 'shangyi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', 1.89);
        break;
      case 'xiayi':
        PlaygroundStore.setCurrentNodeAttrAdd('x', -1.89);
        break;
      case 'zuoyi':
        PlaygroundStore.setCurrentNodeAttrAdd('y', -1.89);
        break;
      default:
        PlaygroundStore.setCurrentNodeAttrAdd('y', 1.89);
        break;
    }
  }
}

function keydownHandler(event) {
  let tags = ['INPUT', 'TEXTAREA'];
  if (tags.includes(event.target.tagName) || event.target.className === 'editTextare') {
    return;
  }
  if (event.keyCode === 38) {
    //上移选中元素
    clearInterval(moveTimer.value);
    moveTimer.value = setInterval(() => {
      updateActive('shangyi');
    }, 30);
    event.preventDefault();
    return;
  }
  if (event.keyCode === 40) {
    //下移选中元素
    clearInterval(moveTimer.value);
    moveTimer.value = setInterval(() => {
      updateActive('xiayi');
    }, 30);
    event.preventDefault();
    return;
  }
  if (event.keyCode === 37) {
    //左移选中元素
    clearInterval(moveTimer.value);
    moveTimer.value = setInterval(() => {
      updateActive('zuoyi');
    }, 30);
    event.preventDefault();
    return;
  }
  if (event.keyCode === 39) {
    //右移选中元素
    clearInterval(moveTimer.value);
    moveTimer.value = setInterval(() => {
      updateActive('youyi');
    }, 30);
    event.preventDefault();
    return;
  }
  if (event.keyCode === 8) {
    //删除选中元素
    PlaygroundStore.delSelectedNodes();
    event.preventDefault();
    return;
  }
  // console.log(event.target.tagName, event, event.ctrlKey);
  // || event.target.contentEditable
  let playground = PlaygroundStore.currentUIPlayground;
  if (!playground) return;

  if (event.keyCode === 27) {
    PlaygroundStore.currentStage.clearStageSelect();
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.keyCode === 191) {
    MainStore.siderShowToggle();
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.keyCode === 83) {
    MainStore.onSave();
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.keyCode === 67) {
     playground.cloneSelectedNode();
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.keyCode === 88) {
    playground.cutSelectedNode();
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.keyCode === 86) {
    playground.stickCopyNodeToLayer();
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.keyCode === 76) {
    playground.changeSelectedNodeLock();
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.keyCode === 65) {
    playground.selectCurrentPlayAllNode();
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.keyCode === 90) {
    if (PlaygroundStore.redoDisabled.value) {
      console.warn('不可操作重做');
      return false;
    }
    PlaygroundStore.redoHistory();
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.keyCode === 90) {
    if (PlaygroundStore.undoDisabled.value) {
      console.warn('不可操作回退');
      return false;
    }
    PlaygroundStore.undoHistory();
    event.preventDefault();
    return;
  }
}
function keyupHandler() {
  clearInterval(moveTimer.value);
}
window.addEventListener('keydown', keydownHandler);
window.addEventListener('keyup', keyupHandler);
onBeforeUnmount(() => {
  window.removeEventListener('keydown', keydownHandler);
  window.removeEventListener('keyup', keyupHandler);
});
const isLoading = ref();
watch(
  () => route.query,
  () => {
    // 判断 designId 更新前为空，更新后为具体值，不需要更新
    if (window.isAutoChange) {
      window.isAutoChange = false;
    } else {
      useLoadedStore.view2d.progress = 0;
      isLoading.value = false;
      Init();
    }
  },
);
</script>
<template>
  <div class="canvas-wrap">
    <div class="layout-list" ref="konvaWrap"></div>
    <Operate></Operate>
    <slot></slot>
    <Rule></Rule>
    <ThumbViewer v-if="PlaygroundStore.layouts.length > 0 && isLoading"></ThumbViewer>
    <HistoryViewer></HistoryViewer>
  </div>
</template>
<style>
canvas {
  pointer-events: none;
}
</style>
<style scoped lang="less">
.bottom-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 10;
}

.canvas-wrap {
  position: relative;
  height: 100%;
  flex: 1;
  background-color: @bg-color;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.4s ease-in-out;
  padding-left: 20px;
  padding-top: 20px;

  .layout-list {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
</style>
