<template>
  <div class="left-container" :class="{ show: siderShow.left }">
    <a-menu
      style="width: 70px; background: #f4f4f4"
      id="dddddd"
      :selectedKeys="[LeftSideType]"
      mode="inline"
      @click="handleClick"
    >
      <a-menu-item v-for="item in menuList" :key="item.type">
        <Icon :type="item.icon" />
        <div class="title">{{ item.name }}</div>
      </a-menu-item>
      <FastKey></FastKey>
    </a-menu>

    <div class="left-content" v-show="LeftSideType">
      <BoxType v-if="LeftSideType === 'BoxType'"></BoxType>
      <Template v-if="LeftSideType === 'Template'"></Template>
      <Material v-if="LeftSideType === 'Material'"></Material>
      <Background v-if="LeftSideType === 'Background'"></Background>
      <Text v-if="LeftSideType === 'Text'"></Text>
      <Upload v-if="LeftSideType === 'Upload'"></Upload>
      <Layer v-if="LeftSideType === 'Layer'"></Layer>
    </div>
    <div class="switch-btn" @click="toggle">
      <img src="../../images/left.png" />
      <Icon v-if="siderShow.left" type="left" class="sider-arrow"></Icon>
      <Icon v-else type="right" class="sider-arrow"></Icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BoxType from './BoxType/BoxType.vue';
import Template from './Template/Template.vue';
import Material from './Material/Material.vue';
import Background from './Background/Background.vue';
import Text from './Text/Text.vue';
import Upload from './Upload/Upload.vue';
import Layer from './Layer/Layer.vue';
import Icon from '@/components/common/Icon/Icon.vue';
import {getParameterByName} from '../../utils/common'
import FastKey from './FastKey/FastKey.vue';
import { useMainStore } from '../../store';
import { storeToRefs } from 'pinia';
let MainStore = useMainStore();
let { LeftSideType, siderShow } = storeToRefs(MainStore);
function toggle() {
  MainStore.siderShowToggle('left');
}
// const selectedKeys = computed(() => {
//   return [LeftSideType.value]
// })
const handleClick = (e) => {
  MainStore.setLeftSideType(e.key);
};

const enterType = getParameterByName('enterType')

const base = enterType != 'ADMIN_OPERATION' ? [{
  name: '盒型',
  type: 'BoxType', icon: 'hexing',
}, {
  name: '模板', type: 'Template', icon: 'moban',
},]:[]

const menuList = ref([
...base,...[{
  name: '素材', type: 'Material', icon: 'sucai',
}, {
  name: '背景', type: 'Background', icon: 'beijing',
}, {
  name: '文字', type: 'Text', icon: 'wenzi',
}, {
  name: '上传', type: 'Upload', icon: 'shangchuan',
}, {
  name: '图层', type: 'Layer', icon: 'a-tucengjiacu',
}]
])

</script>
<style scoped lang="less">
:deep(.ant-menu) {
  overflow: auto;
  padding-bottom: 40px;
  &.ant-menu-inline,
  .ant-menu-vertical,
  .ant-menu-vertical-left {
    border-right: none;
  }
}
:deep(.ant-menu-item) {
  height: auto !important;
  display: flex;
  overflow: hidden;
  padding-top: 14px;
  padding-bottom: 18px;
  margin-top: 0 !important;

  margin-bottom: 10px !important;
  &:first-child {
    padding-top: 24px;
  }
}

:deep(.ant-menu-title-content) {
  height: 100%;
  line-height: 12px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  // padding-top:10px;
  .anticon {
    font-size: 25px;
  }
}

:deep(.ant-menu-item-selected) {
  background-color: #fff !important;
}

.ant-menu-item-selected .title {
  color: @primary-color;
}

:deep(.ant-menu-item::after) {
  left: 0;
  right: auto !important;
}

.left-container {
  height: 100%;
  display: flex;
  user-select: none;
  box-shadow: 0px 4px 10px 0px rgba(221, 221, 221, 0.5);
  z-index: 1100;
  position: relative;
  .switch-btn {
    position: absolute;
    display: none;
    top: 50%;
    right: 16px;
    height: 100px;
    width: 50px;
    transform: translateY(-50%) translateX(100%);
    cursor: pointer;
    z-index: -1;
    img {
      width: 100%;
    }
    .sider-arrow {
      position: absolute;
      top: 50%;
      right: 28px;
      transform: translateY(-50%) translateX(50%);
      z-index: 1000;
      :deep(.anticon) {
        color: #9c9c9c;
      }
    }
  }
  &:hover {
    .switch-btn {
      display: block;
    }
  }
  .left-content {
    // transition: all 0.2s;
    width: 0px;
    height: 100%;
    background: #fff;
    position: relative;
    overflow: hidden;
  }

  &.show {
    overflow: visible;

    .left-content {
      width: 330px;
      // transition: all 0.2s;
    }
  }
}

.title {
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #333333;
  line-height: 12px !important;
  margin-top: 10px;
}

:deep(.ant-menu-item) {
  &.ant-menu-item-selected,
  &:hover {
    background: #f8f8f8;
    color: @primary-color;

    .anticon,
    .title {
      color: @primary-color;
    }
  }
}
</style>
<style></style>
