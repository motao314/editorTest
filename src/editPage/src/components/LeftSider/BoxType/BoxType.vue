<template>
  <div class="box-type-wrap content-wrap">
    <div class="search-wrap">
      <a-input-search
        v-model:value="params.keyword"
        :maxlength="20"
        placeholder="输入盒型关键字"
        @search="onSearch"
        @pressEnter="onSearch"
      >
        <template #enterButton>
          <Icon type="sousuo" class="search-icon"></Icon>
        </template>
      </a-input-search>
    </div>
    <SelectTabs
      :list="boxTypeGategroy"
      v-model="params.boxCagetoryId"
      type="primary"
      @change="tabChange"
      :config="tabsConfig"
    >
    </SelectTabs>

    <ImageList
      :list="currentList"
      :modelValue="currentBox.boxId || currentBox.defaultBoxId"
      :isLoaded="isLoaded"
      :isLoading="isLoading"
      :config="listConfig"
      :needDownload="false"
      :draggable="false"
      emptyText="暂无盒型,敬请期待"
      popClassName="detail-width-220"
      :imgStyle="{ width: '144px' }"
      @change="changeBox"
      @srcollEnd="getList"
    >
      <template v-slot:default="slotProps">
        <DetailList
          title="尺寸（单位mm）："
          :bigTitle="slotProps.item.boxCategoryName"
          :list="slotProps.item.sizeList"
          style="margin-bottom: 14px"
          :column="2"
          :row="2"
        ></DetailList>
        <DetailList
          title="材质："
          :list="formatDetailList(slotProps.item.materialList)"
          :column="3"
          :row="2"
        ></DetailList>
      </template>
    </ImageList>
  </div>
  <!-- <SubmitDialog
    v-model:visible="visible"
    @ok="handleOk"
    :boxId="selectBox?.defaultBoxId"
    content="当前方案未保存，是否直接替换成新盒型？"
  >
  </SubmitDialog> -->
</template>

<script setup>
import Icon from '@/components/common/Icon/Icon.vue';
// import SubmitDialog from '@/components/SubmitDialog/SubmitDialog.vue';
import SelectTabs from '@/components/common/SelectTabs/SelectTabs.vue';
import ImageList from '@/components/common//ImageList/ImageList.vue';
import DetailList from '@/components/common/DetailList/DetailList.vue';
import fetchApi from '@/api/fetchApi.js';
import { BOX_TYPE_LIST } from '@/api/API.config.js';
import { ref } from 'vue';
import { useMainStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
let router = useRouter();

let MainStore = useMainStore();
const { boxTypeGategroy, currentBox } = storeToRefs(MainStore);
const tabsConfig = {
  label: 'boxCategoryName',
  value: 'id',
};

const params = ref({
  boxCagetoryId: '',
  keyword: '',
  pageIndex: -1,
  pageSize: 10,
});
function resetParams() {
  params.value.pageIndex = -1;
  currentList.value = [];
  isLoading.value = false;
  isLoaded.value = false;
}
const isLoaded = ref(false);
let isLoading = ref(false);
const currentList = ref([]);
const listConfig = {
  value: 'defaultBoxId',
  label: 'boxCategoryName',
  url: 'defaultThumbnailOssUrl',
};
function tabChange(item) {
  if (item?.[tabsConfig.id] === params.value?.boxCagetoryId) return;
  resetParams();
  getList();
}

const onSearch = () => {
  resetParams();
  getList();
};

function getList() {
  isLoading.value = true;
  isLoaded.value = false;
  const { pageIndex, pageSize, ...data } = params.value;
  fetchApi
    .post(BOX_TYPE_LIST + `?page=${pageIndex + 1}&size=${pageSize}`, data)
    .then((res) => {
      currentList.value = [...currentList.value, ...(res?.data?.content || [])];
      if (res.data?.last) {
        isLoaded.value = true;
      }
      isLoading.value = false;
      params.value.pageIndex += 1;
    })
    .catch((err) => {
      console.log(err);
      isLoading.value = false;
    });
}
getList();
let route = useRoute();
const visible = ref(false);
const selectBox = ref({});
async function changeBox(box) {
  // console.log("是这里吗？",box);
  selectBox.value = box;
  if (MainStore.templateId) {
    visible.value = true;
  } else {
    if (!box?.defaultBoxId) return;
    let res = await MainStore.getNewTemplate(box?.defaultBoxId);
    MainStore.templateId = res.data;
    MainStore.designId = '';
    MainStore.enterType = 'PC_DESIGNER';
    MainStore.updateCanvasUpateTime();
  }
}

function handleOk() {
  MainStore.setCurrentBox(selectBox.value);
}
function formatDetailList(list) {
  return list.map((item) => item.nameCh);
}
</script>

<style lang="less" scoped>
@import '@/less/search-input.less';

.box-type-wrap {
  :deep(.img-wrap) {
    // background: #d3c6c3;
  }
  :deep(.img-list-wrap) {
    overflow-x: hidden;
  }
}

.content-wrap {
  padding: 20px 5px 0 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.arrow {
  width: 6px !important;
  height: 6px !important;
  cursor: pointer;

  &:hover {
    border-color: @primary-color;
  }

  &.arrow-left {
    border-color: #3f3f3f;
  }
}

.search-icon {
  :deep(.anticon) {
    color: #616161;
    font-size: 16px;
  }
}

:deep(.ant-btn.ant-btn-primary:hover) {
  background: #fff !important;
}

:deep(.img-wrap img) {
  width: 100%;
  height: 100%;
}
</style>
