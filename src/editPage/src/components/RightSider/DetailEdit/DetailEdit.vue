<template>
  <div class="select-item">
    <div class="label">刀版尺寸<span>(单位:mm)</span></div>
    <a-dropdown v-model:visible="sizeVisible" trigger="click">
      <template #overlay>
        <a-menu @mouseleave="sizeVisible = false" @click="sizeChange" :selectedKeys="[size]" class="select-dropdown">
          <a-menu-item v-for="item in sizeList" :key="item" :value="item" class="select">
            {{ item }}
          </a-menu-item>
        </a-menu>
      </template>
      <div class="select-label">
        <span>{{ size }}</span> <Icon type="xiala"></Icon>
      </div>
    </a-dropdown>
  </div>
  <div class="select-item">
    <div class="label">刀版材质<span></span></div>
    <a-dropdown v-model:visible="materialVisible" trigger="click">
      <template #overlay>
        <a-menu
          @mouseleave="materialVisible = false"
          @click="materialLabelChange"
          :selectedKeys="[materialLabel?.nameEn]"
          class="select-dropdown"
        >
          <a-menu-item v-for="item in materialLabelList" :key="item.nameEn" :value="item.nameEn" :title="item.nameCh">
            {{ item.nameCh }}
          </a-menu-item>
        </a-menu>
      </template>
      <div class="select-label">
        <span>{{ materialLabel }}</span
        ><Icon type="xiala"></Icon>
      </div>
    </a-dropdown>
  </div>
  <div class="select-item">
    <div class="label">印后工艺<span>(单位:mm)</span></div>
    <a-dropdown :disabled="true">
      <template #overlay>
        <a-menu @click="postprintingChange" :selectedKeys="[postprinting]" class="select-dropdown">
          <a-menu-item v-for="item in postprintingList" :key="item.value" :value="item.value">
            {{ item.value }}
          </a-menu-item>
        </a-menu>
      </template>
      <div class="select-label">
        <span>{{ postprinting }}</span> <Icon type="xiala"></Icon>
      </div>
    </a-dropdown>
  </div>
  <!-- <SubmitDialog
    v-model:visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    :templateId="currentTemplateId"
    :designId="currentDesignId"
  ></SubmitDialog> -->
</template>

<script setup>
import fetchApi from '@/api/fetchApi';
import Icon from '@/components/common/Icon/Icon.vue';
// import SubmitDialog from '@/components/SubmitDialog/SubmitDialog.vue';
import { ref, watch, onMounted } from 'vue';
import { useMainStore } from '@/store/index.js';
import { usePlaygroundStore } from '@/store/module/usePlayground';
let playgroundStore = usePlaygroundStore();
let mainStore = useMainStore();
const sizeVisible = ref(false);
const materialVisible = ref(false);
const postprintingList = [{ id: 1, value: '哑膜' }];
const postprinting = ref('哑膜');
const size = ref(null);
const sizeList = ref([]);
const materialLabel = ref(null);
const materialLabelList = ref([]);
let diecutList = [];
const materialId = ref(null);
watch(
  () => [mainStore.diecutList[playgroundStore.layoutId || playgroundStore.selectLayoutId]],
  () => {
    getDiecutTemplateList();
  },
);
// watch(() => [playgroundStore.layoutId, playgroundStore.selectLayoutId], (val) => {
//   console.log("数据有变化2");
//   getDiecutTemplateList();
// })
function getDiecutTemplateList() {
  let palyId = playgroundStore.layoutId || playgroundStore.selectLayoutId;
  if (!palyId || !mainStore.diecutList[palyId]) return false;
  let data = mainStore.diecutList[palyId];
  // console.log('此时的刀版数据',data,palyId)
  diecutList = data.diecutList || [];
  let defaultInfo = diecutList.find((item) => String(item.diecutId) === String(palyId));
  sizeList.value = data.sizeList || [];
  size.value = defaultInfo?.size || '';
  materialLabelList.value = data.materialList || [];
  materialLabel.value = defaultInfo?.materialName || '';
  materialId.value = defaultInfo?.materialId || '';
}

getDiecutTemplateList();
let currentTemplateId = ref();
let currentDesignId = ref();
let selectBox = null;
function sizeChange(val) {
  let nowSize = val.item.value;
  sizeVisible.value = false;
  if (size.value === nowSize) {
    return;
  }
  let info = diecutList.find((item) => {
    return item.size === nowSize && item.materialId === materialId.value;
  });
  if (!info) {
    info = diecutList.find((item) => {
      return item.size === nowSize;
    });
  }
  // console.log(info,diecutList,'材质切尺寸换')

  showSubmitDialog(info);
  selectBox = info;
}

function materialLabelChange(val) {
  let nowMaterialId = val.item.value;
  materialVisible.value = false;
  if (materialId.value === nowMaterialId) {
    return;
  }
  let info = diecutList.find((item) => {
    return item.size === size.value && item.materialId === nowMaterialId;
  });
  if (!info) {
    info = diecutList.find((item) => {
      return item.materialId === nowMaterialId;
    });
  }
  // console.log(info,diecutList,'材质切换')
  showSubmitDialog(info);
  selectBox = info;
}
function postprintingChange(val) {}
function showSubmitDialog(info) {
  if (!info.templateId) {
    console.warn('templateId 为空');
    return;
  }
  currentTemplateId.value = info.templateId;
  currentDesignId.value = info.designId;
  visible.value = true;
}
const visible = ref(false);
const handleCancel = () => {};
const handleOk = () => {
  materialId.value = selectBox.materialId;
  materialLabel.value = selectBox.materialName;
  size.value = selectBox.size;
};
</script>

<style lang="less" scoped>
.select-item {
  margin-bottom: 20px;

  .label {
    height: 20px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    color: #333333;
    line-height: 20px;
    margin-bottom: 10px;

    span {
      color: #999999;
      line-height: 17px;
      height: 17px;
      font-size: 12px;
    }
  }

  .select-label {
    background: #f7f7f7;
    width: 240px;
    height: 40px;
    line-height: 40px;
    background: #f7f7f7;
    border-radius: 8px;
    text-align: center;
    display: flex;
    align-items: center;
    padding-right: 10px;

    span {
      flex: 1;
      display: block;
      width: 210px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :deep(.anticon) {
      font-size: 12px;
      color: #a8a8a8;
      margin: 0 4px;
    }
  }
}

.select-dropdown {
  max-height: 50vh !important;
  overflow-y: auto;
  max-width: 240px;

  :deep(.ant-dropdown-menu-title-content) {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

:deep(.ant-dropdown-menu-item) {
  height: 32px;
  line-height: 32px;
}

:deep(.ant-dropdown-menu-item-selected, .ant-dropdown-menu-submenu-title-selected) {
  background-color: #f8f8f8;
  color: #333333;
}

:deep(.select-label.ant-dropdown-trigger) {
  cursor: pointer;

  &[disabled='true'] {
    cursor: not-allowed;
  }
}

.dialog-body {
  text-align: center;
  margin-bottom: 30px;
}

.dialog-bottom {
  padding-bottom: 32px;
  margin: 10px auto 0;
  text-align: center;

  .button-bottom {
    width: 130px;
    height: 40px;
    line-height: 40px;
    padding: 0;
    text-align: center;
    border-radius: 5px;

    &:first-child {
      margin-right: 40px;
    }
  }
}
</style>
