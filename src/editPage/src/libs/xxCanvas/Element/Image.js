/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2022-10-13 11:05:53
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-04 15:39:30
 * @FilePath: /project-20220906-xiaoxiang/src/XXEditor/src/libs/xxcanvas/Element/Image.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Konva from 'konva/lib/index';
import { addImageProcess } from '../utils/common';
/**
 * @description: 图片素材生成
 * @return {*}
 */
export class Image extends Konva.Image {
  constructor(options = {}) {
    // let {image,width,height,crop,scaleX=1,scaleY=1,name} = options;
    // if(image && name && !(name?.split(" ").includes("_anchor"))){
    //     let {naturalWidth,naturalHeight} = image;
    //     if(!crop){
    //         if(naturalWidth!==width && naturalWidth){
    //             options.scaleX = width/naturalWidth * scaleX;
    //             options.width = naturalWidth;
    //         }
    //         if(naturalHeight!==height && naturalWidth){
    //             options.scaleY = height/naturalHeight * scaleY;
    //             options.height = naturalHeight;
    //         }
    //     }
    // }
    super(options);
    this.init(options);
  }

  init(options) {
    // 如果没有生成图片对象，则生成图片对象
    if (!options.image && options.url) {
      addImageProcess(options.url).then((res) => {
        // let {width,height,crop,scaleX=1,scaleY=1,name} = this.attrs;
        // let {naturalWidth,naturalHeight} = res;
        // if(!crop){
        //     if(naturalWidth!==width&&naturalWidth){
        //         scaleX = width/naturalWidth * scaleX;
        //         width = naturalWidth;
        //     }
        //     if(naturalHeight!==height&&naturalWidth){
        //         scaleY = height/naturalHeight * scaleY;
        //         height = naturalHeight;
        //     }
        // }
        // this.setAttrs({
        //     image:res,
        //     width,
        //     height,
        //     scaleX,
        //     scaleY
        // });
        this.setAttrs({
          image: res,
        });
        options?.callback?.(res);
        this.fire('onLoad', { target: this, typeName: 'Image' });
      });
    }
  }
}
