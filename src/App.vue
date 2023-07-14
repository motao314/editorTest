<template>
  <div id="wrap">
    <nav id="nav">
        <button 
          v-for="(item,index) in data" 
          :class='{"active":index===activeIndex}'
          @click="setIndex(index)"
        >{{item.name}}</button>
    </nav>
    <div id="content">
        <iframe class="subWin" :src='`edit.html${nowUrl}`'></iframe>
    </div>
  </div>
</template>
<script setup>
import {computed, ref} from "vue";
const data = [
  {
    name:"抽屉盒-一层",
    templateId:"1679384693300281345"
  },{
    name:"书型盒-对开翻盖盒",
    templateId:"1674062477436166145"
  },{
    name:"提手箱-双保险扣",
    templateId:"1666350361006645249"
  },{
    name:"异形盒-圆柱形对开双层",
    templateId:"1674613800879562754"
  },{
    name:"腰封-常规",
    templateId:"1610506248726556673"
  },{
    name:"书型盒-四片式带内衬（面纸定制）",
    templateId:"1678701999780306946"
  },{
    name:"书型盒-四片式带内衬（面纸定制）2",
    templateId:"1678963560172240897"
  },{
    name:"腰封-常规",
    templateId:"1643132449362075649"
  },{
    name:"书型盒-四片式带内衬（面纸定制）",
    templateId:"1678697528778072065"
  }
];
const activeIndex = ref(0);
const setIndex = (index)=>{
  activeIndex.value = index;
};
const nowUrl = computed(()=>{
  const activeItem = data[activeIndex.value];
  return `?enterType=PC_DESIGNER&templateId=${activeItem.templateId}&userId=63488838078465&designId=${activeItem.designid}`;
})
</script>
<style scoped>
#wrap {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}
#nav {
  width: 100%;
  height: 30px;
  border-bottom: 1px solid #000;
}
#nav button {
  box-sizing: border-box;
  border: 1px solid #fff;
  height: 30px;
  background-color: #000;
  color: #fff;
}
#nav .active {
  background-color: #f60;
}
#content {
  display: flex;
  flex: 1;
}
.subWin {
  flex: 1;
  border: none;
} 
</style>
