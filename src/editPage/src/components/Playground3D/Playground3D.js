import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { usePlaygroundStore } from '@/store/module/usePlayground.js';
// import {indexStore} from '@/store/module/index.js';
import { toRaw } from 'vue';

// import { CFD_ZH }  from './javascripts/filedrop.js';
// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
// import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
// import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";

import Hammer from 'hammerjs';
import { useLoaded } from '@/store/module/loaded';

// import VConsole from 'vconsole';
// const vConsole = new VConsole();

// 设置3D是否是高质量显示版本，高质量按刀版图宽高2倍放大，低质量按刀版图宽高1.4倍放大。getLayerImage、getCraftImage函数中 scale调节
const isHighQualityEdition = true;

// 3D视图容器、场景、相机、渲染器对象
let container3D, scene, camera, renderer;
// let controls;

// 环境贴图
let hdrTexture;

// const selectColor = new THREE.Color(0, 0.1, 0);
// const blackColor = new THREE.Color(0, 0, 0);

// let composerAllInOne;

// 上一次触摸X轴偏移
let preDeltaTouchMoveX = 0;
// 上一次触摸Y轴偏移
let preDeltaTouchMoveY = 0;
// 缩放变化值
let deltaMoveScale = 0;

// 现在选择的模型
let curSelectMesh;
let preSelectMesh;

// 包装盒GLTF
let packingBoxGLTF;

// 所有canvas贴图数组
const canvasALLArray = [];
// 所有img贴图数组
const imgALLArray = [];

// 相机控制虚拟目标物体
let dummyTargetMesh;

// （多）部件接口数据
let boxsDataArray;

// 选择包装盒面ID
let selectFaceBoxID;

// 动画混合器
let mixer;
//动画持续时间
let actionDuration = 0;
// let animationActions = [];

// y轴标准向量
const vectorUp = new THREE.Vector3(0, 1, 0);
// y轴旋转值
let angleRotYAngle = 0;

// 点击这里提示精灵对象
let spriteClickHereChoseAreaTips;
let outLineSelectArray = [];

// 包装盒长宽高
let maxLength = -100;
let maxWidth = -100;
let maxHeight = -100;

// 是否是首次进入3D
let isFirstIn3D = true;

// 对角线长度
let diagonalLineLengthHalf = 0;

// 哑光工艺金属度
const yaGuangMetalnessValue = 200;
// 哑光工艺粗糙度
const yaGuangRoughnessValue = 210;

// const defaultColor = new THREE.Color(1, 1, 1);

// 部件信息，单部件当只有一个部件的多部件处理
const boxesCanvasMapInfoDic = {
  // "canvasID": []
};

// 重进3D时释放上一次进入的canvas/img资源。
async function releaseAll3DResources() {
  canvasALLArray.length = 0;
  imgALLArray.length = 0;

  scene.children.forEach((item) => {
    item.traverse((child) => {
      if (child.material) {
        if (child.material.map) {
          child.material.map.dispose();
        }
        if (child.material.metalnessMap) {
          child.material.metalnessMap.dispose();
        }
        if (child.material.roughnessMap) {
          child.material.roughnessMap.dispose();
        }
        if (child.material.normalMap) {
          child.material.normalMap.dispose();
        }
        // !!child.clear && child.clear();

        // child.geometry.dispose();
        // child.material.dispose();
      }
    });
    // scene.remove( item );
  });

  // scene.environment.dispose();

  // scene.clear();
  // !!scene.clear && scene.clear(renderer);
  // scene.children = null;
  //
  // container3D.removeChild(renderer.domElement);
  // renderer.dispose();
  // renderer.forceContextLoss();
  // renderer.content = null;
  // renderer.renderLists.dispose();
  // renderer.dispose();
  // renderer.domElement = null;
  // renderer.content = null;
  // renderer = null;
  // cancelAnimationFrame(animate);
}

/**
 * 初始化3D场景
 * @param {*} cont3D 3D视图容器
 * @param {*} modelInfo 模型数据
 * @param {*} boxesInfo 包装盒数据
 * @param {*} canvasMapInfo 画布数据
 * @returns
 */
async function init3D(cont3D, modelInfo, boxesInfo, canvasMapInfo) {
  // console.log(modelInfo);
  // console.log(boxesInfo);
  // console.log(canvasMapInfo);

  // 3D视图容器
  container3D = cont3D;

  // 3D场景
  scene = new THREE.Scene();
  // 3D渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
    preserveDrawingBuffer: true,
  }); // 截图需要设置 preserveDrawingBuffer: true
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  // renderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap

  // 3D相机
  camera = new THREE.PerspectiveCamera(45, container3D.clientWidth / container3D.clientHeight, 0.01, 10);
  // camera.position.set(0.22, 0.15, -0.24);
  // camera.lookAt(new THREE.Vector3(0, 0, 0));

  // 设置渲染尺寸
  renderer.setSize(container3D.clientWidth, container3D.clientHeight);

  // 设置渲染比例
  renderer.setPixelRatio(window.devicePixelRatio);

  // 附加渲染器dom元素到3D视图
  container3D.appendChild(renderer.domElement);

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.target.set(0, 0, 0);
  // controls.update();
  // controls.enablePan = true;
  // // controls.enableDamping = true;

  // const light = new THREE.HemisphereLight(0xffffbb, 0x666666, 0.8);
  // scene.add(light);

  // 方向灯光
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.25);
  dirLight.position.set(0.1, 1, 0.15);

  // 方向灯光方向
  dirLight.lookAt(new THREE.Vector3(0, 0, 0));
  // // dirLight.rotation.set(0.5, 0.5, 0.5);
  // dirLight.castShadow = true;
  // const shadowDistance = 2; // 阴影体大小，不在这之内的显示不出来
  // dirLight.shadow.camera.near = 0.01;
  // dirLight.shadow.camera.far = 4;
  // dirLight.shadow.camera.right = shadowDistance;
  // dirLight.shadow.camera.left = -shadowDistance;
  // dirLight.shadow.camera.top = shadowDistance;
  // dirLight.shadow.camera.bottom = -shadowDistance;
  // dirLight.shadow.bias = -0.001; //防止斜纹
  // dirLight.shadow.mapSize.width = 1024;
  // dirLight.shadow.mapSize.height = 1024;

  // 增加灯光到场景
  scene.add(dirLight);

  // 环境灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  // 增加环境灯光到场景
  scene.add(ambientLight);

  // 相机注视虚拟物体
  dummyTargetMesh = new THREE.Object3D();
  dummyTargetMesh.position.set(0, 0, 0);

  // HDR环境图
  new RGBELoader().load('images/environment.hdr', (hdrTexture) => {
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    scene.environment = hdrTexture;
    // scene.background = hdrTexture;
    scene.background = new THREE.Color(0.937254, 0.937254, 0.937254);
    // scene.background = new THREE.Color(0.90588, 0.90588, 0.90588);
    // scene.background = new THREE.Color(0.934, 0.934, 0.934);
    // scene.background = new THREE.Color(0.52, 0.52, 0.52);
    // scene.background = new THREE.Color(0, 0, 0);
  });

  if (!modelInfo || modelInfo.length === 0) {
    alert('3D模型信息为空！请联系管理员');
    return;
  }

  // 包装盒模型加载
  // new GLTFLoader().load('./models/banbaoweitiandigai.glb', function (gltf) {
  // new GLTFLoader().load('./models/feijihe.glb', function (gltf) {
  // new GLTFLoader().load('./models/tutuantuan.glb', function (gltf) {
  new GLTFLoader().load(modelInfo.modelIdDetail.entryOssUrl, function (gltf) {
    // console.log("模型加载完成")
    // 加载进度条，模型加载完毕
    useLoaded().setloading3d();

    packingBoxGLTF = gltf;

    scene.add(gltf.scene);

    // 计算最大宽度，设置camera相机视角
    let tmpLength = 0;
    let tmpWidth = 0;
    let tmpHeight = 0;
    maxLength = -100;
    maxWidth = -100;
    maxHeight = -100;
    packingBoxGLTF.scene.traverse((child) => {
      if (child.type === 'Mesh' && child.name.indexOf('选面') < 0) {
        tmpWidth = child.geometry.boundingBox.max.x - child.geometry.boundingBox.min.x;
        if (tmpWidth > maxWidth) {
          maxWidth = tmpWidth;
        }

        tmpHeight = child.geometry.boundingBox.max.y - child.geometry.boundingBox.min.y;
        if (tmpHeight > maxHeight) {
          maxHeight = tmpHeight;
        }

        tmpLength = child.geometry.boundingBox.max.z - child.geometry.boundingBox.min.z;
        if (tmpLength > maxLength) {
          maxLength = tmpLength;
        }
      }
    });

    diagonalLineLengthHalf = Math.sqrt(maxWidth * maxWidth + maxLength * maxLength) / 2;

    // 自动根据盒型宽高深设置相机位置
    autoAdjustCameraPos();

    // console.log(modelInfo);
    // console.log(boxesInfo);
    // console.log(canvasMapInfo);

    // 获取盒型内外刀版相关相关图片
    boxesInfo.forEach((itemBoxesInfo) => {
      itemBoxesInfo.childrenId.forEach((canvasId) => {
        packingBoxGLTF.scene.traverse((childMesh) => {
          const nameSplitArray = childMesh.name.split('-');
          // 单部件 名称eg：内刀版-部件1、外刀版-部件1
          if (boxesInfo.length === 1) {
            if (
              nameSplitArray.length > 1 &&
              nameSplitArray[0].indexOf('刀版') >= 0 &&
              (nameSplitArray[0] === '外刀版' ? 'obverse' : 'reverse') === canvasMapInfo[canvasId].face
            ) {
              if (!boxesCanvasMapInfoDic[canvasId]) {
                boxesCanvasMapInfoDic[canvasId] = [];
              }
              boxesCanvasMapInfoDic[canvasId].push(childMesh);
            }
          }
          // 多部件 名称eg：地盖-内刀版-部件1、地盖-外刀版-部件1
          // console.log(canvasId, itemBoxesInfo.desc, canvasMapInfo[canvasId].face);
          // 626 天盖 obverse
          // 627 天盖 reverse
          // 628 地盖 obverse
          if (boxesInfo.length >= 2) {
            if (
              nameSplitArray.length > 1 &&
              nameSplitArray[0] === itemBoxesInfo.desc &&
              nameSplitArray[1].indexOf('刀版') >= 0 &&
              (nameSplitArray[1] === '外刀版' ? 'obverse' : 'reverse') === canvasMapInfo[canvasId].face
            ) {
              if (!boxesCanvasMapInfoDic[canvasId]) {
                boxesCanvasMapInfoDic[canvasId] = [];
              }

              boxesCanvasMapInfoDic[canvasId].push(childMesh);
            }
          }
        });
      });
    });

    // console.log(boxesCanvasMapInfoDic)

    // const innerTileMat = new THREE.MeshStandardMaterial({
    //     map: new THREE.TextureLoader().load('images/material/niupizhi.jpg'),
    //     color: 0xaaaaaa
    // })

    // 遍历包装盒子物体
    packingBoxGLTF.scene.traverse((childMesh) => {
      // 隐藏选面物体，射线拾取不受影响
      if (childMesh.name.indexOf('选面') >= 0) {
        childMesh.visible = false;
      }
      // //内部通用牛皮纸材质
      // if (childMesh.name.indexOf('内装饰') >= 0) {
      //     childMesh.material = innerTileMat;
      // }

      // 设置Mesh物体的反光强度
      if (childMesh.type === 'Mesh') {
        // childMesh.castShadow = true;
        // childMesh.receiveShadow = true;
        childMesh.envMap = hdrTexture;
        // childMesh.material.color = defaultColor;
        childMesh.material.metalness = 0.04;
        childMesh.material.roughness = 0.65;

        // 如果模型带有无用贴图，释放该贴图
        if (childMesh.material.map) {
          childMesh.material.map.dispose();
          // childMesh.material.map = null;
        }
      }
    });

    // const groundGeometry = new THREE.PlaneGeometry(20,20);
    // const planeMaterial = new THREE.MeshStandardMaterial({color: 0xc2c2c2});
    // const ground = new THREE.Mesh(groundGeometry, planeMaterial);
    // ground.rotation.x = -0.5 * Math.PI;
    // ground.position.set(0, -maxHeight / 2, 0);
    // ground.receiveShadow = true;
    // ground.name = 'ground';
    // scene.add(ground);

    // container3D.addEventListener('mouseup', () => {
    //     rayCastSelect();
    //     if (spriteClickHereChoseAreaTips) {
    //         spriteClickHereChoseAreaTips.visible = false;
    //     }
    // });

    // initPostEffects();

    // const geoBox = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    // const matBox = new THREE.MeshBasicMaterial({color: 0xffff00});
    // targetBoxMesh = new THREE.Mesh(geoBox, matBox);
    // scene.add(targetBoxMesh);

    calc3DTextures();
  });

  const hammertime = new Hammer(container3D);

  hammertime.get('pinch').set({ enable: true });
  hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });

  hammertime.on('panmove', (e) => {
    deltaMoveScale = 0.01;

    angleRotYAngle = camera.position.clone().angleTo(vectorUp);

    if (angleRotYAngle < 3 && e.deltaY - preDeltaTouchMoveY < 0) {
      rotateAroundWorldAxis(
        camera,
        camera.position.clone().cross(vectorUp).normalize(),
        (e.deltaY - preDeltaTouchMoveY) * deltaMoveScale,
      );
    }
    if (angleRotYAngle > 0.2 && e.deltaY - preDeltaTouchMoveY > 0) {
      rotateAroundWorldAxis(
        camera,
        camera.position.clone().cross(vectorUp).normalize(),
        (e.deltaY - preDeltaTouchMoveY) * deltaMoveScale,
      );
    }

    rotateAroundWorldAxis(camera, new THREE.Vector3(0, 1, 0), (e.deltaX - preDeltaTouchMoveX) * -deltaMoveScale);
    preDeltaTouchMoveX = e.deltaX;

    // rotateAroundWorldAxis(camera, camera.position.clone().cross(vectorUp).normalize(), (e.deltaY - preDeltaTouchMoveY) * deltaMoveScale);
    preDeltaTouchMoveY = e.deltaY;

    camera.lookAt(dummyTargetMesh.position);

    // 隐藏提示信息UI
    if (spriteClickHereChoseAreaTips) {
      spriteClickHereChoseAreaTips.visible = false;
    }
  });

  // 触屏结束
  hammertime.on('panend', () => {
    preDeltaTouchMoveX = 0;
    preDeltaTouchMoveY = 0;
  });
  // 双指缩小
  hammertime.on('pinchin', (e) => {
    if (camera.position.distanceTo(dummyTargetMesh.position) < maxWidth * 4) {
      camera.translateZ(e.scale * 0.01);
      // camera.translateZ(e.scale * deltaTime);
    }
    // 隐藏提示信息UI
    if (spriteClickHereChoseAreaTips) {
      spriteClickHereChoseAreaTips.visible = false;
    }
  });
  // 双指放大
  hammertime.on('pinchout', (e) => {
    if (camera.position.distanceTo(dummyTargetMesh.position) > diagonalLineLengthHalf + 0.05) {
      camera.translateZ(-e.scale * 0.005);
      // camera.translateZ(-e.scale * 0.2 * deltaTime);
    }
    // 隐藏提示信息UI
    if (spriteClickHereChoseAreaTips) {
      spriteClickHereChoseAreaTips.visible = false;
    }
  });
  // 单指点击
  hammertime.on('tap', () => {
    // 射线拾取点击选中的面
    rayCastSelect();
    if (spriteClickHereChoseAreaTips) {
      spriteClickHereChoseAreaTips.visible = false;
    }
  });

  animate();
}

let openAction = [];

/**
 * 包装盒模型打开动画播放（blender中制作的动画）
 */
function openAnimation() {
  if (spriteClickHereChoseAreaTips) {
    spriteClickHereChoseAreaTips.visible = false;
  }
  mixer = new THREE.AnimationMixer(packingBoxGLTF.scene);
  const clips = packingBoxGLTF.animations;
  clips.forEach(function (clip) {
    if (clip.duration > actionDuration) {
      actionDuration = clip.duration;
    }
    const action = mixer.clipAction(clip).play();
    action.loop = THREE.LoopOnce;
    // 停在最后一帧
    action.clampWhenFinished = true;
    openAction.push(action);
  });
}

/**
 * 包装盒模型关闭动画播放（blender中制作的动画）
 */
function closeAnimation() {
  mixer = new THREE.AnimationMixer(packingBoxGLTF.scene);
  const clips = packingBoxGLTF.animations;
  clips.forEach(function (clip) {
    const action = mixer.clipAction(clip).play();
    action.loop = THREE.LoopOnce;
    action.time = actionDuration;
    action.timeScale = -1;
    // 停在最后一帧
    action.clampWhenFinished = true;
  });
}

/**
 * 包装盒模型打开动画重置（blender中制作的动画）
 */
function resetAnimation() {
  if (openAction) {
    openAction.forEach((action) => {
      action.stop();
    });
  }
}

// function initPostEffects() {
//     //初始化特效合成器
//     composerAllInOne = new EffectComposer(renderer);
//     composerAllInOne.addPass(new RenderPass(scene, camera));
//
//     // //Outline 描边特效
//     // const outlinePass = new OutlinePass(new THREE.Vector2(container3D.clientWidth, container3D.clientHeight), scene, camera);
//     // outlinePass.visibleEdgeColor.set("#ff0000"); //设置描边颜色
//     // outlinePass.hiddenEdgeColor.set("#ff0000"); //设置描边颜色
//     // outlinePass.edgeStrength = 4;
//     // outlinePass.edgeGlow = 1;
//     // outlinePass.edgeThickness = 1;
//     // outlinePass.pulsePeriod = 0;
//     // outlinePass.setSize(container3D.clientWidth / 2,container3D.clientHeight / 2);
//     // outlinePass.overlayMaterial.blending = THREE.CustomBlending;
//     // composerAllInOne.addPass(outlinePass);
//     // outLineSelectArray.push(scene.getObjectByName("顶面"));
//     // outlinePass.selectedObjects = outLineSelectArray;
//
//     //Glow 泛光特效
//     const bloomPass = new UnrealBloomPass(
//         new THREE.Vector2(container3D.clientWidth / 8, container3D.clientHeight / 8),
//         0.2,
//         0.1,
//         0.1
//         // 0.35,
//         // 0.2,
//         // 0.01
//     );
//     composerAllInOne.addPass(bloomPass);
// }

/**
 *
 * @param {*} ctxCraftMaskCombine 合并部分工艺图，减少计算数量，减少计算时间，减少内存占用
 * @param {*} ctxSingleCraftMask 单个工艺canvas
 * @param {*} knifeMapWidth 刀版图宽
 * @param {*} knifeMapHeight 刀版图高
 */
function combineCraftMask(ctxCraftMaskCombine, ctxSingleCraftMask, knifeMapWidth, knifeMapHeight) {
  const canvasCraftMaskCombineData = ctxCraftMaskCombine.getImageData(0, 0, knifeMapWidth, knifeMapHeight);
  const canvasCraftMaskCombineDataArray = canvasCraftMaskCombineData.data;

  const canvasSingleCraftMaskData = ctxSingleCraftMask.getImageData(0, 0, knifeMapWidth, knifeMapHeight);
  const canvasSingleCraftMaskDataArray = canvasSingleCraftMaskData.data;

  for (let i = 0; i < canvasSingleCraftMaskDataArray.length; i += 4) {
    if (canvasSingleCraftMaskDataArray[i + 3] > 0) {
      canvasCraftMaskCombineDataArray[i] = 1;
      canvasCraftMaskCombineDataArray[i + 1] = 1;
      canvasCraftMaskCombineDataArray[i + 2] = 1;
      canvasCraftMaskCombineDataArray[i + 3] = canvasSingleCraftMaskDataArray[i + 3];
    }

    // //TODO
    // if (canvasSingleCraftMaskDataArray[i + 3] != 255) {
    //     // console.log(canvasSingleCraftMaskDataArray[i + 3])
    //     canvasCraftMaskCombineDataArray[i] = 255 - canvasSingleCraftMaskDataArray[i + 3];
    //     canvasCraftMaskCombineDataArray[i + 1] =   255 - canvasSingleCraftMaskDataArray[i + 3];
    //     canvasCraftMaskCombineDataArray[i + 2] =  255 - canvasSingleCraftMaskDataArray[i + 3];
    //     canvasCraftMaskCombineDataArray[i + 3] = 255;
    // } else if (canvasSingleCraftMaskDataArray[i + 3] === 255) {
    //     canvasCraftMaskCombineDataArray[i] = 0;
    //     canvasCraftMaskCombineDataArray[i + 1] = 0;
    //     canvasCraftMaskCombineDataArray[i + 2] = 0;
    //     canvasCraftMaskCombineDataArray[i + 3] = 255;
    // }
  }
  ctxCraftMaskCombine.putImageData(canvasCraftMaskCombineData, 0, 0);
}

/**
 *
 * @param {*} ctxCanvas 设置画布透明区域为白色（包括半透区域）
 * @param {*} knifeMapWidth 刀版图宽
 * @param {*} knifeMapHeight 刀版图宽
 */
function setWhiteBackground(ctxCanvas, knifeMapWidth, knifeMapHeight) {
  const canvasData = ctxCanvas.getImageData(0, 0, knifeMapWidth, knifeMapHeight);
  const canvasDataArray = canvasData.data;

  for (let i = 0; i < canvasDataArray.length; i += 4) {
    if (canvasDataArray[i + 3] !== 255 && canvasDataArray[i + 3] !== 0) {
      // console.log(canvasSingleCraftMaskDataArray[i + 3])
      canvasDataArray[i] = 255 - canvasDataArray[i + 3];
      canvasDataArray[i + 1] = 255 - canvasDataArray[i + 3];
      canvasDataArray[i + 2] = 255 - canvasDataArray[i + 3];
      canvasDataArray[i + 3] = 255;
    } else if (canvasDataArray[i + 3] === 0) {
      canvasDataArray[i] = 255;
      canvasDataArray[i + 1] = 255;
      canvasDataArray[i + 2] = 255;
      canvasDataArray[i + 3] = 255;
    }
  }

  ctxCanvas.putImageData(canvasData, 0, 0);
}

// function combineTwoMask(resultMaskCanvas, waitAddMaskCanvas) {
//
//     const cxtResultMaskCanvas = resultMaskCanvas.getContext('2d');
//
//     const resultMaskCanvasData = resultMaskCanvas.getImageData(0, 0, resultMaskCanvas.width, resultMaskCanvas.height);
//     const resultMaskCanvasDataArray = resultMaskCanvasData.data;
//
//     const waitAddMaskCanvasData = waitAddMaskCanvas.getImageData(0, 0, waitAddMaskCanvas.width, waitAddMaskCanvas.height);
//     const waitAddMaskCanvasDataArray = waitAddMaskCanvasData.data;
//
//     for (let i = 0; i < resultMaskCanvas.length; i += 4) {
//         if (waitAddMaskCanvasDataArray[i + 3] > 0) {
//             // resultMaskCanvasDataArray[i] = waitAddMaskCanvasDataArray[i];
//             // resultMaskCanvasDataArray[i + 1] = waitAddMaskCanvasDataArray[i + 1];
//             // resultMaskCanvasDataArray[i + 2] = waitAddMaskCanvasDataArray[i + 2];
//             // resultMaskCanvasDataArray[i + 3] = 255;
//
//             resultMaskCanvasDataArray[i] = 0;
//             resultMaskCanvasDataArray[i + 1] = 255;
//             resultMaskCanvasDataArray[i + 2] = 0;
//             resultMaskCanvasDataArray[i + 3] = 255;
//         }
//     }
//     cxtResultMaskCanvas.putImageData(resultMaskCanvasData, 0, 0);
// }

/**
 *
 * @param {*} canvasMap 将2D工艺设计图，根据相关算法计算生成3D工艺贴图
 * @returns
 */
async function calc3DTextures() {
  // return;
  //console.log("3D贴图开始生成~")
  // let testIndex = 0;

  // console.log(CFD_ZH.getNormalMap)
  // var image = CFD_ZH.getNormalMap('images/cc.png',0.5,8.0,0);
  // console.log(image)

  const PlaygroundStore = usePlaygroundStore();
  // console.log(PlaygroundStore)
  const canvasMapDataProxy = toRaw(PlaygroundStore).canvasMap.value;

  const layoutsDataProxy = toRaw(PlaygroundStore).layouts.value;
  // console.log(toRaw(layoutsDataProxy));

  // calc3DTextures(toRaw(canvasMap.value)[layoutId.value], toRaw(toRaw(canvasMap.value)[layoutId.value].nodePreviewMap), toRaw(toRaw(canvasMap.value)[layoutId.value].craftName));
  // console.log(toRaw(PlaygroundStore).canvasMap.value);

  // console.log(canvasMapDataProxy)
  // 遍历处理所有部件
  for (const canvasMapDataItemKey in canvasMapDataProxy) {
    const canvasMapDataItem = toRaw(canvasMapDataProxy[canvasMapDataItemKey]);
    const coverPreviewMapArray = toRaw(canvasMapDataProxy[canvasMapDataItemKey].nodePreviewMap);

    // console.log('========canvasMapDataItemKey=============', canvasMapDataItemKey)
    // console.log(boxesCanvasMapInfoDic)
    // console.log(boxesCanvasMapInfoDic[canvasMapDataItemKey])

    // 2D使用all字段数据，3D跳过该数据
    if (!boxesCanvasMapInfoDic[canvasMapDataItemKey]) {
      // alert("接口部件名称与模型部件名称不匹配！");
      if (canvasMapDataItemKey === 'all') {
        continue;
      } else {
        console.log('接口部件名称与模型部件名称不匹配！');
        continue;
      }
    }

    // 根据初始接口，设定宽高初始值。后面更新设定为2D设计图宽高。设置初始宽高防止没有设计图时，宽高为0，导致程序出错
    let knifeMapWidth = Math.ceil(canvasMapDataItem.background.width);
    let knifeMapHeight = Math.ceil(canvasMapDataItem.background.height);
    // console.log("接口刀版宽高：", knifeMapWidth, knifeMapHeight);

    // if (!knifeMapWidth || !knifeMapWidth) {
    //     alert('刀版图宽高数据为空，请检查!');
    //     return;
    // }
    // console.log(coverPreviewMapArray);

    const basicColorImageBase64 = canvasMapDataItem.playgroundImg.image2DUrl;
    // basicColor 获取漫反射贴图
    const imageBasicColorPromise = new Promise((resolve, reject) => {
      const basicColorImage = document.createElement('img');
      imgALLArray.push(basicColorImage);
      basicColorImage.crossOrigin = 'Anonymous';
      // 有base64数据
      if (basicColorImageBase64) {
        basicColorImage.src = basicColorImageBase64;
        basicColorImage.addEventListener('load', function (event) {
          // document.body.appendChild(basicColorImage);
          const canvasBasicColorTmp = document.createElement('canvas');
          canvasALLArray.push(canvasBasicColorTmp);

          knifeMapWidth = basicColorImage.naturalWidth;
          knifeMapHeight = basicColorImage.naturalHeight;

          canvasBasicColorTmp.width = basicColorImage.naturalWidth;
          canvasBasicColorTmp.height = basicColorImage.naturalHeight;
          // console.log(basicColorImage.naturalWidth, basicColorImage.naturalHeight)
          const ctxBasicColor = canvasBasicColorTmp.getContext('2d');
          ctxBasicColor.drawImage(basicColorImage, 0, 0);
          setOpacityZeroToWhite(canvasBasicColorTmp);
          // document.body.appendChild(canvasBasicColorTmp);
          // console.log("刀版图：" , basicColorImage.width, basicColorImage.height)
          resolve(canvasBasicColorTmp);
        });
      } else {
        const canvasBasicColorTmp = document.createElement('canvas');
        canvasALLArray.push(canvasBasicColorTmp);
        canvasBasicColorTmp.width = knifeMapWidth;
        canvasBasicColorTmp.height = knifeMapHeight;
        const ctxBasicColor = canvasBasicColorTmp.getContext('2d');
        ctxBasicColor.fillStyle = '#dddddd';
        ctxBasicColor.fillRect(0, 0, knifeMapWidth, knifeMapHeight);
        resolve(canvasBasicColorTmp);
      }
    });

    // basicColor 漫反射颜色canvas
    const canvasBasicColor = await imageBasicColorPromise;
    // document.body.appendChild(canvasBasicColor);

    const canvasCraftMaskCombine = document.createElement('canvas');
    canvasALLArray.push(canvasCraftMaskCombine);
    const ctxCraftMaskCombine = canvasCraftMaskCombine.getContext('2d');
    canvasCraftMaskCombine.width = knifeMapWidth;
    canvasCraftMaskCombine.height = knifeMapHeight;

    // 各个工艺单独canvas
    let canvasTangJin, canvasYaWen, canvasUV, canvasJiAo, canvasJiTu;

    // // HARDCODE
    // const myDiv = document.createElement('div');
    // document.body.appendChild(myDiv);
    // myDiv.id = 'testKonva' + testIndex;
    //
    // let stage = new Konva.Stage({
    //     container: 'testKonva' + testIndex,   // id of container <div>
    //     width: knifeMapWidth,
    //     height: knifeMapHeight
    // });
    // testIndex++;

    // 遍历处理该部件所有工艺蒙版canvas
    for (let i = 0; i < coverPreviewMapArray.length; i++) {
      // const coverPreviewBlackAndShadowImgPromise = new Promise((resolve, reject)=>{
      //     const layer = new Konva.Layer({ x: 0, y: 0 });
      //     stage.add(layer);
      //
      //     const coverPreviewBlackAndShadowImg = new Image();
      //     coverPreviewBlackAndShadowImg.crossOrigin = 'Anonymous';
      //     coverPreviewBlackAndShadowImg.src = coverPreviewMapArray[i].imageUrl;
      //     coverPreviewBlackAndShadowImg.onload = () => {
      //
      //         const Img = new Konva.Image({
      //             image: coverPreviewBlackAndShadowImg,
      //             width: coverPreviewBlackAndShadowImg.width,
      //             height: coverPreviewBlackAndShadowImg.height,
      //             x: 0,
      //             y: 0,
      //             shadowColor: '#000',
      //             shadowBlur: 2,
      //             shadowOffset: { x: 0, y: 0 },
      //             shadowOpacity: 1,
      //         });
      //
      //         // 元素置黑
      //         Img.cache();
      //         Img.filters([Konva.Filters.RGBA]);
      //         Img.red(0);
      //         Img.green(0);
      //         Img.blue(0);
      //
      //         // Img.setAttrs({
      //         //     fill:"#fff"
      //         // });
      //
      //         layer.add(Img);
      //
      //         // console.log(Img.toDataURL())
      //
      //         resolve(Img.toDataURL());
      //     };
      // })
      //
      // const coverPreviewBlackAndShadowBase64 =  await coverPreviewBlackAndShadowImgPromise;
      // // console.log(coverPreviewBlackAndShadowBase64)

      // base64工艺图转换为img
      const imageSingleCraftMaskPromise = new Promise((resolve, reject) => {
        const imageSingleCraftMask = document.createElement('img');
        imgALLArray.push(imageSingleCraftMask);
        imageSingleCraftMask.crossOrigin = 'Anonymous';
        // base64工艺图转换为img，coverPreviewMapArray[i].imageUrl为base64格式
        imageSingleCraftMask.src = coverPreviewMapArray[i].imageUrl;
        // imageSingleCraftMask.src = coverPreviewBlackAndShadowBase64;
        imageSingleCraftMask.addEventListener('load', () => {
          resolve(imageSingleCraftMask);
          // document.body.appendChild(imageSingleCraftMask);
          // console.log(coverPreviewMapArray[i].craftName, imageSingleCraftMask.naturalWidth, imageSingleCraftMask.naturalHeight)
        });
      });

      const imageSingleCraftMask = await imageSingleCraftMaskPromise;
      // document.body.appendChild(imageSingleCraftMask);

      const canvasSingleCraftMask = document.createElement('canvas');
      canvasALLArray.push(canvasSingleCraftMask);
      canvasSingleCraftMask.width = knifeMapWidth;
      canvasSingleCraftMask.height = knifeMapHeight;
      const ctxSingleCraftMask = canvasSingleCraftMask.getContext('2d');

      // 工艺名称
      const craftName = coverPreviewMapArray[i].craftName;
      // console.log(craftName);

      // 工艺image像素数据存入ctxSingleCraftMask画布
      ctxSingleCraftMask.drawImage(imageSingleCraftMask, 0, 0);
      // document.body.appendChild(imageSingleCraftMask);

      // 循环合并工艺图；按工艺表现的本质效果合并（高亮反光效果。），以优化性能、内存占用：
      if (craftName === '烫金' || craftName === '局部uv' || craftName === '击凹' || craftName === '击凸') {
        if (craftName === '烫金') {
          canvasTangJin = canvasSingleCraftMask;
        }
        if (craftName === '局部uv') {
          canvasUV = canvasSingleCraftMask;
        }
        if (craftName === '击凹') {
          canvasJiAo = canvasSingleCraftMask;
        }
        if (craftName === '击凸') {
          canvasJiTu = canvasSingleCraftMask;
        }

        combineCraftMask(ctxCraftMaskCombine, ctxSingleCraftMask, knifeMapWidth, knifeMapHeight);
      }
      if (craftName === '压纹') {
        canvasYaWen = canvasSingleCraftMask;
      }
    }

    // 设置canvas透明区域为白色
    setWhiteBackground(ctxCraftMaskCombine, knifeMapWidth, knifeMapHeight);

    // document.body.appendChild(canvasCraftMaskCombine);
    // console.log(canvasCraftMaskCombine.toDataURL())

    // 增加烫金工艺肌理，增加压纹工艺纹理
    for (let i = 0; i < coverPreviewMapArray.length; i++) {
      if (coverPreviewMapArray[i].craftName === '烫金') {
        // 高质量本部增加肌理，非高质量版本不增加肌理，节省内存（肌理效果视角不是特别近是效果区别不大）
        if (isHighQualityEdition) {
          // 烫金肌理纹理
          const tangJinCalPromise = new Promise((resolve, reject) => {
            const skinImage = document.createElement('img');
            imgALLArray.push(skinImage);
            skinImage.src = 'images/craft/gloden.jpg';
            skinImage.addEventListener('load', function (event) {
              const canvasSkin = document.createElement('canvas');
              canvasALLArray.push(canvasSkin);
              canvasSkin.width = knifeMapWidth;
              canvasSkin.height = knifeMapHeight;
              const ctxSkin = canvasSkin.getContext('2d');
              ctxSkin.fillStyle = ctxSkin.createPattern(skinImage, 'repeat');
              ctxSkin.fillRect(0, 0, knifeMapWidth, knifeMapHeight);
              // document.body.appendChild(canvasSkin);

              getTangJin(canvasBasicColor, canvasTangJin, canvasSkin);
              // document.body.appendChild(canvasTangJin);

              resolve();
            });
          });
          await tangJinCalPromise;
        }
      }
      // // 背景压纹
      // else if (coverPreviewMapArray[i].craftName === "压纹"){
      //
      //     const yawenBackgroundPromise = new Promise((resolve, reject)=>{
      //
      //         const yawenImage = document.createElement( 'img');
      //         yawenImage.src = 'images/craft/yawen.jpg';
      //         yawenImage.addEventListener('load', function (event) {
      //             // document.body.appendChild(yawenImage);
      //
      //             // yawen
      //             const canvasYaWen = document.createElement("canvas");
      //             canvasYaWen.width = knifeMapWidth;
      //             canvasYaWen.height = knifeMapHeight;
      //             const ctxYaWen = canvasYaWen.getContext("2d");
      //             ctxYaWen.fillStyle = ctxYaWen.createPattern(yawenImage, 'repeat');
      //             ctxYaWen.fillRect(0, 0, knifeMapWidth, knifeMapHeight);
      //
      //             calBackgroundYaWen(canvasBasicColor, canvasYaWen, canvasCraftMaskCombine);
      //             // document.body.appendChild(canvasBasicColor);
      //             resolve();
      //         })
      //     })
      //     await yawenBackgroundPromise;
      // }

      // 图案压纹
      else if (coverPreviewMapArray[i].craftName === '压纹') {
        const yawenElementPromise = new Promise((resolve, reject) => {
          const yawenElementImage = document.createElement('img');
          imgALLArray.push(yawenElementImage);
          yawenElementImage.src = 'images/craft/yawen.jpg';
          yawenElementImage.addEventListener('load', function (event) {
            // document.body.appendChild(yawenElementImage);

            // yawen
            const canvasElementYaWen = document.createElement('canvas');
            canvasALLArray.push(canvasElementYaWen);
            canvasElementYaWen.width = knifeMapWidth;
            canvasElementYaWen.height = knifeMapHeight;
            const ctxElementYaWen = canvasElementYaWen.getContext('2d');
            ctxElementYaWen.fillStyle = ctxElementYaWen.createPattern(yawenElementImage, 'repeat');
            ctxElementYaWen.fillRect(0, 0, knifeMapWidth, knifeMapHeight);

            calElementYaWen(canvasBasicColor, canvasElementYaWen, canvasYaWen);

            resolve();
          });
        });
        await yawenElementPromise;
      }
    }
    // document.body.appendChild(canvasBasicColor);

    // 计算 metalnessMap
    const canvasMetalness = document.createElement('canvas');
    canvasALLArray.push(canvasMetalness);
    canvasMetalness.width = knifeMapWidth;
    canvasMetalness.height = knifeMapHeight;
    const ctxMetalness = canvasMetalness.getContext('2d');
    ctxMetalness.drawImage(canvasCraftMaskCombine, 0, 0);
    getMetalness(canvasMetalness);
    // document.body.appendChild(canvasMetalness);

    // 计算 roughnessMap
    const canvasRoughness = document.createElement('canvas');
    canvasALLArray.push(canvasRoughness);
    canvasRoughness.width = knifeMapWidth;
    canvasRoughness.height = knifeMapHeight;
    const ctxRoughness = canvasRoughness.getContext('2d');
    ctxRoughness.drawImage(canvasCraftMaskCombine, 0, 0);
    getRoughness(canvasRoughness);
    // document.body.appendChild(canvasRoughness);

    // 计算 凸出部位的 normalMap，用canvasCraftMaskCombine来计算
    const canvasCombineNormal = document.createElement('canvas');
    canvasALLArray.push(canvasCombineNormal);
    canvasCombineNormal.width = knifeMapWidth;
    canvasCombineNormal.height = knifeMapHeight;
    const ctxCombineNormal = canvasCombineNormal.getContext('2d');
    ctxCombineNormal.drawImage(canvasCraftMaskCombine, 0, 0);

    calcNormal(ctxCombineNormal, knifeMapWidth, knifeMapHeight);
    // console.log(canvasCombineNormal.toDataURL())
    // document.body.appendChild(canvasCombineNormal);

    // const canvasCombineNormal = getNormalMap(canvasCraftMaskCombine, 5)
    // const ctxCombineNormal = canvasCombineNormal.getContext('2d')
    // // document.body.appendChild(canvasCombineNormal);

    // 计算击凸、击凹法线信息
    for (let i = 0; i < coverPreviewMapArray.length; i++) {
      if (coverPreviewMapArray[i].craftName === '击凸') {
        const ctxJiTu = canvasJiTu.getContext('2d');
        // 特殊处理，翻转canvasJiTu mask 凹进法线为凸出法线
        invertMaskNormal(ctxCombineNormal, ctxJiTu, knifeMapWidth, knifeMapHeight);
        // console.log(canvasCombineNormal.toDataURL())
        // console.log(canvasBasicColor.toDataURL())
        // console.log(canvasRoughness.toDataURL());
        // 特殊处理凸出的
        fixAoTuMetalnessRoughness(ctxMetalness, ctxJiTu, yaGuangMetalnessValue, knifeMapWidth, knifeMapHeight);
        fixAoTuMetalnessRoughness(ctxRoughness, ctxJiTu, yaGuangRoughnessValue, knifeMapWidth, knifeMapHeight);
        // console.log(canvasRoughness.toDataURL());
      }
      if (coverPreviewMapArray[i].craftName === '击凹') {
        const ctxJiAo = canvasJiAo.getContext('2d');

        fixAoTuMetalnessRoughness(ctxMetalness, ctxJiAo, yaGuangMetalnessValue, knifeMapWidth, knifeMapHeight);
        fixAoTuMetalnessRoughness(ctxRoughness, ctxJiAo, yaGuangRoughnessValue, knifeMapWidth, knifeMapHeight);
      }
    }

    // document.body.appendChild(canvasCombineNormal);
    // console.log(boxesCanvasMapInfoDic, canvasMapDataItemKey)

    // 根据包装各盒部件和各部件设计图及工艺图信息，设置材质贴图
    for (const packingBoxMeshPart of boxesCanvasMapInfoDic[canvasMapDataItemKey]) {
      // console.log(packingBoxMeshPart.name)

      if (packingBoxMeshPart.material) {
        packingBoxMeshPart.material.needsUpdate = true;
      } else {
        packingBoxMeshPart.material = new THREE.MeshStandardMaterial();
      }

      // // 基础色
      // const newMat = new THREE.MeshStandardMaterial({map: new THREE.TextureLoader().load(basicColorImageBase64)});
      // const newMat = new THREE.MeshStandardMaterial({map: new THREE.CanvasTexture(canvasBasicColor)});

      // // 销毁之前的材质贴图
      // scene.children.forEach((item)=>{
      //     item.traverse((child)=>{
      //         if (child.material) {
      //             if (child.material.map) {
      //                 child.material.map.dispose();
      //             }
      //             if (child.material.metalnessMap) {
      //                 child.material.metalnessMap.dispose();
      //             }
      //             if (child.material.roughnessMap) {
      //                 child.material.roughnessMap.dispose();
      //             }
      //             if (child.material.normalMap) {
      //                 child.material.normalMap.dispose();
      //             }
      //             child.material.dispose();
      //         }
      //     });
      // })

      // if (packingBoxMeshPart.material.map) {
      //     if (packingBoxMeshPart.material.map) {
      //         packingBoxMeshPart.material.map.dispose();
      //     }
      //     if (packingBoxMeshPart.material.metalnessMap) {
      //         packingBoxMeshPart.material.metalnessMap.dispose();
      //     }
      //     if (packingBoxMeshPart.material.roughnessMap) {
      //         packingBoxMeshPart.material.roughnessMap.dispose();
      //     }
      //     if (packingBoxMeshPart.material.normalMap) {
      //         packingBoxMeshPart.material.normalMap.dispose();
      //     }
      //     // packingBoxMeshPart.material.dispose();
      // }
      // packingBoxMeshPart.material = new THREE.MeshStandardMaterial();

      // // 高质量版本显示烫金肌理；非高质量版本不显示烫金肌理
      // if (isHighQualityEdition) {
      //     packingBoxMeshPart.material.map = new THREE.TextureLoader().load(canvasBasicColor.toDataURL())
      // }
      // else{
      //     packingBoxMeshPart.material.map = new THREE.TextureLoader().load(basicColorImageBase64)
      // }

      // 设置包装盒整体反射环境光强度
      if (packingBoxMeshPart.material) {
        packingBoxMeshPart.material.envMapIntensity = 1.2;
        if (packingBoxMeshPart.material.map) {
          packingBoxMeshPart.material.map.flipY = false;
          packingBoxMeshPart.material.map.encoding = THREE.sRGBEncoding;
          // packingBoxMeshPart.material.map.magFilter = THREE.LinearFilter;
          // packingBoxMeshPart.material.map.magFilter = THREE.NearestFilter;
          packingBoxMeshPart.material.map.generateMipmaps = false;
        }
      }

      // 新贴图转换为材质贴图，并赋给材质。
      const newTextureLoader = new THREE.TextureLoader();
      let abedoMap, metalnessMap, roughnessMap, normalMap;

      // 漫反射贴图
      const abedoMapPromise = new Promise((resolve, reject) => {
        newTextureLoader.load(canvasBasicColor.toDataURL(), (texture) => {
          abedoMap = texture;
          resolve();
        });
      });

      // 金属度贴图
      const metalnessMapPromise = new Promise((resolve, reject) => {
        newTextureLoader.load(canvasMetalness.toDataURL(), (texture) => {
          metalnessMap = texture;
          resolve();
        });
      });

      // 粗糙度贴图
      const roughnessMapPromise = new Promise((resolve, reject) => {
        newTextureLoader.load(canvasRoughness.toDataURL(), (texture) => {
          roughnessMap = texture;
          resolve();
        });
      });

      // 法线贴图
      const normalMapPromise = new Promise((resolve, reject) => {
        newTextureLoader.load(canvasCombineNormal.toDataURL(), (texture) => {
          normalMap = texture;
          resolve();
        });
      });

      await Promise.all([abedoMapPromise, metalnessMapPromise, roughnessMapPromise, normalMapPromise]).then(
        (result) => {
          // console.log('最终贴图生成完毕！开始替换为最终贴图');

          if (packingBoxMeshPart.material.map) {
            packingBoxMeshPart.material.map.dispose();
          }
          if (packingBoxMeshPart.material.metalnessMap) {
            packingBoxMeshPart.material.metalnessMap.dispose();
          }
          if (packingBoxMeshPart.material.roughnessMap) {
            packingBoxMeshPart.material.roughnessMap.dispose();
          }
          if (packingBoxMeshPart.material.normalMap) {
            packingBoxMeshPart.material.normalMap.dispose();
          }

          packingBoxMeshPart.material.map = abedoMap;
          packingBoxMeshPart.material.map.encoding = THREE.sRGBEncoding;
          packingBoxMeshPart.material.map.flipY = false;
          packingBoxMeshPart.material.map.generateMipmaps = false;

          packingBoxMeshPart.material.metalnessMap = metalnessMap;
          packingBoxMeshPart.material.metalnessMap.encoding = THREE.sRGBEncoding;
          packingBoxMeshPart.material.metalnessMap.flipY = false;
          packingBoxMeshPart.material.metalnessMap.generateMipmaps = false;

          packingBoxMeshPart.material.roughnessMap = roughnessMap;
          packingBoxMeshPart.material.roughnessMap.encoding = THREE.sRGBEncoding;
          packingBoxMeshPart.material.roughnessMap.flipY = false;
          packingBoxMeshPart.material.roughnessMap.generateMipmaps = false;

          packingBoxMeshPart.material.normalMap = normalMap;
          packingBoxMeshPart.material.normalMap.encoding = THREE.sRGBEncoding;
          packingBoxMeshPart.material.normalScale = new THREE.Vector2(-4, 3);
          packingBoxMeshPart.material.normalMap.flipY = false;
          packingBoxMeshPart.material.normalMap.generateMipmaps = false;
          packingBoxMeshPart.material.needsUpdate = true;
        },
      );
    }

    // const testObj = scene.getObjectByName('顶面');
    // console.log(testObj.getWorldDirection(new THREE.Vector3(0, 1, 0)))
    // testObj.position.copy( testObj.position.clone().add(testObj.getWorldDirection(new THREE.Vector3(0, -0.3, 0))) )
  }

  // 根据接口图片设置为模型内装饰贴图
  const innerMapImgURL = toRaw(layoutsDataProxy)[0].innerMapImg;
  if (innerMapImgURL) {
    const innerMapImgTexture = new THREE.TextureLoader().load(innerMapImgURL);
    packingBoxGLTF.scene.traverse((child) => {
      if (child.name.indexOf('内装饰') >= 0) {
        if (!child.material) {
          alert('内装饰模型有多个材质或无材质，请检查!');
          return;
        }
        child.material.map = innerMapImgTexture;
        child.material.color = new THREE.Color(0.9, 0.9, 0.9);
        child.material.needsUpdate = true;

        // const innerTileMat = new THREE.MeshStandardMaterial({
        //     map: innerMapImgTexture,
        // })
        // child.material = innerTileMat;
      }
    });
  }
}

async function capture3DThumbnail() {
  autoAdjustCameraPos();
  const PlaygroundStore = usePlaygroundStore();
  boxsDataArray = toRaw(toRaw(PlaygroundStore).boxs.value);
  const boxPreviewInfoObj = {};
  for (let i = 0; i < boxsDataArray.length; i++) {
    const boxData = boxsDataArray[i];
    const boxName = boxData.desc;

    // 多组件需要隐藏其它组件，单组件不需要
    if (boxsDataArray.length > 1) {
      packingBoxGLTF.scene.traverse((child) => {
        if ((child.name.startsWith(boxName) && child.name.indexOf('选面') < 0) || child.name === 'Scene') {
          child.visible = true;
        } else {
          child.visible = false;
        }
      });
    }

    let image3dThumbnailPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        const image3dThumbnail = document.createElement('img');
        imgALLArray.push(image3dThumbnail);
        image3dThumbnail.src = renderer.domElement.toDataURL('image/png');
        image3dThumbnail.addEventListener('load', () => {
          const canvasThumbnail3D = document.createElement('canvas');
          // canvasThumbnail3D.width = image3dThumbnail.naturalWidth;
          // canvasThumbnail3D.height = image3dThumbnail.naturalHeight;
          canvasThumbnail3D.width = image3dThumbnail.naturalWidth;
          canvasThumbnail3D.height = image3dThumbnail.naturalWidth;
          const ctxThumbnail3D = canvasThumbnail3D.getContext('2d');
          // 截图需要延迟一点，才能截到最新画面
          ctxThumbnail3D.drawImage(
            image3dThumbnail,
            0,
            (image3dThumbnail.naturalHeight - image3dThumbnail.naturalWidth) / 2,
            image3dThumbnail.naturalWidth,
            image3dThumbnail.naturalWidth,
            0,
            0,
            image3dThumbnail.naturalWidth,
            image3dThumbnail.naturalWidth,
          );
          // document.body.appendChild(canvasThumbnail3D);

          // 'boxId': {
          //     imageUrl: ''
          // }

          PlaygroundStore.setBoxPreview({
            [boxData.id]: {
              imageUrl: canvasThumbnail3D.toDataURL('image/png'),
            },
          });
          boxPreviewInfoObj[boxData.id] = {
            imageUrl: canvasThumbnail3D.toDataURL('image/png'),
          };
          resolve();
        });
      }, 100);
    });
    await image3dThumbnailPromise;
  }

  // 还原包装盒显示
  packingBoxGLTF.scene.traverse((child) => {
    if (child.name.indexOf('选面') < 0) {
      child.visible = true;
    }
  });

  // 生成包装盒整体缩略图
  let p = new Promise((resolve) => {
    setTimeout(() => {
      const image3dThumbnailALLScene = document.createElement('img');
      imgALLArray.push(image3dThumbnailALLScene);
      image3dThumbnailALLScene.src = renderer.domElement.toDataURL('image/png');
      image3dThumbnailALLScene.addEventListener('load', () => {
        const canvasThumbnail3D = document.createElement('canvas');
        canvasALLArray.push(canvasThumbnail3D);
        // canvasThumbnail3D.width = image3dThumbnail.naturalWidth;
        // canvasThumbnail3D.height = image3dThumbnail.naturalHeight;
        canvasThumbnail3D.width = image3dThumbnailALLScene.naturalWidth;
        canvasThumbnail3D.height = image3dThumbnailALLScene.naturalWidth;
        const ctxThumbnail3D = canvasThumbnail3D.getContext('2d');
        // 截图需要延迟一点，才能截到最新画面
        ctxThumbnail3D.drawImage(
          image3dThumbnailALLScene,
          0,
          (image3dThumbnailALLScene.naturalHeight - image3dThumbnailALLScene.naturalWidth) / 2,
          image3dThumbnailALLScene.naturalWidth,
          image3dThumbnailALLScene.naturalWidth,
          0,
          0,
          image3dThumbnailALLScene.naturalWidth,
          image3dThumbnailALLScene.naturalWidth,
        );
        // document.body.appendChild(canvasThumbnail3D);

        // 设置缩略图
        PlaygroundStore.setBoxPreview(boxPreviewInfoObj, canvasThumbnail3D.toDataURL('image/png'));

        console.log('3D贴图生成完毕！');
        //useLoaded().setCraftImg();
        // 释放过程canvas占用内存
        canvasALLArray.forEach((canvas) => {
          if (canvas) {
            canvas.width = canvas.height = 0;
            canvas.getContext('2d').fillRect(0, 0, 0, 0);

            canvas.length = 0;
            canvas = null;
          }
        });

        // 释放过程img占用内存
        imgALLArray.forEach((img) => {
          if (img) {
            img.remove();
            img.src = '';
            // img = null;
          }
        });
        resolve(true);
      });
    }, 100);
  });

  return p;
}

/**
 * 点击射线拾取，拾取包装盒面
 */
function rayCastSelect() {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  // pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  // pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  pointer.x = ((event.clientX - container3D.getBoundingClientRect().left) / container3D.clientWidth) * 2 - 1;
  pointer.y = -((event.clientY - container3D.getBoundingClientRect().top) / container3D.clientHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects && intersects.length > 0) {
    // console.log(intersects[0].object.name);
    curSelectMesh = intersects[0].object;

    if (curSelectMesh.name.indexOf('选面-') < 0) {
      return;
    }

    // if (preSelectMesh) {
    //     preSelectMesh.material.emissive = blackColor;
    // }
    // preSelectMesh = curSelectMesh;

    // const selectMat = curSelectMesh.material.clone();
    // selectMat.emissive = selectColor;
    // curSelectMesh.material = selectMat;

    // console.log(curSelectMesh.name, selectFaceBoxID)

    // 单部件
    if (boxsDataArray.length === 1) {
      selectFaceBoxID = boxsDataArray[0].id;
    }

    // 多部件
    if (boxsDataArray.length > 1) {
      boxsDataArray.forEach((boxData) => {
        // console.log(curSelectMesh.name.split("-")[1], boxData.desc)
        if (curSelectMesh.name.split('-')[1] === boxData.desc) {
          selectFaceBoxID = boxData.id;
        }
      });
    }
    // console.log(selectFaceBoxID)

    const curSelectMeshNameArray = curSelectMesh.name.split('选面-');

    // // 调用2D选择对应面方法
    // window.selectFaceFrom3D(curSelectMeshNameArray[1], selectFaceBoxID);
    // choseSelect(curSelectMeshNameArray[1]);

    // outLineSelectArray.length = 0;
    // outLineSelectArray.push(curSelectMesh);
  } else {
    // outLineSelectArray.length = 0;
  }
}

/**
 * 2DUI选择调用3D视角旋转移动到该面正面
 * @param {*} faceName 可选面名称
 */
function choseSelect(faceName) {
  // if (preSelectMesh) {
  //     preSelectMesh.material.emissive = blackColor;
  // }

  // // 清空描边效果
  // outLineSelectArray.length = 0;

  // console.log(faceName)

  // 隐藏提示信息UI
  if (spriteClickHereChoseAreaTips) {
    spriteClickHereChoseAreaTips.visible = false;
  }

  curSelectMesh = scene.getObjectByName('选面-' + faceName);

  if (!curSelectMesh) {
    return;
  }
  // const selectMat = curSelectMesh.material.clone();
  // selectMat.emissive = selectColor;
  // curSelectMesh.material = selectMat;
  // preSelectMesh = curSelectMesh;

  // moveCameraToFront(curSelectMesh);
  rotateCameraToFront(curSelectMesh);
}

// function moveCameraToFront() {
//     const targetPos = curSelectMesh.getWorldDirection(new THREE.Vector3()).normalize().multiplyScalar(0.6);
//     new TWEEN.Tween({ x: camera.position.x, y: camera.position.y, z: camera.position.z })
//         .to({
//             x: targetPos.x,
//             y: targetPos.y,
//             z: targetPos.z
//         }, 1000)
//         .easing(TWEEN.Easing.Quadratic.Out)
//         // .easing(TWEEN.Easing.Linear.None)
//         .onUpdate(({ x, y, z }) => {
//             camera.position.set(x, y, z);
//             camera.lookAt(targetPos);
//         })
//         .start()
//         .onComplete(() => {
//         });
// }

let isAutoRotFinish = true;
const dummy = new THREE.Object3D();
const q1 = new THREE.Quaternion();
const q2 = new THREE.Quaternion();

/**
 * 旋转到模板模型正面
 * @param {*} targetMesh 模板面模型
 * @returns
 */
function rotateCameraToFront(targetMesh) {
  if (!isAutoRotFinish) {
    return;
  }
  isAutoRotFinish = false;

  // if (useLoaded().previewMode3D) {
  //     return;
  // }

  dummy.position.copy(dummyTargetMesh.position);
  dummy.lookAt(camera.position);
  q1.copy(dummy.quaternion);

  // const targetPos = new THREE.Vector3();
  // targetMesh.getWorldDirection(targetPos);

  targetMesh.translateZ(0.5);
  targetMesh.translateY(-0.01);

  dummy.lookAt(targetMesh.position);
  q2.copy(dummy.quaternion);

  targetMesh.translateZ(-0.5);
  targetMesh.translateY(0.01);
}

/**
 * 绕指定轴旋转
 * @param {*} object 旋转物体
 * @param {*} axis 旋转轴
 * @param {*} radian 旋转弧度
 */
function rotateAroundWorldAxis(object, axis, radian) {
  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationAxis(axis.normalize(), radian);
  const currentPos = new THREE.Vector4(object.position.x, object.position.y, object.position.z, 1);
  const newPos = currentPos.applyMatrix4(rotationMatrix);
  object.position.set(newPos.x, newPos.y, newPos.z);
}

/**
 * 法线计算版本2，性能消耗较高
 * @param {*} canvasOrigin 待计算画布图
 * @param {*} depth 法线深度
 * @returns 计算完成的法线数据画布
 */
function getNormalMap(canvasOrigin, depth) {
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  function normalize(a) {
    var l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    return [a[0] / l, a[1] / l, a[2] / l];
  }

  depth = depth | 1;

  const width = canvasOrigin.width;
  const height = canvasOrigin.height;

  const contextOrigin = canvasOrigin.getContext('2d');
  const dataOrigin = contextOrigin.getImageData(0, 0, width, height).data;

  const canvasNew = document.createElement('canvas');
  canvasNew.width = width;
  canvasNew.height = height;
  const canvasNewContext = canvasNew.getContext('2d');
  var canvasNewImageData = canvasNewContext.createImageData(width, height);
  const canvasNewData = canvasNewImageData.data;

  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var ly = y - 1 < 0 ? 0 : y - 1;
      var uy = y + 1 > height - 1 ? height - 1 : y + 1;
      var lx = x - 1 < 0 ? 0 : x - 1;
      var ux = x + 1 > width - 1 ? width - 1 : x + 1;

      var points = [];
      var origin = [0, 0, (dataOrigin[(y * width + x) * 4] / 255) * depth];
      points.push([-1, 0, (dataOrigin[(y * width + lx) * 4] / 255) * depth]);
      points.push([-1, -1, (dataOrigin[(ly * width + lx) * 4] / 255) * depth]);
      points.push([0, -1, (dataOrigin[(ly * width + x) * 4] / 255) * depth]);
      points.push([1, -1, (dataOrigin[(ly * width + ux) * 4] / 255) * depth]);
      points.push([1, 0, (dataOrigin[(y * width + ux) * 4] / 255) * depth]);
      points.push([1, 1, (dataOrigin[(uy * width + ux) * 4] / 255) * depth]);
      points.push([0, 1, (dataOrigin[(uy * width + x) * 4] / 255) * depth]);
      points.push([-1, 1, (dataOrigin[(uy * width + lx) * 4] / 255) * depth]);

      var normals = [];
      var num_points = points.length;

      for (var i = 0; i < num_points; i++) {
        var v1 = points[i];
        var v2 = points[(i + 1) % num_points];
        v1 = subtract(v1, origin);
        v2 = subtract(v2, origin);
        normals.push(normalize(cross(v1, v2)));
      }

      var normal = [0, 0, 0];

      for (var i = 0; i < normals.length; i++) {
        normal[0] += normals[i][0];
        normal[1] += normals[i][1];
        normal[2] += normals[i][2];
      }

      normal[0] /= normals.length;
      normal[1] /= normals.length;
      normal[2] /= normals.length;

      var idx = (y * width + x) * 4;

      canvasNewData[idx] = (((normal[0] + 1.0) / 2.0) * 255) | 0;
      canvasNewData[idx + 1] = (((normal[1] + 1.0) / 2.0) * 255) | 0;
      canvasNewData[idx + 2] = (normal[2] * 255) | 0;
      canvasNewData[idx + 3] = 255;
    }
  }

  canvasNewContext.putImageData(canvasNewImageData, 0, 0);

  return canvasNew;
}

/**
 * 法线计算版本1，，性能消耗较低
 * @param {*} ctx   待计算法线画布
 * @param {*} width     画布宽
 * @param {*} height    画布高
 */
function calcNormal(ctx, width, height) {
  // const pixelData = ctx.getImageData(0,0,1,1).data;

  const canvasImageDataArray = ctx.getImageData(0, 0, width, height).data;
  const newCanvasImageData = new ImageData(width, height);
  const newImageDataArray = newCanvasImageData.data;

  let topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left, dX, dY, dZ;
  let widthPlus4;
  let yPlus4PlusWidth, ySub1Plus4PlusWidth, yAdd1Plus4PlusWidth;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width * 4; x = x + 4) {
      widthPlus4 = width * 4;
      yPlus4PlusWidth = y * 4 * width;
      ySub1Plus4PlusWidth = (y - 1) * 4 * width;
      yAdd1Plus4PlusWidth = (y + 1) * 4 * width;
      // 取得周围的像素点的 rgba值(灰度值)
      // 自己像素 canvasData[ yPlus4PlusWidth + x ]
      if (x === 0 || y === 0) {
        topLeft = canvasImageDataArray[yPlus4PlusWidth + x];
      } else {
        topLeft = canvasImageDataArray[ySub1Plus4PlusWidth + x - 4];
      }
      if (y === 0) {
        top = canvasImageDataArray[yPlus4PlusWidth + x];
      } else {
        top = canvasImageDataArray[ySub1Plus4PlusWidth + x];
      }
      if (x === widthPlus4 || y === 0) {
        topRight = canvasImageDataArray[yPlus4PlusWidth + x];
      } else {
        topRight = canvasImageDataArray[ySub1Plus4PlusWidth + x + 4];
      }
      if (x === widthPlus4) {
        right = canvasImageDataArray[yPlus4PlusWidth + x];
      } else {
        right = canvasImageDataArray[yPlus4PlusWidth + x + 4];
      }
      if (x === widthPlus4 || y === height - 1) {
        bottomRight = canvasImageDataArray[yPlus4PlusWidth + x];
      } else {
        bottomRight = canvasImageDataArray[yAdd1Plus4PlusWidth + x + 4];
      }
      if (y === height - 1) {
        bottom = canvasImageDataArray[yPlus4PlusWidth + x];
      } else {
        bottom = canvasImageDataArray[yAdd1Plus4PlusWidth + x];
      }
      if (x === 0 || y === height - 1) {
        bottomLeft = canvasImageDataArray[yPlus4PlusWidth + x];
      } else {
        bottomLeft = canvasImageDataArray[yAdd1Plus4PlusWidth + x - 4];
      }
      if (x === 0) {
        left = canvasImageDataArray[yPlus4PlusWidth + x];
      } else {
        left = canvasImageDataArray[yPlus4PlusWidth + x - 4];
      }

      // valTest = canvasImageDataArray [yPlus4PlusWidth + x];
      // newImageDataArray[ yPlus4PlusWidth + x ]  = valTest;
      // newImageDataArray[ yPlus4PlusWidth + x + 1 ] = valTest;
      // newImageDataArray[ yPlus4PlusWidth + x + 2 ] = valTest;
      // newImageDataArray[ yPlus4PlusWidth + x + 3 ] = 255;

      topLeft /= 255;
      top /= 255;
      topRight /= 255;
      right /= 255;
      bottomRight /= 255;
      bottom /= 255;
      bottomLeft /= 255;
      left /= 255;

      // sobel filter
      dX = topRight + 2.0 * right + bottomRight - (topLeft + 2.0 * left + bottomLeft);
      dY = bottomLeft + 2.0 * bottom + bottomRight - (bottomLeft + 2.0 * top + topRight);
      dZ = 255;

      // 凸出
      newImageDataArray[yPlus4PlusWidth + x] = dX * 255 * 0.5 + 128;
      newImageDataArray[yPlus4PlusWidth + x + 1] = dY * 255 * 0.5 + 128;
      newImageDataArray[yPlus4PlusWidth + x + 2] = dZ;
      newImageDataArray[yPlus4PlusWidth + x + 3] = 255;
    }
  }
  ctx.putImageData(newCanvasImageData, 0, 0);
  // document.body.appendChild(canvas);
}

/**
 * 翻转法线方向
 * @param {*} ctxNormal     法线ctx
 * @param {*} ctxInvertMask 翻转法线区域蒙版
 * @param {*} width         画布宽
 * @param {*} height        画布高
 */
function invertMaskNormal(ctxNormal, ctxInvertMask, width, height) {
  const normalData = ctxNormal.getImageData(0, 0, width, height);
  const invertMaskData = ctxInvertMask.getImageData(0, 0, width, height);

  const normalDataArray = normalData.data;
  const invertMaskDataArray = invertMaskData.data;

  for (let i = 0; i < normalDataArray.length; i += 4) {
    if (invertMaskDataArray[i + 3] > 0) {
      normalDataArray[i] = 255 - normalDataArray[i];
      normalDataArray[i + 1] = 255 - normalDataArray[i + 1];
    }
  }
  ctxNormal.putImageData(normalData, 0, 0);
}

/**
 * 调整金属度粗糙度
 * @param {*} ctxMetalness  金属度ctx
 * @param {*} ctxMask       蒙版ctx
 * @param {*} fixValue      修复值
 * @param {*} width         画布宽
 * @param {*} height        画布高
 */
function fixAoTuMetalnessRoughness(ctxMetalness, ctxMask, fixValue, width, height) {
  const metalnessData = ctxMetalness.getImageData(0, 0, width, height);
  const maskData = ctxMask.getImageData(0, 0, width, height);

  const metalnessDataArray = metalnessData.data;
  const maskDataArray = maskData.data;

  for (let i = 0; i < metalnessDataArray.length; i += 4) {
    if (maskDataArray[i + 3] === 255) {
      metalnessDataArray[i] = fixValue;
      metalnessDataArray[i + 1] = fixValue;
      metalnessDataArray[i + 2] = fixValue;
    }
  }
  ctxMetalness.putImageData(metalnessData, 0, 0);
}

/**
 * 设置透明度为0的像素为白色
 * @param {*} canvas 待设置画布
 */
function setOpacityZeroToWhite(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Red data[i] 0-255、Green data[i+1] 0-255、Blue data[i+2] 0-255、ALPHA data[i+3] 0-255
  const imageDataArray = imageData.data;
  for (let i = 0; i < imageDataArray.length; i += 4) {
    if (imageDataArray[i + 3] === 0) {
      imageDataArray[i] = 255;
      imageDataArray[i + 1] = 255;
      imageDataArray[i + 2] = 255;
      imageDataArray[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// function setBlackOrWhite(canvas) {
//     const ctx = canvas.getContext('2d');
//     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     // Red data[i] 0-255、Green data[i+1] 0-255、Blue data[i+2] 0-255、ALPHA data[i+3] 0-255
//     const imageDataArray = imageData.data;
//     for (let i = 0; i < imageDataArray.length; i += 4) {
//         if (imageDataArray[i + 3] > 0) {
//             imageDataArray[i] = 255;
//             imageDataArray[i + 1] = 255;
//             imageDataArray[i + 2] = 255;
//             imageDataArray[i + 3] = 255;
//         } else {
//             imageDataArray[i] = 0;
//             imageDataArray[i + 1] = 0;
//             imageDataArray[i + 2] = 0;
//             imageDataArray[i + 3] = 255;
//         }
//     }
//     ctx.putImageData(imageData, 0, 0);
// }

// 根据2D设计图，计算烫金贴图，融合烫金肌理
/**
 * 根据2D设计图，计算烫金贴图，融合烫金肌理
 * @param {*} canvasBasicColor  基础颜色画布
 * @param {*} canvasTangJin     烫金区域蒙版画布
 * @param {*} canvasSkin        烫金肌理画布
 */
function getTangJin(canvasBasicColor, canvasTangJin, canvasSkin) {
  const ctxBasicColor = canvasBasicColor.getContext('2d');
  const ctxTangJinMask = canvasTangJin.getContext('2d');
  const ctxSkin = canvasSkin.getContext('2d');

  // document.body.appendChild(canvasBasicColor);
  // document.body.appendChild(canvasTangJin);
  // document.body.appendChild(canvasSkin);

  // Red data[i] 0-255、Green data[i+1] 0-255、Blue data[i+2] 0-255、ALPHA data[i+3] 0-255
  const imageBasicColorData = ctxBasicColor.getImageData(0, 0, canvasBasicColor.width, canvasBasicColor.height);
  const imageBasicColorDataArray = imageBasicColorData.data;

  const imageTangJinMaskData = ctxTangJinMask.getImageData(0, 0, canvasTangJin.width, canvasTangJin.height);
  const imageTangJinMaskDataArray = imageTangJinMaskData.data;

  const imageSkinData = ctxSkin.getImageData(0, 0, canvasSkin.width, canvasSkin.height);
  const imageSkinDataArray = imageSkinData.data;

  // A<=0.5:C=(2*A-1)*(B-B*B)+B
  // A>0.5: C=(2*A-1)*(sqrt(B)-B)+B
  for (let i = 0; i < imageBasicColorDataArray.length; i += 4) {
    if (imageTangJinMaskDataArray[i + 3] === 255) {
      // imageBasicColorDataArray[i] = (imageBasicColorDataArray[i] + imageSkinDataArray[i]) / 2;
      // imageBasicColorDataArray[i + 1] = (imageBasicColorDataArray[i] + imageSkinDataArray[i + 1]) / 2;
      // imageBasicColorDataArray[i + 2] = (imageBasicColorDataArray[i] + imageSkinDataArray[i + 2]) / 2;
      imageBasicColorDataArray[i] = (imageBasicColorDataArray[i] * imageSkinDataArray[i]) / 255;
      imageBasicColorDataArray[i + 1] = (imageBasicColorDataArray[i] * imageSkinDataArray[i + 1]) / 255;
      imageBasicColorDataArray[i + 2] = (imageBasicColorDataArray[i] * imageSkinDataArray[i + 2]) / 255;
      imageBasicColorDataArray[i + 3] = 255;
    }
  }
  ctxBasicColor.putImageData(imageBasicColorData, 0, 0);
}

// function getTangJin(canvasBasicColor, canvasTangJin, canvasSkin) {
//
//     const ctxBasicColor = canvasBasicColor.getContext('2d');
//     const ctxTangJinMask = canvasTangJin.getContext('2d');
//     const ctxSkin = canvasSkin.getContext('2d');
//
//     // Red data[i] 0-255、Green data[i+1] 0-255、Blue data[i+2] 0-255、ALPHA data[i+3] 0-255
//     const imageBasicColorData = ctxBasicColor.getImageData(0, 0, canvasBasicColor.width, canvasBasicColor.height);
//     const imageBasicColorDataArray = imageBasicColorData.data;
//
//     const imageTangJinMaskData = ctxTangJinMask.getImageData(0, 0, canvasTangJin.width, canvasTangJin.height);
//     const imageTangJinMaskDataArray = imageTangJinMaskData.data;
//
//     const imageSkinData = ctxSkin.getImageData(0, 0, canvasSkin.width, canvasSkin.height);
//     const imageSkinDataArray = imageSkinData.data;
//
//     for (let i = 0; i < imageBasicColorDataArray.length; i += 4) {
//         if (imageTangJinMaskDataArray[i + 3] === 255) {
//             imageBasicColorDataArray[i] = (255 + imageSkinDataArray[i]) / 2;
//             imageBasicColorDataArray[i + 1] = (215 + imageSkinDataArray[i + 1]) / 2;
//             imageBasicColorDataArray[i + 2] = (53 + imageSkinDataArray[i + 2]) / 2;
//             imageBasicColorDataArray[i + 3] = 255;
//         }
//     }
//     ctxBasicColor.putImageData(imageBasicColorData, 0, 0);
// }

// function calBackgroundYaWen(canvasBasicColor, canvasYaWen, canvasMask) {
//
//     const ctxBasicColor = canvasBasicColor.getContext('2d');
//     const ctxYaWen = canvasYaWen.getContext('2d');
//     const ctxMask = canvasMask.getContext('2d');
//
//     // Red data[i] 0-255、Green data[i+1] 0-255、Blue data[i+2] 0-255、ALPHA data[i+3] 0-255
//     const imageBasicColorData = ctxBasicColor.getImageData(0, 0, canvasBasicColor.width, canvasBasicColor.height);
//     const imageBasicColorDataArray = imageBasicColorData.data;
//
//     const imageYaWenData = ctxYaWen.getImageData(0, 0, canvasYaWen.width, canvasYaWen.height);
//     const imageYaWenDataArray = imageYaWenData.data;
//
//     const imageMaskData = ctxMask.getImageData(0, 0, canvasMask.width, canvasMask.height);
//     const imageMaskDataArray = imageMaskData.data;
//
//     for (let i = 0; i < imageBasicColorDataArray.length; i += 4) {
//         if (imageMaskDataArray[i + 3] === 0) {
//             // imageBasicColorDataArray[i] = imageYaWenDataArray[i];
//             // imageBasicColorDataArray[i + 1] = imageYaWenDataArray[i + 1];
//             // imageBasicColorDataArray[i + 2] = imageYaWenDataArray[i + 2];
//             // imageBasicColorDataArray[i + 3] = 255;
//             imageBasicColorDataArray[i] = (imageBasicColorDataArray[i] + imageYaWenDataArray[i]) / 2;
//             imageBasicColorDataArray[i + 1] = (imageBasicColorDataArray[i + 1] + imageYaWenDataArray[i + 1]) / 2;
//             imageBasicColorDataArray[i + 2] = (imageBasicColorDataArray[i + 2] + imageYaWenDataArray[i + 2]) / 2;
//             imageBasicColorDataArray[i + 3] = 255;
//         }
//     }
//     ctxBasicColor.putImageData(imageBasicColorData, 0, 0);
// }

/**
 * 根据2D设计图，合并压纹
 * @param {*} canvasBasicColor  基础色画布
 * @param {*} canvasYaWen       压纹画布
 * @param {*} canvasMask        压纹工艺蒙版区域画布
 */
function calElementYaWen(canvasBasicColor, canvasYaWen, canvasMask) {
  const ctxBasicColor = canvasBasicColor.getContext('2d');
  const ctxYaWen = canvasYaWen.getContext('2d');
  const ctxMask = canvasMask.getContext('2d');

  // Red data[i] 0-255、Green data[i+1] 0-255、Blue data[i+2] 0-255、ALPHA data[i+3] 0-255
  const imageBasicColorData = ctxBasicColor.getImageData(0, 0, canvasBasicColor.width, canvasBasicColor.height);
  const imageBasicColorDataArray = imageBasicColorData.data;

  const imageYaWenData = ctxYaWen.getImageData(0, 0, canvasYaWen.width, canvasYaWen.height);
  const imageYaWenDataArray = imageYaWenData.data;

  const imageMaskData = ctxMask.getImageData(0, 0, canvasMask.width, canvasMask.height);
  const imageMaskDataArray = imageMaskData.data;

  for (let i = 0; i < imageBasicColorDataArray.length; i += 4) {
    if (imageMaskDataArray[i + 3] !== 0) {
      // imageBasicColorDataArray[i] = imageYaWenDataArray[i];
      // imageBasicColorDataArray[i + 1] = imageYaWenDataArray[i + 1];
      // imageBasicColorDataArray[i + 2] = imageYaWenDataArray[i + 2];
      // imageBasicColorDataArray[i + 3] = 255;
      imageBasicColorDataArray[i] = (imageBasicColorDataArray[i] + imageYaWenDataArray[i]) / 2;
      imageBasicColorDataArray[i + 1] = (imageBasicColorDataArray[i + 1] + imageYaWenDataArray[i + 1]) / 2;
      imageBasicColorDataArray[i + 2] = (imageBasicColorDataArray[i + 2] + imageYaWenDataArray[i + 2]) / 2;
      imageBasicColorDataArray[i + 3] = 255;
    }
  }
  ctxBasicColor.putImageData(imageBasicColorData, 0, 0);
}

/**
 * 根据2D设计工艺图，计算3D模型金属度贴图
 * @param {*} canvas    待计算工艺图
 */
function getMetalness(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Red data[i] 0-255、Green data[i+1] 0-255、Blue data[i+2] 0-255、ALPHA data[i+3] 0-255
  const imageDataArray = imageData.data;
  for (let i = 0; i < imageDataArray.length; i += 4) {
    if (imageDataArray[i] < 240) {
      imageDataArray[i] = 1;
      imageDataArray[i + 1] = 1;
      imageDataArray[i + 2] = 1;
      imageDataArray[i + 3] = 255;
    } else {
      // imageDataArray[i] = 245;
      // imageDataArray[i + 1] = 245;
      // imageDataArray[i + 2] = 245;
      // imageDataArray[i + 3] = 255;

      // 哑膜 工艺
      imageDataArray[i] = yaGuangMetalnessValue;
      imageDataArray[i + 1] = yaGuangMetalnessValue;
      imageDataArray[i + 2] = yaGuangMetalnessValue;
      imageDataArray[i + 3] = 255;

      // // 亮膜 工艺
      // imageDataArray[i] = 1;
      // imageDataArray[i + 1] = 1;
      // imageDataArray[i + 2] = 1;
      // imageDataArray[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * 根据2D设计工艺图，计算3D模型粗糙度度贴图
 * @param {*} canvas    待计算画布
 */
function getRoughness(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Red data[i] 0-255、Green data[i+1] 0-255、Blue data[i+2] 0-255、ALPHA data[i+3] 0-255
  const imageDataArray = imageData.data;
  for (let i = 0; i < imageDataArray.length; i += 4) {
    if (imageDataArray[i] < 240) {
      imageDataArray[i] = 1;
      imageDataArray[i + 1] = 1;
      imageDataArray[i + 2] = 1;
      imageDataArray[i + 3] = 255;
    } else {
      // 亮膜 哑膜
      imageDataArray[i] = yaGuangRoughnessValue;
      imageDataArray[i + 1] = yaGuangRoughnessValue;
      imageDataArray[i + 2] = yaGuangRoughnessValue;
      imageDataArray[i + 3] = 255;

      // // 亮膜 工艺
      // imageDataArray[i] = 1;
      // imageDataArray[i + 1] = 1;
      // imageDataArray[i + 2] = 1;
      // imageDataArray[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// function gray(imageData) {
//     const data = imageData.data;
//     const len = data.length;
//
//     let avg = 0;
//     for (let i = 0; i < len; i += 4) {
//         avg = 0;
//         for (let j = 0; j < 3; j++) {
//             avg += (data[i + j] / 3);
//         }
//         data[i] = data[i + 1] = data[i + 2] = avg;
//     }
//     return imageData;
// }

/**
 * 监听PC缩放事件，调整视角远近
 */
function wheelEvent(evt) {
  console.log('wheelEvent!!!!~~~~');
  if (evt.target !== document.querySelector('#playground3D')) {
    return;
  }
  if (evt.deltaY > 0 && camera.position.distanceTo(dummyTargetMesh.position) < maxWidth * 4) {
    camera.translateZ(evt.deltaY * 0.0003);
  }
  if (evt.deltaY < 0 && camera.position.distanceTo(dummyTargetMesh.position) > diagonalLineLengthHalf + 0.05) {
    camera.translateZ(evt.deltaY * 0.0003);
  }
  evt.preventDefault();
}
export function onWheelEvent() {
  window.addEventListener('wheel', wheelEvent, { passive: false });
}

export function unWheelEvent() {
  window.removeEventListener('wheel', wheelEvent);
}

/**
 * 监听按键按下事件
 */
document.addEventListener('keydown', (e) => {
  // angleRotYAngle = camera.position.clone().angleTo(vectorUp);
  // // console.log(angleRotYAngle)
  //
  // if (e.key === 'a') {
  //     rotateAroundWorldAxis(camera, new THREE.Vector3(0, 1, 0), 0.1);
  // }
  // if (e.key === 'd') {
  //     rotateAroundWorldAxis(camera, new THREE.Vector3(0, 1, 0), -0.1);
  // }
  // if (e.key === 'w') {
  //     if (angleRotYAngle < 3) {
  //         rotateAroundWorldAxis(camera, camera.position.clone().cross(vectorUp).normalize(), -0.1);
  //     }
  // }
  // if (e.key === 's') {
  //     if (angleRotYAngle > 0.1) {
  //         rotateAroundWorldAxis(camera, camera.position.clone().cross(vectorUp).normalize(), 0.1);
  //     }
  // }

  if (e.key === 'f') {
    // const tt = scene.getObjectByName("选面-顶面").translateZ(0.2);
    // resetAnimation();
  }

  // camera.lookAt(dummyTargetMesh.position);
});

/**
 * 监听窗口大小变化事件，重新设置窗口大小
 */
// window.addEventListener('resize', () => {
//   // posScaleFactor = maxWidth * (container3D.clientHeight / container3D.clientWidth);
//   // camera.position.set(0, posScaleFactor > maxWidth ? posScaleFactor : maxWidth, 0.01);

// })

export function resize() {
  autoAdjustCameraPos();
  resizePreview3D();
}

/**
 * 重置3D视图大小变化
 */
function resizePreview3D() {
  if (!container3D) {
    return;
  }
  camera.aspect = container3D.clientWidth / container3D.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container3D.clientWidth, container3D.clientHeight);
}

// function animate() {
//     requestAnimationFrame(animate);
//
//     if (useLoaded().showView === "2d") { return }
//
//     // if (controls) {
//     //     controls.update();
//     // }
//     if (renderer) {
//         renderer.render(scene, camera);
//     }
//
//     if ( q1.angleTo( q2 ) > 0.02) {
//         q1.rotateTowards( q2, 0.2 );
//         // camera.position.set( 0, 0, 0.5 ).applyQuaternion( q1 )
//         camera.position.set( 0, 0, maxWidth * 2 ).applyQuaternion( q1 )
//         // camera.position.set( 0, 0, camera.position.distanceTo( dummyTargetMesh.position )).applyQuaternion( q1 );
//         camera.quaternion.rotateTowards( q2, 0.2);
//     }
//     else {
//         isAutoRotFinish = true;
//     }
//
//     if (mixer) {
//         mixer.update( 0.1 );
//     }
//
//     // if (composerAllInOne) {
//     //     composerAllInOne.render();
//     // }
//
//     // TWEEN.update();
// }

let preContainerHeight = 0;
let preView = '',
  curView = '';
let posScaleFactor = 0;

/**
 * 根据包装盒大小智能调整相机位置
 */
function autoAdjustCameraPos() {
  // camera.position.set(0.22, 0.15, -0.24);
  // camera.position.set(-maxWidth * 1.3, maxHeight * 1.6, maxWidth * 1.3);
  // camera.position.set(0, maxWidth * 2, 0.01);
  if (!container3D || !container3D.clientWidth) {
    return;
  }
  posScaleFactor = (container3D.clientHeight / container3D.clientWidth) * 0.56;
  // camera.position.set(0, posScaleFactor > maxWidth ? posScaleFactor : maxWidth, 0.01);
  // camera.position.set(-maxWidth * 1.1, maxHeight * 5, maxWidth * 1.1);
  const finalWidth =
    maxWidth * posScaleFactor > diagonalLineLengthHalf ? maxWidth * posScaleFactor : diagonalLineLengthHalf;
  // const finalWidth = maxWidth * posScaleFactor;
  // camera.position.set(-finalWidth, maxHeight * 2, finalWidth);
  camera.position.set(-finalWidth - 0.02, 0.1, finalWidth * 2.5);

  // camera.position.set(-maxWidth - 0.02, 0.14, maxWidth * 1.5);

  camera.lookAt(new THREE.Vector3(0, 0, 0));
}

// let deltaTime = 0;
// const clock= new THREE.Clock();

/**
 * 3D渲染帧循环
 */
function animate() {
  requestAnimationFrame(animate);

  preView = curView;

  // if (useLoaded().showView === "2d") {
  //     curView = '2d';
  //     return;
  // }
  // if (useLoaded().showView === "3d") {
  //     curView = '3d';
  // }

  if (preView !== curView) {
    autoAdjustCameraPos();
    resetAnimation();
  }

  if (container3D && container3D.clientHeight !== preContainerHeight) {
    resizePreview3D();
  }
  preContainerHeight = container3D.clientHeight;

  // deltaTime = clock.getDelta();

  // if (controls) {
  //     controls.update();
  // }
  if (renderer) {
    renderer.render(scene, camera);
  }

  if (q1.angleTo(q2) > 0.02) {
    q1.rotateTowards(q2, 0.2);
    // camera.position.set( 0, 0, 0.5 ).applyQuaternion( q1 )
    camera.position.set(0, 0, maxWidth * 1.5).applyQuaternion(q1);
    // camera.position.set( 0, 0, camera.position.distanceTo( dummyTargetMesh.position )).applyQuaternion( q1 );
    camera.quaternion.rotateTowards(q2, 0.2);
  } else {
    isAutoRotFinish = true;
  }

  if (mixer) {
    mixer.update(0.1);
  }

  // if (composerAllInOne) {
  //     composerAllInOne.render();
  // }

  // TWEEN.update();
}

export {
  init3D,
  calc3DTextures,
  capture3DThumbnail,
  resizePreview3D,
  choseSelect,
  rayCastSelect,
  openAnimation,
  closeAnimation,
  releaseAll3DResources,
};
