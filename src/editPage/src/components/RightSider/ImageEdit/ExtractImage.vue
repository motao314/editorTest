<template>
  <a-button
    class="extract-image-btn"
    style="width: 240px; margin-bottom: 10px"
    type="primary"
    @click="handleOpenExtract"
  >
    <Icon type="koutu" class="btn-icon" />
    抠图
  </a-button>

  <a-modal
    v-model:visible="visible"
    title="抠图"
    @cancel="handleCancel"
    :footer="null"
    :width="560"
    class="extract-modal"
  >
    <div class="extract-body">
      <div class="extract-body-main">
        <div class="extract-body-box" ref="canvasBoxRef">
          <canvas
            ref="canvasRef"
            :class="{ 'not-allowed': popVisible, 'cursor-straw': !popVisible }"
            @click.stop="onCanvasClick"
          >
          </canvas>
        </div>
      </div>
      <div class="extract-body-title mgt25">容差范围</div>
      <div class="extract-body-slide">
        <SliderBox v-model="tolerance" :min="0" :max="255"></SliderBox>
      </div>
      <div class="extract-body-title mgt15">吸管选色</div>
      <div class="extract-body-colors">
        <div class="xiguan" @click.stop="popVisible = false">
          <!-- <img :src="StrawPng" alt="StrawPng"> -->
          <Icon type="xiguan"></Icon>
        </div>
        <div
          v-for="(it, i) in new Array(10).fill('')"
          :key="it + i"
          class="color"
          :style="{ background: colors.list[i]?.color || '#F4F4F4' }"
          :class="colors.list[i]?.color === '#ffffff' ? 'color-boreer' : ''"
          @click.stop="onSelectColor(i)"
        >
          <Icon
            v-if="colors.list[i]?.color && activeColor && colors.list[i]?.color === activeColor"
            type="xuanzhong3"
            color="#666"
          />
        </div>
      </div>
      <div class="extract-body-btns">
        <span type="text" class="reset" @click="handleReset">
          <Icon type="zhongzhi" />
          重置
        </span>
        <span type="text" class="start" @click="handleStart">
          <Icon type="koutu" />
          开始抠图
        </span>
        <a-button type="primary" class="save" @click="handleSave" :loading="isExtractImging"> 保存 </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import fetchApi from '@/api/fetchApi';
import StrawPng from '@/images/straw.png';
import SliderBox from '@/components/common/SliderBox/SliderBox.vue';
import Icon from '@/components/common/Icon/Icon.vue';

import { usePlaygroundStore } from '@/store/module/usePlayground';
import { dataURLtoFile } from '@/utils/upload';
import { useMainStore } from '@/store/index.js';
import { API_WX_UPLOADUSERMATERIAL } from '@/api/API2.config';
import { addImageProcess } from '@/libs/xxCanvas';
const MainStore = useMainStore();
const PlaygroundStore = usePlaygroundStore();
const props = defineProps({
  // 图片对象
  data: {
    type: [String, Blob, null, File],
    default: null,
  },
});
// 弹窗的控制
let visible = ref(false);
// 功能区显隐
const popVisible = ref(true);
// canvas对象
const canvasRef = ref(null);
// canvas盒子对象
const canvasBoxRef = ref(null);
// context对象
const contextIns = ref(null);
// 图像像素初始数据
const imgPxData = ref(null);
// 图像像素临时数据，用以多次抠图
const tmpImgPxData = ref(null);
// 图像像素临时数据，用以存储数据
const tTmpImgPxData = ref(null);
// 容差范围，默认140
const tolerance = ref(140);
// 取色
const rgbaPicker = ref('[0,0,0,255]');
// 历史颜色
const colors = reactive({ list: [] });
// 当前使用颜色
const activeColor = ref('');
// 正在处理图片
let isExtractImging = ref(false);

// canvas等比宽高
const canvasWidth = 500;
const canvasHeight = 400;

const currentNode = computed(() => {
  return PlaygroundStore.clickTargetNode[0];
});

/**
 * 设置打开弹窗
 * @param {} state
 */
function setVisibled(state = false) {
  visible.value = state;
}
function handleCancel() {}

/**
 * 选取历史颜色
 * @param {Number} i 索引
 */
const onSelectColor = (i) => {
  // 点击无效颜色
  if (!colors.list[i]) return;

  activeColor.value = colors.list[i].color;
  rgbaPicker.value = colors.list[i].picker;
};

// 取色
const onCanvasClick = (e) => {
  // 先点击吸管才能取色
  if (popVisible.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const picker = contextIns.value.getImageData(x, y, 1, 1).data;
  rgbaPicker.value = picker;

  // 获取吸管取色
  let strHex = '#';
  for (let i = 0; i < rgbaPicker.value.length - 1; i++) {
    let hex = rgbaPicker.value[i].toString(16);
    if (hex.length < 2) {
      hex = '0' + hex;
    }
    strHex += hex;
  }
  // 激活的颜色
  setActiveColor(strHex, picker);
  popVisible.value = true;
};

/**
 * 设置取色
 * @param {String} color 色值
 * @param {Object} picker 像素信息
 */
const setActiveColor = (color, picker) => {
  // 取不同的颜色才更新
  if (!colors.list.filter((c) => c.color === color).length) {
    if (colors.list.length > 5) {
      colors.list.splice(0, 1);
    }
    colors.list.push({ color, picker });
    // console.log('colors.list', colors.list);
  }
  activeColor.value = color;
  rgbaPicker.value = picker;
};

/**
 * 计算实际绘制图片在canvas中的各个参数
 * @param {Number} _w 图片实际宽度
 * @param {Number} _h 图片实际高度
 */
const calculate = (_w, _h) => {
  let dx = 0;
  let dy = 0;
  let dWidth = _w;
  let dHeight = _h;

  // 图片宽高都小于canvas宽高
  if (_w < canvasWidth && _h < canvasHeight) {
    dx = parseInt((canvasWidth - _w) / 2);
    dy = parseInt((canvasHeight - _h) / 2);
  } else if (_w / _h > canvasWidth / canvasHeight) {
    // 图片宽高比大于画布宽高比
    dWidth = canvasWidth;
    dHeight = parseInt((_h * canvasWidth) / _w);
    dy = parseInt((canvasHeight - dHeight) / 2);
  } else {
    dHeight = canvasHeight;
    dWidth = parseInt((_w * canvasHeight) / _h);
    dx = parseInt((canvasWidth - dWidth) / 2);
  }

  return { dx, dy, dWidth, dHeight };
};
/**
 * 打开抠图
 */
function onOpenExtractImage() {
  let url = currentNode.value.attrs.url;
  if (!url) {
    console.error('error current node');
    return false;
  }
  // 多次调用getImageData浏览器会报错，配置willReadFrequently，可以略微提升性能
  contextIns.value = canvasRef.value.getContext('2d', { willReadFrequently: true });

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = url;
  img.onload = () => {
    // console.log('%c Line:54 🥟 img.onload', 'color:#e41a6a', img.width, img.height);

    // 计算绘制参数
    const { dx, dy, dWidth, dHeight } = calculate(img.width, img.height);
    // 动态改变画布宽高
    canvasRef.value.width = dWidth;
    canvasRef.value.height = dHeight;
    canvasBoxRef.value.style.width = dWidth + 'px';
    canvasBoxRef.value.style.height = dHeight + 'px';
    // 绘制到画布
    contextIns.value.drawImage(img, 0, 0, dWidth, dHeight);
    // 获取像素信息数据
    imgPxData.value = contextIns.value.getImageData(0, 0, dWidth, dHeight);
    tmpImgPxData.value = contextIns.value.getImageData(0, 0, dWidth, dHeight);
    tTmpImgPxData.value = contextIns.value.getImageData(0, 0, dWidth, dHeight);
  };

  img.onerror = (e) => {
    // console.log('img.onerror', e);
  };
}
/**
 * 点击打开
 */
function handleOpenExtract() {
  setVisibled(true);
  nextTick(() => {
    onOpenExtractImage();
  });
}
// 重置
const reset = () => {
  rgbaPicker.value = '[0,0,0,255]';
  contextIns.value.putImageData(imgPxData.value, 0, 0);
  tmpImgPxData.value = imgPxData.value;
  activeColor.value = '';
};

/**
 * 开始抠图
 * @param {*} v 容差值
 */
const startKoutu = (v) => {
  // console.log('startKoutu');
  const rongcha = v || tolerance.value;
  // 基于原始图片数据处理
  for (let i = 0; i < tmpImgPxData.value.data.length; i += 4) {
    const r = tmpImgPxData.value.data[i];
    const g = tmpImgPxData.value.data[i + 1];
    const b = tmpImgPxData.value.data[i + 2];

    if (
      Math.sqrt(
        (r - rgbaPicker.value[0]) * (r - rgbaPicker.value[0]) +
          (g - rgbaPicker.value[1]) * (g - rgbaPicker.value[1]) +
          (b - rgbaPicker.value[2]) * (b - rgbaPicker.value[2]),
      ) <= rongcha
    ) {
      tTmpImgPxData.value.data[i] = 0;
      tTmpImgPxData.value.data[i + 1] = 0;
      tTmpImgPxData.value.data[i + 2] = 0;
      tTmpImgPxData.value.data[i + 3] = 0;
    } else {
      tTmpImgPxData.value.data[i] = r;
      tTmpImgPxData.value.data[i + 1] = g;
      tTmpImgPxData.value.data[i + 2] = b;
      tTmpImgPxData.value.data[i + 3] = tmpImgPxData.value.data[i + 3];
    }
  }

  // 更新画布
  contextIns.value.putImageData(tTmpImgPxData.value, 0, 0);
  tmpImgPxData.value = tTmpImgPxData.value;
};
function getFileNameFromImageURL(imageURL) {
  return imageURL.substring(imageURL.lastIndexOf('/') + 1);
}
/**
 * 确定抠图
 */
async function handleOk() {
  const base64 = canvasRef.value.toDataURL('image/png');
  // console.log('results', base64)
  let imageName = getFileNameFromImageURL(currentNode.value.attrs.url);
  imageName = imageName.replace(/\.[^\.]+$/, new Date().getTime() + '.png');
  // 生成一个文件对象
  let newImageFile = dataURLtoFile(base64, imageName);
  // 开始上传
  let uploadImgOj = await uploadImage(newImageFile);
  if (uploadImgOj) {
    // 并且替换新的图片
    await handleReplaceImage({ ...uploadImgOj, name: imageName });
    return true;
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
// 直接替换画布上的图片
async function handleReplaceImage(item) {
  const url = item.sourceUrl || item.thumbnailUrl || item.url;
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
      materialId: "999999",
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
/**
 * 上传扣完的图
 */
async function uploadImage(newImage) {
  let res = await MainStore.upload(newImage);
  // if(res.flag) {

  //     let newOj = await afterUploadImgSave(res,newImage)
  //     return newOj
  // } // 不需要存入个人上传列表
  return res.data;
}
/**
 * 保存上传完成的图片结果
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
  return false;
}

/**
 * 开始抠图
 */
function handleStart() {
  if (isExtractImging.value) {
    return false;
  }
  startKoutu();
}

/**
 * 重置
 */
function handleReset() {
  if (isExtractImging.value) {
    return false;
  }
  reset();
}

/**
 * 保存
 */
async function handleSave() {
  if (isExtractImging.value) {
    return false;
  }
  isExtractImging.value = true;
  let res = await handleOk();
  if (res) {
    await MainStore.loadImgLists();
    isExtractImging.value = false;
    // 关闭
    setVisibled();
  }
}
</script>

<style lang="less" scoped>
.extract-body {
  margin: 0 auto 0;
  padding: 0 30px 30px;

  &-main {
    margin: auto;
    width: 100%;
    height: 400px;
    background-color: #ffffff;
  }
  &-box {
    margin: auto;
    width: 100%;
    height: 400px;
    // padding-top: px2vw(64);
    display: flex;
    align-items: center;
    justify-content: center;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC')
      repeat;
    cursor: default;
    .not-allowed {
      cursor: not-allowed;
    }
    .cursor-straw {
      cursor: url(../../../images/straw.cur) 0 21, default;
    }

    canvas {
      width: 100%;
      height: 100%;
      pointer-events: all;
    }
  }

  &-colors {
    margin-top: 18px;
    padding: 0 20px;
    padding-right: 0;
    display: flex;
    gap: 12px;
    .xiguan {
      margin-right: 12px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding-top: 6px;
      height: 48px;
      cursor: pointer;
      // img {
      //     width: 21px;
      //     height: 21px;
      // }
      &:hover {
        :deep(.anticon) {
          color: @primary-color;
        }
      }

      .text {
        font-size: 10px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #666666;
        white-space: nowrap;
      }
    }
    .color {
      width: 34px;
      height: 34px;
      background: #f4f4f4;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      :deep(.anticon) {
        color: #ffffff;
      }
      &-boreer {
        border: 1px solid #dedede;

        :deep(.anticon) {
          color: #a5a5a5;
        }
      }
    }

    .anticon {
      color: #666666;
    }
  }

  &-btns {
    margin: 30px auto 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .reset {
      margin-right: 10px;
      width: 100px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      color: #666666;
      display: inline-block;
      font-size: 14px;
      flex: 1 0 auto;
      cursor: pointer;

      & > div {
        display: inline-block;
      }

      :deep(.anticon) {
        font-size: 14px;
        color: #666666;
      }
    }
    .start {
      margin-right: 10px;
      width: 100px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 8px;
      border: 1px solid @primary-color;
      color: @primary-color;
      font-size: 14px;
      flex: 1 0 auto;
      cursor: pointer;

      & > div {
        display: inline-block;
      }

      :deep(.anticon) {
        font-size: 14px;
        color: @primary-color;
      }
    }
    .save {
      width: 80%;
      flex: 1 1 auto;
      height: 40px;
      line-height: 40px;
      box-sizing: content-box;
      padding: 0;
      border: none;
      .anticon {
        color: #666666;
      }
    }
  }
}
</style>
<style lang="less">
.extract-modal {
  .ant-modal-content {
    .ant-modal-header {
      height: 44px;
      padding: 0;
      box-sizing: border-box;

      .ant-modal-title {
        display: none;
      }
    }
  }

  .mgt25 {
    margin-top: 25px;
  }
  .mgt15 {
    margin-top: 13px;
  }
}
.extract-image-btn {
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
