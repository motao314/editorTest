<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-13 00:26:11
 * @LastEditors: Ammy ammy0620@aliyun.com
 * @LastEditTime: 2023-03-10 21:54:11
 * @FilePath: \XXEditor\src\components\Menu\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="group-btns opreate-btns" :class="['group-' + type, 'group-btns-' + column]">
    <div class="btn" v-for="item in list" :key="item[valueKey]" @click="changeHandler(item)" :style="itemStyle">
      <a-popover
        trigger="click"
        placement="bottom"
        overlayClassName="no-arrow no-padding"
        :visible="item.slotName ? item.clicked : false"
      >
        <template #content v-if="item.slotName">
          <slot :name="item.slotName"></slot>
        </template>

        <div
          class="hover-light"
          :class="{ active: item[valueKey] === active || item[valueKey] === active2 || item.selected }"
        >
          <a-tooltip placement="topLeft" v-if="item.text">
            <template #title>
              <div class="btn-text">{{ item.text }}</div>
            </template>
            <Icon :type="item[iconKey]"></Icon>
          </a-tooltip>
          <Icon :type="item[iconKey]" v-else></Icon>
          <div class="label" v-if="item[labelKey]">{{ item[labelKey] }}</div>
        </div>
      </a-popover>
    </div>
  </div>
</template>

<script setup>
import { computed } from '@vue/reactivity';
import Icon from '../Icon/Icon.vue';

const emit = defineEmits(['change', 'update']);
const props = defineProps({
  column: {
    type: Number,
    default: 3,
  },
  type: {
    type: String,
    default: 'group', // group 横排，list 竖排
  },
  // 列表
  list: {
    require: true,
    type: Array,
  },
  // 初始值
  active: {
    type: String,
  },
  active2: {
    type: String,
  },
  valueKey: {
    type: String,
    default: 'type',
  },
  labelKey: {
    default: 'name',
    type: String,
  },
  imgKey: {
    default: 'iconImg',
    type: String,
  },
  // 激活态的图片
  activeImgKey: {
    default: 'activeIconImg',
    type: String,
  },
  iconKey: {
    default: 'icon',
    type: String,
  },
});

const itemStyle = computed(() => {
  return { width: 100 / props.column + '%' };
});

function changeHandler(item, index) {
  emit('update', item[props.valueKey]);
  emit('change', item);
}
</script>

<style lang="less" scoped>
.group-btns {
  width: 100%;
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  flex-wrap: wrap;
  font-size: 12px;

  .btn {
    box-sizing: border-box;
    border-radius: 8px;
    cursor: pointer;
    width: calc(100% - 15px);
    .hover-light {
      display: flex;
      border-radius: 6px;

      display: flex;
      align-items: center;
      color: #666666;
      font-size: 12px;

      :deep(.anticon) {
        color: #8e8e8e;
        font-size: 18px;
      }

      &:hover {
        background: #f7f7f7;
      }

      &.active {
        background: @bg-hover;
        color: @primary-color !important;

        :deep(.anticon) {
          color: @primary-color !important;
        }
      }
    }

    .label {
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      line-height: 17px;
      margin-left: 5px;
      white-space: nowrap;
      letter-spacing: 1px;
    }
  }
}

.group-btns.group-group {
  border: 1px solid #ececec;
  padding: 5px;

  .btn {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      width: 1px;
      height: 20px;
      background-color: #dfdfdf;
    }

    &:last-child {
      &::after {
        content: none;
      }
    }
  }

  .hover-light {
    justify-content: center;
    text-align: center;
    padding: 6px;
    margin: 0 6px !important;
    width: auto !important;
  }
}

.group-btns.group-list {
  padding: 8px 2px 8px 2px;
  // box-shadow: 0px 0px 4px 0px rgba(187, 187, 187, 0.5);
  .btn {
    .hover-light {
      margin-right: 8px;
      margin-left: 8px;
      border-radius: 8px;
      &:hover {
        background: @bg-hover;
        color: @primary-color !important;

        :deep(.anticon) {
          color: @primary-color !important;
        }
      }
    }
  }
  .hover-light {
    margin-bottom: 2px;
    padding: 6px 10px;
    margin: 4px 0;
  }
  &.group-btns-2 {
  }
  &.group-btns-3 {
  }
}
</style>
