<template>
  <div class="self-color" :class="{ round: round, small: small }">
    <slot>
      <a-popover
        trigger="click"
        v-model:visible="show"
        placement="bottomLeft"
        overlayClassName="no-arrow no-padding"
        arrow-point-at-center
        @visibleChange="visibleChange"
      >
        <template #content>
          <div class="detail-color-outer-wrap">
            <DetailColorPicker :color="color" :initColor="initColor" :onSave="onSave" :onClose="onClose">
            </DetailColorPicker>
          </div>
        </template>
        <div class="color-more color-btn"></div>
      </a-popover>
    </slot>
    <div
      v-for="(item, index) in historyColors"
      :key="index"
      :class="[
        'color-btn ',
        {
          line: isLine(item?.dataTypeId),
          active: isActive(item?.dataTypeId, color),
          transparent: isTransparent(item?.dataTypeId),
        },
      ]"
      :style="{ background: item?.dataTypeId ? item?.dataTypeId : 'rgba(0,0,0,0)' }"
      @click="colorChange(item?.dataTypeId)"
    >
      <Icon v-if="isActive(item?.dataTypeId, color)" type="xuanzhong3" class="select-icon"></Icon>
    </div>
    <div class="color-btn disabled" v-for="(item, index) in defaultColorList" :key="index"></div>
  </div>
</template>
<script setup>
import DetailColorPicker from './DetailColorPicker.vue';
import tinycolor from 'tinycolor2';
import { ref, computed, watch } from 'vue';
import { useColorStore } from '@/store/module/useColors';
import { storeToRefs } from 'pinia';
import Icon from '@/components/common/Icon/Icon.vue';

const props = defineProps(['color', 'onSave', 'round', 'small', 'count']);
const emit = defineEmits(['update:color']);

const colorStore = useColorStore();
const { historyColors } = storeToRefs(colorStore);
const defaultColorList = computed(() => {
  let num = props.count - (colorStore.historyColors?.length || 0);
  return num > 0 ? new Array(num) : [];
});
const show = ref(false);
function formatColor(color) {
  if (!color || !color.trim()) {
    color = 'transparent';
  }
  return color !== 'transparent' ? tinycolor(color).toHex() : color;
}
const isLine = (itemColor) => {
  return formatColor(itemColor) === formatColor('#fff');
};
const isActive = (itemColor) => {
  return formatColor(itemColor) === formatColor(props.color || 'transparent');
};
const isTransparent = (itemColor) => {
  return itemColor === 'transparent';
};
const initColor = ref('');
function visibleChange(val) {
  if (val) {
    initColor.value = props.color;
  } else {
  }
}

const onClose = () => {
  show.value = false;
};
const onSave = (newColor) => {
  show.value = false;
  colorChange(newColor);
  colorStore.addHistoryColor(newColor);
};
const colorChange = (newColor) => {
  if (!newColor) {
    return;
  }
  colorStore.addHistoryColor(newColor);
  emit('update:color', newColor);
};
</script>
<style lang="less" scoped>
.self-color {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  max-height: 80px;
  overflow: hidden;

  .color-btn {
    flex-shrink: 0;
    box-sizing: border-box;
    width: 40px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid #fff;
    border-radius: 4px;
    background-color: #f4f4f4;
    cursor: pointer;
    :deep(.anticon) {
      display: block;
      color: #fff;
      top: 20%;
      left: 20%;
      position: absolute;
      font-weight: 800;
    }
    &.line {
      color: @primary-color;
    }
    &.disabled {
      cursor: not-allowed;
    }
  }

  &.small {
    max-height: 30px;

    .color-btn {
      width: 25px;
      height: 25px;
      margin: auto;
    }
    :deep(.anticon) {
      font-size: 16px;
      top: 16%;
      left: 16%;
    }
  }
}

.color-more {
  background: url('./icon/colorMore.png') no-repeat;
  background-size: cover;
  position: relative;
}

.transparent {
  background: url(./icon/transparent.png) center center repeat !important;
}

.color-btn.active,
.line.active {
  position: relative;
  :deep(.anticon) {
    display: block;
  }
  &.line {
    :deep(.anticon) {
      color: #3f3f3f;
    }
    border: 1px solid #eee;
  }
  &.transparent {
    :deep(.anticon) {
      color: #3f3f3f;
    }
  }
}

.color-btn.line {
  border-color: #ececec;
}

.detail-color-outer-wrap {
  padding: 8px;
  width: 240px;
}

.round .color-btn {
  border-radius: 50%;
}
</style>
