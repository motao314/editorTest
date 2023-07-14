import { Util } from 'konva/lib/Util';
import { Factory } from 'konva/lib/Factory';
import { Shape } from 'konva/lib/Shape';
import { _registerNode } from 'konva/lib/Global';
import tinycolor from 'tinycolor2';
import Konva from 'konva';
let AUTO = 'auto',
  //CANVAS = 'canvas',
  CENTER = 'center',
  JUSTIFY = 'justify',
  CHANGE_KONVA = 'Change.konva',
  CONTEXT_2D = '2d',
  DASH = '-',
  LEFT = 'left',
  TEXT = 'text',
  TEXT_UPPER = 'Text',
  TOP = 'top',
  BOTTOM = 'bottom',
  MIDDLE = 'middle',
  NORMAL = 'normal',
  PX_SPACE = 'px',
  SPACE = ' ',
  RIGHT = 'right',
  WORD = 'word',
  CHAR = 'char',
  NONE = 'none',
  ELLIPSIS = '…',
  WRITEMODE = 'horizontal',
  ATTR_CHANGE_LIST = [
    'fontFamily',
    'fontSize',
    'fontStyle',
    'align',
    'lineHeight',
    'text',
    'width',
    'height',
    'letterSpacing',
    'writeMode',
    'textDecoration',
    'fill',
    'fontWeight',
  ],
  // cached variables
  attrChangeListLen = ATTR_CHANGE_LIST.length;

function stringToArray(string) {
  return Array.from(string);
}

function isLetter(text) {
  let code = text.charCodeAt(text);
  if (code <= 256) {
    return true;
  }
  return false;
}

let dummyContext;
function getDummyContext() {
  if (dummyContext) {
    return dummyContext;
  }
  dummyContext = Util.createCanvasElement().getContext(CONTEXT_2D);
  return dummyContext;
}
// 判断是否是单词或者数字。
function isNubOrWord(text) {
  let pattern = /^[a-zA-Z]*$/; // 数组或字母
  let pattern2 = /^[0-9]*$/;
  return pattern.test(text) || pattern2.test(text);
}
/**
 * @description: 文字素材生成
 * @return {*}
 */
export class Text extends Konva.Text {
  constructor(props) {
    super(props);
    // 横竖排版切换监听
    this.on('writeMode' + CHANGE_KONVA, this._setTextData);
  }
  //计算文本宽度
  _getTextWidth(text) {
    if (Array.isArray(text)) {
      text = text.map((item) => {
        if (item.length > 1) {
          return item.split('');
        }
        return item;
      });
      text = text.flat(Infinity);
      text = text.join('');
    }
    let letterSpacing = this.letterSpacing();
    let length = text.length;
    getDummyContext().font = this._getContextFont();
    return getDummyContext().measureText(text).width + (length ? letterSpacing * (length - 1) : 0);
  }

  //计算文本高度（用于竖排文本）
  _getTextHeight(text) {
    let letterSpacing = this.letterSpacing();
    let fontSize = this.fontSize();
    let height = 0;
    if (Array.isArray(text)) {
      text = text.map((item) => {
        if (item.length > 1) {
          return item.split('');
        }
        return item;
      });
      text = text.flat(Infinity);
    }
    for (let i = 0; i < text.length; i++) {
      // if (isNubOrWord(text[i])) { // 单词或者数字
      //   height += this._getTextWidth(text[i]);
      // } else {
      height += fontSize;
      //}
      if (i !== 0) {
        height += letterSpacing;
      }
    }
    return height;
  }

  // 添加一行
  _addTextLine(line) {
    let isVertical = true; //判断是否竖排编辑
    if (this.writeMode() === WRITEMODE) {
      isVertical = false;
    }
    if (!Array.isArray(line)) {
      line = this._getWord(line);
    }
    if (isVertical) {
      let height = this._computedHeight(line);
      return this.textArr.push({
        text: line,
        height,
        lastInParagraph: false,
      });
    }
    var width = this._getTextWidth(line);
    return this.textArr.push({
      text: line,
      width: width,
      lastInParagraph: false,
    });
  }
  /**
   * @description: 当文本相关属性变化时，重置信息
   * @param {*} props
   * @return {*}
   */
  _setTextData(props) {
    if (this.unUpdate) {
      return;
    }
    if (props?.type !== 'widthChange' || props?.type !== 'heightChange') {
      this._minHeight = 0;
      this._minWidth = 0;
    }
    if (props?.type === 'writeModeChange') {
      let _minWidth = this._minWidth;
      let _minHeight = this._minHeight;
      let width = this.width();
      let height = this.height();
      this._setWidth(height);
      this._setHeight(width);
      this._minWidth = _minHeight;
      this._minHeight = _minWidth;
    }
    this.__setTextData();
  }
  // 区分单词和数字
  _getWord(text) {
    let i = 0;
    let textArr = [];
    let subText = '';
    while (i < text.length) {
      let newStr = text.substr(0, 1);
      let newSubText = subText + text.substr(0, 1);
      // 当该字符串是单词或者数字
      if (isNubOrWord(newSubText)) {
        subText = newSubText;
        text = text.substr(1);
      } else {
        if (subText.length) {
          textArr.push(subText);
          subText = '';
        } else {
          subText = newStr;
          text = text.substr(1);
        }
      }
    }
    if (subText.length > 0) {
      textArr.push(subText);
    }
    return textArr;
  }
  _setWidth(val) {
    this.unUpdate = true;
    this.width(val);
    this.unUpdate = false;
  }
  _setHeight(val) {
    this.unUpdate = true;
    this.height(val);
    this.unUpdate = false;
  }

  // 元素属性有变化时，进行绘制方式的重新计算
  __setTextData() {
    if (this.writeMode() === 'horizontal') {
      this.__setHorizontalTextData();
    } else {
      this.__setVerticalTextData();
    }
  }

  // 水平排列时，进行重计算
  __setHorizontalTextData() {
    let lines = this.text().split('\n'), //默认根据换行符计算有多少行
      fontSize = +this.fontSize(), // 文字大小
      textWidth = 0, // 文本的宽度
      lineHeightPx = this.lineHeight() * fontSize, // 行高
      width = this.attrs.width, // 元素宽度
      height = this.attrs.height, // 元素高度
      fixedWidth = width !== AUTO && width !== undefined, // 有固定宽度
      fixedHeight = height !== AUTO && height !== undefined, // 有固定高度
      padding = this.padding(), //填充
      maxWidth = width - padding * 2, // 最大宽度
      maxHeightPx = height - padding * 2, // 最大高度
      currentHeightPx = 0, // 当前高度
      wrap = this.wrap(), // 相关换行处理
      // align = this.align(),
      shouldWrap = wrap !== NONE,
      wrapAtWord = wrap !== CHAR && shouldWrap,
      shouldAddEllipsis = this.ellipsis();
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }
    this.textArr = [];
    getDummyContext().font = this._getContextFont(); // 将缓存的canvas 文字设置为和当前 canvas 一致
    var additionalWidth = shouldAddEllipsis ? this._getTextWidth(ELLIPSIS) : 0; // 是否超出显示省略号
    // 计算行，默认根据换行符来拆分
    for (var i = 0, max = lines.length; i < max; ++i) {
      var line = this._getWord(lines[i]);
      var lineWidth = this._getTextWidth(line);
      if (fixedWidth && lineWidth > maxWidth) {
        /*
         * if width is fixed and line does not fit entirely
         * break the line into multiple fitting lines
         */
        while (line.length > 0) {
          // 该行如果有文字
          /*
           * use binary search to find the longest substring that
           * that would fit in the specified width
           */
          let low = 0, // 起始
            high = line.length, // 结束
            match = '',
            matchWidth = 0;
          while (low < high) {
            var mid = (low + high) >>> 1,
              substr = line.slice(0, mid + 1),
              substrWidth = this._getTextWidth(substr);
            if (substrWidth <= maxWidth) {
              // 如果字符宽度小于元素宽度
              low = mid + 1;
              match = substr;
              matchWidth = substrWidth;
            } else {
              high = mid; // 否则该行可以接受的最大元素宽度到此为止
            }
          }
          if (!match && line.length) {
            match = [line[0]];
            matchWidth = this._getTextWidth(match);
          }
          /*
           * 'low' is now the index of the substring end 当前子字符结束索引
           * 'match' is the substring 子字符串
           * 'matchWidth' is the substring width in px 以px 为单位的子字符串宽度
           */
          if (match) {
            // a fitting substring was found
            if (wrapAtWord) {
              // 根据单词换行
              // try to find a space or dash where wrapping could be done
              var wrapIndex; // 换行索引
              var nextChar = line[match.length]; // 下一个字母
              var nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH; // 如果下一个字母是 空格或者 "-"
              if (nextIsSpaceOrDash && matchWidth <= maxWidth) {
                wrapIndex = match.length;
              } else {
                wrapIndex = Math.max(match.lastIndexOf(SPACE), match.lastIndexOf(DASH)) + 1;
              }
              if (wrapIndex > 0) {
                //如果换行合理
                // re-cut the substring found at the space/dash position
                low = wrapIndex;
                match = match.slice(0, low);
                matchWidth = this._getTextWidth(match);
              } else {
                low = match.length;
                match = match.slice(0, low);
                matchWidth = this._getTextWidth(match);
              }
            }
            if (!Array.isArray(match)) {
              match = [match];
            }
            // if (align === 'right') {
            match = this._getWord(match.join('').trimRight());
            // }
            this._addTextLine(match);
            textWidth = Math.max(textWidth, matchWidth);
            currentHeightPx += lineHeightPx;

            line = line.slice(low);
            line = this._getWord(line.join('').trimLeft());
            if (line.length > 0) {
              // Check if the remaining text would fit on one line
              lineWidth = this._getTextWidth(line);
              if (lineWidth <= maxWidth) {
                // if it does, add the line and break out of the loop
                this._addTextLine(line);
                currentHeightPx += lineHeightPx;
                textWidth = Math.max(textWidth, lineWidth);
                break;
              }
            }
          } else {
            // not even one character could fit in the element, abort
            break;
          }
        }
      } else {
        // element width is automatically adjusted to max line width
        // 元素宽度自动调整为最大行宽
        this._addTextLine(line);
        currentHeightPx += lineHeightPx;
        textWidth = Math.max(textWidth, lineWidth);
      }
      if (this.textArr[this.textArr.length - 1]) {
        this.textArr[this.textArr.length - 1].lastInParagraph = true;
      }
      if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
        this._setHeight(currentHeightPx + lineHeightPx);
        //break;
      }
    }
    this.textHeight = fontSize;
    // var maxTextWidth = 0;
    // for(var j = 0; j < this.textArr.length; j++) {
    //     maxTextWidth = Math.max(maxTextWidth, this.textArr[j].width);
    // }
    this.textWidth = textWidth;
    if (!fixedWidth || this.width() < textWidth) {
      this.width(textWidth);
      this._minWidth = textWidth;
    }
    // 重置元素高度
    let len = this.textArr.length;
    len = len < 1 ? 1 : len;
    this._setHeight(len * lineHeightPx);
  }
  // 文字高度计算
  _computedHeight(text) {
    let letterSpacing = this.letterSpacing();
    let fontSize = this.fontSize();
    let height = 0;
    getDummyContext().font = this._getContextFont();
    if (Array.isArray(text)) {
      text = text.map((item) => {
        if (item.length > 1) {
          return item.split('');
        }
        return item;
      });
      text = text.flat(Infinity);
    }
    for (let i = 0; i < text.length; i++) {
      if (isLetter(text[i])) {
        height += getDummyContext().measureText(text[i]).width;
      } else {
        height += fontSize;
      }
      if (i !== 0) {
        height += letterSpacing;
      }
    }
    return height;
  }
  // 垂直排列时，进行重计算
  __setVerticalTextData() {
    let lines = this.text().split('\n'), //默认根据换行符计算有多少行
      fontSize = +this.fontSize(), // 文字大小
      textHeight = 0, // 文本的宽度
      lineHeightPx = this.lineHeight() * fontSize, // 行高
      width = this.attrs.width, // 元素宽度
      height = this.attrs.height, // 元素高度
      fixedWidth = width !== AUTO && width !== undefined, // 有固定宽度
      fixedHeight = height !== AUTO && height !== undefined, // 有固定高度
      padding = this.padding(), //填充
      maxWidth = width - padding * 2, // 最大宽度
      maxHeight = height - padding * 2, // 最大高度
      currentWidthPx = 0, // 当前宽度
      wrap = this.wrap(), // 相关换行处理
      shouldWrap = wrap !== NONE,
      wrapAtWord = wrap !== CHAR && shouldWrap,
      shouldAddEllipsis = this.ellipsis();
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }
    this.textArr = [];
    getDummyContext().font = this._getContextFont(); // 将缓存的canvas 文字设置为和当前 canvas 一致
    var additionalWidth = shouldAddEllipsis ? this._getTextWidth(ELLIPSIS) : 0; // 是否超出显示省略号
    // 计算行，默认根据换行符来拆分
    for (var i = 0, max = lines.length; i < max; ++i) {
      var line = this._getWord(lines[i]);
      var lineHeight = this._computedHeight(line);
      if (fixedHeight && lineHeight > maxHeight) {
        /*
         * if width is fixed and line does not fit entirely
         * break the line into multiple fitting lines
         */
        while (line.length > 0) {
          // 该行如果有文字
          /*
           * use binary search to find the longest substring that
           * that would fit in the specified width
           */
          let low = 0, // 起始
            high = line.length, // 结束
            match = [],
            matchHeight = 0;
          while (low < high) {
            var mid = (low + high) >>> 1,
              substr = line.slice(0, mid + 1),
              substrHeight = this._computedHeight(substr);
            if (substrHeight <= maxHeight) {
              // 如果字符宽度小于元素宽度
              low = mid + 1;
              match = substr;
              matchHeight = substrHeight;
            } else {
              high = mid; // 否则该行可以接受的最大元素宽度到此为止
            }
          }
          if (!match.length && line.length) {
            match = [line[0]];
            matchHeight = this._computedHeight(match);
          }
          /*
           * 'low' is now the index of the substring end 当前子字符结束索引
           * 'match' is the substring 子字符串
           * 'matchHeight' is the substring width in px 以px 为单位的子字符串高度
           */
          if (match) {
            // a fitting substring was found
            if (wrapAtWord) {
              // 根据单词换行
              // try to find a space or dash where wrapping could be done
              var wrapIndex; // 换行索引
              var nextChar = line[match.length]; // 下一个字母
              var nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH; // 如果下一个字母是 空格或者 "-"
              if (nextIsSpaceOrDash && matchHeight <= maxHeight) {
                wrapIndex = match.length;
              } else {
                wrapIndex = Math.max(match.lastIndexOf(SPACE), match.lastIndexOf(DASH)) + 1;
              }
              if (wrapIndex > 0) {
                //如果换行合理
                // re-cut the substring found at the space/dash position
                low = wrapIndex;
                match = match.slice(0, low);
                matchHeight = this._computedHeight(match);
              } else {
                low = match.length;
                match = match.slice(0, low);
                matchHeight = this._computedHeight(match);
              }
            }
            // if (align === 'right') {
            match = this._getWord(match.join('').trimRight());
            // }
            this._addTextLine(match);
            textHeight = Math.max(textHeight, matchHeight);
            currentWidthPx += lineHeightPx;
            line = line.slice(low);

            line = this._getWord(line.join('').trimLeft());
            if (line.length > 0) {
              // 如果一行的内容没有结束
              // Check if the remaining text would fit on one line
              lineHeight = this._computedHeight(line);
              if (lineHeight <= maxHeight) {
                // if it does, add the line and break out of the loop
                this._addTextLine(line);
                currentWidthPx += lineHeightPx;
                textHeight = Math.max(textHeight, lineHeight);
                break;
              }
            }
          } else {
            // not even one character could fit in the element, abort
            break;
          }
        }
      } else {
        // element width is automatically adjusted to max line width
        // 元素宽度自动调整为最大行宽
        this._addTextLine(line);
        currentWidthPx += lineHeightPx;
        textHeight = Math.max(textHeight, lineHeight);
      }
      if (this.textArr[this.textArr.length - 1]) {
        this.textArr[this.textArr.length - 1].lastInParagraph = true;
      }
      if (fixedWidth && currentWidthPx + lineHeightPx > maxWidth) {
        this._setWidth(currentWidthPx + lineHeightPx);
        //break;
      }
    }
    this.textWidth = fontSize;
    // var maxTextWidth = 0;
    // for(var j = 0; j < this.textArr.length; j++) {
    //     maxTextWidth = Math.max(maxTextWidth, this.textArr[j].width);
    // }
    this.textHeight = textHeight;
    if (!fixedHeight || this.height() < textHeight) {
      this.height(textHeight);
      this._minHeight = textHeight;
    }
    // 重置元素高度
    let len = this.textArr.length;
    len = len < 1 ? 1 : len;
    this._setWidth(len * lineHeightPx);
  }

  // 水平文本绘制
  _sceneHorizontalFunc(context) {
    let textArr = this.textArr,
      textArrLen = textArr.length;
    let padding = this.padding(), //获取padding
      fontSize = this.fontSize(), //获取文字大小
      lineHeightPx = this.lineHeight() * fontSize, //行高
      verticalAlign = this.verticalAlign(), //垂直对齐方式
      alignY = 0,
      align = this.align(), // 水平对齐方式
      totalWidth = this.getWidth(), //元素宽度
      letterSpacing = this.letterSpacing(), // 字母间距
      fill = this.fill(), // 颜色
      textDecoration = this.textDecoration(), // 文本修饰
      shouldUnderline = textDecoration.indexOf('underline') !== -1, // 下划线
      shouldLineThrough = textDecoration.indexOf('line-through') !== -1, // 删除线
      n;

    let translateY = 0; // 变化起点
    translateY = lineHeightPx / 2;

    let lineTranslateX = 0; // 行的x轴起点
    let lineTranslateY = 0; // 行的y轴起点
    context.setAttr('font', this._getContextFont()); // 设置font: style size fontFamily;

    context.setAttr('textBaseline', MIDDLE); // 设置文字基线

    context.setAttr('textAlign', LEFT); // 设置对齐方式

    // handle vertical alignment 垂直对齐方式设置
    if (verticalAlign === MIDDLE) {
      alignY = (this.getHeight() - textArrLen * lineHeightPx - padding * 2) / 2;
    } else if (verticalAlign === BOTTOM) {
      alignY = this.getHeight() - textArrLen * lineHeightPx - padding * 2;
    }

    context.translate(padding, alignY + padding);

    // draw text lines
    for (n = 0; n < textArrLen; n++) {
      lineTranslateX = 0; //行的起点
      lineTranslateY = 0;
      var obj = textArr[n], // 获取该行
        text = obj.text, // 获取该行文本
        width = this._getTextWidth(text), // 该行文本宽度
        lastLine = obj.lastInParagraph, // 是否是最后一行
        spacesNumber, // 编号
        oneWord, //
        lineWidth; //

      // horizontal alignment  水平对齐方式
      context.save();
      if (align === RIGHT) {
        //右对齐
        lineTranslateX += totalWidth - width - padding * 2;
      } else if (align === CENTER) {
        // 居中对齐
        lineTranslateX += (totalWidth - width - padding * 2) / 2;
      }
      // 下划线
      if (shouldUnderline) {
        context.save();
        context.beginPath();
        // 下划线起点 从行的左侧开始，
        context.moveTo(lineTranslateX, translateY + lineTranslateY + Math.round(fontSize / 2));
        if (Array.isArray(text)) {
          text = text.join('');
        }
        spacesNumber = text.split(' ').length - 1;
        oneWord = spacesNumber === 0;
        lineWidth = align === JUSTIFY && lastLine && !oneWord ? totalWidth - padding * 2 : width;
        text = this._getWord(text);
        context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY + Math.round(fontSize / 2));

        // I have no idea what is real ratio
        // just /15 looks good enough
        context.lineWidth = fontSize / 15;
        context.strokeStyle = fill;
        context.stroke();
        context.restore();
      }
      if (shouldLineThrough) {
        context.save();
        context.beginPath();
        context.moveTo(lineTranslateX, translateY + lineTranslateY);
        spacesNumber = text.split(' ').length - 1;
        oneWord = spacesNumber === 0;
        lineWidth = align === JUSTIFY && lastLine && !oneWord ? totalWidth - padding * 2 : width;
        context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY);
        context.lineWidth = fontSize / 15;
        context.strokeStyle = fill;
        context.stroke();
        context.restore();
      }

      text = Array.isArray(text) ? text.join('') : text;

      // 绘制每个字符
      if (letterSpacing !== 0 || align === JUSTIFY) {
        //   var words = text.split(' ');
        spacesNumber = text.split(' ').length - 1;
        var array = stringToArray(text);
        for (var li = 0; li < array.length; li++) {
          var letter = array[li]; // 获取当前字符
          // skip justify for the last line
          if (letter === ' ' && !lastLine && align === JUSTIFY) {
            lineTranslateX += (totalWidth - padding * 2 - width) / spacesNumber;
            // context.translate(
            //   Math.floor((totalWidth - padding * 2 - width) / spacesNumber),
            //   0
            // );
          }
          this._partialTextX = lineTranslateX;
          this._partialTextY = translateY + lineTranslateY;
          this._partialText = letter;
          context.fillStrokeShape(this);
          lineTranslateX += this.measureSize(letter).width + letterSpacing;
        }
      } else {
        this._partialTextX = lineTranslateX;
        this._partialTextY = translateY + lineTranslateY;
        this._partialText = text;
        context.fillStrokeShape(this);
      }
      context.restore();
      // 如果有多行，则继续绘制下一行
      if (textArrLen > 1) {
        translateY += lineHeightPx;
      }
    }
  }

  // 垂直文本绘制
  _sceneVerticalFunc(context) {
    let textArr = this.textArr,
      textArrLen = textArr.length;
    let padding = this.padding(), //获取padding
      fontSize = this.fontSize(), //获取文字大小
      lineHeightPx = this.lineHeight() * fontSize, //行高
      verticalAlign = this.verticalAlign(), //垂直对齐方式
      alignY = 0,
      align = this.align(), // 水平对齐方式
      totalHeight = this.getHeight(), //元素宽度
      letterSpacing = this.letterSpacing(), // 字母间距
      fill = this.fill(), // 颜色
      textDecoration = this.textDecoration(), // 文本修饰
      shouldUnderline = textDecoration.indexOf('underline') !== -1, // 下划线
      shouldLineThrough = textDecoration.indexOf('line-through') !== -1, // 删除线
      n;
    let translateX = 0; // 变化起点
    translateX = lineHeightPx / 2;
    let translateY = 0;
    translateY = fontSize / 2; // 坐标修正

    let lineTranslateX = 0; // 行的x轴起点
    let lineTranslateY = 0; // 行的y轴起点
    context.setAttr('font', this._getContextFont()); // 设置font: style size fontFamily;
    context.setAttr('textBaseline', MIDDLE); // 设置文字基线
    context.setAttr('textAlign', CENTER); // 设置对齐方式
    // handle vertical alignment 垂直对齐方式设置
    if (verticalAlign === MIDDLE) {
      alignY = (this.getHeight() - textArrLen * lineHeightPx - padding * 2) / 2;
    } else if (verticalAlign === BOTTOM) {
      alignY = this.getHeight() - textArrLen * lineHeightPx - padding * 2;
    }
    context.translate(padding, alignY + padding);

    // draw text lines
    for (n = textArrLen - 1; n >= 0; n--) {
      lineTranslateX = 0; //行的起点
      lineTranslateY = 0;
      var obj = textArr[n], // 获取该行
        text = obj.text, // 获取该行文本
        height = this._computedHeight(text), //obj.height, // 该行文本宽度
        spacesNumber, // 编号
        oneWord, //
        lineHeight; //
      // horizontal alignment  水平对齐方式
      context.save();
      if (align === RIGHT) {
        //右对齐
        lineTranslateY += totalHeight - height - padding * 2;
      } else if (align === CENTER) {
        // 居中对齐
        lineTranslateY += (totalHeight - height - padding * 2) / 2;
      }
      // 下划线
      if (shouldUnderline) {
        context.save();
        context.beginPath();
        // 下划线起点 从行的左侧开始，
        context.moveTo(translateX - Math.round(fontSize / 2), lineTranslateY);
        // context.moveTo(
        //   lineTranslateY,
        //   translateX + lineTranslateX + Math.round(fontSize / 2)
        // );
        spacesNumber = text.join('').split(' ').length - 1;
        oneWord = spacesNumber === 0; //是否只有一个单词
        lineHeight = height;
        context.lineTo(translateX - Math.round(fontSize / 2), lineTranslateY + Math.round(lineHeight));

        // I have no idea what is real ratio
        // just /15 looks good enough
        context.lineWidth = fontSize / 15;
        context.strokeStyle = fill;
        context.stroke();
        context.restore();
      }
      let letters = text.join('').split('');
      let lettersHeight = letters.map((l) => {
        let h = context.measureText(l).width;
        return h;
      });
      for (let i = 0; i < letters.length; i++) {
        let letter = letters[i];
        // if(i === 0){
        //   lineTranslateY = lettersHeight[i] / 2;
        // }
        let x = translateX + lineTranslateX;
        let y = translateY + lineTranslateY;
        this._partialTextY = 0;
        this._partialTextX = 0;
        this._partialText = letter;
        if (isLetter(letter)) {
          if (i > 0 && !isLetter(letters[i - 1])) {
            lineTranslateY = lineTranslateY - lettersHeight[i] / 2;
            y = translateY + lineTranslateY;
          }
          context.translate(x, y);
          context.rotate((90 * Math.PI) / 180);
          context.fillStrokeShape(this);
          context.rotate((-90 * Math.PI) / 180);
          context.translate(-x, -y);
        } else {
          if (i > 0 && isLetter(letters[i - 1])) {
            lineTranslateY += lettersHeight[i - 1] / 2;
            y = translateY + lineTranslateY;
          }
          context.translate(x, y);
          context.fillStrokeShape(this);
          context.translate(-x, -y);
        }
        lineTranslateY += lettersHeight[i] + letterSpacing;
      }
      context.restore();
      // 如果有多行，则继续绘制下一行
      if (textArrLen > 1) {
        translateX += lineHeightPx;
      }
    }
  }

  // 绘制文字
  _sceneFunc(context) {
    if (!this.text()) {
      return;
    }
    if (this.writeMode() === 'horizontal') {
      this._sceneHorizontalFunc(context);
    } else {
      this._sceneVerticalFunc(context);
    }
  }
}
Text.prototype.className = 'Text';
_registerNode(Text);
Factory.addGetterSetter(Text, 'writeMode', WRITEMODE);
