<template>
  <div class="box-type-wrap content-wrap">
    <div class="search-wrap">
      <a-input-search
        v-model:value="params.keyword"
        :maxlength="20"
        placeholder="输入模板关键字"
        @search="onSearch"
        @pressEnter="onSearch"
      >
        <template #prefix>
          <a-popover
            placement="rightTop"
            trigger="hover"
            v-model:visible="filterVisible"
            overlayClassName="no-arrow no-out-padding no-padding filter-popover"
          >
            <template #content>
              <div class="filter-list-wrap">
                <div class="filter-list level-one">
                  <div
                    class="filter-item"
                    :class="{ active: item.id === boxCagetoryId }"
                    v-for="item in boxTypeGategroy"
                    :key="item.id"
                    @click="getBoxList(item.id)"
                  >
                    {{ item.boxCategoryName }}
                  </div>
                </div>
                <div class="filter-list level-two">
                  <div
                    class="filter-item"
                    :class="{ active: box.id === boxCagetoryId2 }"
                    v-for="box in boxList"
                    :key="box.defaultBoxId"
                    @click="selectBox(box.id)"
                  >
                    {{ box.boxCategoryName }}
                  </div>
                  <!-- <div class="loadding-wrap" v-if="boxLoading">
                      加载中......
                    </div> -->
                </div>
              </div>
            </template>
            <Icon type="hexingzhankai" class="box-type-filter"></Icon>
          </a-popover>
        </template>
        <template #enterButton>
          <Icon type="sousuo" class="search-icon"></Icon>
        </template>
      </a-input-search>
    </div>
    <CascadeSelect
      :list="tempaleteFristGategroy"
      :list2="tempaleteSecondGategroy"
      v-model:fristValue="selectType"
      v-model:secondValue="params.designStyle"
      @fristChange="fristChange"
      @secondChange="secondChange"
      :config="tabsConfig"
    ></CascadeSelect>
    <ImageList
      :list="currentList"
      popClassName="detail-width-220"
      :modelValue="templateId"
      :imgStyle="{ height: '192px' }"
      :isLoaded="isLoaded"
      :isLoading="isLoading"
      :config="ImageListConfig"
      emptyText="暂无模板,敬请期待"
      :needDownload="false"
      :draggable="false"
      @srcollEnd="getList"
      @clickDetail="clickDetail"
      @change="changeTemplate"
    >
      <template v-slot:default="slotProps">
        <template v-if="slotProps.item.detailLoaded">
          <DetailList
            type="around"
            :bigTitle="slotProps.item.detail.showName"
            :list="slotProps.item.detail.categoryList"
            style="margin-bottom: 14px"
            :column="0"
          ></DetailList>
          <DetailList title="尺寸（单位mm）：" :list="slotProps.item.detail.sizeList" :column="2" :row="2"></DetailList>
          <DetailList title="材质：" :list="slotProps.item.detail.materialLabelList" :column="3" :row="2"></DetailList>
        </template>
        <template v-else> 正在获取数据，请稍等...</template>
      </template>
    </ImageList>
  </div>
  <!-- <SubmitDialog v-model:visible="visible" @cancel="handleCancel" :templateId="templateId">
  </SubmitDialog> -->
</template>

<script setup>
import Icon from '@/components/common/Icon/Icon.vue';
// import SubmitDialog from '@/components/SubmitDialog/SubmitDialog.vue';
import CascadeSelect from '@/components/common/CascadeSelect/CascadeSelect.vue';
import ImageList from '@/components/common/ImageList/ImageList.vue';
import DetailList from '@/components/common/DetailList/DetailList.vue';
import fetchApi from '@/api/fetchApi';

import { TEMPLATE_LIST, TEMPLATE_DETAIL, TEMPLATE_BOX_CATEGORY, BOX_TYPE_LIST } from '@/api/API.config';
import { ref } from 'vue';
import { useMainStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
let router = useRouter();
let MainStore = useMainStore();
let route = useRoute();
const { tempaleteFristGategroy, tempaleteSecondGategroy } = storeToRefs(MainStore);
const boxTypeGategroy = ref([]);
let allLevel3 = [];
//  获取盒型类型列表
getBoxTypeGategroy();
function getBoxTypeGategroy() {
  Promise.all([
    fetchApi.get(TEMPLATE_BOX_CATEGORY, { level: 2 }),
    fetchApi.get(TEMPLATE_BOX_CATEGORY, { level: 3 }),
  ]).then(([res, res2]) => {
    boxTypeGategroy.value = [{ boxCategoryName: '全部', id: '' }, ...(res.data || [])];
    allLevel3 = [{ boxCategoryName: '全部', id: '' }, ...(res2.data || [])];
    getBoxList();
  });
}
const tabsConfig = {
  label: 'labelName',
  value: 'labelNameEn',
};
const ImageListConfig = {
  label: '',
  value: 'defaultTemplateInfoId',
  url: 'coverImageUrl',
};
const selectType = ref('');
// 查询 模板列表 POST {designStyle设计风格,keyword 关键字，scene场景,trade行业，boxCagetoryId盒型分类,boxSearchMaterial材质,boxSearchType类型,}

const params = ref({
  boxCagetoryId: '',
  keyword: '',
  designStyle: '',
  keyword: '',
  scene: '',
  trade: '',
  pageIndex: -1,
  pageSize: 20,
});
function resetParams() {
  params.value.pageIndex = -1;
  currentList.value = [];
  isLoading.value = false;
  isLoaded.value = false;
}
function fristChange(item) {
  if (!item) {
    params.value.trade = '';
    params.value.scene = '';
  } else if (item.labelType === 'trade') {
    params.value.trade = item.labelNameEn;
    params.value.scene = '';
  } else {
    params.value.scene = item.labelNameEn;
    params.value.trade = '';
  }
  resetParams();
  getList();
}
function secondChange() {
  resetParams();
  getList();
}
const onSearch = () => {
  resetParams();
  getList();
};

const currentList = ref([]);
const isLoaded = ref(false);
const isLoading = ref(false);

function getList() {
  if (isLoading.value) return;
  isLoading.value = true;
  const { pageIndex, pageSize, ...data } = params.value;
  fetchApi
    .post(TEMPLATE_LIST + `?page=${pageIndex + 1}&size=${pageSize}`, data)
    .then((res) => {
      currentList.value = [...currentList.value, ...(res?.data?.content || [])];
      if (!res.data?.content || res.data?.last) {
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
// getList()
function clickDetail({ detail, index }) {
  fetchApi
    .get(TEMPLATE_DETAIL, { boxCategoryId: detail.boxCategoryId, templateInfoAlias: detail.templateInfoAlias })
    .then((res) => {
      let data = res.data;
      currentList.value[index].detail = {
        ...data,
        categoryList: [...data.designStyles, ...data.trades, ...data.sences],
        materialLabelList: data.materialList.map((i) => i.nameCh),
      };
      currentList.value[index].detailLoaded = true;
    });
}

const templateId = ref('');
const designId = ref('');
const visible = ref(false);
function changeTemplate(item) {
  templateId.value = item.defaultTemplateInfoId;
  designId.value = item.defaultDesignId;
  MainStore.enterType = 'PC_DESIGNER';
  if (MainStore.templateId) {
    visible.value = true;
  } else {
    if (!templateId?.value) return;
    MainStore.templateId = templateId.value;
    MainStore.designId = designId.value;
    MainStore.updateCanvasUpateTime();
  }
}
function handleCancel() {
  templateId.value = null;
}
//  盒型筛选
const boxCagetoryId = ref('');
const boxCagetoryId2 = ref('');
const boxList = ref([]);
const filterVisible = ref(false);

function getBoxList(id) {
  if (boxCagetoryId.value === id) return;
  id = id || '';
  boxCagetoryId.value = id;
  boxCagetoryId2.value = id;
  selectBox(boxCagetoryId.value);
  // resetParams()
  // getList()
  boxList.value = [];
  if (id) {
    let boxs = boxTypeGategroy.value.find((item) => item.id === id)?.childrenBox || [];
    boxList.value = [{ id: id, boxCategoryName: '全部' }, ...boxs];
  } else {
    boxList.value = allLevel3;
  }
}
function selectBox(id) {
  if (id && id == boxCagetoryId2.value) return;
  boxCagetoryId2.value = id;
  params.value.boxCagetoryId = id;
  resetParams();
  getList();
  filterVisible.value = false;
}
</script>

<style lang="less" scoped>
@import '@/less/search-input.less';

.content-wrap {
  padding: 20px 5px 0 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.filter-list-wrap {
  display: flex;
  max-height: 540px;

  .filter-list {
    overflow-y: auto;

    .filter-item {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #333333;
      line-height: 36px;
      white-space: nowrap;
      padding: 0px 10px;

      &:hover,
      &.active {
        background-color: #fff;
        color: @primary-color;
        font-weight: 800;
      }
    }

    &.level-one {
      background-color: #f8f9fa;
      min-width: 120px;

      .filter-item {
        padding-left: 26px;
      }
    }

    &.level-two {
      background-color: #fff;
      min-width: 168px;

      .filter-item {
        padding-left: 36px;
      }
    }
  }
}

:global(.filter-popover.no-arrow .ant-popover-inner) {
  max-width: none !important;
}

:deep(.img-wrap img) {
  width: 100%;
  height: 100%;
}
</style>
