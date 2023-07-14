<template>
  <div :class="['vc-hue-slider']">
    <div ref="barElement" class="vc-hue-slider__bar">
      <div :class="['vc-hue-slider__bar-pointer']" ref="cursorElement">
        <div class="vc-hue-slider__bar-handle"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import gesture from '@/utils/gesture';
const props = defineProps(['color']);
const emit = defineEmits(['change']);
const parentColor = reactive(props.color);
const color = reactive({ hue: parentColor.hue || 0 });
const barElement = ref(null);
const cursorElement = ref(null);
const getCursorLeft = () => {
  if (barElement.value && cursorElement.value) {
    const rect = barElement.value.getBoundingClientRect();
    const offsetWidth = cursorElement.value.offsetWidth;
    if (color.hue === 360) {
      return rect.width - offsetWidth / 2;
    }
    return ((color.hue % 360) * (rect.width - offsetWidth)) / 360 + offsetWidth / 2;
  }
  return 0;
};
const onMoveBar = (event) => {
  event.stopPropagation();
  if (barElement.value && cursorElement.value) {
    const rect = barElement.value.getBoundingClientRect();
    const offsetWidth = cursorElement.value.offsetWidth;
    let left = event.clientX - rect.left;
    left = Math.min(left, rect.width - offsetWidth / 2);
    left = Math.max(offsetWidth / 2, left);
    const hue = Math.round(((left - offsetWidth / 2) / (rect.width - offsetWidth)) * 360);
    color.hue = hue;
    emit('change', hue);
    updatePosition(left);
  }
};
onMounted(() => {
  if (barElement.value) {
    gesture(barElement.value);
    barElement.value.addEventListener('start', (e) => {
      onMoveBar(e);
    });
    barElement.value.addEventListener('move', (e) => {
      onMoveBar(e);
    });
    updatePosition();
  }
});
const updatePosition = (l) => {
  const left = l || getCursorLeft();
  if (cursorElement.value) {
    cursorElement.value.style.left = left + 'px';
  }
};
watch(
  () => props.color,
  (value) => {
    color.hue = value.hue;
    updatePosition();
  },
  { deep: true },
);
</script>
<style lang="less" scoped>
.vc-hue-slider {
  position: relative;
  margin-bottom: 15px;
  width: 100%;
  height: 14px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  border-radius: 15px;

  &.is-vertical {
    width: 14px;
    height: 100%;
    display: inline-block;
    transform: rotate(180deg);
  }

  &.transparent {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
    background-repeat: repeat;
  }

  &__bar {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 15px;
    background: -webkit-linear-gradient(
      left,
      rgb(255, 0, 0) 0%,
      rgb(255, 255, 0) 16.66%,
      rgb(0, 255, 0) 33.33%,
      rgb(0, 255, 255) 50%,
      rgb(0, 0, 255) 66.66%,
      rgb(255, 0, 255) 83.33%,
      rgb(255, 0, 0) 100%
    );
    background: -moz-linear-gradient(
      left,
      rgb(255, 0, 0) 0%,
      rgb(255, 255, 0) 16.66%,
      rgb(0, 255, 0) 33.33%,
      rgb(0, 255, 255) 50%,
      rgb(0, 0, 255) 66.66%,
      rgb(255, 0, 255) 83.33%,
      rgb(255, 0, 0) 100%
    );
    background: -ms-linear-gradient(
      left,
      rgb(255, 0, 0) 0%,
      rgb(255, 255, 0) 16.66%,
      rgb(0, 255, 0) 33.33%,
      rgb(0, 255, 255) 50%,
      rgb(0, 0, 255) 66.66%,
      rgb(255, 0, 255) 83.33%,
      rgb(255, 0, 0) 100%
    );

    &-pointer {
      position: absolute;
      width: 14px;
      height: 14px;
      top: 0;
    }

    &-handle {
      width: 14px;
      height: 14px;
      border-radius: 6px;
      transform: translate(-7px, -2px);
      background-color: #f8f8f8;
      margin-top: 2px;
      box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.37);
      cursor: pointer;

      &.vertical {
        transform: translate(0, -7px);
        margin-top: 0;
      }
    }
  }
}
</style>
