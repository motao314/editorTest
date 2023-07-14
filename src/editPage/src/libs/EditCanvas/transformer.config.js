/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2022-10-12 15:33:10
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-20 15:37:49
 * @FilePath: /project-20220906-xiaoxiang/src/XXEditor/src/utils/transformer.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AEE
 */
import XXCanvas from '../xxCanvas/index';
import removeIcon from './iconImg/removeIcon.png';
import scaleIcon from './iconImg/scaleIcon.png';
import rotateIcon from './iconImg/rotateIcon.png';
import suoding from './iconImg/suoding.png';
function suoDing() {
  const suodingIcon = new Image();
  suodingIcon.src = suoding;
  const node = new XXCanvas.Image({
    name: 'top-right _anchor custom',
    draggable: false,
    image: suodingIcon,
    width: 25,
    height: 25,
  });
  return node;
}
/**
 * @description: 生成删除快捷操作按钮
 * @return {*}
 */
function topLeft() {
  const topLeftIcon = new Image();
  topLeftIcon.src = removeIcon;
  const node = new XXCanvas.Image({
    name: 'top-left _anchor custom',
    draggable: false,
    image: topLeftIcon,
    width: 25,
    height: 25,
  });
  const topLeftNode = {
    node,
    setEvent(tr, layer) {
      node.on('mousedown', (e) => {
        try {
          e.cancelBubble = true;
          const nodes = tr.nodes();
          tr.nodes([]);
          tr.destroy();
          nodes.forEach((node) => {
            layer.selectNodes = layer.selectNodes.filter((item) => {
              return item.id() !== node.id();
            });
            node.destroy();
          });
          layer.fire('nodesChange', {
            typeName: 'delete',
            target: nodes,
            nodes: layer.nodeElements,
          });
          layer.getStage().content.style.cursor = 'default';
        } catch (err) {}
      });
    },
  };
  return topLeftNode;
}
/**
 * @description: 生成旋转快捷操作按钮
 * @return {*}
 */
function rotater() {
  const rotaterIcon = new Image();
  rotaterIcon.src = rotateIcon;
  const rotaterNode = new XXCanvas.Image({
    name: 'rotater _anchor custom',
    draggable: false,
    image: rotaterIcon,
    width: 25,
    height: 25,
  });
  return rotaterNode;
}
/**
 * @description: 生成缩放快捷操作按钮
 * @return {*}
 */
function bottomRight() {
  const bottomRightIcon = new Image();
  bottomRightIcon.src = scaleIcon;
  const bottomRightNode = new XXCanvas.Image({
    name: 'bottom-right _anchor custom',
    draggable: false,
    image: bottomRightIcon,
    width: 25,
    height: 25,
  });

  return bottomRightNode;
}
/**
 * @description: 四个方向的小快捷操作按钮生成
 * @param {*} name 按钮名称（方向）
 * @return {*}
 */
function icon(name) {
  const icon = new XXCanvas.Circle({
    name: `${name} _anchor custom`,
    radius: 3,
    stroke: '#EB0C0C',
    strokeWidth: 1,
    fill: '#ffffff',
  });
  return icon;
}

/**
 * @description: 元素选框
 * @param {*} layer
 * @param {*} targetNodes 旋转元素
 * @param {*} dash 实现还是虚线，[] 实线、[2,2]虚线
 * @return {*}
 */
export function elNormalTransformer(layer, targetNodes, dash = []) {
  const nodes = Array.isArray(targetNodes) ? targetNodes : [targetNodes];
  if (nodes[0].className === 'Text') {
    return textTransformer(layer, targetNodes, dash);
  }
  return shapTransformer(layer, targetNodes, dash);
}
/**
 * @description: 单元素锁定状态选框
 * @param {*} layer
 * @param {*} targetNodes
 * @return {Object} Transformer 当前选框
 */
export function elTopLockTransformer(layer, targetNodes) {
  const nodes = Array.isArray(targetNodes) ? targetNodes : [targetNodes];
  const tr = new XXCanvas.Transformer({
    enabledAnchors: [
      {
        name: 'top-right',
        content: suoDing(),
        size: {
          width: 25,
          height: 25,
        },
      },
    ],
    borderStroke: '#EB0C0C',
    borderStrokeWidth: 1,
    borderDash: [2, 2],
    flipEnabled: false,
    resizeEnabled: false,
    rotateEnabled: false,
    padding: 2,
  });
  layer.add(tr);
  tr.nodes(nodes);
  return tr;
}
/**
 * @description: 多选状态，每个元素的选框
 * @param {*} layer
 * @param {*} targetNodes
 * @return {Array} Transformers
 */
export function elsNormalTransformer(layer, targetNodes) {
  const nodes = Array.isArray(targetNodes) ? targetNodes : [targetNodes];
  const trs = nodes.map((node) => {
    return setGroupTransformer(layer, node);
  });
  return trs;
}

/**
 * @description: 成组时，在整个组的外轮廓加选框
 * @param {*} layer
 * @param {*} targetNodes
 * @return {*} Transformer
 */
export function setGroupTransformer(layer, targetNodes, draggable = false) {
  const nodes = Array.isArray(targetNodes) ? targetNodes : [targetNodes];
  const tr = new XXCanvas.Transformer({
    enabledAnchors: [],
    borderStroke: '#EB0C0C',
    borderStrokeWidth: 1,
    draggable: false,
    flipEnabled: false,
    resizeEnabled: false,
    rotateEnabled: false,
    padding: 2,
    // dragDistance: 0
    /* boundBoxFunc(res){
            //console.log(res);
        } */
  });
  layer.add(tr);
  tr.nodes(nodes);
  return tr;
}

/**
 * @description: 组内元素被选中时，组的选框及选中元素选框
 * @param {*} layer
 * @param {*} group 组
 * @param {*} targetNodes 选中元素
 * @return {Object} {group:组的选框,el:选中元素选框}
 */
export function groupElTransformer(layer, group, targetNodes) {
  if (!targetNodes) {
    return setGroupTransformer(layer, group);
  }
  const groupTransformer = shapTransformer(layer, group, [6, 4], targetNodes);
  const childBack = new XXCanvas.Rect({
    ...targetNodes.attrs,
    listening: false,
  });
  childBack.name('Transformer');
  childBack.opacity(1);
  childBack.fill('');
  childBack.stroke('#EB0C0C');
  childBack.target = targetNodes;
  group.add(childBack);
  let scale = childBack.getAbsoluteScale();
  // let layerScale = layer.getAbsoluteScale().x;
  scale = Math.max(scale.x, scale.y);
  childBack.strokeWidth(1 / scale);
  childBack.zIndex(group.children.length - 1);
  groupTransformer.update();
  groupTransformer.target = targetNodes;

  function toScale() {
    let scale = childBack.getAbsoluteScale();
    scale = Math.max(scale.x, scale.y);
    childBack.strokeWidth(1 / scale);
  }
  layer.off('scaleChange.select');
  layer.on('scaleChange.select', toScale);
  group.off('transform.transformer');
  group.on('transform.transformer', toScale);

  // console.log(groupTransformer.zIndex());
  return groupTransformer;
}

/**
 * @description: 元素默认选区 (出文字之外的图形)
 * @param {*} layer 所在图层
 * @param {*} targetNodes 要添加选区的元素
 * @return {Object} Transformer 选区对象
 */
export function shapTransformer(layer, targetNodes, dash = [], child = null) {
  const nodes = Array.isArray(targetNodes) ? targetNodes : [targetNodes];
  const topLeftNode = topLeft();
  const tr = new XXCanvas.Transformer({
    enabledAnchors: [
      {
        name: 'top-left',
        content: topLeftNode.node,
        size: {
          width: 25,
          height: 25,
        },
      },
      {
        name: 'top-center',
        content: icon('top-center'),
        size: {
          width: 8,
          height: 8,
        },
      },
      {
        name: 'middle-right',
        content: icon('middle-right'),
        size: {
          width: 8,
          height: 8,
        },
      },
      {
        name: 'middle-left',
        content: icon('middle-left'),
        size: {
          width: 8,
          height: 8,
        },
      },
      {
        name: 'bottom-center',
        content: icon('bottom-center'),
        size: {
          width: 8,
          height: 8,
        },
      },
      {
        name: 'bottom-right',
        content: bottomRight(),
        size: {
          width: 25,
          height: 25,
        },
      },
      {
        name: 'rotater',
        content: rotater(),
        size: {
          width: 25,
          height: 25,
        },
      },
    ],
    borderStroke: '#EB0C0C',
    borderStrokeWidth: 1,
    draggable: false,
    flipEnabled: false,
    borderDash: dash,
    padding: 2,
  });
  tr.child = child;
  layer.add(tr);
  tr.nodes(nodes);
  topLeftNode.setEvent(tr, layer);
  return tr;
}
/**
 * @description: 元素默认选区 (文字)
 * @param {*} layer 所在图层
 * @param {*} targetNodes 要添加选区的元素
 * @return {Object} Transformer 选区对象
 */
function textTransformer(layer, targetNodes, dash = []) {
  const nodes = Array.isArray(targetNodes) ? targetNodes : [targetNodes];
  const topLeftNode = topLeft();
  const enabledAnchors = () => {
    let enabledAnchors;
    if (targetNodes.writeMode() !== 'horizontal') {
      enabledAnchors = [
        {
          name: 'top-left',
          content: topLeftNode.node,
          size: {
            width: 25,
            height: 25,
          },
        },
        {
          name: 'top-center',
          content: icon('top-center'),
          size: {
            width: 8,
            height: 8,
          },
        },
        {
          name: 'bottom-center',
          content: icon('bottom-center'),
          size: {
            width: 8,
            height: 8,
          },
        },
        {
          name: 'bottom-right',
          content: bottomRight(),
          size: {
            width: 25,
            height: 25,
          },
        },
        {
          name: 'rotater',
          content: rotater(),
          size: {
            width: 25,
            height: 25,
          },
        },
      ];
    } else {
      enabledAnchors = [
        {
          name: 'top-left',
          content: topLeftNode.node,
          size: {
            width: 25,
            height: 25,
          },
        },
        {
          name: 'middle-right',
          content: icon('middle-right'),
          size: {
            width: 8,
            height: 8,
          },
        },
        {
          name: 'middle-left',
          content: icon('middle-left'),
          size: {
            width: 8,
            height: 8,
          },
        },
        {
          name: 'bottom-right',
          content: bottomRight(),
          size: {
            width: 25,
            height: 25,
          },
        },
        {
          name: 'rotater',
          content: rotater(),
          size: {
            width: 25,
            height: 25,
          },
        },
      ];
    }
    return enabledAnchors;
  };
  // let oldSize = targetNodes.fontSize();
  const tr = new XXCanvas.TextTransformer({
    enabledAnchors: enabledAnchors(),
    borderStroke: '#EB0C0C',
    borderStrokeWidth: 1,
    draggable: false,
    flipEnabled: false,
    borderDash: dash,
    padding: 2,
    // dragDistance: 0,
    boundBoxFunc(oldBox, newBox) {
      const scale = nodes[0].getAbsoluteScale();
      if (tr._movingAnchorName === 'top-center' || tr._movingAnchorName === 'bottom-center') {
        // 获取最小高度
        if (targetNodes?._minHeight && nodes[0]._minHeight * scale.y > newBox.height) {
          return oldBox;
        }
      } else if (tr._movingAnchorName === 'middle-left' || tr._movingAnchorName === 'middle-right') {
        // 最小宽度
        if (nodes[0]?._minWidth && nodes[0]._minWidth * scale.x > newBox.width) {
          return oldBox;
        }
      } else if (tr._movingAnchorName === 'bottom-right') {
        let { scaleX, fontSize } = nodes[0].attrs;
        let newFontSize = fontSize * scaleX;
        if (newFontSize < 9 || newFontSize > 500) {
          return oldBox;
        }
      }
      return newBox;
    },
  });
  targetNodes.off('transform.textTransformer');
  targetNodes.on('transform.textTransformer', () => {
    const node = tr._nodes[0];
    let { x, y, width, height, scaleX, scaleY, fontSize } = node.attrs;
    if (tr._movingAnchorName === 'top-center') {
      //高度修改(需要对top进行修正)
      let nowScaleY = scaleY / scaleX;
      let newHeight = height * nowScaleY;
      scaleY = scaleX;
      node.setAttrs({
        height: newHeight,
        scaleY: scaleY,
      });
      if (newHeight !== node.height()) {
        let disH = node.height() - newHeight;
        node.y(y - disH);
      }
    } else if (tr._movingAnchorName === 'bottom-center') {
      //高度修改
      let nowScaleY = scaleY / scaleX;
      height = height * nowScaleY;
      scaleY = scaleX;
      node.setAttrs({
        height,
        scaleY,
      });
    } else if (tr._movingAnchorName === 'middle-left') {
      // 宽度修改需要对x进行修正
      let nowScaleX = scaleX / scaleY;
      let newWidth = width * nowScaleX;
      scaleX = scaleY;
      node.setAttrs({
        width: newWidth,
        scaleX: scaleX,
      });
      if (newWidth !== node.width()) {
        let disW = node.width() - newWidth;
        node.x(x - disW);
      }
    } else if (tr._movingAnchorName === 'middle-right') {
      // 宽度修改
      let nowScaleX = scaleX / scaleY;
      width = width * nowScaleX;
      scaleX = scaleY;
      node.setAttrs({
        width,
        scaleX,
      });
    } else if (tr._movingAnchorName === 'bottom-right') {
      let newFontSize = Math.round(fontSize * scaleX);
      newFontSize = Math.min(newFontSize, 500);
      newFontSize = Math.max(newFontSize, 9);
      let newScale = newFontSize / fontSize;
      let newWidth = width * newScale;
      let newHeight = height * newScale;
      node.setAttrs({
        fontSize: newFontSize,
        scaleX: 1,
        scaleY: 1,
        width: newWidth,
        height: newHeight,
      });
    }
  });
  layer.add(tr);
  tr.nodes(nodes);
  topLeftNode.setEvent(tr, layer);

  return tr;
}

/**
 * @description: hover的边框
 * @param {*} layer 所在图层
 * @param {*} targetNodes 要添加选区的元素
 * @return {Object} Transformer 选区对象
 */
export function elBorder(layer, targetNodes) {
  const nodes = Array.isArray(targetNodes) ? targetNodes : [targetNodes];
  const tr = new XXCanvas.Transformer({
    enabledAnchors: [],
    borderStroke: '#EB0C0C',
    borderStrokeWidth: 1,
    borderDash: [1, 1],
    flipEnabled: false,
    resizeEnabled: false,
    rotateEnabled: false,
    padding: 1,
    name: 'border',
    listening: false,
  });
  layer.add(tr);
  tr.nodes(nodes);
  nodes[0].tr = tr;
  return tr;
}
