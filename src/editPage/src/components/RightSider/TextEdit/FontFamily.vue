<template>
  <a-popover trigger="click" placement="bottom" overlayClassName="no-arrow no-padding font-list-popover">
    <template #content>
      <div class="font-list-wrap">
        <a-radio-group v-model:value="langeType" button-style="solid" class="tab-group-ridio">
          <a-radio-button :value="item.type" v-for="item in fontFamilyList">{{ item.typeName }}</a-radio-button>
        </a-radio-group>

        <div class="font-list" v-for="Family in fontFamilyList" :key="Family.type" v-show="Family.type === langeType">
          <div
            class="font-item"
            :class="{ active: fontFamily.id === selecetCn || fontFamily.id === selecetEn }"
            v-for="fontFamily in Family.list"
            :key="fontFamily.id"
            @click="onSelect(fontFamily)"
          >
            <img :src="fontFamily.imageOssPath" alt="" />
            <a-spin :indicator="indicator" v-if="fontFamily.loading" class="loadding-icon" />
          </div>
        </div>
      </div>
    </template>
    <div class="slecet-font">
      <span class="name" :style="{ 'font-family': fontFamily }">{{ fontFamily }}</span>
      <i class="arrow arrow-bottom"></i>
    </div>
  </a-popover>
</template>
<script setup>
import { message } from 'ant-design-vue';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { computed, ref, h, toRaw, onBeforeUnmount, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import fetchApi from '@/api/fetchApi';
import { GET_USER_HISTORY_DATA } from '@/api/API.config';
import { useMainStore } from '@/store';
import { usePlaygroundStore } from '@/store/module/usePlayground';
import loadFont from '@/utils/loadFont.js';
import { func } from 'vue-types';
const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px',
  },
  spin: true,
});
const {
  originData: { xmmFontDTOEnList, xmmFontDTOCnList },
  onSaveNear,
  setHistoryFontList,
  userId,
} = useMainStore();
const { historyFontList } = storeToRefs(useMainStore());
const PlaygroundStore = usePlaygroundStore();
let langeType = ref('cn');
let fontFamilyId = ref('');
let selecetCn = ref('');
let selecetEn = ref('');
// let fontFamily = computed(() => {
//   fontFamilyId.value = PlaygroundStore.clickNode?.[0]?.attrs?.fontFamilyId || ''
//   let arr = fontFamilyId.value.split(',')
//   selecetCn.value = Number((arr[0] ? arr[1] : arr[0])||0)
//   selecetEn.value = Number(arr[0] || '')
//   return PlaygroundStore.clickNode?.[0]?.attrs?.fontFamily || ''
// });
let fontFamily = ref('');
watch(
  () => PlaygroundStore.slecetTimestape,
  () => {
    update();
  },
);

onMounted(() => {
  update();
});

function update() {
  fontFamilyId.value = PlaygroundStore.clickNode?.[0]?.attrs?.fontFamilyId || '';
  let arr = fontFamilyId.value.split(',');
  selecetCn.value = Number((arr[0] ? arr[1] : arr[0]) || 0);
  selecetEn.value = Number(arr[0] || '');
  fontFamily.value = PlaygroundStore.clickNode?.[0]?.attrs?.fontFamily || '';
}

const fontFamilyList = [
  {
    type: 'cn',
    typeName: '中文',
    list: xmmFontDTOCnList,
  },
  {
    type: 'en',
    typeName: '英文',
    list: xmmFontDTOEnList,
  },
];

const onSelect = async (font) => {
  // 取消选中
  if (font.id === selecetCn.value || font.id === selecetEn.value) return;
  font.loading = true;
  let fontName = font.fontPath.replace('/fonts/', '').replace('.ttf', '');
  const fontPath = font.fontPath;
  fontName = fontName.replace(/\s+/g, '');
  try {
    await loadFont(fontName, fontPath);
    onSaveHistory(font);
    font.loading = false;
    FontChange({ id: font.id, name: fontName });
  } catch (e) {
    message.error(e.error || e.message);
    font.loading = false;
  }
};
function FontChange(font) {
  const otherTypeSelect = [];
  if (fontFamilyId.value) {
    // 显示字体
    const fontIds = fontFamilyId.value.split(',');
    const fontOtherList = String(langeType.value) === 'cn' ? xmmFontDTOEnList : xmmFontDTOCnList;
    fontIds.forEach((id) => {
      const font2 = fontOtherList.find((item) => String(item.id) === String(id));
      if (font2) {
        const name2 = font2.fontPath.replace('/fonts/', '').replace('.ttf', '');
        otherTypeSelect.push({
          name: name2,
          id,
        });
      }
    });
  }
  const arr =
    langeType.value === 'cn'
      ? [...otherTypeSelect, { name: font.name, id: font.id }]
      : [{ name: font.name, id: font.id }, ...otherTypeSelect];
  const name = arr.map((item) => item.name).join(',');
  const id = arr.map((item) => item.id).join(',');
  fontFamilyId.value = id;
  fontFamily.value = name;
  let arrIds = fontFamilyId.value.split(',');
  selecetCn.value = Number((arrIds[0] ? arrIds[1] : arrIds[0]) || 0);
  selecetEn.value = Number(arrIds[0] || '');
  PlaygroundStore.setClickNodeAttrs({ fontFamily: name, fontFamilyId: id });
}
// 获取最近使用字体
function getUsedList() {
  let beforeFontList = toRaw(historyFontList);
  if (!beforeFontList.length) {
    fetchApi
      .get(GET_USER_HISTORY_DATA, {
        useDataTypeEnum: 'FOUNT',
        userId: userId,
      })
      .then((res) => {
        let list = res.data.map((item) => ({ ...item.xmmFontDTO, _id: item.id }));
        setHistoryFontList(list);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
getUsedList();
function onSaveHistory(font) {
  let list = historyFontList.value.filter((item) => item.id !== font.id);
  list.unshift(font);
  setHistoryFontList(list);
}
onBeforeUnmount(() => {
  onSaveNear();
});
</script>
<style>
.font-list-popover .ant-popover-inner {
  max-width: 300px !important;
  width: 300px;
}
</style>
<style lang="less" scoped>
.tab-group-ridio {
  width: 100%;

  .ant-radio-button-wrapper {
    height: 46px;
    line-height: 46px;
    text-align: center;
    width: 50%;
    background: #f7f7f7;
    border: none;
    color: #000000;

    &.ant-radio-button-wrapper-checked {
      color: #000000 !important;
      background: #fff !important;
      font-weight: 800;

      &:hover {
        font-weight: 800;
      }
    }

    &.ant-radio-button-wrapper:focus-within {
      box-shadow: 0 0 0 0px #eee !important;
    }
  }

  .ant-radio-button-wrapper-checked:not(
      [class*=' ant-radio-button-wrapper-disabled']
    ).ant-radio-button-wrapper:first-child {
    border-right-color: #f7f7f7;
  }

  .ant-radio-button-wrapper:not(:first-child)::before {
    background-color: #fff;
  }

  .ant-radio-button-wrapper:first-child {
    border-radius: 8px 0px 0px 0px;
  }

  .ant-radio-button-wrapper:last-child {
    border-radius: 0px 8px 0px 0px;
  }
}

.font-list-wrap {
  display: flex;
  flex-direction: column;

  .tab-group-ridio {
    flex-shrink: 0;
  }

  .font-list {
    max-height: 50vh;
    overflow-y: auto;
    padding: 12px 0 0 0;

    .font-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 44px;
      padding-left: 32px;
      position: relative;
      cursor: pointer;
      &:hover {
        background: #f8f8f8;
      }

      img {
        height: 32px;
        max-width: calc(100% - 40px);
        object-fit: contain;
        display: block;
      }

      .loadding-icon {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
      }

      &.active {
        background: #f8f8f8;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          right: 15px;
          bottom: 15px;
          width: 10px;
          height: 20px;
          transform-origin: 50% 50%;
          transform: rotate(45deg);
          border-right: 2px solid @primary-color;
          border-bottom: 2px solid @primary-color;
          z-index: 100;
        }
      }
    }
  }
}

.slecet-font {
  display: flex;
  width: 240px;
  min-height: 40px;
  background: #f7f7f7;
  border-radius: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 24px;
  color: #a8a8a8;
  margin-bottom: 17px;
  cursor: pointer;
  .name {
    color: #000000;
    font-size: 18px;
    font-family: HelloFont-ID-DianHei-GEJ, HelloFont-ID-DianHei;
  }
}
</style>
