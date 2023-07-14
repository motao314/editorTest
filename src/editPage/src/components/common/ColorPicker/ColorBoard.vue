<template>
  <div ref="boardElement" :class="['vc-saturation']" :style="{ backgroundColor: state.hueColor }" @mousedown="start">
    <div class="vc-saturation__white"></div>
    <div class="vc-saturation__black"></div>
    <div class="vc-saturation__cursor" ref="cursorElement">
      <div></div>
    </div>
  </div>
</template>
<script setup>
import { computed, getCurrentInstance, reactive, ref, watch, onMounted } from 'vue';
import { clamp, Color } from './color';
const props = defineProps(['color']);
const instance = getCurrentInstance();
const cursorElement = ref();
const boardElement = ref();
const emit = defineEmits(['change']);
const isDrag = ref(false);
const hueColor = new Color({
  h: props.color?.hue || 0,
  s: 1,
  v: 1,
}).toHexString();
console.log(props.color);
const state = reactive({
  hueColor,
  saturation: props.color?.saturation || 0,
  brightness: props.color?.brightness || 0,
});
const updatePosition = () => {
  if (cursorElement.value && !isDrag.value) {
    const el = instance.vnode.el;
    cursorElement.value.style.left = state.saturation * el?.clientWidth + 'px';
    cursorElement.value.style.top = (1 - state.brightness) * el?.clientHeight + 'px';
  }
};
const handleDrag = (event) => {
  if (instance) {
    const el = instance.vnode.el;
    const rect = el?.getBoundingClientRect();
    let left = event.clientX - rect.left;
    let top = event.clientY - rect.top;
    left = clamp(left, 0, rect.width);
    top = clamp(top, 0, rect.height);
    const saturation = left / rect.width;
    const bright = clamp(-(top / rect.height) + 1, 0, 1);
    state.saturation = saturation;
    state.brightness = bright;
    emit('change', saturation, bright);
    cursorElement.value.style.left = left + 'px';
    cursorElement.value.style.top = top + 'px';
  }
};
const start = (event) => {
  isDrag.value = true;
  let move = (event) => {
    handleDrag(event);
  };
  document.addEventListener('mousemove', move);
  document.addEventListener(
    'mouseup',
    () => {
      isDrag.value = false;
      document.removeEventListener('mousemove', move);
    },
    { once: true },
  );
  handleDrag(event);
  event.preventDefault();
};
onMounted(() => {
  if (boardElement.value) {
    setTimeout(() => {
      updatePosition();
    }, 100);
  }
});
watch(
  () => props.color,
  (value) => {
    if (isDrag.value) {
      return;
    }
    Object.assign(state, {
      hueColor: new Color({ h: value.hue, s: 1, v: 1 }).toHexString(),
      saturation: value.saturation,
      brightness: value.brightness,
    });
    updatePosition();
  },
  {
    deep: true,
  },
);
</script>
<style lang="less" scoped>
.vc-saturation {
  position: relative;
  margin-bottom: 15px;
  width: 100%;
  height: 130px;

  &__chrome {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border-color: transparent;
  }

  &__hidden {
    overflow: hidden;
  }

  &__white,
  &__black {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  &__black {
    background: linear-gradient(0deg, #000, transparent);
  }

  &__white {
    background: linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0));
  }

  &__cursor {
    position: absolute;

    div {
      transform: translate(-5px, -5px);
      box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.37);
      width: 10px;
      height: 10px;
      border: 1px solid white;
      border-radius: 50%;
      cursor: pointer;
    }
  }
}
</style>
