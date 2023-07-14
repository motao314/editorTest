<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-08 22:02:37
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-06-07 16:28:51
 * @FilePath: \XXEditor\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="box-type-wrap content-wrap">
    <div class="search-wrap">
      <a-input-search
        v-model:value="params.materialName"
        placeholder="输入素材关键字"
        @search="onSearch"
        @pressEnter="onSearch"
      >
        <template #enterButton>
          <Icon type="sousuo" class="search-icon"></Icon>
        </template>
      </a-input-search>
    </div>
    <SelectTabs type="primary" :list="tabsList" :config="tabsConfig" v-model="params.gropuId" @change="tabsChange">
    </SelectTabs>
    <ImageList
      :list="currentList"
      :isLoaded="isLoaded"
      :isLoading="isLoading"
      :imgStyle="imgStyle"
      :cloumn="3"
      :config="{
        label: '',
        value: 'id',
        url: 'sourceUrl',
      }"
      @change="selectItemHandle"
      @srcollEnd="getDetailList"
    >
      <template v-slot:default="slotProps">
        {{ slotProps.item.materialName }}
      </template>
    </ImageList>
  </div>
</template>
<script setup>
import { nanoid } from 'nanoid';
import Icon from '@/components/common/Icon/Icon.vue';
import SelectTabs from '@/components/common/SelectTabs/SelectTabs.vue';
import ImageList from '@/components/common/ImageList/ImageList.vue';
import fetchApi from '@/api/fetchApi';
import {
  MATERIALGROUP_GETALLGROUNPLIST, // 素材类型
  PAGEMATERIALLIST, // 正常的素材列表
} from '@/api/API.config';
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { usePlaygroundStore } from '@/store/module/usePlayground.js';
import { useMainStore } from '@/store/index.js';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
const PlaygroundStore = usePlaygroundStore();
const MainStore = useMainStore();
const tabsList = ref(null);
const tabsConfig = ref({
  label: 'name',
  value: 'id',
});
const imgStyle = ref({
  height: '90px',
  'border-radius': '8px',
  border: '1px solid #E8E8E8',
  padding: '10px',
  background: '#fff',
});
const currentList = ref([]);

getTabList();
// 获取素材类型栏
const tabsLoaded = ref(false);

function getTabList() {
  fetchApi
    .post(MATERIALGROUP_GETALLGROUNPLIST, { 
      materialGroupUseType: 0,
      platformType:MainStore.enterType == 'ADMIN_OPERATION'?0:1,
      templateId:MainStore.enterType == 'ADMIN_OPERATION'?MainStore.templateId:''
    })
    .then((res) => {
      tabsList.value = [{ name: '全部', id: '' }, ...res?.data] || [];
      params.value.gropuId = tabsList.value.length ? tabsList.value[0].id : '';
      getDetailList();
      // console.log(res, '请求成功')
    })
    .catch((err) => {
      console.log(err);
    });
}
let params = ref({
  materialUseType: 0,
  gropuId: '',
  materialName: '',
  pageIndex: -1,
  pageSize: 30,
});
//  页面从 0 开始
const isLoaded = ref(false);
function resetParams() {
  params.value.pageIndex = -1;
  currentList.value = [];
  isLoading.value = false;
  isLoaded.value = false;
}
function tabsChange(item) {
  if (item[tabsConfig.id] === params.value.gropuId) return;
  resetParams();
  onSearch();
}
let isLoading = ref(false);
function getDetailList() {
  if (isLoading.value) return;
  isLoading.value = true;
  fetchApi
    .post(PAGEMATERIALLIST, { 
      ...params.value, 
      pageIndex: params.value.pageIndex + 1,
      platformType:MainStore.enterType == 'ADMIN_OPERATION'?0:1,
      templateId:MainStore.enterType == 'ADMIN_OPERATION'?MainStore.templateId:''
     })
    .then((res) => {
      currentList.value = [...currentList.value, ...(res?.data?.dataList || [])];
      if (!res.data?.dataList || !res.data?.dataList?.length || currentList.value.length === res.data.count) {
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
function onSearch() {
  resetParams();
  getDetailList();
}

function hiddenLoading(node) {
  let index = currentList.value.findIndex((item) => item.id === node.id);
  if (index >= 0) currentList.value[index].loading = false;
}
function selectItemHandle(item) {
  // console.log(item, Number(item.typeMaterial) === 1);
  if (Number(item.groupId) === -1) {
    const content = item?.designCompositeElementExtDTO?.content;
    if (!content) {
      message.warn('此元素不符合规定，请选择其他');
      return false;
    }
    const groupInfo = JSON.parse(content);
    groupInfo.attrs.url = item.previewUrl;
    groupInfo.attrs.srcId = item.previewFid || item.sourceUrl;
    groupInfo.attrs.materialDesc = item.materialName;
    groupInfo.attrs.materialId = item.id;
    let minY = Infinity;
    let minX = Infinity;
    groupInfo.children.forEach((node) => {
      node.attrs.id = nanoid();
      minY = Math.min(minY, node.attrs.y);
      minX = Math.min(minX, node.attrs.x);
    });
    groupInfo.children.forEach((item, index) => {
      item.attrs.y = item.attrs.y - minY;
      item.attrs.x = item.attrs.x - minX;
    });
    groupInfo.displaySize = item.displaySize;
    // console.log(groupInfo, 'groupInfo');
    PlaygroundStore.addGroup(groupInfo)
      .then((res) => {
        // setLayerTransformY();
      })
      .finally((res) => {
        hiddenLoading(item);
      });
  } else {
    // console.log(item,'--------------')
    PlaygroundStore.addImage({
      url: item.previewUrl || item.sourceUrl,
      srcId: item.previewFid,
      materialDesc: item.materialName,
      materialId: item.id,
      displaySize: item.displaySize,
    })
      .then((res) => {})
      .finally((res) => {
        hiddenLoading(item);
      });
  }
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
</style>
