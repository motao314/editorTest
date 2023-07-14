import { defineStore } from 'pinia';
import { formatLoading } from '@/utils/formatLayersData';
import { useCharlet } from './useCharlet';
import loadFont from '@/utils/loadFont';
import { calc3DTextures } from '../../components/Playground3D/Playground3D';
// 对全局的 loading 状态进行管理
export const useLoaded = defineStore('loaded', {
  state: () => {
    return {
      isShare: false,
      showView: '2d', // 当前要展示的是3d还是2d
      view3d: {}, // 3d相关要loading的素材
      view2d: {}, // 2d相关要loading的素材
      originData: {}, // 原始数据
      loaded2dData: null, //2d加载完成回调
      boxLoading: false, //3d模型是否loading完毕
      chartlet: false, // 3d贴图完毕
      progress3d: {
        progress: 0, //3d相关的贴图是否加载完毕
        len: 0, // 3d的贴图数量
      },
    };
  },
  getters: {
    progress() {
      if (this.showView === '2d') {
        return this.view2d.progress / this.view2d.len;
      }
      if (this.showView === '3d') {
        if (this.boxLoading && this.chartlet && this.progress3d.len === this.progress3d.progress) {
          return 1;
        }
        let boxNub = this.boxLoading ? 0.3 : 0;
        let len = (this.progress3d.progress / this.progress3d.len) * 0.5;
        return boxNub + len;
      }
      return false;
    },
    loaded2d() {
      return this.view2d.progress >= this.view2d.len;
    },
    loaded() {
      if (this.showView === '2d') {
        return this.loaded2d;
      }
      if (this.showView === '3d') {
        // 需要重新处理
        return this.boxLoading && this.chartlet;
      }
      return true;
    },
  },
  actions: {
    initData(data, fonts) {
      // 根据当前数据结构，筛选出，需要loading的数据
      // 准备要loading的素材
      this.fonts = fonts;
      const { canvasMap, layouts, boxs } = data;
      const view2d = {};
      const view3d = {};
      view2d.progress = 0;
      view2d.data = []; //需要loading的资源
      let len2d = 0; // 2d需要加载的图片长图(包含刀版图+背景图+刀版材质图+子元素图片)
      Object.keys(canvasMap).forEach((k) => {
        const layout = layouts.filter((item) => item.id === k)[0];
        const layoutDetail = canvasMap[k];
        const { imgData, fonts } = formatLoading(layout, layoutDetail);
        const { playgroundImg, nodePreviewMap, ...img2dData } = imgData;
        let len = 1; // 刀版图
        // 背景图
        if (img2dData.background) {
          len++;
        }
        // 刀版材质图
        if (img2dData.backgroundTexture) {
          len++;
        }
        // 子元素
        len += img2dData.children.length;
        view2d.data.push({
          id: k, // id
          imgData: img2dData, // 需要预加载的图片
          fonts, // 需要加载的字体
        });
        len2d += len;
        view3d[k] = {
          playgroundImg,
          nodePreviewMap,
        };
      });
      view2d.len = len2d;
      view2d.imgs = {}; // 用于存储生成后的图片
      this.view2d = view2d;
      this.view3d = view3d;

      this.loading2dData();
      this.loading3dData();
      this.showView = '2d';
    },
    setLoadedCallback(cb) {
      this.loaded2dData = cb;
    },
    getFontUrl(id) {
      const fontData = this.fonts.find((item) => {
        return id == item.id;
      });
      return fontData;
    },
    // loading 相应字体
    loadingFonts(fonts) {
      if (fonts && fonts.length < 1) {
        return;
      }
      fonts = fonts.flat(Infinity);
      fonts.forEach((item) => {
        let ids = item.id?.split(',');
        ids = ids ? ids : ['714506'];
        ids.forEach((id) => {
          const fontData = this.getFontUrl(id);
          if (!fontData) {
            return;
          }
          loadFont(fontData.fontPath.replace('/fonts/', ''), fontData.fontPath).then((res) => {
            if (useCharlet().stage) {
              useCharlet().stage.batchDraw();
            }
          });
        });
      });
    },
    // 设置当前的展示模式2d还是3d
    setShowView(showView) {
      if (this.showView === '2d' && showView === '3d') {
        if (!this.isShare) {
          this.progress3d.progress = 0;
          this.chartlet = false;
          useCharlet()
            .get3dCharlet()
            .then((res) => {
              this.progress3d.progress = this.progress3d.len;
              calc3DTextures().then((res) => {
                setTimeout(() => {
                  this.chartlet = true;
                }, 100);
              });
            });
        } // else {
        //     this.progress3d.progress = 0;
        //     calc3DTextures().then(res=>{
        //         this.progress3d.progress = this.progress3d.len;
        //         setTimeout(()=>{
        //             this.chartlet = true;
        //         },100);
        //     });
        // }
      }
      this.showView = showView;
    },
    // loading 图片，url 图片地址
    loadingImg(url) {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      return new Promise((resolve) => {
        img.onload = () => {
          resolve(img);
        };
        img.src = url;
      });
    },
    /*
            加载刀版图对应数据
            id 刀版图id
            isFirst 是否是第一个加载的刀版图
        */
    loading2dData() {
      this.view2d.data.forEach((item) => {
        // console.log(item);
        this.loading2dLayout(item);
      });
    },
    set2dProgress() {
      let progress = this.view2d.progress + 1;
      if (progress === this.view2d.len && this.loaded2dData) {
        this.loaded2dData(this.view2d.data);
      }
      this.view2d.progress = progress;
    },
    loading2dLayout(data) {
      const { imgData } = data;
      const { layout, background, children, backgroundTexture } = imgData;
      // loading 刀版图
      this.loadingImg(layout).then((res) => {
        this.set2dProgress();
        imgData.layout = res;
      });
      // 背景图
      if (background) {
        this.loadingImg(background).then((res) => {
          this.set2dProgress();
          imgData.background = res;
        });
      }
      // 刀版 材质图
      if (backgroundTexture) {
        this.loadingImg(backgroundTexture).then((res) => {
          this.set2dProgress();
          imgData.backgroundTexture = res;
          // console.log(this.view2d[id].imgData.backgroundTexture, '图片加载完成');
        });
      }
      // 子元素
      children.forEach((item, index) => {
        this.loadingImg(item.url).then((res) => {
          this.set2dProgress();
          imgData.children[index].img = res;
        });
      });
      // loading相关字体
      this.loadingFonts(data.fonts);
    },
    // 3d 模型loading 完成
    setloading3d() {
      this.boxLoading = true;
    },
    loading3dData() {
      useCharlet().initCharlet(this.view3d);
      let imgs = [];
      for (let id in this.view3d) {
        imgs.push(this.view3d[id].playgroundImg);
        imgs.push(this.view3d[id].nodePreviewMap);
      }
      imgs = imgs.flat(Infinity);
      this.progress3d = {
        progress: 0,
        len: imgs.length,
      };
      imgs.forEach((item) => {
        let img = new Image();
        img.onload = () => {
          this.progress3d.progress++;
          // if(this.progress3d.progress === this.progress3d.len){
          //     console.log("加载完成",this.progress3d.progress,this.progress3d.len);
          // }
        };
        img.src = item;
      });
    },
  },
});
