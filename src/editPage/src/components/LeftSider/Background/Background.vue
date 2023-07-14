<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-08 22:02:37
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-26 15:37:33
 * @FilePath: \XXEditor\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="box-type-wrap content-wrap">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="颜色">
        <ColorPicker :initColor="beforeColor" v-model:color="nowColor" @update:color="setBgColor"></ColorPicker>
      </a-tab-pane>
      <a-tab-pane key="2" tab="图案">
        <SelectTabs
          v-if="!(params.pageIndex === 0 && !params.gropuId && currentList.length === 0)"
          type="primary"
          :list="tabsList"
          :config="tabsConfig"
          v-model="params.gropuId"
          style="margin-top: 10px"
          @change="tabsChange"
        >
        </SelectTabs>

        <!--   :showDetail="false"  -->
        <ImageList
          :list="currentList"
          :isLoaded="isLoaded"
          :isLoading="isLoading"
          :draggable="false"
          emptyText="暂无背景图案,敬请期待"
          :modelValue="currentUrl"
          :config="{
            label: '',
            value: 'sourceUrl',
            url: 'sourceUrl',
          }"
          :cloumn="3"
          :imgStyle="imgStyle"
          @change="setBgImg"
          @srcollEnd="getDetailList"
        >
          <template v-slot:before>
            <div class="clear-btn" @click="clearImg">
              <Icon type="15qingkong-1"></Icon>
              <div class="text">清除图案</div>
            </div>
          </template>
          <template v-slot:default="slotProps">
            {{ slotProps.item.materialName }}
          </template>
        </ImageList>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import SelectTabs from '@/components/common/SelectTabs/SelectTabs.vue';
import ImageList from '@/components/common/ImageList/ImageList.vue';
import {
  MATERIALGROUP_GETALLGROUNPLIST, // 素材类型
  PAGEMATERIALLIST, // 正常的素材列表
} from '@/api/API.config';
import { usePlaygroundStore } from '@/store/module/usePlayground.js';
import { useMainStore } from '@/store';
import ColorPicker from './ColorPicker.vue';
import fetchApi from '@/api/fetchApi';
import Icon from '../../common/Icon/Icon.vue';
import { message } from 'ant-design-vue';
const PlaygroundStore = usePlaygroundStore();
const MainStore = useMainStore();
const tabsList = ref(null);
const activeKey = ref('1');
const tabsConfig = ref({
  label: 'name',
  value: 'id',
});
const imgStyle = ref({
  height: '100px',
  height: '90px',
  'border-radius': '8px',
  padding: '0px',
  background: '#fff',
  'margin-bottom': '10px',
});
const UIBackground = computed(() => {
  return PlaygroundStore?.currentCanvasMap?.background;
});
const nowColor = ref('');
const beforeColor = computed(() => {
  nowColor.value = UIBackground.value?.fillColor;
  return UIBackground.value?.originData?.fillColor || 'transparent';
});

function setBgColor(color) {
  nowColor.value = color;
  PlaygroundStore.setBackground({ fillColor: color });
}
// -------- 背景图片----------

const beforeBackgroundImage = UIBackground.value?.originData?.fillImage || '';
const currentUrl = computed(() => {
  return PlaygroundStore?.currentCanvasMap?.background?.fillImage || '';
});
const selectImage = ref(beforeBackgroundImage);
function setBgImg(item) {
  if (item.sourceUrl === selectImage.value) return false;
  // item.loading = true;
  PlaygroundStore.setBackground({ fillImage: item.sourceUrl }).finally(() => {
    selectImage.value = item.sourceUrl;
    // item.loading = false;
    currentList.value.find((img) => img.sourceUrl === item.sourceUrl).loading = false;
  });
}
function clearImg() {
  if (!selectImage.value && !currentUrl.value) return false;
  PlaygroundStore.setBackground({ fillImage: null });
  selectImage.value = null;
}
const currentList = ref([]);
getTabList();
// 获取素材类型栏
const tabsLoaded = ref(false);
function getTabList() {
  fetchApi
    .post(MATERIALGROUP_GETALLGROUNPLIST, { 
      materialGroupUseType: 1 ,
      platformType:MainStore.enterType == 'ADMIN_OPERATION'?0:1,
      templateId:MainStore.enterType == 'ADMIN_OPERATION'?MainStore.templateId:''
    })
    .then((res) => {
      tabsList.value = [{ name: '全部', id: '' }, ...res?.data] || [];
      params.value.gropuId = tabsList.value.length ? tabsList.value[0].id : '';
      getDetailList();
      tabsLoaded.value = true;
    })
    .catch((err) => {
      console.log(err);
    });
}
let params = ref({
  materialUseType: 1,
  gropuId: '',
  materialName: '',
  pageIndex: -1,
  pageSize: 30,
});
function tabsChange(item) {
  if (item[tabsConfig.id] === params.value.gropuId) return;
  params.value.pageIndex = -1;
  currentList.value = [];
  getDetailList();
}
const isLoaded = ref(false);
const isLoading = ref(false);
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
      if (!res.data?.dataList || !res.data?.dataList?.length || currentList.value.length === res?.data.count)
        isLoaded.value = true;
      isLoading.value = false;
      params.value.pageIndex += 1;
    })
    .catch((err) => {
      console.log(err);
      isLoading.value = false;
    });
}
</script>
<style lang="less" scoped>
.content-wrap {
  padding: 10px 5px 0 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  :deep(.ant-tabs) {
    height: 100%;
    flex-direction: column;
  }

  :deep(.ant-tabs-content-holder) {
    flex: 1 !important;
  }

  :deep(.ant-tabs-content) {
    height: 100%;
  }

  :deep(.ant-tabs-tabpane) {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin-bottom: 10px;
  }

  :deep(.ant-tabs-nav-list) {
    width: 100%;
  }

  :deep(ant-tabs-nav-wrap) {
    width: 100%;
  }

  :deep(.ant-tabs-tab) {
    flex: 1;
    text-align: center;
    justify-content: center;
    padding: 10px;
    line-height: 20px;
    font-size: 14px;
  }

  :deep(.ant-tabs-ink-bar) {
    background: #fff;

    &::after {
      content: '';
      width: 30px;
      background-color: @primary-color-bg;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      height: 4px;
      border-radius: 2px;
    }
  }

  :deep(.ant-tabs-nav-operations) {
    display: none;
  }

  :deep(.ant-tabs-top > .ant-tabs-nav::before) {
    border-bottom: 0;
  }

  :deep(.ant-tabs-tab-btn) {
    color: #999999;
    line-height: 20px;
    text-shadow: none;
  }

  :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
    color: #333333;
    font-weight: 800;
  }
}

.clear-btn {
  width: 90px;
  height: 90px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  color: #999999;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  padding-top: 22px;
  text-align: center;

  :deep(.anticon) {
    color: #e8e8e8;
    font-size: 30px;
  }

  .text {
    font-size: 12px;
  }
}
</style>
