<!--
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-14 10:22:41
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-06-15 15:53:17
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/common/Slider/Slider.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="slider-input-wrap">
    <div class="title" v-if="title">{{ title }}</div>
    <div class="slider-input">
      <a-slider
        class="slider-wrap"
        v-model:value="sliderVal"
        :step="step"
        :min="min"
        :max="max"
        @change="sliderChange"
      />
      <a-input-number
        v-model:value="sliderVal"
        :min="min"
        :max="max"
        :step="step"
        @change="inputBlur"
        @blur="inputBlur"
        @pressEnter="inputBlur"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue';
const emit = defineEmits(['update:modelValue', 'change']);
/**
 * 选择器组件
 * modelValue 选择器的选中数值
 * title 显示的标题
 * step 步长
 * max 选择器的最大值
 * min 选择器的最小值
 * postifx 选择器的标量-显示单位用
 */

const props = defineProps({
  // 初始值
  modelValue: {
    type: Number,
    default: 50,
  },
  // 显示标题
  title: {
    type: String,
    defualt: '',
  },
  // 步长
  step: {
    type: Number,
    default: 1,
  },
  // 选择器的最大值
  max: {
    type: Number,
    default: 100,
  },
  // 最小值
  min: {
    type: Number,
    default: 0,
  },
});
// 组件状态数据
const sliderVal = ref(props.modelValue);

watch(
  () => props.modelValue,
  (value) => {
    if (sliderVal.value !== value) {
      sliderVal.value = value;
    }
  },
);

function sliderChange() {
  emitUpdate();
}
function inputBlur() {
  emitUpdate();
}

function emitUpdate() {
  let num = String(props.step).indexOf('.')!=-1? sliderVal.value : Math.round(sliderVal.value);
  emit('update:modelValue', num)
  sliderVal.value = num
  emit('change', num);
}
</script>
<style lang="less" scoped>
.slider-input-wrap {
  padding: 17px 10px 17px 14px;
  width: 240px;
  .title {
    height: 20px;
    font-size: 10px;
    color: #666666;
    line-height: 20px;
  }
  .slider-input {
    display: flex;
    align-items: center;
    .slider-wrap {
      flex: 1;
    }
  }
}
</style>
<style lang="less">
.slider-input-wrap {
  .ant-input-number-handler-wrap {
    padding: 3px 0;
  }
}
</style>
