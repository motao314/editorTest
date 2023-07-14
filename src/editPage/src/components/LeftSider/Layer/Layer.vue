<template>
  <div class="layer-panel">
    <a-directory-tree
      v-if="sortableList && sortableList.length > 0"
      v-model:expandedKeys="expandedKeys"
      :multiple="true"
      :tree-data="sortableList"
      :selectedKeys="selectedKeys"
      @select="handleSelectNode"
    >
      <!-- <template #title="{ title, key }">
        <span style="color: #1890ff">11111{{ title }}</span>
      </template> -->
      <template #switcherIcon="{ switcherCls, expanded }">
        <Icon type="xiala" />
      </template>
      <template #icon="{ key, trueType, selected }">
        <template v-if="trueType === 'Group'">
          <Icon type="shoucang" />
        </template>
        <template v-else-if="trueType === 'Text'">
          <Icon type="wenzi" />
        </template>
        <template v-else-if="trueType === 'Image'">
          <Icon type="a-ziyuan59" />
        </template>
        <template v-else-if="trueType === 'SVG'">
          <Icon type="graphical" />
        </template>
        <template v-else>
          <!-- <frown-filled v-if="selected" /> -->
          <Icon type="a-ziyuan59" />
        </template>
      </template>
    </a-directory-tree>
    <Empty v-else :text="emptyText" :image-url="`/assets/empty/${brandName}/default_empty.png`"></Empty>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/common/Icon/Icon.vue';
import Empty from '@/components/Empty/Empty.vue';
import { onMounted, ref, computed, onUpdated } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlaygroundStore } from '@/store/module/usePlayground';
import { useMainStore } from '@/store/index';
import LayerTreeClass from './layerTree';
const MainStore = useMainStore();

const brandName = ref(MainStore.brand);

const LayerTree = new LayerTreeClass();
const expandedKeys = ref([]);
const selectedKeys = computed(() => {
  if (PlaygroundStore.selectedAllNode?.[0]?.attrs.id !== PlaygroundStore.clickTargetNode?.[0]?.attrs.id) {
    let id = [PlaygroundStore.selectedAllNode[0].attrs.id, PlaygroundStore.clickTargetNode[0].attrs.id];
    expandedKeys.value = id;
    return id;
  }
  return PlaygroundStore.selectedAllNode.map((node) => node.attrs.id);
});

const PlaygroundStore = usePlaygroundStore();
const { isMultiple, layoutId } = storeToRefs(PlaygroundStore);
const emptyText = ref('暂无图层...');
const sortableList = computed(() => {
  let arr = [...PlaygroundStore.currentLayerList] || [];
  arr = arr.reverse();
  LayerTree.reset();
  let treeDatas = LayerTree.createTree(arr);
  return treeDatas;
});
// 拿到图层数据-需要转换成树

const isSelect = computed(() => {
  return PlaygroundStore.selectedAllNode.some((item) => item.id() === props.data.attrs.id);
});
function handleSelectNode(ids, nodeData) {
  // 选中画布的图层
  PlaygroundStore.toggleSelected(ids[0], PlaygroundStore.isMultiple ? isSelect.value : false);
}
</script>

<style lang="less" scoped>
.layer-panel {
  padding: 30px 20px;
  height: 100%;

  :deep(.anticon) {
    font-size: 12px;
    color: #9b9b9b;
  }

  :deep(.ant-tree.ant-tree-directory) {
    .ant-tree-treenode-selected:hover::before,
    .ant-tree-treenode-selected::before {
      background-color: transparent;
      color: @primary-color;
    }

    .ant-tree-treenode .ant-tree-node-content-wrapper.ant-tree-node-selected {
      background-color: transparent;
      .anticon {
        color: @primary-color;
      }
      .ant-tree-title {
        color: @primary-color;
      }
    }
    .ant-tree-treenode {
      &.ant-tree-treenode-selected {
        .ant-tree-switcher {
          .anticon {
            color: @primary-color;
          }
        }
      }

      .ant-tree-node-content-wrapper-open,
      .ant-tree-node-content-wrapper-close {
        .ant-tree-title {
          color: #333333;
          font-weight: 500;
        }
      }
    }

    .ant-tree-title {
      width: 80%;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      // font-weight: 600;
      color: #666666;
    }

    .ant-tree-switcher {
      .anticon {
        -webkit-transition: transform 0.3s;
        transition: transform 0.3s;
      }
    }
    .ant-tree-switcher_close {
      .anticon {
        -webkit-transform: rotate(-90deg);
        transform: rotate(-90deg);
      }
    }
  }
  :deep(.ant-tree) {
    &.ant-tree-block-node .ant-tree-list-holder-inner .ant-tree-node-content-wrapper {
      width: 80%;
    }
  }
}
</style>
