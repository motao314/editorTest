/*
 * @Author: Ammy ammy0620@aliyun.com
 * @Date: 2022-09-08 22:02:37
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-07-03 12:36:50
 * @FilePath: \XXEditor\src\store\index.js
 * @Description: 此文件放：页面展示、页面请求公用数据、初始化数据
 */
import { defineStore } from 'pinia';
import fetchApi from '@/api/fetchApi';
import {
  HOT_COLORS,
  DESIGN_EDITOR_INITIALIZE,
  BOX_INFO_BY_TEMPLATEID,
  SAVE_USER_HISTORY_DATA,
  GET_USER_HISTORY_DATA,
  SAVE_DESIGN,
  BOX_CATEGORY,
  FIND_LABEL_TYPE,
  GET_USER_INFOS,
  GET_BLANK_TEMPLATE_ID,
  GET_STR_DECODE,
  GET_BOX_ASSOCIATION_LIST,
} from '@/api/API.config';
import { DISPLAY_MODE, SOURCE_SERVER } from '@/utils/constant';
import { formatDataToFE, formatLayerNode, setImageInto } from '@/utils/formatLayersData';
import { useColorStore } from './module/useColors';
import { usePlaygroundStore } from './module/usePlayground';
import { useLoaded } from './module/loaded';
import { useCharlet } from './module/useCharlet';
import { message } from 'ant-design-vue';
import FileUploadFn from './module/fileUpload';
import { API_WX_MATERIALUSERDESIGN } from '@/api/API2.config';
import { Modal } from 'ant-design-vue';
import { h } from 'vue';
import { useRouter } from 'vue-router';
import { createPinia } from 'pinia';

const store = createPinia();

export default store;


let router = useRouter();

import { calc3DTextures, capture3DThumbnail, resize } from '../components/Playground3D/Playground3D';
const FileUpload = new FileUploadFn();
import { dataURLtoFile } from '@/utils/upload';
import { v4 as uuidv4 } from 'uuid';
function changeURLArg(url, obj) {
  Object.keys(obj).forEach((arg) => {
    const pattern = arg + '=([^&]*)';
    let arg_val = obj[arg];
    const replaceText = arg + '=' + arg_val;
    if (url.match(pattern)) {
      let tmp = '/(' + arg + '=)([^&]*)/gi';
      tmp = url.replace(eval(tmp), replaceText);
    } else {
      if (url.match('[?]')) {
        url = url + '&' + replaceText;
      } else {
        url = url + '?' + replaceText;
      }
    }
  });
  return url;
}
/*
 * 传入2个参数，定义仓库并导出
 * 第一个参数唯一不可重复，字符串类型，作为仓库ID以区分仓库
 * 第二个参数，以对象形式配置仓库的state、getters、actions
 * 配置 state getters actions
 */
function timestampToTime(timestamp) {
  // 时间戳为10位需*1000，时间戳为13位不需乘1000
  var date = new Date(timestamp);
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return h + m + s;
  //   return Y + M + D + h + m + s;
}
export const useMainStore = defineStore('main', {
  /*
   * 类似于组件的data数据，用来存储全局状态的
   * 1、必须是箭头函数
   */
  state: () => {
    return {
      siderShow: {
        left: true,
        right: true,
      },
      LeftSideType: 'Material',
      // 管理员token 和地址
      // token:"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtdWhlMSIsInNjb3BlIjoiQURNSU4iLCJleHAiOjE2ODE5NzQwMzN9.aUup3FcaG0cPglu8PIMHmgZw05cHpq5ijvJkl4jSx_5aLSftun-7f7P6S1USw7-BaAmpIj3oA-hypu0eC0rWrQ",
      // http://localhost:3000/EditorHome?templateId=1636273303800774657&designId=1636286161214316546&enterType=ADMIN_OPERATION
      // token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtdWhlIiwic2NvcGUiOiJBRE1JTiIsImV4cCI6MTY4MTk3NDczOX0.3TpaMG3j40qD6kdJrUtl7o7aQRv9eSp81nao5gLwTKAy96rfT7D5fGt9NfAg1Us79PuoflUDzmvkRrrlUyR6Dw',
      token: '',
      userId: '', // 用户的ID
      templateId: '', // 模板ID
      isBackGround: false, //是否后台
      designId: '', // 设计
      enterType: 'PC_DESIGNER', // 进入角色
      // ADMIN_OPERATION(1, "运维设计"),
      // PC_DESIGNER(2, "设计师设计"),
      // MOBILE_CUSTOMER(3, "个人设计"),
      // MOBILE_TEMPLATE_DESIGN(4, "个人SKU设计"),
      // ADMIN_COVER_ADAPTATION(5, "面适配设计");
      designPersonId: '',
      editable: true, // true/ '' 可编辑 false 仅查看
      username: 'muhe', // 用户名
      password: 'muhe', // 密码
      historyFontList: [], // 最近使用字体
      designName: '',
      originData: {
        xmmFontDTOEnList: [],
        xmmFontDTOCnList: [],
        designBoundaryConfigDTOList: [],
        elementCrafe: [],
        templateDesignDTO: {},
        boxDetailDTOList: [],
        diecutConfigMapList: [],
      }, // 初始化 原始数据
      isCanRender: false, // 需要初始数据齐全才能展示
      saveTime: timestampToTime(Date.now()),
      layoutContentIds: {}, // 保存接口 返回的  每个刀版设计内容id
      boxTypeGategroy: [], // 盒型类型列表
      tempaleteFristGategroy: [], //模板类型列表 行业 和场景
      tempaleteSecondGategroy: [], // 模板的二级类型菜单 风格
      currentBox: {}, // 当前盒型下 信息 含默认盒型、不同尺寸 不同 材质的 盒型列表 、盒型id,
      diecutList: {}, // 当前盒型的当前刀版 尺寸和材质
      userInfos: {}, // 获取的用户信息
      userUploadImageLists: [], // 用户上传过的图片
      isHandleSave: true, // 是否已经手动保存
      updateTime: Date.now(),
      saveLoading: false, // // 保存进行中的状态
      ossImageMap: {},
      brand: 'ele', // 关于主题 ele 代表小象 zhulaoda 代表诸老大
    };
  },

  /*
   * 类似于组件的计算属性computed的get方法，有缓存的功能
   * 不同的是，这里的getters是一个函数，不是一个对象
   */
  getters: {
    Authorization(state) {
      return 'Bearer ' + state.token;
    },
  },
  /*
   * 类似于组件的methods的方法，用来操作state的
   * 封装处理数据的函数（业务逻辑)：初始化数据、修改数据
   */
  actions: {
    /**
     * 刷新上传过的列表
     * @param {*} imgName
     */
    async loadImgLists(imgName) {
      // isLoadingImgLists.value = true;
      let params = {
        userId: this.userId,
      };
      imgName && (params.materialName = imgName);

      // 获取素材类型栏
      fetchApi.get(API_WX_MATERIALUSERDESIGN, params).then((res) => {
        // isLoadingImgLists.value = false;
        const lists = res?.data;
        this.userUploadImageLists = lists.map((item) => {
          return {
            ...item,
            name: item.materialName,
            url: item.thumbnailUrl || item.sourceUrl, // 提取一下
          };
        });
      });
    },
    /**
     * 通过加密的code获取进入编辑器相关信息
     * @param {*} code 加密的code
     */
    async initParamFromCode(code) {
      // this.isFrom
      try {
        let res = await fetchApi.get(GET_STR_DECODE, { code });
        this.setUrlParams(res.data);
        //  console.log('获取到了参数',this.designId,'---222---',this.templateId)
        return true;
      } catch (err) {
        return false;
      }
    },
    siderShowToggle(key, value) {
      console.log('siderShowToggle', key, value);
      if (key) {
        value = value === false || value === true ? value : !this.siderShow[key];
        this.siderShow[key] = value;
        // console.log(this.siderShow)
      } else {
        let value = Object.keys(this.siderShow).every((name) => this.siderShow[name]);
        this.siderShow.left = !value;
        this.siderShow.right = !value;
      }
      // if (!this.siderShow.left) {
      // this.LeftSideType = ''

      // }else{
      // if (!this.LeftSideType) {
      // this.LeftSideType = this.templateId ? 'Background' : 'BoxType'
      // }
      // }
    },
    setLeftSideType(type) {
      if (type) {
        this.siderShow.left = true;
      }
      this.LeftSideType = type;
    },
    refreshCanvas() {
      this.getOriginData();
    },
    // 设置路径参数
    async setUrlParams(params) {
      // console.log('解析路由参数',params);
      [
        'enterType',
        'templateId',
        'designId',
        'designPersonId',
        'editable',
        'userId',
        'displayMode',
        'diecutId',
        'token',
        'isBackGround',
      ].forEach((item) => {
        this[item] = params[item] !== 'undefined' && params[item] !== 'null' ? params[item] : '';
      });
      if (!this.templateId) {
        this.LeftSideType = 'BoxType';
      }
    },
    // 获取页面最基本的列表数据
    async initBaseList() {
      console.log('initBaseList');
      this.currentBox = {};
      this.designName = '';
      this.saveTime = '';
      this.getHotColors();
      this.getBoxTypeGategroy();
      this.getTemplateGategroy();
      console.log('initBaseList GET_USER_INFOS');
      let res = await fetchApi.get(GET_USER_INFOS, {}, { withoutCheck: true });
      // if (res?.flag) {
      //   this.userInfos = res.data;
      //   this.userId = res.data.id; // 单独设置一下用户ID
      //   this.getHistoryColors();
      // } else {
      //   console.log('initBaseList GET_USER_INFOS false');
      //   localStorage.removeItem('Authorization');
      //   localStorage.removeItem('userId');
      //   localStorage.removeItem('userName');
      //   message.error('会话已过期，请重新登录', 3, () => {
      //     location.replace('/login');
      //   });
      // }
    },
    // 获取热门颜色
    getHotColors() {
      return fetchApi.post(HOT_COLORS).then((res) => {
        const ColorStore = useColorStore();
        ColorStore.initColors(res?.data?.content || []);
      });
    },
    updateCanvasUpateTime() {
      // console.log('之前的 初始化时间', this.updateTime)
      this.updateTime = Date.now();
      // console.log('现在的 初始化时间', this.updateTime)
    },
    // 初始化刀版数据
    getDiecutList(data) {
      let ids = data.layouts.map((item) => item.id);
      this.diecutList = {};
      //console.log( this.templateId,"模板id");
      ids.forEach((id) => {
        fetchApi
          .get(GET_BOX_ASSOCIATION_LIST, {
            diecutId: id,
            templateInfoId: this.templateId,
          })
          .then((res) => {
            // console.log(res.data,"刀版");
            this.diecutList[id] = res.data;
          });
      });
    },
    // 初始化数据
    async getOriginData() {
      if (!this.templateId) return;
      // 初始化数据
      this.isHandleSave = null;
      this.isCanRender = false;
      await this.getBoxInfo();
      this.saveTime = timestampToTime(Date.now());
      // console.log(
      //   '初始化数据',
      //   this.enterType,
      //   this.templateId,
      //   this.designId !== 'null' && this.designId ? this.designId : null,
      // );
      return fetchApi
        .post(DESIGN_EDITOR_INITIALIZE, {
          designSourceEnum: this.enterType,
          templateId: this.templateId,
          userId: this.userId,
          designId: this.designId !== 'null' && this.designId ? this.designId : null,
        })
        .then((res) => {
          // 修改为数据加在完成之后，在进行格式化
          this.layoutContentIds = {};
          return this.setOriginData(res.data);
        });
    },
    setOriginData(data) {
      try {
        const PlaygroundStore = usePlaygroundStore();
        window.isAutoChange = false;
        this.originData = data;
        // console.log('初始化数据', this.originData);
        // enterType  :PC_PERSON_DESIGNER用designName  , PC_DESIGNER 就用showName && this.enterType==='PC_PERSON_DESIGNER'
        if (data?.templateDesignDTO?.designName && this.enterType === 'PC_PERSON_DESIGNER') {
          this.designName = this.originData?.templateDesignDTO?.designName;
        } else {
          this.designName = this.currentBox.showName || this.currentBox.boxCategoryName;
        }
        this.designId = data?.templateDesignDTO?.id || '';
        const standardData = formatDataToFE(data);
        PlaygroundStore.init(standardData);
        this.getDiecutList(standardData);
        const { xmmFontDTOCnList, xmmFontDTOEnList } = data;
        const fonts = [...xmmFontDTOCnList, ...xmmFontDTOEnList];
        const useLoadedStore = useLoaded();
        useLoadedStore.initData(standardData, fonts);
        //将loading的图片添加的初始化数据中
        useLoadedStore.setLoadedCallback((data) => {
          data.forEach((item) => {
            let { id } = item;
            const newData = setImageInto(standardData.canvasMap[id], item);
            PlaygroundStore.setCanvasMapItem(id, newData);
            let imageData = JSON.parse(JSON.stringify(newData));
            this.ossImageMap[id] = {
              playgroundImg: imageData.playgroundImg,
              coverPreviewMap: imageData.coverPreviewMap,
              nodePreviewMap: imageData.nodePreviewMap,
            };
          });
        });
        this.ossImageMap['3d'] = data?.templateDesignDTO.image3DUrl;
        this.isCanRender = true;
        // const ColorStore = useColorStore();
        // ColorStore.initColors(data.materialGroupDTO.materials);
      } catch (err) {
        message.warn('此模板数据有问题');
      }
    },

    // 获取盒型信息
    getBoxInfo() {
      let id = this.templateId;
      fetchApi.get(BOX_INFO_BY_TEMPLATEID, { templateInfoId: id }).then((res) => {
        this.setCurrentBoxInfo(res.data);
      });
    },
    setCurrentBoxInfo(box) {
      this.currentBox = box;
    },
    // 上传所有图片
    async uploadAllImage() {
      const PlaygroundStore = usePlaygroundStore();
      let uuid = '';
      let fileUploadArr = PlaygroundStore.layouts.map((layout) => {
        let layoutId = layout.id;
        let item = PlaygroundStore.canvasMap[layoutId];
        uuid = uuidv4();
        let playgroundImgFile = dataURLtoFile(item.playgroundImg.image2DUrl, layoutId + '-' + uuid + '-2d.png');
        let playgroundImgImages =
          playgroundImgFile &&
          this.upload(playgroundImgFile).then((res) => {
            this.ossImageMap[layoutId].playgroundImg = {
              image2DUrl: res.data.url,
            };
          });
        this.ossImageMap[layoutId].coverPreviewMap = [];
        let coverPreviewImages = item.coverPreviewMap.map((cover, i) => {
          this.ossImageMap[layoutId].coverPreviewMap.push({});
          uuid = uuidv4();
          let file = dataURLtoFile(cover.imageUrl, cover.coverId + '-' + uuid + '-cover.png');
          return (
            file &&
            this.upload(file).then((res) => {
              this.ossImageMap[layoutId].coverPreviewMap[i] = {
                coverId: cover.coverId,
                coverName: cover.coverName,
                imageUrl: res.data.url, // 缩略图地址
              };
            })
          );
        });
        this.ossImageMap[layoutId].nodePreviewMap = [];
        let nodePreviewImages = item.nodePreviewMap.map((node, i) => {
          this.ossImageMap[layoutId].nodePreviewMap.push({});
          uuid = uuidv4();
          let file = dataURLtoFile(node.imageUrl, node.craftId + '-' + uuid + '-craft.png');
          return (
            file &&
            this.upload(file).then((res) => {
              this.ossImageMap[layoutId].nodePreviewMap[i] = {
                craftId: node.craftId, // 工艺id
                craftName: node.craftName, // 缩略图地址
                imageUrl: res.data.url, // 缩略图地址
              };
            })
          );
        });
        let arr = [playgroundImgImages, ...coverPreviewImages, ...nodePreviewImages];
        return arr;
      });
      uuid = uuidv4();
      let image3DFile = dataURLtoFile(PlaygroundStore.Image3d || '', uuid + '-' + '3d.png');
      let image3DImage =
        image3DFile &&
        this.upload(image3DFile).then((res) => {
          this.ossImageMap['3d'] = res.data.url;
          // console.log(res,'image3DImage 上传完毕')
        });

      fileUploadArr = [...fileUploadArr, image3DImage].filter((item) => item);
      return Promise.all(fileUploadArr.flat(Infinity));
    },
    getDiecutContent(content, designDetailDTO) {
      const faceList = content.background.coverList;
      const { coverPreviewMap = [], nodePreviewMap = [], playgroundImg } = this.ossImageMap[content.id];
      const infoLayer = {
        saveTime: new Date().toLocaleString(),
        background: {
          fillImage: content.background.fillImage || null,
          fillColor: content.background.fillColor || null,
        },
        coverPreviewMap,
        nodePreviewMap,
        playground: {
          children: content.playground.children.map((item) => {
            return formatLayerNode(item, faceList);
          }),
        },
      };
      const designDetailExtDTO = {
        id: content.playgroundId || null,
        content: JSON.stringify(infoLayer),
      };
      if ((!designDetailDTO.id || designDetailDTO.id === 'null') && this.layoutContentIds[content.id]) {
        designDetailDTO.id = this.layoutContentIds[content.id];
      }
      // designDetailDTO.image2DId = content.playgroundImg.image2DId;
      designDetailDTO.image2DUrl = playgroundImg.image2DUrl || '';
      return { designDetailExtDTO, designDetailDTO };
    },
    getLayoutData() {
      const PlaygroundStore = usePlaygroundStore();
      const boxDetailDTOList = this.originData.boxDetailDTOList.map((item) => {
        const diecutId = item?.obverseInfo?.diecutConfig?.id;
        const reverseDiecutId = item?.reverseInfo?.diecutConfig?.id;
        if (diecutId && PlaygroundStore.canvasMap[diecutId]) {
          if (!item.obverseInfo.designDetailDTO) item.obverseInfo.designDetailDTO = {};
          if (!item.obverseInfo.designDetailExtDTO) item.obverseInfo.designDetailExtDTO = {};
          // console.log('保存时的id', item.obverseInfo.designDetailDTO);
          let { designDetailExtDTO, designDetailDTO } = this.getDiecutContent(
            PlaygroundStore.canvasMap[diecutId],
            item.obverseInfo.designDetailDTO,
          );
          item.obverseInfo.designDetailExtDTO = designDetailExtDTO;
          item.obverseInfo.designDetailDTO = designDetailDTO;
        }
        if (reverseDiecutId && PlaygroundStore.canvasMap[reverseDiecutId]) {
          if (!item.reverseInfo.designDetailDTO) item.reverseInfo.designDetailDTO = {};
          if (!item.reverseInfo.designDetailExtDTO) item.reverseInfo.designDetailExtDTO = {};
          let { designDetailExtDTO, designDetailDTO } = this.getDiecutContent(
            PlaygroundStore.canvasMap[reverseDiecutId],
            item.reverseInfo.designDetailDTO,
          );
          item.reverseInfo.designDetailExtDTO = designDetailExtDTO;
          item.reverseInfo.designDetailDTO = designDetailDTO;
        }
        return item;
      });
      // console.log('保存时的数据', boxDetailDTOList);
      return boxDetailDTOList;
    },

    // 手动保存 (走所有截图)
    async onCompleteSave(btnType) {
      if (this.saveLoading) return false;
      this.saveLoading = true;
      const PlaygroundStore = usePlaygroundStore();
      const oldLevel = PlaygroundStore.canvasLevel;
      // const oldFaceId = PlaygroundStore.selectFaceId;
      // const oldSelectLayoutId = PlaygroundStore.selectFaceId;
      let isUpdateCanvas = false;
      if (oldLevel === 'level-2') {
        //先清除高亮
        // 调用 goAll();
        PlaygroundStore.setLightBackgroud();
        PlaygroundStore.goToAll('level-0', 0, false);
        isUpdateCanvas = true;
      } else if (oldLevel === 'level-1') {
        if (PlaygroundStore.layouts.length > 1) {
          PlaygroundStore.goToAll('level-0', 0, false);
          isUpdateCanvas = true;
        }
      }
      return new Promise((resolve) => {
        setTimeout(
          () => {
            let imgs2d = useCharlet().forceCharlet(2);
            imgs2d.then((res) => {
              // console.log(res,"2d相关图片生成完毕");
              let wrap3d = document.getElementById('playground3D');
              wrap3d.style.width = '1048px';
              wrap3d.style.height = '1048px';
              resize();
              calc3DTextures().then((res) => {
                // console.log("贴图完成");
                capture3DThumbnail().then((res) => {
                  // console.log(res,"3d截图完成");
                  wrap3d.style.width = '100%';
                  wrap3d.style.height = '100%';
                  resize();
                  this.onSave(true, btnType)
                    .then((res) => {
                      resolve();
                    })
                    .finally(() => {
                      this.saveLoading = false;
                    });
                });
              });
            });
          },
          isUpdateCanvas ? 500 : 0,
        );
      });
    },
    // 保存 不是最新的截图（无工艺截图+面截图）
    async onSave(isHandleSave, btnType) {
      this.isHandleSave = false;
      // console.log('是否是实时保存',isHandleSave)
      // try {
      isHandleSave && this.onSaveNear();
      const PlaygroundStore = usePlaygroundStore();
      if (PlaygroundStore.canvasLevel === 'level-0') PlaygroundStore.getLevel0JSON();
      if (isHandleSave) {
        // try{
        await this.uploadAllImage();
        //    }catch(err){
        //     throw  new Error('上传图片失败')

        //    }
      }
      let boxDetailDTOList = this.getLayoutData(isHandleSave); // 再把缩略图存进来
      let enterType;
      if (this.isBackGround) {
        enterType = this.enterType;
      } else {
        enterType = 'PC_PERSON_DESIGNER';
      }
      let saveData = {
        designSourceEnum: enterType,
        templateDesignDTO: {
          ...this.originData.templateDesignDTO,
          // image3DId: PlaygroundStore.image3dId,
          // image3DUrl: PlaygroundStore.Image3d,
          image3DUrl: this.ossImageMap['3d'],
          id: this.designId,
          designName: this.designName,
          templateDesignSource: enterType === 'ADMIN_OPERATION' ? '1' : '2',
        },
        boxDetailDTOList,
        saveMode: isHandleSave ? 'MANUAL' : 'AUTO',
      };
      // console.log(saveData, '保存的数据');
      let saveRes = await fetchApi.post(SAVE_DESIGN, saveData, {
        withoutCheck: true,
      });

      const obj = saveRes.data?.diecutList;
      if (saveRes.data?.id) {
        this.designId = saveRes.data.id;
        this.saveTime = timestampToTime(Date.parse(saveRes.data.lastModifiedDate));
        // console.log(saveRes.data);
        if (enterType !== this.enterType) {
          // console.log(enterType, this.enterType, '身份变化');
          this.enterType = enterType;
          window.isAutoChange = true;
        }
        isHandleSave && message.success('保存成功', 2);
        this.isHandleSave = isHandleSave ? true : false;
        if (obj) {
          this.layoutContentIds = obj;
          Object.keys(obj).forEach((layoutId) => {
            PlaygroundStore.canvasMap[layoutId].playgroundId = obj[layoutId];
          });
        }
        if (btnType === 'nextBtn') {
          let message = {
            type: 'executeParentFunction',
          };
          window.parent.postMessage(message, '*');
        } else {
          // 当前页面不在iframe中打开
        }
      } else {
        throw new Error('保存失败');
      }
      this.saveLoading = false;
      this.isAutoSave = false;
      return saveRes;
      // } catch (err) {
      //    isHandleSave && message.error('保存失败', 2);
      //    this.saveLoading = false;

      //    this.isAutoSave = false;
      //    throw new Error(err)
      // }
    },
    onAutoSave() {
      this.onSave();
    },
    //  保存 用户颜色使用记录
    onSaveNear() {
      const ColorStore = useColorStore();
      const colors = ColorStore.historyColors.map((item) => {
        return {
          ...item,
          userId: this.userId,
        };
      });
      const fonts = this.historyFontList.map((item) => {
        return {
          userId: this.userId,
          dataType: 'FOUNT',
          dataTypeId: item.id,
        };
      });
      const data = {
        userId: this.userId,
        designUserHistoryDataDTOList: [...colors, ...fonts],
      };
      fetchApi.post(SAVE_USER_HISTORY_DATA, data).then((res) => {});
    },

    getHistoryColors() {
      return fetchApi
        .get(GET_USER_HISTORY_DATA, {
          useDataTypeEnum: 'CUSTOMCOLOR',
          userId: this.userId,
        })
        .then((res) => {
          useColorStore().initUserId(this.userId);
          useColorStore().initHistoryColors(res.data);
        });
    },

    /**
     * 更新最近使用字体
     */
    setHistoryFontList(historyFontList) {
      this.historyFontList = historyFontList;
    },

    //  获取盒型类型列表
    getBoxTypeGategroy() {
      return fetchApi.get(BOX_CATEGORY).then((res) => {
        this.boxTypeGategroy = [{ boxCategoryName: '全部', id: '' }, ...(res.data || [])];
      });
    },
    // 获取模板 类型列表
    getTemplateGategroy() {
      return Promise.all([
        fetchApi.get(FIND_LABEL_TYPE, { labelType: 'TRADE' }),
        fetchApi.get(FIND_LABEL_TYPE, { labelType: 'SCENE' }),
        fetchApi.get(FIND_LABEL_TYPE, { labelType: 'DESIGN_STYLE' }),
      ]).then((res) => {
        this.tempaleteFristGategroy = [
          { labelName: '全部', labelNameEn: '', id: '' },
          ...(res[0].data || []),
          ...(res[1].data || []),
        ];
        this.tempaleteSecondGategroy = [{ labelName: '全部', labelNameEn: '', id: '' }, ...(res[2].data || [])];
      });
    },
    setCurrentBox(box) {
      this.currentBox = box;
    },
    getNewTemplate(boxId) {
      return fetchApi.get(GET_BLANK_TEMPLATE_ID, {
        boxId,
      });
    },
    // 单个上传
    upload(...args) {
      // console.log('单个上传----', FileUpload, args)
      return FileUpload.upload(...args);
    },
    // 批量上传
    multipleUpload(...args) {
      // console.log('批量上传----', args)
      return FileUpload.start(...args);
    },
  },
});
