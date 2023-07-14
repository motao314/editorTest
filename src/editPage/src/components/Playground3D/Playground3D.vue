<template>
  <div class="canvas-wrap" ref="wrap" @click="emit('clickEmpty')">
    <slot></slot>
    <div class="group-btns toggle-btns">
      <div class="btn" :class="{ active: isOpen }" @click="open">开</div>
      <div class="btn" :class="{ active: !isOpen }" @click="close">合</div>
    </div>
    <div id="playground3D" ref="playgroundElement"></div>
  </div>
</template>
<script setup>
import { onMounted, ref, toRaw, onUnmounted } from 'vue';
import {
  closeAnimation,
  init3D,
  openAnimation,
  resize,
  unWheelEvent,
  onWheelEvent,
  releaseAll3DResources,
} from './Playground3D.js';
import { usePlaygroundStore } from '@/store/module/usePlayground.js';
import { storeToRefs } from 'pinia';
import { useLoaded } from '../../store/module/loaded';
const loaded = useLoaded();
const PlaygroundStore = usePlaygroundStore();
const { models, boxs, canvasMap, layoutId } = storeToRefs(PlaygroundStore);
const emit = defineEmits(['clickEmpty']);
const isOpen = ref(false);
const wrap = ref();
function toResize() {
  // 获取要监听的元素
  // 创建一个观察器实例并传入回调函数
  var observer = new ResizeObserver(function (entries) {
    entries.forEach(function (entry) {
      resize();
    });
  });
  // 传入目标节点
  observer.observe(wrap.value);
}
onMounted(() => {
  const playground3D = document.getElementById('playground3D');
  init3D(playground3D, toRaw(models.value), toRaw(boxs.value), toRaw(canvasMap.value));
  toResize();
  onWheelEvent();
});
onUnmounted(() => {
  unWheelEvent();
  releaseAll3DResources();
});
function open() {
  if (isOpen.value) {
    return;
  }
  isOpen.value = true;
  openAnimation();
}

function close() {
  if (!isOpen.value) {
    return;
  }
  isOpen.value = false;
  closeAnimation();
}
</script>

<style scoped lang="less">
.scale-btn {
  user-select: none;
  position: absolute;
  left: 40%;
  #bottom-px();

  .ant-input-prefix {
    overflow: hidden;
    user-select: none;
  }

  ::deep(input.ant-input) {
    text-align: right;
  }

  .btn {
    width: 35px;
    text-align: center;
    color: #3f3f3f;
    font-size: 20px;
    line-height: 40px;
    user-select: none;
    margin-top: -3px;

    cursor: pointer;

    &:hover {
      color: @primary-color;
    }

    &.add-btn {
      text-align: left;
      width: 30px;
    }

    ::deep(.ant-input-suffix) {
      margin-left: 10px;
    }

    &.minus-btn {
      transform: scaleX(2);
    }
  }
}

.group-btns {
  display: flex;
  height: 32px;
  padding: 5px;
  background-color: #fff;
  border-radius: 8px;

  .btn {
    width: 50px;
    box-sizing: border-box;
    display: grid;
    place-content: center;
    text-align: center;
    color: #666666;
    border-radius: 8px;
    cursor: pointer;

    &:first-child {
      border-radius: 8px 0px 0px 8px;
    }

    &:last-child {
      border-radius: 0px 8px 8px 0px;
    }

    &.active {
      background: @primary-color-bg;
      color: #fff;
    }

    &.hover-light:hover {
      border-radius: 6px;
      background: @bg-hover;
      color: @primary-color;
    }
  }
}

#bottom-px() {
  bottom: 30px;
}

.toggle-btns {
  user-select: none;
  position: absolute;
  right: 16px;
  padding: 0;
  font-size: 14px;
  #bottom-px();
}

.canvas-wrap {
  position: relative;
  height: 100%;
  flex: 1;
  background-color: @bg-color;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.4s ease-in-out;

  #playground3D {
    height: 100%;
    width: 100%;
  }
}
</style>
