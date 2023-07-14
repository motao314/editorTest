<template>
  <div class="sliderbox-input-wrap">
    <div class="sliderbox-input">
      <span class="sliderbox-icon" @click="handleDown">
        <Icon type="jian"></Icon>
      </span>
      <a-slider
        class="sliderbox-wrap"
        v-model:value="sliderboxVal"
        :step="step"
        :min="min"
        :max="max"
        @change="sliderboxChange"
      />

      <span class="sliderbox-icon" @click="handleAdd">
        <Icon type="jia"></Icon>
      </span>
    </div>
    <div class="sliderbox-inputnumber">
      <a-input-number :min="min" :max="max" v-model:value="sliderboxVal" @change="handleNumberChange" />
      <div class="sliderbox-inputnumber-btns">
        <span class="upbtn triangle" @click="handleAdd"> </span>
        <span class="downbtn triangle" @click="handleDown"> </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue';
import Icon from '@/components/common/Icon/Icon.vue';
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
const sliderboxVal = ref(props.modelValue);

watch(
  () => props.modelValue,
  (value) => {
    console.log('更新', value);
    if (sliderboxVal.value !== value) {
      sliderboxVal.value = value;
    }
  },
);

function sliderboxChange() {
  emitUpdate();
}
function inputBlur() {
  emitUpdate();
}
function handleNumberChange() {
  emitUpdate();
}

function emitUpdate() {
  emit('update:modelValue', Math.round(sliderboxVal.value));
  emit('change', sliderboxVal.value);
}

/**
 * 减少
 */
function handleDown() {
  let num = sliderboxVal.value;

  num -= 1;

  setVal(num);
}

/**
 * 增加
 */
function handleAdd() {
  let num = sliderboxVal.value;

  num += 1;

  setVal(num);
}

function setVal(num) {
  num = num >= props.max ? props.max : num;
  num = num <= props.min ? props.min : num;
  sliderboxVal.value = num;
  emitUpdate();
}
</script>
<style lang="less" scoped>
.sliderbox-input-wrap {
  width: 100%;
  height: 36px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;

  .sliderbox-input {
    width: 80%;
    flex: 1 1 auto;
    display: flex;
    align-items: center;

    .sliderbox-icon {
      width: 20px;
      height: 20px;
      text-align: center;
      font-size: 18px;
      display: inline-block;
      line-height: 20px;
      cursor: pointer;
      color: @text-color-secondary;

      & > div {
        display: inline-block;
        height: 20px;
        line-height: 20px;

        :deep(.anticon) {
          color: #828282;
          font-size: 16px;
        }
      }
    }
    .sliderbox-wrap {
      width: 80%;
      display: inline-block;
    }

    .jian {
      margin-right: 15px;
    }
    .jia {
      margin-left: 15px;
    }
  }

  .sliderbox-inputnumber {
    position: relative;
    width: 82px;
    height: 36px;
    background: #f7f7f7;
    border-radius: 8px;

    :deep(.ant-input-number) {
      background: transparent;
      width: 100%;
      height: 100%;
      border: none;
      box-shadow: none;

      &:hover {
        border: none;
        outline: none;
      }
      &:focus {
        border: none;
        outline: none;
      }
    }

    .ant-input-number-handler-up-inner,
    :deep(.ant-input-number-handler-wrap) {
      display: none !important;
    }

    &-btns {
      position: absolute;
      right: 0;
      top: 0;
      width: 22px;
      height: 100%;
      // display: none;

      .downbtn {
        position: absolute;
        top: 20px;
        left: 3px;
      }

      .upbtn {
        position: absolute;
        top: 10px;
        left: 3px;
        transform: rotate(180deg);
      }
    }

    // &:hover{
    //   .sliderbox-inputnumber-btns{
    //     display: block;
    //   }
    // }
  }

  .sliderbox-wrap {
    :deep(.ant-slider-track) {
      background-color: @primary-color-bg;
    }
    :deep(.ant-slider-handle) {
      border-color: @primary-color;
    }
  }
}

.triangle {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #b5b3b3;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  cursor: pointer;

  // .inner {
  //   width: 100%;
  //   height: 100%;
  //   background-color: #000;
  //   border-top-left-radius: 5px;
  //   border-top-right-radius: 5px;
  // }
}
</style>
