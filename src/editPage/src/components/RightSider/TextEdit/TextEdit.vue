<template>
  <div>
    <FontFamily></FontFamily>
    <div class="font-style-wrap">
      <div class="font-input-wrap">
        <a-input-number v-model:value="fontSize" :min="9" :max="500" @blur="inputBlur" @change="fontSizeChange">
        </a-input-number>
        <span class="unit">px</span>
      </div>
      <ColorPicker></ColorPicker>
    </div>
    <ButtonGroup
      :active="activeType1"
      :list="MenuList1"
      :column="3"
      type="group"
      @update="updateActive1"
      style="margin-bottom: 20px"
    />
    <ButtonGroup
      :active="align"
      :list="MenuList2"
      :column="3"
      type="group"
      @update="updateActive2"
      style="margin-bottom: 20px"
    />
    <ButtonGroup :list="MenuList3" :column="3" type="group" @update="updateActive3" style="margin-bottom: 20px">
      <template #letterSpacing>
        <Slider
          title="字间距"
          :modelValue="letterSpacing"
          :min="0"
          :max="100"
          :step="1"
          @update:modelValue="letterSpacingChange"
        ></Slider>
      </template>
      <template #lineheight>
        <Slider
          title="行间距"
          :modelValue="lineHeight"
          :min="1"
          :max="5"
          :step="0.1"
          @update:modelValue="lineHeightChange"
        ></Slider>
      </template>
    </ButtonGroup>
  </div>
</template>

<script setup>
import ColorPicker from './ColorPicker.vue';
import ButtonGroup from '@/components/common/ButtonGroup/ButtonGroup.vue';
import Slider from '../../common/Slider/Slider.vue';
import FontFamily from './FontFamily.vue';
import { ref, computed, watch, onMounted } from 'vue';
import { usePlaygroundStore } from '@/store/module/usePlayground';
const PlaygroundStore = usePlaygroundStore();
// -----字体 -----------
// 字颜色 字号

const fontSize = ref(0);

const fontSizeChange = (value) => {
  fontSize.value = value;
  PlaygroundStore.setClickNodeAttr('fontSize', value, false);
};
const inputBlur = (e) => {
  fontSize.value = Number(e.target.value);
  PlaygroundStore.setClickNodeAttr('fontSize', fontSize.value, true);
};

// -------- 加粗  倾斜 下划线 ----
const activeType1 = ref('');
const fontWeight = ref(false);
const fontStyle = ref(false);
const textDecoration = ref(false);

const MenuList1 = computed(() => {
  return [
    { text: '加粗', type: 'jiachu', icon: 'jiacu', selected: fontWeight.value },
    { text: '倾斜', type: 'qingxie', icon: 'qingxie', selected: fontStyle.value },
    { text: '下划线', type: 'xiahuaxian', icon: 'xiahuaxian', selected: textDecoration.value },
  ];
});
function updateActive1(value) {
  switch (value) {
    case 'jiachu':
      fontWeight.value = !fontWeight.value;
      break;
    case 'qingxie':
      fontStyle.value = !fontStyle.value;
      break;
    case 'xiahuaxian':
      textDecoration.value = !textDecoration.value;
      break;
  }
  let attrs = {
    fontStyle: `${fontWeight.value ? 'bold' : ''} ${fontStyle.value ? 'italic' : ''}`,
    textDecoration: textDecoration.value ? 'underline' : 'none',
  };
  PlaygroundStore.setClickNodeAttrs(attrs);
}

//  ----- 对齐----------
const align = ref('left');

const writeMode = ref('horizontal');

const MenuList2 = computed(() => {
  return writeMode.value === 'vertical'
    ? [
        { text: '顶对齐', type: 'left', icon: 'zuoduiqi' },
        { text: '居中对齐', type: 'center', icon: 'juzhongduiqi' },
        { text: '底对齐', type: 'right', icon: 'youduiqi' },
      ]
    : [
        { text: '左对齐', type: 'left', icon: 'zuoduiqi' },
        { text: '居中对齐', type: 'center', icon: 'juzhongduiqi' },
        { text: '右对齐', type: 'right', icon: 'youduiqi' },
      ];
});
function updateActive2(val) {
  align.value = val;
  PlaygroundStore.setClickNodeAttr('align', val);
}
// -----   字间距 行间距 文字竖排 ----------

const MenuList3 = computed(() => {
  return [
    {
      text: '文字竖排',
      type: 'shupai',
      icon: 'wenzihengshupaifang',
      selected: writeMode.value == 'vertical',
      slotName: 'vertical',
    },
    { text: '字间距', type: 'zijianju', icon: 'zijianju', selected: false, slotName: 'letterSpacing' },
    { text: '行间距', type: 'hangjianju', icon: 'hangjianju', selected: false, slotName: 'lineheight' },
  ];
});
function updateActive3(val) {
  if (val === 'shupai') {
    writeMode.value = writeMode.value == 'vertical' ? 'horizontal' : 'vertical';
    PlaygroundStore.setClickNodeWriteMode(writeMode.value);
  }
}

const letterSpacing = ref(0);
const letterSpacingChange = (value) => {
  console.log("字间距",value);
  letterSpacing.value = value;
  PlaygroundStore.setClickNodeAttr('letterSpacing', value);
};

const lineHeight = ref(1);
const lineHeightChange = (value) => {
  value = value ? value : 1;
  lineHeight.value = value;
  PlaygroundStore.setClickNodeAttr('lineHeight', value);
};

function update() {
  let node = PlaygroundStore.clickNode[0];
  const attrs = node.attrs;
  fontSize.value = attrs?.fontSize || 12;
  letterSpacing.value = attrs?.letterSpacing || 0;
  fontWeight.value = attrs?.fontStyle?.includes('bold');
  fontStyle.value = attrs?.fontStyle?.includes('italic');
  textDecoration.value = attrs?.textDecoration == 'underline';
  align.value = attrs?.align || 'left';
  writeMode.value = attrs?.writeMode || 'horizontal';
  lineHeight.value = attrs?.lineHeight || 1;

  node.on('fontSizeChange.UI', (val) => {
    //console.log(val.newVal,"123");
    if (fontSize.value !== val.newVal) {
      fontSize.value = val.newVal;
    }
  });
}

watch(
  () => [PlaygroundStore.slecetTimestape, PlaygroundStore.attrsChangeTimestape],
  () => {
    update();
  },
);

onMounted(() => {
  update();
});
</script>

<style scoped lang="less">
.font-input-wrap {
  position: relative;
  width: 112px;
  :deep(.ant-input-number) {
    width: 100% !important;
    height: 40px !important;
    background: #f7f7f7;
  }

  :deep(.ant-input-number-input) {
    padding-right: 30px;
  }

  .unit {
    position: absolute;
    top: 45%;
    right: 25px;
    transform: translateY(-50%);
    height: 20px;
    font-size: 14px;
    color: #999999;
    line-height: 20px;
  }
}

.font-style-wrap {
  display: flex;
  margin-bottom: 10px;

  :deep(.ant-input-number) {
    height: 40px;
    width: 112px;
  }
}

.color-input {
  display: flex;
  align-items: center;
  padding: 6px 7px 6px 12px;
  height: 40px;
  background: #f7f7f7;
  border-radius: 8px;
  width: 118px;
  margin-left: 10px;

  .color-value {
    flex: 1;
    font-size: 12px;
    color: #666666;
    line-height: 17px;
    margin-right: 12px;
    letter-spacing: 1px;
  }

  .color-show {
    display: inline-block;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    flex-shrink: 0;
  }
}
</style>
