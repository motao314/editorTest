function calculateMaxWidthAndHeight(childrens) {
  const maxWidthNode = childrens.sort(function (a, b) {
    return a.width() < b.width();
  })[0];
  const maxHeightNode = childrens.sort(function (a, b) {
    return a.height() < b.height();
  })[0];
  return {
    maxWidthNode,
    maxHeightNode,
  };
}

/*
    单图层对齐：
        alignLayerX 水平方向与画布对齐方式：left、xCenter、top
        alignLayerY 垂直方向与画布对齐方式：top、yCenter、bottom
*/

export default class AlignmentLayout {
  constructor(options) {
    this.container = options.playground;
  }

  /**
   * 多图层相对对齐
   * @param nodes  图层
   * @param type  左对齐left，水平居中xCenter，右对齐right，顶对齐top，垂直居中yCenter，底对齐bottom
   */
  nodesAlgin(nodes, type) {
    // todo x y 计算
    switch (type) {
      case 'left':
        this.multipleNodeLeftAlignment(nodes);
        break;
      case 'xCenter':
        this.multipleNodeLevelCenter(nodes);
        break;
      case 'right':
        this.multipleNodeRightAlignment(nodes);
        break;
      case 'top':
        this.multipleNodeTopAlignment(nodes);
        break;
      case 'yCenter':
        this.multipleNodeVerticalCenter(nodes);
        break;
      case 'bottom':
        this.multipleNodeBottomAlignment(nodes);
        break;
    }
    this.container.fire('attrsChange', {
      type: 'nodesAlign',
      target: nodes,
      nodes: this.container.nodeElements,
    });
  }

  /**
   * 图层相对刀版图对齐
   * @param nodes  图层
   * @param type  左对齐left，水平居中xCenter，右对齐right，顶对齐top，垂直居中yCenter，底对齐bottom
   */
  nodeAlginToLayer(node, type) {
    if (!node) {
      // console.error('没有选中图层');
      return;
    }
    // todo x y 计算
    switch (type) {
      case 'left':
        this.singleNodeLeftAlignment(node);
        break;
      case 'xCenter':
        this.singleNodeLevelCenter(node);
        break;
      case 'right':
        this.singleNodeRightAlignment(node);
        break;
      case 'top':
        this.singleNodeTopAlignment(node);
        break;
      case 'yCenter':
        this.singleNodeVerticalCenter(node);
        break;
      case 'bottom':
        this.singleNodeBottomAlignment(node);
        break;
    }
    this.container.fire('attrsChange', {
      type: 'nodesAlign',
      target: [node],
      nodes: this.container.nodeElements,
    });
  }
  /**
   * 获取当前刀版宽高
   */
  getLayerRect() {
    const stage = this.container.getStage();
    const playId = stage.currentPlayId;
    const { width, height } = playId ? stage._stageInfo.playInfoMap[playId] : stage._stageInfo.actualSize;
    return { width, height };
  }
  /**
   * 获取元素相对于刀版的 rect
   */
  getNodeRect(node) {
    const stage = this.container.getStage();
    const playId = node.attrs.parentPlayId;
    const { width, height, originPoint } = stage._stageInfo.playInfoMap[playId];
    let rect = node.getClientRect({ relativeTo: this.container });
    rect.x = rect.x - originPoint.x;
    return rect;
  }
  /**
   * 单图层左对齐
   * @param id
   */
  singleNodeLeftAlignment(node) {
    if (!node) return;
    const { x } = this.getNodeRect(node);
    this.getNodeRect(node);
    const offsetXDistance = node.x() - x;
    node.x(offsetXDistance);
  }
  /**
   * 单图层水平居中
   * @param id
   */
  singleNodeLevelCenter(node) {
    if (!node) return;
    const { x, width } = this.getNodeRect(node);
    const { width: bgWidth } = this.getLayerRect();
    const offsetXDistance = node.x() - (x + width / 2 - bgWidth / 2);
    node.x(offsetXDistance);
  }
  /**
   * 单图层右对齐
   * @param id
   */
  singleNodeRightAlignment(node) {
    if (!node) return;
    const { x, width } = this.getNodeRect(node);
    const { width: bgWidth } = this.getLayerRect();
    const offsetXDistance = node.x() - (x + width - bgWidth);
    node.x(offsetXDistance);
  }

  /**
   * 单图层顶对齐
   * @param id
   */
  singleNodeTopAlignment(node) {
    if (!node) return;
    const { y } = this.getNodeRect(node);
    const offsetYDistance = node.y() - y;
    node.y(offsetYDistance);
  }

  /**
   * 单图层垂直居中
   * @param id
   */
  singleNodeVerticalCenter(node) {
    if (!node) return;
    const { y, height } = this.getNodeRect(node);
    const { height: bgHeight } = this.getLayerRect();
    const offsetYDistance = node.y() - (y + height / 2 - bgHeight / 2);
    node.y(offsetYDistance);
  }

  /**
   * 单图层底对齐
   * @param id
   */
  singleNodeBottomAlignment(node) {
    if (!node) return;
    const { y, height } = this.getNodeRect(node);
    const { height: bgHeight } = this.getLayerRect();
    const offsetYDistance = node.y() - (y + height - bgHeight);
    node.y(offsetYDistance);
  }

  /**
   * 多图层左对齐
   */
  multipleNodeLeftAlignment(selectedNodes) {
    let minX = Infinity;
    const attrs = [];
    selectedNodes.forEach((node) => {
      const attr = this.getNodeRect(node);
      minX = Math.min(minX, attr.x);
      attrs.push(attr);
    });
    minX = minX < 0 ? 0 : minX;
    selectedNodes.forEach((node, index) => {
      const offsetXDistance = node.x() - (attrs[index].x - minX);
      node.x(offsetXDistance);
    });
  }

  /**
   * 多图层水平居中
   */
  multipleNodeLevelCenter(selectedNodes) {
    let minX = Infinity;
    let maxX = 0;
    const attrs = [];
    let centerX = 0;
    selectedNodes.forEach((node) => {
      const attr = this.getNodeRect(node);
      minX = Math.min(minX, attr.x);
      maxX = Math.max(maxX, attr.x + attr.width);
      attrs.push(attr);
    });
    centerX = minX + (maxX - minX) / 2;
    selectedNodes.forEach((node, index) => {
      const offsetXDistance = node.x() - (attrs[index].x + attrs[index].width / 2 - centerX);
      node.x(offsetXDistance);
    });
  }

  /**
   * 多图层右对齐
   */
  multipleNodeRightAlignment(selectedNodes) {
    let maxX = 0;
    const attrs = [];
    const { width: bgWidth } = this.getLayerRect();
    selectedNodes.forEach((node) => {
      const attr = this.getNodeRect(node);
      maxX = Math.max(maxX, attr.x + attr.width);
      attrs.push(attr);
    });
    maxX = maxX > bgWidth ? bgWidth : maxX;
    selectedNodes.forEach((node, index) => {
      const offsetXDistance = node.x() - (attrs[index].x + attrs[index].width - maxX);
      node.x(offsetXDistance);
    });
  }

  /**
   * 多图层垂直居中
   */
  multipleNodeVerticalCenter(selectedNodes) {
    let minY = Infinity;
    let maxY = 0;
    const attrs = [];
    let centerY = 0;
    selectedNodes.forEach((node) => {
      const attr = this.getNodeRect(node);
      minY = Math.min(minY, attr.y);
      maxY = Math.max(maxY, attr.y + attr.height);
      attrs.push(attr);
    });
    centerY = minY + (maxY - minY) / 2;
    selectedNodes.forEach((node, index) => {
      const offsetYDistance = node.y() - (attrs[index].y + attrs[index].height / 2 - centerY);
      node.y(offsetYDistance);
    });
  }

  /**
   * 多图层顶对齐
   */
  multipleNodeTopAlignment(selectedNodes) {
    let minY = Infinity;
    const attrs = [];
    selectedNodes.forEach((node) => {
      const attr = this.getNodeRect(node);
      minY = Math.min(minY, attr.y);
      attrs.push(attr);
    });
    minY = minY < 0 ? 0 : minY;
    selectedNodes.forEach((node, index) => {
      const offsetYDistance = node.y() - (attrs[index].y - minY);
      node.y(offsetYDistance);
    });
  }

  /**
   * 多图层底对齐
   */
  multipleNodeBottomAlignment(selectedNodes) {
    let maxY = 0;
    const attrs = [];
    const { height: bgHeight } = this.getLayerRect();
    selectedNodes.forEach((node) => {
      const attr = this.getNodeRect(node);
      maxY = Math.max(maxY, attr.y + attr.height);
      attrs.push(attr);
    });
    maxY = maxY > bgHeight ? bgHeight : maxY;
    selectedNodes.forEach((node, index) => {
      const offsetYDistance = node.y() - (attrs[index].y + attrs[index].height - maxY);
      node.y(offsetYDistance);
    });
  }

  /**
   * 判断是否单图层水平对齐
   */
  isNodeXAligen(node) {
    if (!node) return false;
    const { x, width } = this.getNodeRect(node);
    const { width: bgWidth } = this.getLayerRect();
    if (x === 0) {
      return 'left';
    }
    if (x + width / 2 === bgWidth / 2) {
      return 'xCenter';
    }
    if (x + width === bgWidth) {
      return 'right';
    }
  }

  /**
   * 判断是否单图层垂直对齐
   */
  isNodeYAligen(node) {
    if (!node) return false;
    const { y, height } = this.getNodeRect(node);
    const { height: bgHeight } = this.getLayerRect();
    if (y === 0) {
      return 'top';
    }
    if (y + height / 2 === bgHeight / 2) {
      return 'yCenter';
    }
    if (y + height === bgHeight) {
      return 'bottom';
    }
  }

  /**
   * 判断是否多图层水平对齐方式
   */
  isMultipleNodeXAlignment(selectedNodes) {
    let minX = Infinity;
    let maxX = 0;
    let centerX = 0;
    const attrs = [];
    selectedNodes.forEach((node) => {
      const attr = this.getNodeRect(node);
      minX = Math.min(minX, attr.x);
      maxX = Math.max(maxX, attr.x + attr.width);
      attrs.push(attr);
    });
    centerX = minX + (maxX - minX) / 2;
    let isLeft = true;
    let isCenter = true;
    let isRight = true;
    attrs.forEach((attr) => {
      if (attr.x !== minX) {
        isLeft = false;
      }
      if (attr.x + attr.width !== maxX) {
        isRight = false;
      }
      if (attr.x + attr.width / 2 !== centerX) {
        isCenter = false;
      }
    });
    if (isLeft) return 'left';
    if (isCenter) return 'xCenter';
    if (isRight) return 'right';
    return false;
  }

  /**
   * 判断是否多图层垂直对齐方式
   */
  isMultipleNodeYAlignment(selectedNodes) {
    let minY = Infinity;
    let maxY = 0;
    const attrs = [];
    let centerY = 0;
    selectedNodes.forEach((node) => {
      const attr = this.getNodeRect(node);
      minY = Math.min(minY, attr.y);
      maxY = Math.max(maxY, attr.y + attr.height);
      attrs.push(attr);
    });
    centerY = minY + (maxY - minY) / 2;
    let isTop = true;
    let isCenter = true;
    let isBottom = true;
    console.log(selectedNodes);
    attrs.forEach((attr) => {
      console.log(attr.y, minY);
      if (attr.y !== minY) {
        isTop = false;
      }
      if (attr.y + attr.height !== maxY) {
        isBottom = false;
      }
      if (attr.y + attr.height / 2 !== centerY) {
        isCenter = false;
      }
    });
    if (isTop) return 'top';
    if (isCenter) return 'yCenter';
    if (isBottom) return 'bottom';
    return false;
  }
}
