<template>
  <div class="imgbox-infos">
    <div class="imgbox-infos-name">
      {{ item.name }}
    </div>
    <div class="imgbox-infos-del" @click="handleDelete">
      <span class="imgbox-infos-del-btn">
        <Icon type="shanchu" />
        删除
      </span>
    </div>
  </div>
</template>
<script setup>
import { DeleteOutlined } from '@ant-design/icons-vue';
import Icon from '@/components/common/Icon/Icon.vue';
let props = defineProps({
  item: {
    default: {},
    type: Object,
  },
});
let emits = defineEmits(['del']);

const handleDelete = () => {
  emits('del');
};
</script>
<style scoped lang="less">
.imgbox-infos {
  width: 100%;
  // padding: 16px 18px 0;
  background-color: #ffffff;
  // box-shadow: 0px 0px 4px 0px rgba(187,187,187,0.5);
  // border-radius: 8px;

  .imgbox-infos-name {
    font-size: 14px;
    color: @text-color;
    line-height: 20px;
  }
  .imgbox-infos-del {
    margin-top: 16px;
    padding-top: 10px;
    border-top: 1px dashed #d8d8d8;
    height: 18px;
    line-height: 18px;
    font-size: 12px;
    color: #666666;
    cursor: pointer;
    box-sizing: content-box;

    &-btn {
      padding: 0;

      &:hover {
        color: @primary-color;

        :deep(.anticon) {
          color: @primary-color;
        }
      }

      & > div {
        vertical-align: middle;
        display: inline-block;
      }

      :deep(.anticon) {
        font-size: 18px;
      }
    }
  }
}
</style>
