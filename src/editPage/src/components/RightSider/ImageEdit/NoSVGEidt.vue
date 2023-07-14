<!--
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-07 16:57:37
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-18 14:34:18
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/RightSider/ImageEdit/NoSVGEidt.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <a-divider dashed />
  <div class="svg-edit">
    <ExtractImage></ExtractImage>
    <ReplaceImage class="svg-edit-replace"></ReplaceImage>
    <a-button style="width: 115px" type="primary" class="cut-image-btn" @click="handleOpenCutImage">
      <Icon type="caijian" class="btn-icon" />
      剪裁
    </a-button>
    <!-- {{ cutImagePosition }} -->
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePlaygroundStore } from '@/store/module/usePlayground';
import ReplaceImage from './ReplaceImage.vue';
import ExtractImage from './ExtractImage.vue';
import Icon from '@/components/common/Icon/Icon.vue';
const PlaygroundStore = usePlaygroundStore();

// 根据舞台缩放以及位置变化来更新裁切框的位置
// let cutImagePosition = computed(() => {
//   let position = PlaygroundStore.pagePosition
//   let scale = PlaygroundStore.getCurrentCanvasScale

//   return {
//     x:position.x,
//     y: position.y,
//     scale: scale
//   }
// })

// const currentNode = computed(() => {
//     return PlaygroundStore.clickTargetNode[0]
// })

/**
 * 打开裁剪图片
 */
function handleOpenCutImage() {
  // PlaygroundStore.setCutImageVisibledInfos({
  //   visibled: true,
  //   cutImageDatas: currentNode.value
  // })
  PlaygroundStore.currentUIPlayground.setCutImage();
}
</script>

<style lang="less" scoped>
.svg-edit {
  display: flex;
  justify-content: space-between;
  flex-flow: wrap;

  :deep(.ant-btn) {
    flex: 1 0 auto;
  }

  :deep(.svg-edit-replace) {
    flex: 1 0 auto;
    display: inline-block;
    width: 115px;
  }
}
</style>
<style lang="less">
.cut-image-btn {
  .anticon {
    font-size: 18px;
    color: #ffffff;
  }

  .btn-icon {
    vertical-align: middle;
    margin-right: 10px;
    display: inline-block;
  }

  &.ant-btn-primary:hover,
  &.ant-btn-primary:focus {
    background-color: @primary-color-bg !important;
  }
}
</style>
