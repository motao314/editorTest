<template>
  <a-popover
    placement="rightTop"
    v-model:visible="mousePopoverVisibled"
    @visibleChange="handleVisibleChange"
    overlayClassName="no-arrow no-padding mouse-tool-popover mouse-popover"
    trigger="click"
  >
    <template #content>
      <div class="type-list">
        <div
          class="type-item"
          v-for="item in Types"
          :key="item.id"
          :class="item.disabled ? 'type-item-disabled' : ''"
          @click="handleClick(item)"
        >
          <span>{{ item.name }}</span>
          <span>{{ item.value }}</span>
        </div>
      </div>
    </template>
    <div class="mouse-tool" :style="mousePopoverStyle"></div>
  </a-popover>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import Icon from '@/components/common/Icon/Icon.vue';
import { usePlaygroundStore } from '@/store/module/usePlayground.js';
import { storeToRefs } from 'pinia';
import { ISMAC } from '@/utils/common';
const PlaygroundStore = usePlaygroundStore();

const emits = defineEmits(['update:visibled', 'cancelTpl']);
const { isMultiple } = storeToRefs(PlaygroundStore);
// let props = defineProps()
let mousePopoverVisibled = computed(() => {
  return PlaygroundStore.mouseMenuInfos.visibled;
});
let mousePopoverStyle = computed(() => {
  return {
    left: PlaygroundStore.mouseMenuInfos.position.x + 'px',
    top: PlaygroundStore.mouseMenuInfos.position.y + 'px',
  };
});
let currentSelectedNode = computed(() => {
  return PlaygroundStore.currentSelectedNode || [];
});

let copyNodes = null;
// let isElement = computed(() => {
//     return PlaygroundStore.mouseMenuInfos.isElement
// })

// let curSelectNodes = computed(() => {
//     let arr = PlaygroundStore.selectedAllNode
//     return arr && arr[0]
// })

const Types = computed(() => {
  let isElement = PlaygroundStore.mouseMenuInfos.isElement;
  let ctrlAuto = ISMAC() ? '⌘' : 'Ctrl';
  let copyOJ = {
    id: 5,
    name: '复制',
    value: ` ${ctrlAuto}+C`,
    disabled: false,
  };
  let paseOJ = {
    id: 6,
    name: '粘贴',
    value: ` ${ctrlAuto}+V`,
    disabled: false,
  };
  let cutOj = {
    id: 7,
    name: '剪切',
    value: ` ${ctrlAuto}+X`,
    disabled: false,
  };
  let lockOj = {
    id: 8,
    name: '锁定',
    value: ` ${ctrlAuto}+L`,
    disabled: false,
  };
  let moveTopOj = {
    id: 9,
    name: '移到顶层',
    value: '',
    disabled: false,
  };
  let moveUpOj = {
    id: 10,
    name: '上移一层',
    value: '',
    disabled: false,
  };
  let moveDownOj = {
    id: 11,
    name: '下移一层',
    value: '',
    disabled: false,
  };
  let moveBottomOj = {
    id: 12,
    name: '移到底层',
    value: '',
    disabled: false,
  };
  let arr;

  if (isElement) {
    // 如果不是节点的话
    paseOJ.disabled = copyNodes && !!copyNodes.value;

    // let curNode = currentSelectedNode && currentSelectedNode[0]
    // console.log('锁定----',PlaygroundStore.currentSelectedNodeIsLock)

    if (PlaygroundStore.currentSelectedNodeIsLock) {
      lockOj.name = '取消锁定';
    }
    // // 如果是多选的话不能设置锁定/取消锁定切换
    // if(PlaygroundStore.isMultiple) {
    //     lockOj.disabled = true
    // }

    arr = [copyOJ, paseOJ, cutOj, lockOj, moveTopOj, moveUpOj, moveDownOj, moveBottomOj];
  } else {
    arr = [paseOJ];
  }
  return arr;
});

function handleVisibleChange(v) {
  console.log('handleVisibleChange---', v);
  if (!v) {
    PlaygroundStore.setMouseMenuInfos({
      visibled: v,
    });

    // nextTick(() => {
    //         // 分开设置-避免出现闪频
    //     PlaygroundStore.setMouseMenuInfos({
    //         position: {
    //             x:0,
    //             y: 0
    //         }
    //     })
    // })
  }
}

/**
 * 点击操作
 */
function handleClick(item) {
  let disabled = item.disabled;

  if (disabled) {
    return false;
  }
  let playground = PlaygroundStore.currentUIPlayground;
  let id = item.id;
  switch (id) {
    case 5: //复制
     playground.cloneSelectedNode();
      break;
    case 6: // 粘贴
      playground.stickCopyNodeToLayer();
      break;
    case 7: // 剪切
       playground.cutSelectedNode();
      break;
    case 8: // 锁定/取消锁定
      playground.changeSelectedNodeLock(!PlaygroundStore.currentSelectedNodeIsLock);
      break;
    case 9: //移到顶层
      PlaygroundStore.setZIndex('top');
      break;
    case 10: // 上移一层
      PlaygroundStore.setZIndex('up');
      break;
    case 11: // 下移一层
      PlaygroundStore.setZIndex('down');
      break;
    case 12: // 移到底层
      PlaygroundStore.setZIndex('bottom');
      break;
  }

  handleVisibleChange(false);
}
</script>

<style lang="less" scoped>
.mouse-tool {
  position: absolute;
  width: 1px;
  height: 1px;
  display: grid;
  place-items: center;
  left: 100px;
  bottom: 20px;
  user-select: none;
  cursor: pointer;
  z-index: 888;
  // display: none;
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

  &-disabled {
    color: #bfbfbf;
    cursor: not-allowed;

    & > span:first-child {
      color: #bfbfbf;
    }
  }
}
.mouse-tool-popover :deep(.ant-popover-inner) {
  max-width: 230px;
}
</style>

<style lang="less">
.ant-popover.mouse-popover {
  padding: 0 !important;
}
</style>
