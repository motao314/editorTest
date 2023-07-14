<template>
  <div class="detail-color-picker">
    <ColorBoard :color="state.color" @change="onBoardChange"> </ColorBoard>
    <ColorHue :color="state.color" :max="max" @change="onHueChange"></ColorHue>
    <div class="control">
      <a-select
        v-model:value="colorType"
        :options="options"
        :dropdownMatchSelectWidth="false"
        size="small"
        @dropdownVisibleChange="dropdownVisibleChange"
        @change="changeType"
      >
      </a-select>
      <!-- :class="{ is_hex: colorType === 'HEX' }" -->
      <div class="input-wrap">
        <a-input v-model:value="showColor" @pressEnter="onInputChange" @blur="onInputChange" />
      </div>
      <span style="flex: 1"></span>
      <Icon type="zhongzhi" class="reset-btn" @click="reset"></Icon>
      <span class="handle-text reset-btn" @click="reset">重置</span>
    </div>
    <div v-if="onClose && onSave">
      <a-button class="close" @click.stop="onClose">取消</a-button>
      <a-button danger class="save" @click.stop="onSaveHandle"> 确定 </a-button>
    </div>
  </div>
</template>
<script setup>
import Icon from '../Icon/Icon.vue';
import tinycolor from 'tinycolor2';
import ColorBoard from './ColorBoard.vue';
import ColorHue from './ColorHue.vue';
import { reactive, ref, watch } from 'vue';
import { Color } from './color';
const props = defineProps(['initColor', 'color', 'max', 'onSave', 'onClose']);
const state = reactive({ color: new Color(props.color) });
const emit = defineEmits(['update:color']);
const colorHex = ref(state.color.toHexString());
const colorType = ref('HEX'); //、rgb、hex/cmyk
const options = ref([
  {
    value: 'CMYK',
    label: 'CMYK',
  },
  {
    value: 'RGB',
    label: 'RGB',
  },
  {
    value: 'HEX',
    label: 'HEX',
  },
]);
const showColor = ref("");// 显示出来的color值
const getShowColor = ()=>{
    if(colorType.value === "HEX"){
        return props.color
    }
    return getColor(props.color,colorType.value,"HEX");
}
showColor.value = getShowColor();

watch(()=>[props.color,colorType.value],()=>{
  showColor.value = getShowColor();
});


function rgbToCmyk(R, G, B) {
  if (R == 0 && G == 0 && B == 0) {
    return [0, 0, 0, 1];
  } else {
    var calcR = 1 - R / 255,
      calcG = 1 - G / 255,
      calcB = 1 - B / 255;

    var K = Math.min(calcR, Math.min(calcG, calcB)),
      C = (calcR - K) / (1 - K),
      M = (calcG - K) / (1 - K),
      Y = (calcB - K) / (1 - K);

    return [C, M, Y, K];
  }
}
function cmykToRgb(c, m, y, k) {
  var r = 255 * (1 - c) * (1 - k);
  var g = 255 * (1 - m) * (1 - k);
  var b = 255 * (1 - y) * (1 - k);

  return [r, g, b];
}
let beforeType = '';
function dropdownVisibleChange() {
  console.log('dropdownVisibleChange', colorType.value);
  beforeType = colorType.value;
}
function changeType() {
  if (beforeType === colorType) return;
  colorHex.value = getColor(colorHex.value, colorType.value, beforeType);
}
function getColor(color, type, oldType) {
  if (oldType === 'CMYK') {
    color = cmykToRgb(...color.split(','));
    color = `rgb(${color.join(',')})`;
  }
  var colorObj = tinycolor(color);
  if (type === 'CMYK') {
    let obj = colorObj.toRgb();
    console.log(obj, 'rgb color');

    let newColor = rgbToCmyk(obj.r, obj.g, obj.b);
    console.log(newColor, 'newColor');

    return newColor.join(',');
  } else if (type === 'RGB') {
    return colorObj.toRgbString();
  } else {
    return colorObj.toHexString();
  }
}
const onHueChange = (hue) => {
  state.color.hue = hue;
  let colorHEX = state.color.toHexString();
  colorHex.value = getColor(colorHEX, colorType.value, 'HEX');
  emit('update:color', colorHEX);
};

const onBoardChange = (saturation, brightness) => {
  state.color.saturation = saturation;
  state.color.brightness = brightness;
  let colorHEX = state.color.toHexString();
  colorHex.value = getColor(colorHEX, colorType.value, 'HEX');
  emit('update:color', colorHEX);
};
const onInputChange = (event) => {
  const target = event.target;
  const hex = target.value;
  state.color.hex = getColor(hex, 'HEX', colorType.value);
  emit('update:color', "#"+state.color.hex);
};

function onSaveHandle() {
  emit('update:color', '#' + state.color.hex);
  props.onSave && props.onSave('#' + state.color.hex);
}
function reset() {
  let str = tinycolor(props.initColor).toHexString();
  state.color.hex = str;
  colorHex.value = str;
  colorType.value = 'HEX';
  emit('update:color', str);
}
watch(
  () => props.color,
  (value) => {
    state.color.hex = value;
    colorHex.value = tinycolor(value).toHexString();
    console.log();
  },
  { deep: true },
);
</script>
<style scoped lang="less">
.detail-color-picker {
  width: 100%;
  background: #ffffff;
  box-sizing: border-box;

  .control {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .ant-input {
      padding: 5px 10px;
      width: 90px;
      display: inline-block;
      height: 30px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #dcdcdc;
      color: #666666;
    }
    .select-options {
      width: 100px;
    }

    .ant-select-arrow {
      transform: scaleX(1.2);
    }

    .ant-select-selector {
      height: 30px !important;
      border: none;
      padding-top: 5px;
      align-items: center;
      color: #666666;
    }

    .input-wrap {
      margin-left: 10px;

      &.is_hex {
        position: relative;

        &::before {
          content: '#';
          position: absolute;
          left: 5px;
          top: 5px;
          text-align: center;
          font-size: 14px;
          z-index: 1000;
        }

        .ant-input {
          padding-left: 16px;
        }
      }
    }

    .handler-icon {
      width: 16px;
      height: 16px;
      background: url('./straw.png') no-repeat;
      background-size: 100% 100%;
      // margin-top:5px;
    }

    .handle-text {
      font-size: 12px;
      color: #666666;
      margin-left: 5px;
    }
  }

  .save,
  .close {
    height: 34px;
    line-height: 34px;
    padding: 0px;
    min-width: 72px;
    text-align: center;
    border-radius: 8px;
  }

  .save {
    width: 140px;
    margin-left: 10px;
  }
}
.reset-btn {
  cursor: pointer;
  white-space: nowrap;
  :deep(.anticon) {
    font-size: 18px !important;
    color: #8e8e8e !important;
  }
}
</style>
