<template>
  <template v-if="cutImageVisibled">
    <div class="cut-image-page">
      <ImageBox
        ref="imageCropperRef"
        id="editor"
        v-bind="config"
        :img="cutImageUrl"
        @cropMoving="moving($event)"
        @imgMoving="moving($event)"
      ></ImageBox>
    </div>
    <div class="cut-image-control">
      <!-- {{ cutImagePosition }} -->
      <div class="cut-image-control-scale">
        <span class="text title"> 缩放 </span>
        <a-slider id="test" :min="minValue" :max="maxValue" v-model:value="scaleValue" :step="1" />
        <span class="text value"> {{ scaleValue }}% </span>
      </div>
      <div class="cut-image-control-btns">
        <a-button type="text">重置</a-button>
        <a-button type="text" @click="handleCancel">取消</a-button>
        <a-button type="text" danger @click="handleOk">确认</a-button>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue';

import { usePlaygroundStore } from '@/store/module/usePlayground';
import { useMainStore } from '@/store/index.js';
import ImageBox from './ImageCrop.vue';
import { dataURLtoFile } from '@/utils/upload';
import {
  GET_FILE_EXTENSION_BY_URL,
  GET_IMAGE_MIMETYPE_BY_EXTENSION,
  GET_FILE_NAME_IN_NO_EXTENSION,
  GET_FILE_NAME_BY_URL,
} from '@/utils/common';

import fetchApi from '@/api/fetchApi';
import { API_WX_MATERIALUSERDESIGN, API_WX_UPLOADUSERMATERIAL, API_WX_UPLOADUSERDESIGN } from '@/api/API2.config';
import { addImageProcess } from '@/libs/xxCanvas';

const MainStore = useMainStore();
const PlaygroundStore = usePlaygroundStore();
let scaleValue = ref(100);

let minValue = ref(80);
let maxValue = ref(200);

// 根据舞台缩放以及位置变化来更新裁切框的位置
let cutImagePosition = computed(() => {
  let position = PlaygroundStore.pagePosition;
  let scale = PlaygroundStore.getCurrentCanvasScale;

  return {
    x: position.x,
    y: position.y,
    scale: scale,
  };
});
let cutImageVisibled = computed(() => {
  return PlaygroundStore.cutImageInfos.visibled;
});
let cutImageDatas = computed(() => {
  return PlaygroundStore.cutImageInfos.cutImageDatas;
});
let cutImageUrl = computed(() => {
  let url = PlaygroundStore.cutImageInfos.cutImageDatas.attrs.url;
  return url;
});

// const currentNode = computed(() => {
//     return PlaygroundStore.clickTargetNode[0]
// })
// const currentNodeUrl = computed(() => {
//   return PlaygroundStore.clickTargetNode[0].attrs.url
// })

const props = defineProps({
  // 图片对象
  // imgData: {
  //     type: [String, Blob, null, File],
  //     default: null
  // }
});

// 需要裁切的图片
let imgData = ref('');

// 内部状态数据
const imageCropperRef = ref(null);
// 裁剪图片的配置
const config = ref({
  ceilbutton: false, // 顶部按钮，默认底部
  outputSize: 1, // 裁剪生成图片的质量
  outputType: 'png', // 裁剪生成图片的格式,默认png
  info: false, // 裁剪框的大小信息
  canScale: true, // 图片是否允许滚轮缩放
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 0, // 默认生成截图框宽度
  autoCropHeight: 0, // 默认生成截图框高度
  fixed: false, // 是否开启截图框宽高固定比例
  fixedNumber: [1, 1], // 截图框的宽高比例
  full: true, // 是否输出原图比例的截图
  fixedBox: false, // 固定截图框大小 不允许改变
  canMove: false, // 上传图片是否可以移动
  canMoveBox: true, // 截图框能否拖动
  original: false, // 上传图片按照原始比例渲染
  centerBox: true, // 截图框是否被限制在图片里面
  high: true, // 是否按照设备的dpr 输出等比例图片
  infoTrue: false, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
  maxImgSize: 2000, // 限制图片最大宽度和高度
  enlarge: 1, // 图片根据截图框输出比例倍数
  mode: 'contain', // 图片默认渲染方式
});

// 方法
function moving(e) {
  // console.log(e);
}

function closeCutPanel() {
  PlaygroundStore.setCutImageVisibledInfos({
    visibled: false,
    cutImageDatas: '',
  });
}

/**
 * 取消裁剪
 */
function handleCancel() {
  closeCutPanel();
}
function getCropImage() {
  return new Promise((resolve, reject) => {
    let extension = GET_FILE_EXTENSION_BY_URL(cutImageUrl.value);
    let mimeType = GET_IMAGE_MIMETYPE_BY_EXTENSION(extension);
    let fileName = GET_FILE_NAME_IN_NO_EXTENSION(GET_FILE_NAME_BY_URL(cutImageUrl.value));
    fileName = fileName + new Date().getTime() + '.' + extension;
    imageCropperRef.value.getCropData((images, w, h) => {
      const picContent = dataURLtoFile(images, fileName, mimeType);
      console.log('新的到的图片', picContent, images, w, h, mimeType);
      resolve({ picContent, images, w, h });
    });
  });
}

/**
 * 确定裁剪
 */
async function handleOk() {
  // 拿到新的图片
  console.log('handleOk----', cutImageDatas);

  // 拿到图片编辑的信息
  const imageBase64Infos = await getCropImage();
  const newImage = imageBase64Infos.picContent;

  console.log('newImage', newImage);
  // 上传
  let uploadImgOj = await uploadImage(newImage);
  // 并且保存上传的数据

  // 最后替换掉画布上的图片
  if (uploadImgOj) {
    // 并且替换新的图片
    await uploadImgOj;
    handleCancel();
  }
}

/**
 * res 上传的结果
 * file 当前上传的图片
 */
async function uploadImage(newImage) {
  let res = await MainStore.upload(newImage);
  if (res.flag) {
    let newOj = await afterUploadImgSave(res, newImage);
    return newOj;
  }
  return res.flag;
}

/**
 * 保存上传完成的图片结果
 * res 上传的结果
 * file 当前上传的图片
 */
async function afterUploadImgSave(res, file) {
  let ossUrl = res.data.url;
  console.log('保存上传完成的图片结果', res, file);
  // return false
  // 获取素材类型栏
  let saveRes = await fetchApi.post(API_WX_UPLOADUSERMATERIAL, {
    userId: MainStore.userId,
    materialName: file.name,
    ossUrl: ossUrl,
  });
  // 保存成功之后直接插入
  if (saveRes.flag) {
    // 返回图片信息直接替换
    return {
      sourceUrl: ossUrl,
      id: saveRes.data.id,
      name: file.name,
    };
  }
  return false;
}

// 直接替换图片
async function handleReplaceImage(item) {
  const url = item.sourceUrl || item.thumbnailUrl;
  const srcId = item.id;
  if (isClickItem()?.className === 'Image') {
    const image = await addImageProcess(url);
    // 如果选中了图片，那么是替换
    const width = (selectHeight / image.height) * image.width;
    PlaygroundStore.setClickNodeAttrs({
      width,
      image: image,
      url: url,
      srcId: srcId,
      materialDesc: item.name,
      materialId: item.id,
    });
    item.loading = false;
  }
}

// 获取点击元素
let firstGetImage = true;
let selectWidth = 0;
let selectHeight = 0;
function isClickItem() {
  const clickNode = PlaygroundStore.clickNode && PlaygroundStore.clickNode[0];
  if (clickNode && firstGetImage) {
    selectWidth = clickNode?.width() || 0;
    selectHeight = clickNode?.height() || 0;
    firstGetImage = false;
  }
  return clickNode;
}
</script>

<style lang="less" scoped>
.cut-image-page,
.cut-image-control {
  position: absolute;
  left: 100px;
  top: 100px;
  z-index: 10;
}
.cut-image-page {
  width: 200px;
  height: 200px;
}
.cut-image-control {
  top: 100px - 60px;
  width: 370px;
  height: 46px;
  background: #ffffff;
  box-shadow: 0px 0px 4px 0px rgba(187, 187, 187, 0.5);
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  &-btns {
    width: 120px;
    padding-right: 20px;
    line-height: 46px;
    flex: 1 0 auto;
    box-sizing: content-box;

    :deep(.ant-btn) {
      padding: 0 7px;
      font-size: 12px;
    }
  }

  &-scale {
    padding-left: 25px;
    padding-right: 22px;
    width: 80%;
    flex: 1 1 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .text {
      width: 24px;
      height: 100%;
      line-height: 46px;
      font-size: 12px;
      font-weight: 400;
      color: #666666;
      display: inline-block;
      flex: 1 0 auto;
      box-sizing: content-box;
    }
    .title {
      padding-right: 15px;
    }
    .value {
      padding-left: 10px;
    }

    :deep(.ant-slider) {
      width: 80%;
      flex: 1 1 auto;
    }
  }
}
</style>
<style lang="less"></style>
