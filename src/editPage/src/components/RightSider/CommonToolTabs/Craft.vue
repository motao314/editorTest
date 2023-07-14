<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-08 22:02:37
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-06-15 15:30:16
 * @FilePath: \XXEditor\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { onBeforeUnmount, computed, ref, watch } from 'vue';
import Icon from '@/components/common/Icon/Icon.vue';
import { message } from 'ant-design-vue';

import { usePlaygroundStore } from '@/store/module/usePlayground';
import { useMainStore } from '@/store';
const PlaygroundStore = usePlaygroundStore();
const MainStore = useMainStore();
const visible = ref(false);
function visibleChange() {
  visible.value = !visible.value;
}
const List = computed(() => {
  return MainStore.originData?.elementCrafe || [];
});
watch(
  () => PlaygroundStore.slecetTimestape,
  (val, newValue) => {
    if (!PlaygroundStore.clickTargetNode?.[0]) return false;
    // notifyFuncton()

    updateViewCraft();
  },
);
let selectOriginId = null;
const selectCrafeId = ref([]); // 数组
// 点击元素改变时
function updateViewCraft() {
  const clickNode = PlaygroundStore.clickTargetNode?.[0];
  if (!clickNode) return;
  let craftId = '';
  if (clickNode.getClassName() === 'Group') {
    const children = [...clickNode.getChildren()];
    const craftIds = children
      .map((item) => {
        const childCraftId = item.getAttr('craftId') || '';
        return childCraftId.split(',').sort().join(',');
      })
      .filter((item) => item);
    const isHasCraft = craftIds.length === children.length && craftIds.every((item) => item === craftIds[0]);
    craftId = isHasCraft ? craftIds[0] : '';
  } else {
    craftId = clickNode.getAttr('craftId') || '';
  }
  selectCrafeId.value = craftId ? craftId.split(',') : [];
  selectOriginId = craftId;
  if (craftId) {
    visible.value = true;
  }
}
updateViewCraft();

function selectHandle(selectItem) {
  const currentSelectNode = PlaygroundStore.clickTargetNode?.[0];
  if (!currentSelectNode) return;
  let isDelete = selectCrafeId.value.includes(selectItem.id)
  let newIdArr = isDelete? selectCrafeId.value.filter((item) => item !== selectItem.id) :[...selectCrafeId.value, selectItem.id];
  selectCrafeId.value = newIdArr;
  const selectList = List.value.filter((item) => newIdArr.includes(item.id));
  const craftId = selectList.map((item) => item.id).join(',');
  const craftDesc = selectList.map((item) => item.name).join(',');
  message.destroy();
  message.success(isDelete? selectItem.name+'已取消' :'已添加工艺:'+craftDesc);
  if (currentSelectNode.getClassName() === 'Group') {
    PlaygroundStore.setCurrentNodeAttrs(
      {
        craftId,
        craftDesc,
      },
      true,
      [...currentSelectNode.getChildren()],
    );
  } else {
    PlaygroundStore.setClickNodeAttrs({
      craftId,
      craftDesc,
    });
  }
}

onBeforeUnmount(() => {
  // notifyFuncton();
});
const isActive = computed(() => (item) => {
  return selectCrafeId.value && selectCrafeId.value.includes(item.id);
});
</script>

<template>
  <div class="add-btn" @click="visibleChange">
    <Icon type="jia"></Icon>
    <span class="btn-name">添加工艺</span>
  </div>
  <div class="craft-wrap" v-if="visible">
    <div
      v-for="(item, i) in List"
      :key="item.id + i"
      class="craft-item"
      :class="{ active: isActive(item) }"
      @click="selectHandle(item)"
    >
      <div class="item-cont">
        {{ item.name }}
        <div class="select-active">
          <div class="active-icon">
            <Icon type="xuanzhong3" />
          </div>
          <div class="active-bg"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.add-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #666;
  height: 40px;
  background: #f7f7f7;
  width: 240px;
  border: 1px solid #f7f7f7;
  border-radius: 8px;
  position: relative;
  z-index: 100;
  margin-top: 10px;
  cursor:pointer;
  
  .btn-name {
    margin-left: 4px;
  }
}

.craft-wrap {
  width: 240px;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 0px 0px 8px 8px;
  border: 1px solid #ececec;
  padding: 20px 10px 10px 20px;
  box-sizing: border-box;
  transform: translateY(-8px);

  .craft-item {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    min-width: 58px;
    height: 32px;
    line-height: 32px;
    border-radius: 6px;
    overflow: hidden;
    padding: 0 5px;
    margin-right: 10px;
    text-align: center;
    overflow: hidden;
    background: #fff;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    color: #666666;
    border: 1px solid #e8e8e8;
    cursor: pointer;

    .select-active {
      opacity: 0;
    }

    &.active .select-active {
      opacity: 1;
    }

    &.active,
    &:hover {
      color: @primary-color;
      border: 1px solid @primary-color;
    }

    .active-icon {
      position: absolute;
      right: -2px;
      bottom: -2px;
      transform-origin: 100% 100%;
      transform: scale(0.5) translateY(15%) translateX(-20%);
      z-index: 100;

      :deep(.anticon) {
        font-size: 20px !important;
        color: #fff;
      }
    }

    .active-bg {
      transform-origin: 50% 50%;
      height: 30px;
      width: 30px;
      transform: rotate(45deg) translate(80%, 0);
      background-color: @primary-color-bg;
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
}
.add-btn {
  :deep(.anticon) {
    color: #3f3f3f;
    font-size: 12px;
  }
}
</style>
