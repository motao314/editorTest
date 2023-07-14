<template>
    <div class="editor-home">
      <div class="container">
        <LeftSider></LeftSider>
        <div id="page-wrap">
          <Empty
            v-if="!templateId"
            style="background: #f7f8fa; z-index: 10000"
            class="page"
            :imageUrl="imageUrl"
            text="请先在左侧选择一个模板/盒型，开始设计～"
          ></Empty>
          <div :class="['page', { showZIndex: loaded && showView === '2d' }]">
            <Playground2D>
              <SwitchDisplay></SwitchDisplay>
            </Playground2D>
          </div>
          <div v-if="isCanRender" :class="['page', { showZIndex: loaded && showView === '3d' }]">
            <Playground3D>
              <SwitchDisplay></SwitchDisplay>
            </Playground3D>
          </div>
          <div :class="['page', { showZIndex: !loaded }]">
            <Loading></Loading>
          </div>
          <div class="page" id="saveLoading" v-if="saveLoading">
            <SaveLoading></SaveLoading>
          </div>
        </div>
        <RightSider v-if="templateId"></RightSider>
      </div>
      <RightMouseTool></RightMouseTool>
    </div>
  </template>
  
  <script setup>
  import SwitchDisplay from './components/common/SwitchDisplay/SwitchDisplay.vue';
  import LeftSider from './components/LeftSider/LeftSider.vue';
  import Playground2D from './components/Playground2D/Playground2D.vue';
  import Playground3D from './components/Playground3D/Playground3D.vue';
  import RightSider from './components/RightSider/RightSider.vue';
  import Empty from './components/Empty/Empty.vue';
  import Loading from './components/Loading/Loading.vue';
  import SaveLoading from './components/common/SaveLoading/SaveLoading.vue';
  import { useMainStore } from '@/store';
  import { storeToRefs } from 'pinia';
  import { useLoaded } from '@/store/module/loaded';
  import RightMouseTool from './components/common/RightMouseTool/RightMouseTool.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { watch, onMounted, ref } from 'vue';
  
  const loadedStore = useLoaded();
  loadedStore.isShare = false;
  const MainStore = useMainStore();
  const { showView, loaded } = storeToRefs(loadedStore);
  const { isCanRender, templateId, saveLoading } = storeToRefs(MainStore);
  const route = useRoute();
  const router = useRouter();
  MainStore.setUrlParams(route.query);
  console.log('EditorHome.vue MainStore.initBaseList');
  MainStore.initBaseList();
  watch(()=>[showView,loaded],()=>{
    console.log(showView,loaded);
  });
  const myEventHandler = (event) => {
    if (event.data === 'executeFunction') {
      MainStore.onCompleteSave('nextBtn'); 
    }
  }
  window.removeEventListener('message', myEventHandler);
  window.addEventListener('message', myEventHandler);
  
  // 核心是保存的时候,更新 designId
  watch(
    () => [MainStore.templateId, MainStore.designId, MainStore.enterType],
    ([templateId, designId, enterType], [oldTemplateId, oldDesignId, oldEnterType]) => {
      if (window.isAutoChange || oldTemplateId !== templateId) {
        router.replace({
          name: 'EditorHome',
          query: {
            ...route.query,
            templateId: templateId,
            designId: designId,
            enterType: enterType,
          },
        });
      }
    },
  );
  
  const imageUrl = ref('');
  onMounted(() => {
    imageUrl.value = `/assets/empty/${MainStore.brand}/box_empty.png`;
  });
  </script>
  <style lang="less">
  @import url('./less/edito-global.less');
  @import url('./assets/font/font.css');
  </style>
  <style scoped lang="less">
  .container {
    display: flex;
    height: 100%;
    position: relative;
    z-index: 100;
    // overflow: hidden;
  }
  
  #page-wrap {
    position: relative;
    flex: 1;
  
    .page {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      display: flex;
  
      &.showZIndex {
        z-index: 1000;
      }
    }
  
    #saveLoading {
      z-index: 2000;
    }
  }
  </style>
  