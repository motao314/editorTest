<template>
  <a-upload
    v-model:file-list="fileList"
    name="file"
    accept=".png,.svg,.jpg"
    :beforeUpload="handleBeforeUpload"
    :headers="headers"
    :showUploadList="false"
  >
    <a-button
      class="replace-image-btn"
      style="width: 115px"
      type="primary"
      :isLoading="isUploadingImg"
      :disabled="isUploadingImg"
    >
      <Icon type="tihuantupian" class="btn-icon" />
      替换图片
    </a-button>
  </a-upload>
</template>

<script setup>
import { ref } from 'vue';
import fetchApi from '@/api/fetchApi';
import { useMainStore } from '@/store/index.js';
import { usePlaygroundStore } from '@/store/module/usePlayground.js';
import { addImageProcess } from '@/libs/xxCanvas';
import Icon from '@/components/common/Icon/Icon.vue';
import { API_WX_MATERIALUSERDESIGN, API_WX_UPLOADUSERMATERIAL, API_WX_UPLOADUSERDESIGN } from '@/api/API2.config';
const MainStore = useMainStore();
const PlaygroundStore = usePlaygroundStore();
// let FileUpload = ref(MainStore.FileUpload)
// const Upload = ref(FileUpload.value)
// 正在上传
let isUploadingImg = ref(false);
let value = ref();
const selectBoxType = ref('');
const searchValue = ref('');
const imageLists = ref([]);

const fileList = ref([]);
const headers = ref({});

/**
 * res 上传的结果
 * file 当前上传的图片
 */
async function afterUploadImgSave(res, file) {
  let ossUrl = res.data.url;
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
}

// 上传前
function handleBeforeUpload(file, fileList) {
  let newImg;
  // 处理一次响应的时候开始上传
  if (!isUploadingImg.value) {
    isUploadingImg.value = true;
    MainStore.multipleUpload(
      'img',
      fileList,
      async (res, file) => {
        newImg = await afterUploadImgSave(res, file);
        // 直接替换
        await handleReplaceImage(newImg);

        await MainStore.loadImgLists();
      },
      () => {
        // 所有的图片都完成了
        isUploadingImg.value = false;
        // 通知上传面板更新图片列表
      },
    );
  }
  return false;
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

// 直接替换图片
async function handleReplaceImage(item) {
  const url = item.sourceUrl || item.thumbnailUrl;
  const srcId = item.id;
  let clickNode = isClickItem();
  if (clickNode?.className === 'Image') {
    const image = await addImageProcess(url);
    let newAttrs = {};
    let scaleX = clickNode.scaleX();
    let scaleY = clickNode.scaleY();
    // 发生了垂直镜像，需要恢复
    if (clickNode.scaleY() < 0) {
      newAttrs = reflectionY({
        x: clickNode.x(),
        y: clickNode.y(),
        rotation: clickNode.rotation(),
        scaleY: scaleY,
        height: clickNode.height(),
      });
      scaleY = newAttrs.scaleY;
    }
    // 发生了水平镜像，需要恢复
    if (clickNode.scaleX() < 0) {
      newAttrs = reflectionX({
        x: newAttrs.x || clickNode.x(),
        y: newAttrs.y || clickNode.y(),
        rotation: clickNode.rotation(),
        scaleX: scaleX,
        width: clickNode.width(),
      });
      scaleX = newAttrs.scaleX;
    }
    // 如果选中了图片，那么是替换
    const width = (selectHeight / image.height) * image.width;
    console.log(item);
    PlaygroundStore.setClickNodeAttrs({
      width,
      image: image,
      url: url,
      srcId: srcId,
      materialDesc: item.name,
      materialId: item.id,
      ...newAttrs,
      scaleX,
      scaleY,
    });
    item.loading = false;
  }
  // } else {
  //     item.loading = true;
  //     PlaygroundStore.addImage({
  //         url: url,
  //         srcId: srcId,
  //         materialDesc: item.name,
  //         materialId: item.id
  //     }).finally(res => {
  //         imageLists.value[0].loading = false;
  //         item.loading = false;

  //     });
  // }
}

function reflectionY({ x, y, rotation, scaleY, height }) {
  let rad = (rotation * Math.PI) / 180;
  const rcos = Math.cos(rad);
  const rsin = Math.sin(rad);
  let f = scaleY || 1;
  let h = f * height * rcos;
  let attrs = {
    scaleY: -scaleY,
    x: x - f * height * rsin,
    y: y + f * height * rcos,
  };

  return attrs;
}
function reflectionX({ x, y, rotation, scaleX, width }) {
  let rad = (rotation * Math.PI) / 180;
  const rcos = Math.cos(rad);
  const rsin = Math.sin(rad);
  let f = scaleX || 1;
  let attrs = {
    scaleX: -scaleX,
    x: x + f * width * rcos,
    y: y + f * width * rsin,
  };
  return attrs;
}
</script>
<style lang="less">
.replace-image-btn {
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
