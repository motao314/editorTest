<template>
  <div class="right-container" :class="{ show: siderShow.right }">
    <div :class="['switch-btn', { show: !siderShow.right }]" @click="toggle">
      <img src="../../images/right.png" />
      <Icon v-if="siderShow.right" type="right" class="sider-arrow"></Icon>
      <Icon v-else type="left" class="sider-arrow"></Icon>
    </div>
    <div class="right-title">
      <div class="name" :class="{ active: activeType === 1,'cursor-pointer': isShowPlayType && showView === '2d'||currentType?.type }" @click="activeType = 1">全局</div>
      <div
        v-if="isShowPlayType && showView === '2d'"
        class="name"
        :class="{ active: activeType === 2 ,'cursor-pointer':isShowPlayType && showView === '2d'}"
        @click="activeType = 2"
      >
        画布
      </div>
      <div v-if="currentType?.type" class="name" :class="{ active: activeType === 3 ,'cursor-pointer':currentType?.type}" @click="activeType = 3">
        {{ currentType.name }}
      </div>
    </div>
    <div class="content">
      <GlobalEdit v-if="activeType === 1"></GlobalEdit>
      <DetailEdit v-else-if="activeType === 2"></DetailEdit>
      <template v-else>
        <div>
          <a-button v-if="currentType.type === 'Multiple'" style="width: 240px" type="primary" @click="freeze"
            >组合</a-button
          >
          <a-button
            v-if="
              currentType.type === 'Group' || currentType.type === 'Group-Text' || currentType.type === 'Group-Image'
            "
            style="width: 240px"
            type="primary"
            @click="Unfreeze"
            >拆分组合</a-button
          >
          <a-button
            v-if="
              currentType.type === 'Group' || currentType.type === 'Group-Text' || currentType.type === 'Group-Image'
            "
            style="width: 240px; margin-bottom: 10px; margin-top: 10px; height: 40px"
            @click="saveGroup"
            >保存为组合素材</a-button
          >
        </div>
        <TextEdit v-if="currentType.type === 'Text' || currentType.type === 'Group-Text'"></TextEdit>
        <template v-if="currentType.type === 'Image' || currentType.type === 'Group-Image'">
          <ImageEdit :type="imageType"></ImageEdit>
          <NoSVGEidt v-if="imageType !== 'SVG'"></NoSVGEidt>
        </template>
        <Craft v-if="imageType === 'SVG' || currentType.type === 'Group-Text' || currentType.type === 'Text'"></Craft>
        <a-divider dashed />
        <CommonToolTabs></CommonToolTabs>
      </template>
    </div>
  </div>
</template>

<script setup>
import { dataURLtoFile } from '@/utils/upload';
import { message } from 'ant-design-vue';
import Icon from '@/components/common/Icon/Icon.vue';
import { isBase64 } from '@/utils/upload';
import NoSVGEidt from './ImageEdit/NoSVGEidt.vue';
import Craft from './CommonToolTabs/Craft.vue';
import CommonToolTabs from './CommonToolTabs/CommonToolTabs.vue';
import GlobalEdit from './GlobalEdit/GlobalEdit.vue';
import DetailEdit from './DetailEdit/DetailEdit.vue';
import ImageEdit from './ImageEdit/ImageEdit.vue';
import TextEdit from './TextEdit/TextEdit.vue';
import fetchApi from '@/api/fetchApi';
import { API_JD_COMPOSITE_SAVE } from '@/api/API.config'; // 正常的素材列表
import { ref, computed, watch, onMounted } from 'vue';
import { usePlaygroundStore } from '@/store/module/usePlayground';
import { useMainStore } from '../../store';
import { useLoaded } from '@/store/module/loaded';
import { storeToRefs } from 'pinia';
const loadedStore = useLoaded();
const { showView } = storeToRefs(loadedStore);
const PlaygroundStore = usePlaygroundStore();
const MainStore = useMainStore();
const { siderShow } = storeToRefs(MainStore);
function toggle() {
  MainStore.siderShowToggle('right');
}
const activeType = ref(1);
const isShowPlayType = ref(0);
onMounted(() => {
  update();
});
watch(
  () => [PlaygroundStore.layoutId, PlaygroundStore.selectLayoutId],
  () => {
    update();
  },
);

function update() {
  isShowPlayType.value = PlaygroundStore.layoutId || PlaygroundStore.selectLayoutId;
}
const imageType = ref('JPG');
const currentType = ref();
watch(
  () => loadedStore.showView,
  (val) => {
    if (val === '3d') {
      activeType.value = 1;
    }
  },
);
watch(
  () => PlaygroundStore.slecetTimestape,
  () => {
    let selectedAllNode = PlaygroundStore.getSelectedNode();
    if (selectedAllNode.length > 1) {
      activeType.value = 3;
      currentType.value = { name: '组合', type: 'Multiple' };
    } else if (selectedAllNode.length === 1) {
      let typeObj = {};
      if (PlaygroundStore.clickTargetNode[0].getClassName() === 'Text') {
        if (selectedAllNode[0].getClassName() === 'Group') {
          typeObj = { name: '组合-文本', type: 'Group-Text' };
        } else {
          typeObj = { name: '文字', type: 'Text' };
        }
      } else if (PlaygroundStore.clickTargetNode[0].getClassName() === 'Image') {
        let url = PlaygroundStore.clickTargetNode?.[0]?.getAttr('url');
        let arr = url.split('.');
        let type = arr[arr.length - 1].toUpperCase();
        if (isBase64(url)) {
          type = 'PNG';
        }
        imageType.value = type;
        if (selectedAllNode[0].getClassName() === 'Group') {
          typeObj = { name: '组合-' + type + '图片', type: 'Group-Image' };
        } else {
          typeObj = { name: type + '图片', type: 'Image' };
        }
      } else {
        typeObj = { name: '组合', type: 'Group' };
      }
      activeType.value = 3;
      currentType.value = typeObj;
    } else {
      if (PlaygroundStore.layoutId || PlaygroundStore.selectLayoutId) {
        activeType.value = 2;
      } else {
        activeType.value = 1;
      }
      currentType.value = {};
    }
  },
);
function freeze() {
  PlaygroundStore.tofreezeGroup();
}
function Unfreeze() {
  PlaygroundStore.toUnfreezeGroup();
}
async function saveGroup() {
  const node = PlaygroundStore.getSelectedNode()[0];
  if (!node) return;
  const stageDeg = PlaygroundStore.currentUIPlayground.deg;
  const ele = { attrs: { ...node.getAttrs() }, className: 'Group' };
  ele.attrs.zIndex = node.zIndex();
  ele.attrs.x = 0;
  ele.attrs.y = 0;
  ele.attrs.rotation = (node.rotation() || 0) + (stageDeg || 0);
  const cloneNode = node.clone({ rotation: 0 });
  const rect = cloneNode.getClientRect({ relativeTo: PlaygroundStore.currentUIPlayground });
  ele.attrs.width = rect.width;
  ele.attrs.height = rect.height;
  cloneNode.destroy();

  if (ele.attrs.originData) {
    delete ele.attrs.originData;
  }
  if (ele.attrs.oldZIndex) {
    delete ele.attrs.oldZIndex;
  }
  ele.children = [...node.getChildren()].map((child) => {
    const item = { attrs: { ...child.getAttrs() }, className: child.getClassName() };
    if (item.attrs.image) {
      delete item.attrs.image;
    }
    if (item.attrs.originData) {
      delete item.attrs.originData;
    }
    if (item.attrs.oldZIndex) {
      delete item.attrs.oldZIndex;
    }
    return item;
  });
  ele.children = ele.children.filter(item=>{
    return item.className !== "Rect";
  })
  console.log(ele.children);
  const content = JSON.stringify(ele);
  const base64 = node.toDataURL();
  const imageName = '复合素材' + new Date().getTime();
  // 生成一个文件对象
  let newImageFile = dataURLtoFile(base64, imageName);
  // 开始上传
  let uploadImgOj = await MainStore.upload(newImageFile);
  const data = {
    ossUrl: uploadImgOj.data.url,
    designCompositeElementExtDTO: {
      content: content,
    },
  };

  fetchApi.post(API_JD_COMPOSITE_SAVE, data).then((res) => {
    message.success('复合素材保存成功');
  });
}
</script>

<style scoped lang="less">
.right-container {
  height: 100%;
  width: 0px;
  background-color: #fff;
  // transition: all 0.2s;
  position: relative;
  box-shadow: 0px -4px 10px 0px rgba(221, 221, 221, 0.5);
  z-index: 1000;
  // overflow: hidden;

  .right-title {
    display: flex;
    height: 50px;
    border-bottom: 1px solid #dfdfdf;
    align-items: center;
    padding-left: 30px;

    .name {
      margin-right: 30px;
      font-size: 14px;
      line-height: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      color: #999999;
      &.cursor-pointer{
        cursor:pointer;

      }
      &.active {
        color: #000;
        font-weight: 800;
      }
    }
  }

  .content {
    padding: 20px 29px;
  }

  .switch-btn {
    position: absolute;
    display: none;
    top: 50%;
    left: 16px;
    height: 100px;
    width: 50px;
    transform: translateY(-50%) translateX(-100%);
    cursor: pointer;
    z-index: -1;
    img {
      width: 100%;
    }
    .sider-arrow {
      position: absolute;
      top: 50%;
      left: 10px;
      transform: translateY(-50%) translateX(50%);
      z-index: 1000;
      :deep(.anticon) {
        color: #9c9c9c;
      }
    }
    &.show {
      display: block;
    }
  }
  &:hover {
    .switch-btn {
      display: block;
    }
  }
  &.show {
    width: 300px;
    // transition: all 0.2s;
    overflow: auto;
  }
}
</style>
