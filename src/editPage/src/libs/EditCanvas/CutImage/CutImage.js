/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-02 20:06:06
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-07-04 20:32:54
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srclibs/EditCanvas/CutImage/CutImage.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useMainStore } from '@/store/index.js';
import fetchApi from '@/api/fetchApi';
import { dataURLtoFile } from '@/utils/upload';
import { API_WX_UPLOADUSERMATERIAL } from '@/api/API2.config';
import { themeMap } from '@/assets/less/theme';

function afterUploadImgSave(res, name, cb) {
  let ossUrl = res.data.url;
  return fetchApi
    .post(API_WX_UPLOADUSERMATERIAL, {
      userId: useMainStore().userId,
      materialName: name,
      ossUrl: ossUrl,
    })
    .then((res) => {
      cb(res.data.id, ossUrl);
    });
}
function beforeUpload(file, name, cb) {
  useMainStore().multipleUpload('img', [file], async (res, file) => {
    await afterUploadImgSave(res, name, cb);
  });
  return false;
}
/**
 * config 配置信息
 *   x   x坐标
 *   y   y坐标
 *   w   宽度
 *   h   高度
 *   img 要截图的图片,
 *   scale 当前缩放
 *   crop 截图区域image.png
 */
export default class CutImage {
  primaryColor;
  constructor(config) {
    let MainStore = useMainStore();
    this.primaryColor = themeMap[MainStore.brand].primary_color;
    this.config = config;
    this.createStyle();
    this.createElement(config);
    this.saveEle();
    this.resetControlPos();
    this.initResize(config);
    this.initSlider(config);
    this.initDrag(config);
    this.initEvents(config);
    console.log('----- primaryColor', this.primaryColor);
  }
  saveEle() {
    this.wrap = document.querySelector('.cut-image');
    this.control = document.querySelector('.cut-image-control');
    this.imageWrap = document.querySelector('.cut-image-wrap');
    this.point = document.querySelector('.crop-point');
    this.points = document.querySelectorAll('.crop-point span');
    this.shadowImg = document.querySelector('.cut-image .shadow-img');
    this.img = document.querySelector('.cut-image .cut-img');
    this.slider = this.control.querySelector('.slider');
    this.progress = this.control.querySelector('.slider .slider-progress');
    this.bar = this.control.querySelector('.slider .slider-bar');
    this.value = this.control.querySelector('.value');
    this.btns = this.control.querySelectorAll('.cut-image-control-btns span');
  }
  // 重置位置
  resetControlPos() {
    let { control, point } = this;
    let rect = point.getBoundingClientRect();
    control.style.display = 'flex';
    control.style.left = rect.x - 2 + 'px';
    control.style.top = rect.y - 66 + 'px';
  }
  // 创建节点
  createElement(config) {
    let { image, rotation, x, y, clientWidth, clientHeight, mirror } = config;
    let wrap = document.createElement('div');
    wrap.className = 'cut-image';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    wrap.style.width = clientWidth + 'px';
    wrap.style.height = clientHeight + 'px';
    let cutImgWrap = document.createElement('div');
    cutImgWrap.className = 'cut-image-wrap';
    cutImgWrap.style.transformOrigin = '0 0';
    cutImgWrap.style.transform = `rotate(${rotation}deg)`;
    let img = image.cloneNode();
    img.draggable = false;
    img.className = 'cut-img';
    img.style.left = 0 + 'px';
    img.style.top = 0 + 'px';
    img.style.width = clientWidth + 'px';
    img.style.height = clientHeight + 'px';
    img.style.transformOrigin = 'center center';
    if (mirror.x || mirror.y) {
      let xDeg = 0,
        yDeg = 0;
      if (mirror.x) {
        yDeg = 180;
      }
      if (mirror.y) {
        xDeg = 180;
      }
      img.style.transform = `rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
    cutImgWrap.appendChild(img);
    let cropBox = document.createElement('div');
    cropBox.className = 'editor-crop-box';
    let viewBox = document.createElement('div');
    viewBox.className = 'viewBox';
    let shadowImg = img.cloneNode();
    shadowImg.className = 'shadow-img';
    viewBox.appendChild(shadowImg);
    let cropPoint = document.createElement('div');
    cropPoint.className = 'crop-point';
    cropPoint.innerHTML = `
            <span class="point-left-top"></span>
            <span class="point-center-top"></span>
            <span class="point-right-top"></span>
            <span class="point-left-center"></span>
            <span class="point-right-center"></span>
            <span class="point-left-bottom"></span>
            <span class="point-center-bottom"></span>
            <span class="point-right-bottom"></span>
        `;
    cropBox.appendChild(viewBox);
    cropBox.appendChild(cropPoint);
    let control = document.createElement('div');
    control.className = 'cut-image-control';
    control.innerHTML = `<div class="cut-image-control-scale">
            <span class="text title">缩放</span>
            <div class="slider">
                <div class="slider-wrap">
                    <div class="slider-progress">
                        <div class="slider-bar"></div>
                    </div>
                </div>
            </div>
            <span class="text value">100%</span>
        </div>
        <div class="cut-image-control-btns">
            <span>重置</span>
            <span>取消</span>
            <span>确认</span>
        </div>
        `;
    cutImgWrap.appendChild(cropBox);
    wrap.appendChild(cutImgWrap);
    wrap.appendChild(control);
    document.body.appendChild(wrap);
    this.mask = document.createElement('div');
    this.mask.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 1100;
            background: rgba(0,0,0,.6);
        `;
    document.body.appendChild(this.mask);
  }
  // 获取对应的鼠标指针
  getCursor(deg) {
    let rotation = -this.config.rotation;
    let cur = ['n-resize', 'ne-resize', 'e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize', 'nw-resize'];
    deg -= rotation;
    if (deg < 0) {
      deg += 360;
    }
    return cur[Math.round(deg / 45) % cur.length];
  }
  // 创建样式
  createStyle() {
    let style = document.getElementById('cutImageStyle');
    if (style) {
      return;
    }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
            .cut-image {
                position: fixed;
                z-index: 1200;
                left: 0;
                top: 0;
            }
            .cut-image-wrap {
                position: absolute;
                z-index: 1201;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
            }
            .cut-img {
                position: absolute;
                z-index: 1201;
                opacity: 0.3;
            }
            .shadow-img {
                position: relative;
            }
            .cut-image img {
                user-select: none;
            }
            .editor-crop-box {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
            }
            .viewBox {
                position: relative;
                width: 100%;
                height: 100%;
                z-index: 1201;
                overflow: hidden;
            }
            .cut-image-control {
                position: fixed;
                left: -2px;
                top: -66px;
                width: 370px;
                height: 46px;
                background: #fff;
                box-shadow: 0px 0px 4px 0px rgba(187,187,187,0.5);
                border-radius: 8px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                z-index: 1201;
            }
            .cut-image-control-scale {
                padding-left: 25px;
                padding-right: 22px;
                width: 80%;
                flex: 1 1 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .cut-image-control-scale .title {
                padding-right: 15px;
            }
            .cut-image-control-scale .text {
                width: 24px;
                height: 100%;
                line-height: 46px;
                font-size: 12px;
                font-weight: 400;
                color: #666666;
                display: inline-block;
                flex: 1 0 auto;
                box-sizing: content-box;
            }
            .cut-image-control-scale .slider {
                width: 120px;
                padding: 5px 0;
                height: 2px;
                cursor: pointer;
            }
            .cut-image-control-scale .slider-wrap {
                width: 120px;
                height: 2px;
                background: #E1E1E1;
                border-radius: 5px;
            }
            .cut-image-control-scale .slider-progress {
                position: relative;
                width: 0;
                height: 2px;
                border-radius: 5px;
                background: ${this.primaryColor};
            }
            .cut-image-control-scale .slider-bar {
                position: absolute;
                right: -6px;
                top: -6px;
                width: 12px;
                height: 12px;
                background: #FFFFFF;
                border: 1px solid ${this.primaryColor};
                border-radius: 50%;
                cursor: pointer;
            }
            .cut-image-control-scale .value {
                padding-left: 10px;
            }
            .cut-image-control-btns {
                width: 120px;
                padding-right: 20px;
                line-height: 46px;
                flex: 1 0 auto;
                box-sizing: content-box;
                display: flex;
            }
            .cut-image-control-btns span {
                margin: 0 7px;
                font-size: 12px;
                color: #666;
                cursor: pointer;
            }  
            .cut-image-control-btns span:hover {
                color: ${this.primaryColor};
            }    
            .crop-point {
                position: absolute;
                z-index: 1202;
                width: 100%;
                height: 100%;
                left: -1px;
                top: -1px;
                border: 1px solid ${this.primaryColor};
            }
            .crop-point span{
                pointer-events:all;
            }
            .crop-point .point-center-top {
                position: absolute;
                left: 50%;
                margin-left: -8px;
                top: -3px;
                width: 16px;
                height: 16px;
                border-top: 2px solid ${this.primaryColor};
                cursor: ${this.getCursor(0)};
            }
            .crop-point .point-right-top {
                position: absolute;
                right: -3px;
                top: -3px;
                width: 16px;
                height: 16px;
                border-top: 2px solid ${this.primaryColor};
                border-right: 2px solid ${this.primaryColor};
                cursor: ${this.getCursor(45)};
            }
            .crop-point .point-right-center {
                position: absolute;
                right: -3px;
                top: 50%;
                margin-top: -8px;
                width: 16px;
                height: 16px;
                border-right: 2px solid ${this.primaryColor};
                cursor: ${this.getCursor(90)};
            }
            .crop-point .point-right-bottom {
                position: absolute;
                right: -3px;
                bottom: -3px;
                width: 16px;
                height: 16px;
                border-bottom: 2px solid ${this.primaryColor};
                border-right: 2px solid ${this.primaryColor};
                cursor: ${this.getCursor(135)};
            } 
            .crop-point .point-center-bottom {
                position: absolute;
                left: 50%;
                bottom: -3px;
                margin-left: -8px;
                width: 16px;
                height: 16px;
                border-bottom: 2px solid ${this.primaryColor};
                cursor: ${this.getCursor(180)};
            }
            .crop-point .point-left-bottom {
                position: absolute;
                left: -3px;
                bottom: -3px;
                width: 16px;
                height: 16px;
                border-left: 2px solid ${this.primaryColor};
                border-bottom: 2px solid ${this.primaryColor};
                cursor: ${this.getCursor(225)};
            }
            .crop-point .point-left-center {
                position: absolute;
                left: -3px;
                top: 50%;
                margin-top: -8px;
                width: 16px;
                height: 16px;
                border-left: 2px solid ${this.primaryColor};
                cursor: ${this.getCursor(270)};
            }
            .crop-point .point-left-top {
                position: absolute;
                left: -3px;
                top: -3px;
                width: 16px;
                height: 16px;
                border-left: 2px solid ${this.primaryColor};
                border-top: 2px solid ${this.primaryColor};
                cursor: ${this.getCursor(315)};
            }
        `;
    document.head.appendChild(style);
  }
  getWrapStyle = (attr, obj = this.wrap) => {
    if (attr === 'origin') {
      let rect = getComputedStyle(obj)['transformOrigin'];
      rect = rect.split(' ');
      return {
        x: parseFloat(rect[0]),
        y: parseFloat(rect[1]),
      };
    }
    return parseFloat(getComputedStyle(obj)[attr]);
  };
  // 拖拽选框大小改变
  initResize({ rotation }) {
    let { getWrapStyle, control, points } = this;
    let rad = (-rotation * Math.PI) / 180;
    let startPoint = {};
    let startRect = {};
    let startImgPos = {};
    let startOrigin = {};
    let minL = 0; // l 边界限制
    let minT = 0; // t 边界限制
    let maxW = 0; // w 边界限制
    let maxH = 0; // h 边界限制
    points.forEach((item) => {
      let name = item.className;
      let names = name.split('-');
      let move = (e) => {
        if (control.style.display === 'flex') {
          control.style.display = 'none';
        }
        let nowPoint = {
          x: e.clientX,
          y: e.clientY,
        };
        let dis = {
          x: nowPoint.x - startPoint.x,
          y: nowPoint.y - startPoint.y,
        };
        let mX = dis.x * Math.cos(rad) - dis.y * Math.sin(rad);
        let mY = dis.x * Math.sin(rad) + dis.y * Math.cos(rad);
        mX = parseInt(mX);
        mY = parseInt(mY);
        let t = startRect.y;
        let l = startRect.x;
        let w = startRect.w;
        let h = startRect.h;
        let imgT = startImgPos.y;
        let imgL = startImgPos.x;
        let oX = startOrigin.x;
        let oY = startOrigin.y;
        if (names.includes('left')) {
          if (mX < minL) {
            mX = minL;
          }
          if (w - mX < 0) {
            mX = w;
          }
          l = l + mX;
          w = w - mX;
          imgL = imgL - mX;
          oX = oX - mX;
        }
        if (names.includes('right')) {
          if (w + mX < 0) {
            mX = -w;
          }
          if (w + mX > maxW) {
            mX = maxW - w;
          }
          w = w + mX;
        }
        if (names.includes('top')) {
          if (mY < minT) {
            mY = minT;
          }
          if (h - mY < 0) {
            mY = h;
          }
          t = t + mY;
          h = h - mY;
          imgT = imgT - mY;
          oY = oY - mY;
        }
        if (names.includes('bottom')) {
          if (h + mY < 0) {
            mY = -h;
          }
          if (h + mY > maxH) {
            mY = maxH - h;
          }
          h = h + mY;
        }
        this.wrap.style.top = t + 'px';
        this.wrap.style.left = l + 'px';
        this.wrap.style.width = w + 'px';
        this.wrap.style.height = h + 'px';
        this.shadowImg.style.top = imgT + 'px';
        this.shadowImg.style.left = imgL + 'px';
        this.img.style.top = this.shadowImg.offsetTop + 'px';
        this.img.style.left = this.shadowImg.offsetLeft + 'px';
        this.imageWrap.style.transformOrigin = oX + 'px ' + oY + 'px';
      };
      let end = (e) => {
        this.resetControlPos();
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', end);
      };
      item.addEventListener('mousedown', (e) => {
        startPoint = {
          x: e.clientX,
          y: e.clientY,
        };
        startRect = {
          x: getWrapStyle('left'),
          y: getWrapStyle('top'),
          w: getWrapStyle('width'),
          h: getWrapStyle('height'),
        };
        startImgPos = {
          x: getWrapStyle('left', this.img),
          y: getWrapStyle('top', this.img),
        };
        minL = parseInt(startImgPos.x);
        minT = parseInt(startImgPos.y);
        maxW = getWrapStyle('width', this.img) + minL;
        maxH = getWrapStyle('height', this.img) + minT;
        startOrigin = getWrapStyle('origin', this.imageWrap);

        // console.log(minL,minT,maxW,maxH,"start");
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', end);
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }
  // 改变图片大小
  initSlider({ clientHeight, clientWidth }) {
    const { slider, progress, value, img, shadowImg, getWrapStyle, wrap } = this;
    let x, w;
    let isStart = true;
    let startImgRect = null;
    let resetPos = () => {
      let imgL = getWrapStyle('left', img);
      let imgT = getWrapStyle('top', img);
      let imgW = getWrapStyle('width', img);
      let imgH = getWrapStyle('height', img);
      let wrapW = getWrapStyle('width');
      let wrapH = getWrapStyle('height');
      if (imgL > 0) {
        shadowImg.style.left = img.style.left = 0 + 'px';
      }
      if (imgT > 0) {
        shadowImg.style.top = img.style.top = 0 + 'px';
      }
      if (imgL < wrapW - imgW) {
        shadowImg.style.left = img.style.left = wrapW - imgW + 'px';
      }
      if (imgT < wrapH - imgH) {
        shadowImg.style.top = img.style.top = wrapH - imgH + 'px';
      }
      if (wrapW > imgW) {
        wrap.style.width = imgW + 'px';
      }
      if (wrapH > imgH) {
        wrap.style.height = imgH + 'px';
      }
    };
    let move = (e) => {
      change(e);
    };
    const change = (e) => {
      // console.log("slider",slider.getBoundingClientRect());
      let pointX = e.clientX;
      let dis = pointX - x;
      if (dis < 0) {
        dis = 0;
      } else if (dis > w) {
        dis = w;
      }
      progress.style.width = dis + 'px';
      let s = (dis / w) * 2 + 1; // 最小值100%，最大值300%
      value.innerHTML = parseInt(s * 100) + '%';
      if (isStart) {
        isStart = false;
        startImgRect = {
          w: getWrapStyle('width', img),
          h: getWrapStyle('height', img),
          x: getWrapStyle('left', img),
          y: getWrapStyle('top', img),
        };
      }
      let imgW = parseInt(clientWidth * s);
      let imgH = parseInt(clientHeight * s);
      let imgL = startImgRect.x - (imgW - startImgRect.w) / 2;
      let imgT = startImgRect.y - (imgH - startImgRect.h) / 2;
      shadowImg.style.width = img.style.width = imgW + 'px';
      shadowImg.style.height = img.style.height = imgH + 'px';
      shadowImg.style.left = img.style.left = imgL + 'px';
      shadowImg.style.top = img.style.top = imgT + 'px';
    };
    slider.addEventListener('mousedown', (e) => {
      let rect = slider.getBoundingClientRect();
      x = rect.x;
      w = rect.width;
      change(e);
      document.addEventListener('mousemove', move);
      document.addEventListener(
        'mouseup',
        () => {
          document.removeEventListener('mousemove', move);
          isStart = true;
          resetPos();
        },
        { once: true },
      );
      e.preventDefault();
    });
  }
  // 拖拽图片
  initDrag({ rotation }) {
    const { img, shadowImg, getWrapStyle, point } = this;
    let rad = (-rotation * Math.PI) / 180;
    let startPoint = {}; //手指摁下坐标
    let startPos = {}; //图片摁下坐标
    let overInfo = {}; //坐标限制信息
    let move = (e) => {
      let nowPoint = {
        x: e.clientX,
        y: e.clientY,
      };
      let dis = {
        x: nowPoint.x - startPoint.x,
        y: nowPoint.y - startPoint.y,
      };
      let mX = dis.x * Math.cos(rad) - dis.y * Math.sin(rad);
      let mY = dis.x * Math.sin(rad) + dis.y * Math.cos(rad);
      let l = startPos.x + mX;
      let t = startPos.y + mY;
      if (l > 0) {
        l = 0;
      } else if (l < overInfo.minX) {
        l = overInfo.minX;
      }
      if (t > 0) {
        t = 0;
      } else if (t < overInfo.minY) {
        t = overInfo.minY;
      }
      img.style.left = shadowImg.style.left = l + 'px';
      img.style.top = shadowImg.style.top = t + 'px';
    };
    point.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startPoint = {
        x: e.clientX,
        y: e.clientY,
      };
      startPos = {
        x: getWrapStyle('left', img),
        y: getWrapStyle('top', img),
      };
      overInfo = {
        minX: getWrapStyle('width') - getWrapStyle('width', img),
        minY: getWrapStyle('height') - getWrapStyle('height', img),
      };
      document.addEventListener('mousemove', move);
      document.addEventListener(
        'mouseup',
        () => {
          document.removeEventListener('mousemove', move);
        },
        { once: true },
      );
    });
  }
  // 添加按钮的相关事件
  initEvents(config) {
    this.mask.addEventListener('click', () => {
      this.cancel();
    });
    this.btns[0].addEventListener('click', () => {
      this.reset();
    });
    this.btns[1].addEventListener('click', () => {
      this.cancel();
    });
    this.btns[2].addEventListener('click', () => {
      this.save();
    });
  }
  // cancel 取消
  cancel() {
    const { node, layer } = this.config;
    this.mask.remove();
    this.wrap.remove();
    node.show();
    layer.addTransformer(node, true);
  }
  // 重置
  reset() {
    let { img, shadowImg, wrap, imageWrap, progress, value } = this;
    let { clientWidth, clientHeight, x, y } = this.config;
    img.style.left = shadowImg.style.left = 0;
    img.style.top = shadowImg.style.top = 0;
    img.style.width = shadowImg.style.width = wrap.style.width = clientWidth + 'px';
    img.style.height = shadowImg.style.height = wrap.style.height = clientHeight + 'px';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    imageWrap.style.transformOrigin = '0 0';
    progress.style.width = 0 + 'px';
    value.innerHTML = 100 + '%';
    this.resetControlPos();
  }
  // 保存
  async save() {
    let { node, layer, x, y, clientWidth, clientHeight, scale } = this.config;
    let { img, wrap, getWrapStyle } = this;
    let minScale = Math.min(scale.x, scale.y);
    let rect = {
      x: parseInt(getWrapStyle('left')),
      y: parseInt(getWrapStyle('top')),
      w: parseInt(getWrapStyle('width')),
      h: parseInt(getWrapStyle('height')),
    };
    let imgRect = {
      x: parseInt(getWrapStyle('left', img)),
      y: parseInt(getWrapStyle('top', img)),
      w: parseInt(getWrapStyle('width', img)),
      h: parseInt(getWrapStyle('height', img)),
    };

    // 选框为截取任何图片
    if (rect.h <= 0 || rect.w <= 0) {
      this.mask.remove();
      this.wrap.remove();
      node.destroy();
      layer.fire('nodesChange', {
        typeName: 'delete',
        target: [node],
        nodes: layer.nodeElements,
      });
      return;
    }
    //未发生变化
    // console.log(imgRect,rect,this.config);
    if (
      imgRect.w === parseInt(clientWidth) &&
      imgRect.h === parseInt(clientHeight) &&
      imgRect.x === 0 &&
      imgRect.y === 0 &&
      rect.x === parseInt(x) &&
      rect.y === parseInt(y) &&
      rect.w === parseInt(clientWidth) &&
      rect.h === parseInt(clientHeight)
    ) {
      this.cancel();
      return;
    }
    let canvas = document.getElementById('hiddenCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'hiddenCanvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '-10000px';
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    canvas.width = (rect.w * dpr) / minScale;
    canvas.height = (rect.h * dpr) / minScale;
    let imgX = imgRect.x;
    let imgY = imgRect.y;
    let imgW = img.width;
    let imgH = img.height;
    if (this.config.mirror.y || this.config.mirror.x) {
      let tx = 0,
        ty = 0;
      let sX = 1,
        sY = 1;
      if (this.config.mirror.x) {
        tx = canvas.width;
        sX = -1;
        imgX = -(imgW - (rect.w - imgX));
      }
      if (this.config.mirror.y) {
        ty = canvas.height;
        sY = -1;
        imgY = -(imgH - (rect.h - imgY));
      }
      ctx.translate(tx, ty);
      ctx.scale(sX, sY);
    }
    ctx.drawImage(
      img,
      (imgX * dpr) / minScale,
      (imgY * dpr) / minScale,
      (imgW * dpr) / minScale,
      (imgH * dpr) / minScale,
    );
    let url = canvas.toDataURL('image/png');
    let mimeType = 'image/png';
    let fileName = Date.now() + '.png';
    const picContent = dataURLtoFile(url, fileName, mimeType);
    this.mask.remove();
    this.wrap.remove();
    let Img = new Image();
    Img.crossOrigin = 'anonymous';
    Img.onload = () => {
      let scale = node.getAbsoluteScale();
      let stageRect = layer.getStage().container().getBoundingClientRect();
      let nodeScale = node.scale();
      node.setAttrs({
        width: Math.abs(rect.w / scale.x),
        height: Math.abs(rect.h / scale.y),
        scale: {
          x: Math.abs(nodeScale.x),
          y: Math.abs(nodeScale.y),
        },
        image: Img,
      });
      node.absolutePosition({
        x: rect.x - stageRect.x,
        y: rect.y - stageRect.y,
      });
      node.show();
      layer.addTransformer(node, true);
    };
    Img.src = url;
    beforeUpload(picContent, fileName, (id, ossUrl) => {
      node.setAttrs({
        materialId: '999999',
        srcId: ossUrl,
        url: ossUrl,
      });
      layer.fire('attrsChange', {
        typeName: 'cutImage',
        target: [node],
        nodes: layer.nodeElements,
      });
    });
  }
}
