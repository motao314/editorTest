<template>
  <div class="upload-panel">
    <div class="wrap-top">
      <div class="upload-panel-search search-wrap">
        <a-input-search v-model:value="searchValue" placeholder="搜索图片" @search="handleSearchImgs">
          <template #enterButton>
            <Icon type="sousuo" class="search-icon"></Icon>
          </template>
        </a-input-search>
      </div>
      <div class="upload-panel-upload">
        <div class="uploadbtn">
          <a-upload
            v-model:file-list="fileList"
            name="file"
            :multiple="true"
            accept=".png,.svg,.jpg"
            :beforeUpload="handleBeforeUpload"
            :headers="headers"
            :showUploadList="false"
            @change="handleChange"
          >
            <a-button class="uploadbtn-btn" type="primary" :loading="isUploadingImg">
              {{ isUploadingImg ? '上传中...' : '上传图片' }}
            </a-button>
          </a-upload>
        </div>
        <p class="uploadtip tip1">请上传JPG/PNG(分辨率≥300dpi)/SVG格式文件</p>
        <p class="uploadtip tip2">大小不超过200M</p>
      </div>
    </div>
    <p class="upload-panel-title">最近上传</p>
    <ImageList
      :list="uploadImageLists"
      v-model="selectBoxType"
      :isLoading="isLoadingImgLists"
      :imgStyle="imgStyle"
      v-if="uploadImageLists && uploadImageLists.length > 0"
      :cloumn="3"
      :config="{
        label: '',
        value: 'id',
        url: 'sourceUrl',
      }"
      @change="selectItemHandle"
    >
      <template v-slot:default="slotProps">
        <ImgInfos @del="handleDeleteImg(slotProps)" :item="slotProps.item"></ImgInfos>
      </template>
    </ImageList>
    <Empty v-else :text="emptyText" :image-url="`/assets/empty/${brandName}/default_empty.png`"></Empty>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import ImageList from '@/components/common/ImageList/ImageList.vue';
import ImgInfos from './ImgInfos.vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import fetchApi from '@/api/fetchApi';
import { useMainStore } from '@/store/index.js';
import { usePlaygroundStore } from '@/store/module/usePlayground.js';
import { addImageProcess } from '@/libs/xxCanvas';
import { v4 as uuidv4 } from 'uuid';
import { dataURLtoFile } from '@/utils/upload';
import { API_WX_MATERIALUSERDESIGN, API_WX_UPLOADUSERMATERIAL, API_WX_UPLOADUSERDESIGN } from '@/api/API2.config';
import Icon from '@/components/common/Icon/Icon.vue';
import Empty from '@/components/Empty/Empty.vue';
const MainStore = useMainStore();
const brandName = ref(MainStore.brand);
const PlaygroundStore = usePlaygroundStore();
// let FileUpload = ref(MainStore.FileUpload)
// const Upload = ref(FileUpload.value)
let value = ref();
let selectBoxType = ref('');
const searchValue = ref('');
// const imageLists = ref([])
const emptyText = ref('请先上传图片...');

const fileList = ref([]);
const headers = ref({});

const imgStyle = ref({
  height: '90px',
  'border-radius': '8px',
  border: '1px solid #E8E8E8',
  padding: '10px',
  background: '#fff',
});
let isLoadingImgLists = ref(false);

// 正在上传
let isUploadingImg = ref(false);

let uploadImageLists = computed(() => {
  return MainStore.userUploadImageLists;
});

const currentNode = computed(() => {
  // console.log('更新点击元素',PlaygroundStore.clickTargetNode[0],uploadImageLists)
  return PlaygroundStore.clickTargetNode[0];
});

const currentNodeImgId = computed(() => {
  // console.log('更新点击元素-----',currentNode)
  if (!currentNode || !currentNode.value) {
    return '';
  }
  let find = uploadImageLists.value.find((imageItem) => {
    return imageItem.url === currentNode.value.attrs.url;
  });

  return find && find.id;
});

watch(
  () => {
    return currentNodeImgId.value;
  },
  () => {
    // console.log('watch-----',currentNodeImgId.value)
    selectBoxType.value = currentNodeImgId.value;
  },
);
const onSearch = () => {};
const handleChange = (params) => {
  // console.log('change-----',params)
};

const selectItemHandle = (item) => {
  handleAddImage(item);
};

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

function hiddenLoading(node) {
  let index = uploadImageLists.value.findIndex((item) => item.id === node.id);
  if (index >= 0) uploadImageLists.value[index].loading = false;
}
// 添加/替换画布的图片-素材
async function handleAddImage(item) {
  const url = item.sourceUrl || item.thumbnailUrl;
  const srcId = item.id;
  // if (isClickItem()?.className === 'Image') {
  //     const image = await addImageProcess(url);
  //     // 如果选中了图片，那么是替换
  //     const width = selectHeight / image.height * image.width;
  //     PlaygroundStore.setClickNodeAttrs({
  //         width,
  //         image: image,
  //         url: url,
  //         srcId: srcId,
  //         materialDesc: item.name,
  //         materialId: item.id
  //     });
  //     item.loading = false;
  // } else {
  item.loading = true;
  PlaygroundStore.addImage({
    url: url,
    srcId: srcId,
    materialDesc: item.name,
    materialId: item.id,
    displaySize: item.displaySize,
  }).finally((res) => {
    hiddenLoading(item);
  });
  // }
}
const delImg = (imgInfos) => {
  return fetchApi.get(API_WX_UPLOADUSERDESIGN, {
    userId: MainStore.userId,
    id: imgInfos.id,
  });
};

const handleDeleteImg = async (params) => {
  let callback = async () => {
    let img = params.item;
    let res = await delImg(img);

    if (res.flag) {
      //删除成功
      MainStore.userUploadImageLists = MainStore.userUploadImageLists.filter((item) => {
        return item.id !== img.id;
      });
    }
  };

  callback();
};

// function filterImgs (img) {
//     console.log('过滤图片------',img,imageLists.value)
//     imageLists.value = imageLists.value.filter(item => {
//         return item.id !== img.id
//     })
// }
/**
 * res 上传的结果
 * file 当前上传的图片
 */
function afterUploadImgSave(res, file) {
  let ossUrl = res.data.url;
  // return false
  // 获取素材类型栏
  return fetchApi
    .post(API_WX_UPLOADUSERMATERIAL, {
      userId: MainStore.userId,
      materialName: file.name,
      ossUrl: ossUrl,
    })
    .then((res) => {
      // 保存成功之后直接插入
      if (res.flag) {
        // 没有返回图片相关信息，只能直接刷新列表
      }
    });
}

// 上传前
const handleBeforeUpload = (file, fileList) => {
  // 处理一次响应的时候开始上传
  if (!isUploadingImg.value) {
    isUploadingImg.value = true;
    // js 不能直接修改 file 名称，需转换成 base64，然后转成
    let files = fileList.map((f) => {
      return new Promise((res) => {
        let reader = new FileReader();
        reader.onload = (e) => {
          res(e.target.result);
        };
        reader.readAsDataURL(f);
      });
    });

    Promise.all(files).then((files) => {
      files = files.map((f, index) => {
        let url = f;
        let fileName = uuidv4() + fileList[index].name;
        let mimeType = fileList[index].type;
        return dataURLtoFile(url, fileName, mimeType);
      });

      MainStore.multipleUpload(
        'img',
        files,
        async (res, file) => {
          await afterUploadImgSave(res, file);
        },
        () => {
          // 所有的图片都完成了
          isUploadingImg.value = false;
          // 所有图片完成上传再更新列表
          loadImgLists();
        },
      );
    });
  }
  return false;
};

// 自定义上传方法
// const handleCustomRequest = async (params) => {
//     console.log('自定义上传参数返回',params)
//     let file = params.file

//     let res = await MainStore.upload(file)

//     console.log('上传的结果',res)

//     params.onSuccess(res)
// }

// 加载已经上传过的图片
async function loadImgLists(imgName) {
  isLoadingImgLists.value = true;
  await MainStore.loadImgLists(imgName);
  isLoadingImgLists.value = false;
}

function handleSearchImgs() {
  loadImgLists(searchValue.value);
}

loadImgLists();
</script>
<style lang="less" scoped>
@import '@/less/search-input.less';

.upload-panel {
  padding: 20px 14px 20px 20px;
  width: 100%;
  height: 100%;
  // position: absolute;
  // left: 0;
  // top: 0;
  box-sizing: border-box;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;

  .wrap-top {
    padding-right: 7px;
  }

  .search-icon {
    :deep(.anticon) {
      color: #616161;
      font-size: 16px;
    }
  }

  .upload-panel-upload {
    margin: 10px auto 0;
    width: 100%;
    padding: 25px 10px;
    background-color: #f6f6f6;
    height: 146px;
    box-sizing: border-box;
    border-radius: 6px;

    .uploadbtn {
      width: 100%;
      text-align: center;
      display: block;

      .uploadbtn-btn {
        background-color: @primary-color-bg;
      }

      :deep(.ant-upload) {
        width: 100%;

        .ant-btn-primary:hover,
        .ant-btn-primary:focus {
          background-color: @primary-color-bg !important;
        }
      }

      &-btn {
        width: 100%;
      }
    }

    .uploadtip {
      margin-bottom: 0;
      // line-height: 14px;
      font-size: 12px;
      color: @text-color-secondary;
      text-align: center;
    }

    .tip1 {
      margin-top: 20px;
    }

    .tip2 {
      color: @text-color-thrid;
    }
  }

  .upload-panel-title {
    margin: 10px auto 0;
    width: 100%;
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    color: @text-color-secondary;
    text-align: left;
    display: block;
  }

  .upload-panel-imgs {
    flex: 1;
    width: 100%;
    height: 70%;
    // overflow-x: hidden;
    // overflow-y: auto;
    display: flex;
    flex-direction: column;

    :deep(.list) {
      margin-top: 10px;
      // flex: none;
      height: 100%;
      width: 100%;
    }
  }

  :deep(.list-item.selected .checkbox-box) {
    display: none;
  }

  :deep(.list) {
    margin-top: 10px;
  }
}
</style>
<style lang="less">
.upload-panel-search {
  width: 100%;

  &.search-wrap {
    margin-bottom: 0;

    .ant-input + span {
      border: none !important;
    }

    .ant-input {
      border: none;

      &:hover,
      :focus {
        border: none !important;
      }
    }
  }

  .ant-input-group-addon {
    .anticon {
      color: #616161;
      font-size: 14px;
    }
  }
}
</style>
