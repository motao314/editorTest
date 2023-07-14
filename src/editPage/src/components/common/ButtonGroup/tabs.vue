<!--
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-13 00:26:11
 * @LastEditors: Ammy ammy0620@aliyun.com
 * @LastEditTime: 2023-03-09 17:37:30
 * @FilePath: \XXEditor\src\components\Menu\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="ammy-menu" ref="Ele" :class="{ 'is-border': isBorder }">
    <ul class="ammy-menu-list" :class="{ 'is-bespread': isBespread, 'is-border': isBorder }">
      <li
        v-for="(item, index) in list"
        class="ammy-menu-item"
        :key="item[valueKey]"
        v-tap="
          () => {
            changeHandler(item, index);
          }
        "
        :style="{ width: itemWidth + 'px', opacity: itemWidth ? 1 : 0 }"
      >
        <Icon
          v-if="item[iconKey]"
          :color="active === item[valueKey] || item.active ? activeColor : defaultColor"
          :type="item[iconKey]"
        />
        <img
          v-else-if="item[imgKey]"
          :src="active === item[valueKey] || item.active ? item[activeImgKey] : item[imgKey]"
          alt=""
          class="icon-img"
          :style="{ ...(item.style || {}) }"
        />
        <div
          class="ammy-menu-name"
          :style="{ color: active === item[valueKey] || item.active ? activeColor : defaultTextColor }"
        >
          {{ item[labelKey] }}
        </div>
      </li>

      <!--选择标记-->
      <template v-if="isBorder">
        <div class="pointer-wrap" :style="{ left: translateX + 'px' }">
          <div class="ammy-scroll-pointer"></div>
        </div>
        <div class="ammy-scroll-line"></div>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useMainStore } from '@/store';
import { themeMap } from '@/assets/less/theme';
let MainStore = useMainStore();

const emit = defineEmits(['change', 'update']);
const props = defineProps({
  isBorder: {
    type: Boolean,
    default: false,
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
  defaultColor: {
    type: String,
    default: '#666666',
  },
  defaultTextColor: {
    type: String,
    default: '#666666',
  },
  activeColor: {
    type: String,
    default: themeMap[MainStore.brand].primary_color,
  },
});
watch(
  () => props.maxCount,
  (value) => {
    value && getItemWidth();
  },
);

const itemWidth = ref(null);
const Ele = ref(null);
function getItemWidth() {
  const allWidth = Ele.value ? Ele.value.clientWidth : 375;
  const showCount = props.list.length >= props.maxCount ? props.maxCount : props.list.length;
  itemWidth.value = allWidth / showCount > 80 && props.list.length > props.maxCount ? 80 : allWidth / showCount;
}
const translateX = computed(() => {
  const index = props.list.findIndex((item) => item[props.valueKey] === props.active);
  return (index >= 0 ? itemWidth.value * index : 0) + itemWidth.value / 2;
});
window.addEventListener('resize', function () {
  getItemWidth();
});
// 全局初始化
onMounted(async () => {
  setTimeout(() => {
    getItemWidth();
    const scroll = new BScroll(Ele.value, {
      probeType: 3,
      scrollX: true,
      scrollY: false,
      click: true,
      mouseWheel: true,
      eventPassthrough: 'vertical',
      bounce: false,
      swipeTime: 500,
    });
    scroll.on('beforeScrollStart', () => {
      // console.log("需要重置")
      scroll.refresh();
    });
  }, 200);
});
function changeHandler(item, index) {
  emit('update', item[props.valueKey]);
  emit('change', item);
}
</script>

<style lang="less" scoped>
.pointer-wrap {
  position: absolute;
  bottom: px2vw(-7);
  left: 0;
  transform: translateX(-50%);
  transition: all 0.5s;
  z-index: 800;
}
.ammy-scroll-pointer {
  width: px2vw(12);
  height: px2vw(12);
  transform: rotate(45deg);
  background-color: #fff;
  border-left: px2vw(1) solid #ececec;
  border-top: px2vw(1) solid #ececec;
  z-index: 100;
  position: relative;
}
.ammy-scroll-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-bottom: 1px solid #ececec;
  z-index: 10;
}
.ammy-menu {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  font-size: 0;
  .ammy-menu-list {
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    position: relative;
    text-align: center;
    box-sizing: border-box;
    font-size: 0;
    margin: 0 auto;
    padding-top: px2vw(10);
    &.is-border {
      padding-bottom: px2vw(8);
    }
  }

  .ammy-menu-item {
    overflow: hidden;
    display: inline-block;
    padding: px2vw(10) px2vw(10);
    box-sizing: border-box;
    align-items: center;
    font-size: 0;
  }
  .iconfont {
    font-size: px2vw(20) !important;
    line-height: px2vw(20) !important;
  }
  .icon-img {
    width: px2vw(20);
    height: px2vw(20);
  }
  .ammy-menu-name {
    height: px2vw(14);
    line-height: px2vw(14);
    font-size: px2vw(10);
    font-family: PingFangSC-Regular, PingFang SC;
    color: #666666;
    margin-top: px2vw(5);
    white-space: nowrap;
    // font-weight: 300;
  }
}
</style>
