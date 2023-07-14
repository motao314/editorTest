<!--
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-03-23 14:55:16
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-11 20:07:20
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/LeftSider/FastKey/FastKey.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <a-popover placement="rightBottom" overlayClassName="no-arrow no-padding fast-key-popover" trigger="click">
    <template #content>
      <div class="type-list">
        <div class="type-item" v-for="item in Types" :key="item.id">
          <span>{{ item.name }}</span
          ><span>{{ item.value }}</span>
        </div>
      </div>
    </template>
    <div class="fast-key">
      <Icon type="kuaijiejian" />
    </div>
  </a-popover>
</template>

<script setup>
import Icon from '@/components/common/Icon/Icon.vue';

import { ISMAC } from '@/utils/common';

let ctrlAuto = ISMAC() ? '⌘' : 'Ctrl';
const Types = [
  {
    id: 1,
    name: '隐藏/显示 两侧边栏',
    value: `${ctrlAuto}+/`,
  },
  {
    id: 2,
    name: '撤销',
    value: `${ctrlAuto}+Z`,
  },
  {
    id: 3,
    name: '恢复',
    value: `${ctrlAuto}+Shift+Z`,
  },
  {
    id: 4,
    name: '全选',
    value: `${ctrlAuto}+A`,
  },
  {
    id: 5,
    name: '复制',
    value: ` ${ctrlAuto}+C`,
  },
  {
    id: 6,
    name: '粘贴',
    value: ` ${ctrlAuto}+V`,
  },
  {
    id: 7,
    name: '剪切',
    value: ` ${ctrlAuto}+X`,
  },
  {
    id: 8,
    name: '保存 ',
    value: `${ctrlAuto}+S`,
  },
  {
    id: 9,
    name: '锁定/取消锁定',
    value: ` ${ctrlAuto}+L`,
  },
  {
    id: 10,
    name: '移动画布',
    value: '空格+鼠标拖拽',
  },
  {
    id: 11,
    name: '横向滚动画布',
    value: ' Shift+滚轮',
  },
  {
    id: 12,
    name: '多选',
    value: 'Shift+鼠标单击',
  },
  {
    id: 13,
    name: '取消选择',
    value: 'Esc',
  },
  {
    id: 14,
    name: '删除选中元素',
    value: 'Delete',
  },
  {
    id: 15,
    name: '移动元素',
    value: '←↑↓→',
  },
];
</script>

<style lang="less" scoped>
.fast-key {
  position: absolute;
  width: 70px;
  height: 60px;
  display: grid;
  place-items: center;
  bottom: 0;
  user-select: none;
  background-color: rgb(244, 244, 244);

  cursor: pointer;
}

.type-list {
  padding: 20px 0;
  width: 230px;
  box-sizing: border-box;
}

.type-item {
  user-select: none;
  height: 32px;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  color: #333333;
  background: #fff;
  padding: 0 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;

  span:first-child {
    color: #333333;
  }

  span:last-child {
    color: #bbb;
  }
  &:hover {
    background: #f8f8f8;
  }
}
.fast-key-popover :deep(.ant-popover-inner) {
  max-width: 230px;
}
</style>
