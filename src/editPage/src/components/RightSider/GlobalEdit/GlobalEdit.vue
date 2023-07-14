<template>
  <div class="select-item">
    <div class="label">成品尺寸<span>(单位:mm)</span></div>
    <a-dropdown v-model:visible="sizeVisible" trigger="click">
      <template #overlay>
        <a-menu @mouseleave="sizeVisible = false" @click="sizeChange" :selectedKeys="[size]" class="select-dropdown">
          <a-menu-item v-for="item in sizeList" :key="item" :value="item" class="select">
            <span>{{ item }}</span>
          </a-menu-item>
        </a-menu>
      </template>
      <div class="select-label">
        <span>{{ size }}</span> <Icon type="xiala"></Icon>
      </div>
    </a-dropdown>
  </div>
  <div class="select-item">
    <div class="label">盒型材质<span></span></div>
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
        <span>{{ materialLabel?.nameCh }}</span
        ><Icon type="xiala"></Icon>
      </div>
    </a-dropdown>
  </div>
  <!-- 
  <div class="select-item" v-if="layoutId|| selectLayoutId">
    <div class="label">
      印后工艺<span>(单位:mm)</span>
    </div>
    <a-dropdown :disabled="true" >
      <template #overlay>
        <a-menu   @click="postprintingChange" :selectedKeys="[postprinting]" class="select-dropdown">
          <a-menu-item  v-for="item in postprintingList" :key="item.value" :value="item.value" >
            {{ item.value }}
          </a-menu-item>
        </a-menu>
      </template>
      <div class="select-label">
       <span>{{postprinting}}</span> <Icon type="xiala"></Icon>
      </div>
    </a-dropdown>
  </div> -->

  <!-- <SubmitDialog v-model:visible="visible" @ok="handleOk" @cancel="handleCancel" :boxId="currentBoxId"></SubmitDialog> -->
</template>

<script setup>
import Icon from '@/components/common/Icon/Icon.vue';
// import SubmitDialog from '@/components/SubmitDialog/SubmitDialog.vue';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useMainStore } from '@/store/index.js';
import { usePlaygroundStore } from '@/store/module/usePlayground';
import { computed } from '@vue/reactivity';
let { layoutId, selectLayoutId } = storeToRefs(usePlaygroundStore());
let MainStore = useMainStore();
const sizeVisible = ref(false);
const materialVisible = ref(false);
const postprintingList = [{ id: 1, value: '哑膜' }];
const postprinting = ref('哑膜');
const size = ref(null);
const sizeList = ref([]);
const materialLabel = ref(null);
const materialLabelList = ref([]);
watch(
  () => MainStore.currentBox,
  (val) => {
    updateValue(val);
  },
);
function updateValue(val) {
  sizeList.value = val?.sizeList || [];
  size.value = val?.size || val?.defaultSize;
  materialLabel.value = val?.materialLabel || val?.defaultMaterialLabel;
  materialLabelList.value = val?.materialList || [];
}
updateValue(MainStore.currentBox);
let currentBoxId = ref();
let box = '';
function sizeChange(val) {
  let nowSize = val.item.value;
  sizeVisible.value = false;
  if (nowSize === size.value) return;
  box = MainStore.currentBox?.boxList.find((item) => {
    return item.materialLabel.nameEn === materialLabel.value && item.size === nowSize;
  });
  if (!box) {
    box = MainStore.currentBox?.boxList.find((item) => item.size === nowSize);
  }
  showSubmitDialog(box);
}
function materialLabelChange(val) {
  let material = val.item.value;
  if (materialLabel.value.nameEn === material) {
    return;
  }
  box = MainStore.currentBox?.boxList.find((item) => {
    return item.materialLabel.nameEn === material && item.size === size.value;
  });
  if (!box) {
    box = MainStore.currentBox?.boxList.find((item) => item.materialLabel.nameEn === material);
  }
  showSubmitDialog(box);
}
function postprintingChange(val) {}
function showSubmitDialog(box) {
  currentBoxId.value = box.boxId;
  visible.value = true;
}
const visible = ref(false);
const handleCancel = () => {};
const handleOk = () => {
  size.value = box.size;
  materialLabel.value = box.materialLabel;
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
