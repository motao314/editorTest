import { GET_FILE_NAME_BY_URL } from '@/utils/common';
export default class LayerTree {
  constructor() {
    this.picNum = 0;
    this.groupNum = 0;
  }
  reset() {
    this.picNum = 0;
    this.groupNum = 0;
  }
  createTree(arr) {
    // console.log('开始构建图层tree----', arr)
    let result = [];
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      let className = item.className;
      let children;
      if (className === 'Group') {
        children = this.createTree(item.children);
      }
      result.push(this.combinItem(item, children));
    }
    return result;
  }

  getRandomName(item) {
    let picName = GET_FILE_NAME_BY_URL(item.attrs.url);
    return item.attrs.materialDesc || picName || (this.picNum += 1);
  }

  getLayerTitle(item) {
    let type = this.getLayerType(item);
    let name;
    let title = '';
    switch (type) {
      case 'Group':
        title = '图层组' + (item.attrs.materialDesc || (this.groupNum += 1));
        break;
      case 'Text':
        title = '文字-' + item.attrs.text;
        break;
      case 'Image':
        name = this.getRandomName(item);
        title = '图像-' + name;
        break;
      case 'SVG':
        name = this.getRandomName(item);
        title = '图形-' + name;
        break;
      default:
        title = '图层';
    }
    return title;
  }

  combinItem(item, children) {
    return {
      nodeItem: item,
      title: this.getLayerTitle(item),
      key: item.attrs.id,
      type: item.className,
      trueType: this.getLayerType(item), // 图层真实的类型
      children,
      isLeaf: !(children && children.length > 0),
    };
  }

  /**
   * 检查图层是什么类型 文本（text） 图像（svg）图片（png jpg）图层组（group）
   * @param {*} item
   */
  getLayerType(item) {
    let type = item.className;
    let url = item.attrs.url;
    let result;
    switch (type) {
      case 'Group':
      case 'Text':
        result = type;
        break;
      case 'Image':
        // 需要判断是svg还是其他图片
        let suffix = this.getImageUrlSuffix(url);
        result = suffix === 'svg' ? 'SVG' : type;
        break;
      default:
        result = type;
    }
    return result;
  }

  /**
   * 返回URL的图片后缀
   * @param {*} url
   * @returns
   */
  getImageUrlSuffix(url) {
    const regex = /\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg|ico|jfif|avif|apng|heif)$/i;
    const match = url.match(regex);
    let suffix = match ? match[0] : null;
    suffix = suffix ? suffix.replace(/^\./, '') : suffix;
    return suffix;
  }
}
