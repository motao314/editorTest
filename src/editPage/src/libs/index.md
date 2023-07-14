# 画布基础架构

## XXCanvas

图形编辑核心库，继承自 Konva，需求尽量少的修改 Konva 的内部接口，隐患太多，后期想要扩展的时候也容易产生冲突。非不得已不修改。

## EditCanvas

基于 XXCanvas 的实例化对象。将对画布的操作，主要放在 canvasEdit 中。好处无需触碰 XXCanvas 的底层架构，将来扩展需要用到 XXCanvas 功能时，也可以编辑使用。

### EditCanvas 使用

```
import EditCanvas from '@/libs/xxCanvas/index';
// 实例化 画布
const playInst = new EditCanvas(options);
```

### 实例化 options 配置属性

    container // 画布容器
    width // 视觉可操作的画布宽度
    height // 视觉可操作的画布高度
    background // 背景图层配置
    playground // 画布配置
    padding // 画布初始布局
    		> left 画布左边最小留空
    		> right 画布右边最小留空
    		> bottom 画布下边最小留空
    		> top 画布上边最小留空

#### background 背景配置

    width 刀版图宽
    height 刀版图高
    texture 盒面工艺图
    fillColor 背景颜色
    fillImage 背景图片
    coverList 刀版面数据列表
    holeList 刀版孔数据

##### coverList 刀版面数据列表

```

[{
        className: 'Path', // 图形类型 Circle Path
        left:'10',//距左边的距离
        top:'10',//距上边的距离
        width:'10',// 矩形宽度
        height:'10',// 矩形高度
        attrs: {
            type:'COVER', // COVER 面
            id: 'cover-0', // 面id 。 最外层全路径面固定为cover-0
            surfaceName:'正面', // 面名称
            fill: 'green', // 可选填 填充颜色
            stroke: '#000', // 可选填 边框颜色
            strokeWidth:'1' // 可选填 边框大小
            x: 0, // 起始原点
            y: 0, // 起始原点
            data: 'm88.66331,0.756673l634.170023,-0.256673l88.166667,88.166667l-0.333333,1166l-87.833333,87.666667l-634.666667,0.166667l-88,-87.666667l0,-1166.5l88.496644,-87.57666l-0.000001,-0.000001z' // 面路径
        }
    }]

```

##### holeList 刀版孔数据

```

[{
        className: 'Circle', // 图形类型 Circle Path
				left:'10',//距左边的距离
				top:'10',//距上边的距离
				width:'10',// 矩形宽度
				height:'10',// 矩形高度
        attrs: {
					  type:'HOLE', // HOLE 洞
            id: 'hole-0', // 面id 。 最外层全路径面固定为cover-0
						surfaceName:'洞1', // 面名称
            stroke: '#000', // 可选填 边框颜色
            strokeWidth:'1' // 可选填 边框大小
            x: 0, // 起始原点
            y: 0, // 起始原点
            data: 'm88.66331,0.756673l634.170023,-0.256673l88.166667,88.166667l-0.333333,1166l-87.833333,87.666667l-634.666667,0.166667l-88,-87.666667l0,-1166.5l88.496644,-87.57666l-0.000001,-0.000001z' // 面路径
        }
    }]

```

#### playground 画布配置

##### children 设计节点列表<Array[ node options ]>

- node 节点对象
  生成 node 节点 `new XXCanvas.[Group|Image|Text](options)`
  options 节点对象配置如下实例

```
 "children": [
      {
        "className": "Image",
        "attrs": {
          "url": "https://jd-ele007.s3.cn-north-1.jdcloud-oss.com/complier/images/202211/715c58a311eb4c169517b6f03721c75b.png", //当前图片地址，当有镜像时为 base64
          "srcId": "b266d76cd1db4d0fbc01d881f86b2bce",
          "materialId": "2f61c5880f004f6a8ed7cc6e690e2b04", // 素材id
          "materialDesc": "1667495085138.png", // 素材名称
          "width": 150,
          "height": 150,
          "x": 459.29458097168157, // 相对于组的x坐标
          "y": 7.105427357601002e-15, // 相对于组的y坐标
          "name": "node",
          "id": "TKR6OkrzzUazxP6nWusjp",
          "craftId": "14", // 工艺id
          "craftDesc": "烫白", //工艺名称
          "opacity": 0.57, // 透明度
          "rotation": 114.99999999999999, // 旋转角度
          "oldZIndex": 2, // 组合前的层级
          "scaleX": 1, //x 缩放值
          "scaleY": 1, //y 缩放值 也可能表达为 scale(x,y)
          "mirror": "x y", // 镜像，"mirror":"x" 水平镜像 "mirror":"y" 垂直镜像 "mirror":"x y" 水平镜像+垂直镜像
          "originUrl":"https://jd-ele007.s3.cn-north-1.jdcloud-oss.com/complier/images/202211/715c58a311eb4c169517b6f03721c75b.png" // 当有镜像时 原图片地址
        }
      },
      {

        "className": "Text",
        "attrs": {
          "text": "第三方", // 文本
          "fontSize": 126, // 字体大小
          "width": 718.1999999999999,
          "fill": "#56aa40", // 文字颜色
          "lineHeight": 1.9, // 行高
          "align": "right", // 文本对齐方式，水平排列：left（左）center（中） right(右)。垂直排列：left（上）center（中） right(下)
          "height": 420,
          "x": 0,
          "y": 636.0693170769231,
          "name": "node",
          "id": "3srwGFwNqsLnmC2AqCtsD",
          "fontFamily": "字由点字典圆 65", // 字体名称
          "fontFamilyId": "字由点字典圆 65", // 字体Id
          "fontStyle": "bold italic", // 加粗和倾斜 "fontStyle": "bold" 加粗 "fontStyle": "italic" 倾斜  "fontStyle": "bold italic"加粗并倾斜
          "textDecoration": "underline", // 下划线
          "letterSpacing": 18.9, // 字母间距
          "writeMode": "vertical", // 文本排列方式。horizontal 水平排列  vertical 垂直排列
          "craftId": "9", // 工艺id
          "craftDesc": "烫金", // 工艺名称
          "opacity": 0.82, // 透明度
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "oldZIndex": 1
        }
      },
      {
        "className": "Group", // 类型标志 Group 复合素材，Image 图片素材，Text 文字素材
        "attrs": {
          "x": 398.36487268661966, // 相对于刀版 x 坐标
          "y": 63.3927392611049, // 相对于刀版 y 坐标
          "id": "sQeqCZtZjQ19Bkn45zRH5", // 设计图层id ，前端生成
          "name": "node", // 前端使用特殊字段
          "width": 718.1999999999998, // 宽度 px
          "height": 1119.462056338028, // 高度 px
          "zIndex": 2, // 层级
          "surfaceId": "cover-0", // 归属面
          "surfaceX": 398.36487268661966, // 相对于归属面的x坐标
          "surfaceY": 63.3927392611049, // 相对于归属面的y坐标
          "scaleX": 1, //x 缩放值
          "scaleY": 1, //y 缩放值 也可能表达为 scale(x,y)
          "rotation": 30 // 旋转角度
        },
        "children": [
          {
            "className": "Image",
            "attrs": {
              "url": "https://jd-ele007.s3.cn-north-1.jdcloud-oss.com/complier/images/202211/715c58a311eb4c169517b6f03721c75b.png", //当前图片地址，当有镜像时为 base64
              "srcId": "b266d76cd1db4d0fbc01d881f86b2bce",
              "materialId": "2f61c5880f004f6a8ed7cc6e690e2b04", // 素材id
              "materialDesc": "1667495085138.png", // 素材名称
              "width": 150,
              "height": 150,
              "x": 459.29458097168157, // 相对于组的x坐标
              "y": 7.105427357601002e-15, // 相对于组的y坐标
              "name": "node",
              "id": "TKR6OkrzzUazxP6nWusjp",
              "craftId": "14", // 工艺id
              "craftDesc": "烫白", //工艺名称
              "opacity": 0.57, // 透明度
              "rotation": 114.99999999999999, // 旋转角度
              "oldZIndex": 2, // 组合前的层级
              "scaleX": 1, //x 缩放值
              "scaleY": 1, //y 缩放值 也可能表达为 scale(x,y)
              "mirror": "x y", // 镜像，"mirror":"x" 水平镜像 "mirror":"y" 垂直镜像 "mirror":"x y" 水平镜像+垂直镜像
              "originUrl":"https://jd-ele007.s3.cn-north-1.jdcloud-oss.com/complier/images/202211/715c58a311eb4c169517b6f03721c75b.png" // 当有镜像时 原图片地址
            }
          },
          {

            "className": "Text",
            "attrs": {
              "text": "第三方", // 文本
              "fontSize": 126, // 字体大小
              "width": 718.1999999999999,
              "fill": "#56aa40", // 文字颜色
              "lineHeight": 1.9, // 行高
              "align": "right", // 文本对齐方式，水平排列：left（左）center（中） right(右)。垂直排列：left（上）center（中） right(下)
              "height": 420,
              "x": 0,
              "y": 636.0693170769231,
              "name": "node",
              "id": "3srwGFwNqsLnmC2AqCtsD",
              "fontFamily": "字由点字典圆 65", // 字体名称
              "fontFamilyId": "字由点字典圆 65", // 字体Id
              "fontStyle": "bold italic", // 加粗和倾斜 "fontStyle": "bold" 加粗 "fontStyle": "italic" 倾斜  "fontStyle": "bold italic"加粗并倾斜
              "textDecoration": "underline", // 下划线
              "letterSpacing": 18.9, // 字母间距
              "writeMode": "vertical", // 文本排列方式。horizontal 水平排列  vertical 垂直排列
              "craftId": "9", // 工艺id
              "craftDesc": "烫金", // 工艺名称
              "opacity": 0.82, // 透明度
              "rotation": 0,
              "scaleX": 1,
              "scaleY": 1,
              "oldZIndex": 1
            }
          }
        ]
      }

    ]

```

### 实例属性及方法
      currentStage 整个画布
      UIBackground 刀版图背景图层
      UIPlayground 设计元素操作图层
      UILightBackground 选面操作图层
      playAdaption({ doWidth, doHeight, padding }) 刀版在画布中自适应
        >  doWidth 画布宽
        >  doHeight 画布高
        >  padding 左右最小留白

#### currentStage 属性及方法
- this.currentStage.getBackground(attr) 
  - attr ： fillColor 获取背景颜色  fillImage 获取背景图片
- this.currentStage.setBackground(attr,value) 
  - attr ： fillColor 获取背景颜色  fillImage 获取背景图片 
  - value 设置的值

#### UIPlayground 属性及方法

- nodeElements 获取画布上所有设计节点
- scaleX 获取画布的缩放尺寸
- isMultiple 获取画布选中模式是都多选（false 单选 true 多选）
- rotateLayer() 旋转画布 90 度
- addChildToCenter(node) 加设计元素在画布正中间
- getLayerRect() 获取画布刀版宽高
- cloneSelectedNode() 克隆选择节点
- tofreezeGroup(nodes) 节点成组
- toUnfreezeGroup(node) Group 节点解组
- clearTransformer() 清空所有选中状态
- addTransformer(node,disabledEmitUI,type,ignoreScroll) 节点选中
- addTransfomerById(id, disabledEmitUI, type, ignoreScroll) 通过节点 id 选中节点
- removeTransformerById(id) 通过节点 id 清空选中
- getChildById(id) 通过节点 id 获取节点
- getGroupThumbnails(id) 通过节点 id 获取节点缩略图
  - nodes 节点列表
  - node 节点
  - disabledEmitUI 是都需要广播画布选中事件
  - type 高亮的类型
  - ignoreScroll 是否需要触发定位到选中元素

#### UILightBackground 属性及方法

setLightCover(coverId) 选面

- coverId [可选项] 需要高亮的面 id，为空时清空所有选面高亮

### 画布事件

#### selectChange 图层节点选中状态改变

`UIPlayground.on('selectChange', ({ typeName, target, nodes, ignoreScroll }) => {})`

- typeName {String} 选中类型
  - add 新增
  - select 选中
  - remove 移除选中
  - clear 清空选中
  - tofreeze 组合选中
  - toUnfreeze 解组选中
- target {Array} 点击的目标节点列表
- nodes {Array} 所有选中的所有节点列表
- ignoreScroll {Boolean} 是否触发图层列表中 滚动到 选中节点位置

#### clickAgain 图层节点再次点击

`UIPlayground.on('clickAgain', ({ typeName, target, nodes }) => {})`

- typeName {String} 点击的节点类型
- target {String} 点击的节点
- nodes {Array} 所有选中的所有节点列表

#### attrsChange 图层节点节点属性改变

`UIPlayground.on('nodeAttrChange', ({ typeName, target, nodes }) => {});`

- typeName {String} typeName 类型
  - dragend :拖动结束，变动的属性：x y
  - transformend: 拉伸，旋转结束， 变动的属性：scaleX，scaleY,rotation,skewX,skewY
  - nodesAlign:对齐，变动属性 x y
  - lock:锁定，变动的属性：lock
- target {Array} target 操作的元素
- nodes {Array} nodes 画布上的元素

#### nodesChange 图层节点数量变化

`UIPlayground.on('nodesChange', ({ nodes, typeName, target }) => {})`

- @typeName {String} typeName 类型
  - add:增加，target 返回的是增加的元素
  - delete:删除，target 返回的是删除的元素
  - clone:删除，target 返回的是复制出来放到画布的元素
  - toUnfreeze :解组，target 返回的是解组后的元素
  - tofreeze: 组合，target 返回的是组合后的元素
- @target {Array} target 操作后元素
- @nodes {Array} nodes 画布上的元素

#### onAllImagesLoaded 组内所有图片加载完成

`UIPlayground.on('onAllImagesLoaded', ({ id }) => {});`

- id 组 id

#### clickEmpty 画布空白区域点击

`UIPlayground.on('clickEmpty', (e) => {})`

- e 事件对象

### node 节点对象属性及方法

getAttr(attr) 获取单个属性值
setAttr(attr，val) 设置单个属性值
getAttrs() 获取所有样式属性值
setAttrs(attrs) 设置多个属性值
remove() 删除节点

- attrs
  - `id` 节点 id
  - `text` 文本
  - `fontSize` 字体大小
  - `width` 节点宽度
  - `height` 节点高度
  - `fill` 文字颜色
  - `lineHeight` 行高
  - `align` 文本对齐方式，水平排列：left（左）center（中） right(右)。垂直排列：left（上）center（中） right(下)
  - `x` x 轴位置
  - `y` y 轴位置
  - `name` 类名
  - `fontFamily` 字体名称
  - `fontFamilyId` 字体 Id
  - `fontStyle` 加粗和倾斜 "fontStyle": "bold" 加粗 "fontStyle": "italic" 倾斜 "fontStyle": "bold italic"加粗并倾斜
  - `textDecoration` underline 下划线
  - `letterSpacing` 字母间距
  - `writeMode` 文本排列方式。horizontal 水平排列 vertical 垂直排列
  - `craftId` 工艺 id
  - `craftDesc` 工艺名称
  - `opacity` 透明度
  - `rotation` 旋转角度
  - `scaleX` x 轴缩放
  - `scaleY` y 轴缩放
  - `url` 当前图片地址，当有镜像时为 base64
  - `srcId` 当前图片文件 id
  - `materialId` 素材 id
  - `materialDesc` 素材名称
  - `mirror` 镜像，"mirror":"x" 水平镜像 "mirror":"y" 垂直镜像 "mirror":"x y" 水平镜像+垂直镜像
  - `originUrl` 当有镜像时 原图片地址
