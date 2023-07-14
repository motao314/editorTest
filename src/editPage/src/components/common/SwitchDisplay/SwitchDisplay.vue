<!--
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-03-22 23:28:08
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-03-26 10:39:27
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srccomponents/common/SwitchDisplay/SwitchDisplay.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="group-btns toggle-btns">
    <div class="btn" :class="{ active: loadedStore.showView === '2d' }" @click="loadedStore.setShowView('2d')">2D</div>
    <div class="btn" :class="{ active: loadedStore.showView === '3d' }" @click="loadedStore.setShowView('3d')">3D</div>
  </div>
</template>
<script setup>
import { useLoaded } from '@/store/module/loaded';
const loadedStore = useLoaded();
</script>
<style scoped lang="less">
.group-btns {
  display: flex;
  height: 32px;
  padding: 5px;
  background-color: #fff;
  border-radius: 8px;

  .btn {
    flex: 1;
    width: 50px;
    box-sizing: border-box;
    display: grid;
    place-content: center;
    text-align: center;
    color: #666666;
    border-radius: 8px;
    cursor: pointer;

    &:first-child {
      border-radius: 8px 0px 0px 8px;
    }

    &:last-child {
      border-radius: 0px 8px 8px 0px;
    }

    &.active {
      background: @primary-color-bg;
      color: #fff;
    }

    &.hover-light:hover {
      border-radius: 6px;
      background: @bg-hover;
      color: @primary-color;
    }
  }
}
#bottom-px() {
  bottom: 30px;
}

.toggle-btns {
  user-select: none;
  position: absolute;
  left: 36px;
  padding: 0;
  font-size: 14px;
  #bottom-px();
}
</style>
