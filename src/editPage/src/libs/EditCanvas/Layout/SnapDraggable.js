import XXCanvas from '../../xxCanvas/index';
const GUIDELINE_OFFSET = 5;
import lodash from 'lodash';

// 排除拖动的元素本身以及他包含的元素
function diffNode(guideItem, skipShape) {
  //const nodes = skipShape;
  return guideItem === skipShape || guideItem.parent === skipShape;
}

export default function SnapDraggable() {
  const stage = this.getStage();
  const container = this.getLayer();
  // 获取对齐时的所有参照线
  function getLineGuideStops(skipShape) {
    // we can snap to stage borders and the center of the stage
    // 获取画布的中心点
    const vertical = [0, stage.width() / 2, stage.width()];
    const horizontal = [0, stage.height() / 2, stage.height()];
    // and we snap over edges and center of each object on the canvas
    const nodes = [stage.find('.cover'), stage.find('.node')];
    nodes.flat(Infinity).forEach((guideItem) => {
      if (diffNode(guideItem, skipShape)) {
        return;
      }
      // 获取对比元素
      const box = guideItem.getClientRect();
      // 将对比元素添加到对比数组中 [left,right,center]
      // and we can snap to all edges of shapes
      vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
      // [top,bottom,center]
      horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
    });

    return {
      vertical: vertical.flat(),
      horizontal: horizontal.flat(),
    };
  }

  // what points of the object will trigger to snapping?
  // 对象的哪些点将触发捕捉
  // it can be just center of the object
  // 它可以只是物体的中心
  // but we will enable all edges and center
  // 但我们将启用所有边缘和中心

  // 获取指定元素的相关参照坐标
  function getObjectSnappingEdges(node) {
    const box = node.getClientRect();
    // 获取相对canvas 的绝对坐标
    const absPos = node.absolutePosition();
    // box
    return {
      vertical: [
        {
          guide: Math.round(box.x),
          offset: Math.round(absPos.x - box.x),
          snap: 'start',
        },
        {
          guide: Math.round(box.x + box.width / 2),
          offset: Math.round(absPos.x - box.x - box.width / 2),
          snap: 'center',
        },
        {
          guide: Math.round(box.x + box.width),
          offset: Math.round(absPos.x - box.x - box.width),
          snap: 'end',
        },
      ],
      horizontal: [
        {
          guide: Math.round(box.y),
          offset: Math.round(absPos.y - box.y),
          snap: 'start',
        },
        {
          guide: Math.round(box.y + box.height / 2),
          offset: Math.round(absPos.y - box.y - box.height / 2),
          snap: 'center',
        },
        {
          guide: Math.round(box.y + box.height),
          offset: Math.round(absPos.y - box.y - box.height),
          snap: 'end',
        },
      ],
    };
  }

  // find all snapping possibilities
  // 找到所有捕捉可能性
  function getGuides(lineGuideStops, itemBounds) {
    const resultV = [];
    const resultH = [];

    lineGuideStops.vertical.forEach((lineGuide) => {
      itemBounds.vertical.forEach((itemBound) => {
        const diff = Math.abs(lineGuide - itemBound.guide);
        // if the distance between guild line and object snap point is close we can consider this for snapping
        if (diff < GUIDELINE_OFFSET) {
          resultV.push({
            lineGuide: lineGuide,
            diff: diff,
            snap: itemBound.snap,
            offset: itemBound.offset,
          });
        }
      });
    });

    lineGuideStops.horizontal.forEach((lineGuide) => {
      itemBounds.horizontal.forEach((itemBound) => {
        const diff = Math.abs(lineGuide - itemBound.guide);
        if (diff < GUIDELINE_OFFSET) {
          resultH.push({
            lineGuide: lineGuide,
            diff: diff,
            snap: itemBound.snap,
            offset: itemBound.offset,
          });
        }
      });
    });

    const guides = [];

    // find closest snap
    const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
    const minH = resultH.sort((a, b) => a.diff - b.diff)[0];
    if (minV) {
      guides.push({
        lineGuide: minV.lineGuide,
        offset: minV.offset,
        orientation: 'V',
        snap: minV.snap,
      });
    }
    if (minH) {
      guides.push({
        lineGuide: minH.lineGuide,
        offset: minH.offset,
        orientation: 'H',
        snap: minH.snap,
      });
    }
    return guides;
  }

  function drawGuides(guides) {
    const strokeWidth = 1 / container.scale().x;
    guides.forEach((lg) => {
      // 90度或者270度 h 代表垂直线
      let points;
      if (container.deg === 90 || container.deg === 270) {
        points = [0, -6000, 0, 6000];
      } else {
        points = [-6000, 0, 6000, 0];
      }
      if (lg.orientation === 'H') {
        const line = new XXCanvas.Line({
          points,
          name: 'guid-line',
          stroke: '#FD4F00',
          strokeWidth: strokeWidth,
        });
        container.add(line);
        let offsetX, offsetY;
        let scale = container.scaleX();
        if (container.deg === 90) {
          let layerPos = container.absolutePosition();
          offsetX = (lg.lineGuide - layerPos.y) / scale;
          offsetY = 0;
        } else if (container.deg === 180) {
          let layerPos = container.absolutePosition();
          offsetX = 0;
          offsetY = (layerPos.y - lg.lineGuide) / scale;
        } else if (container.deg === 270) {
          let layerPos = container.absolutePosition();
          offsetX = (layerPos.y - lg.lineGuide) / scale;
          offsetY = 0;
        } else {
          let layerPos = container.absolutePosition();
          offsetX = -layerPos.x;
          offsetY = (lg.lineGuide - layerPos.y) / scale;
        }
        line.setAttrs({
          x: offsetX,
          y: offsetY,
        });
        // 90度或者180度 v 代表水平线
      } else if (lg.orientation === 'V') {
        let points;
        if (container.deg === 90 || container.deg === 270) {
          points = [-6000, 0, 6000, 0];
        } else {
          points = [0, -6000, 0, 6000];
        }
        const line = new XXCanvas.Line({
          points,
          stroke: '#FD4F00',
          name: 'guid-line',
          strokeWidth: strokeWidth,
        });
        container.add(line);
        let offsetX, offsetY;
        let scale = container.scaleY();
        if (container.deg === 90) {
          let layerPos = container.absolutePosition();
          offsetY = (layerPos.x - lg.lineGuide) / scale;
          offsetX = 0;
        } else if (container.deg === 180) {
          let layerPos = container.absolutePosition();
          offsetX = (layerPos.x - lg.lineGuide) / scale;
          offsetY = -layerPos.y;
        } else if (container.deg === 270) {
          let layerPos = container.absolutePosition();
          offsetY = (lg.lineGuide - layerPos.x) / scale;
          offsetX = 0;
        } else {
          let layerPos = container.absolutePosition();
          offsetX = (lg.lineGuide - layerPos.x) / scale;
          offsetY = -layerPos.y;
        }
        line.setAttrs({
          x: offsetX,
          y: offsetY,
        });
      }
    });
  }

  let isDarg = false;
  container.on(
    'nodedrag',
    lodash.throttle(
      (e) => {
        if (e.typeName === 'transform') {
          return;
        }
        if (!isDarg) {
          isDarg = true;
          document.addEventListener(
            'mouseup',
            () => {
              isDarg = false;
              container.find('.guid-line').forEach((l) => l.destroy());
            },
            { once: true },
          );
        }
        // 获取拖动的元素
        let target = e.target[0];
        // clear all previous lines on the screen
        container.find('.guid-line').forEach((l) => l.destroy());

        const lineGuideStops = getLineGuideStops(target);
        // find snapping points of current object
        const itemBounds = getObjectSnappingEdges(target);

        // now find where can we snap current object
        const guides = getGuides(lineGuideStops, itemBounds);

        // do nothing of no snapping
        if (!guides.length) {
          return;
        }

        drawGuides(guides);

        const absPos = target.absolutePosition();
        // now force object position
        guides.forEach((lg) => {
          switch (lg.snap) {
            case 'start': {
              switch (lg.orientation) {
                case 'V': {
                  absPos.x = lg.lineGuide + lg.offset;
                  break;
                }
                case 'H': {
                  absPos.y = lg.lineGuide + lg.offset;
                  break;
                }
              }
              break;
            }
            case 'center': {
              switch (lg.orientation) {
                case 'V': {
                  absPos.x = lg.lineGuide + lg.offset;
                  break;
                }
                case 'H': {
                  absPos.y = lg.lineGuide + lg.offset;
                  break;
                }
              }
              break;
            }
            case 'end': {
              switch (lg.orientation) {
                case 'V': {
                  absPos.x = lg.lineGuide + lg.offset;
                  break;
                }
                case 'H': {
                  absPos.y = lg.lineGuide + lg.offset;
                  break;
                }
              }
              break;
            }
          }
        });
        target.absolutePosition(absPos);
      },
      30,
      {
        trailing: true,
      },
    ),
  );
}
