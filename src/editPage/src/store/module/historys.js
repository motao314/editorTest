export default class Historys {
  constructor(options) {
    this.mainStackName = options?.layoutId || Symbol('mainStackName');

    // 初始化历史队列栈
    // 历史数据总栈 -下面是数据结构
    // {
    //     nodeData: {} // 记录的操作节点数据
    //     index: 0 // 当前记录的下标
    // }
    this[this.mainStackName] = [];
    // 最后锁定能操作的游标位置
    this.lockCursorIndex = -1;
    // 最后操作的游标位置--上一步下一步的最后位置
    this.lastCursorIndex = -1;
    // 当前游标
    this.cursorIndex = -1;
  }

  /**
   * 清楚历史记录
   */
  reset() {
    this[this.mainStackName] = [];
    // 最后锁定能操作的游标位置
    this.lockCursorIndex = -1;
    // 最后操作的游标位置--上一步下一步的最后位置
    this.lastCursorIndex = -1;
    // 当前游标
    this.cursorIndex = -1;
  }

  /**
   * 增加历史记录
   * @param {*} nodeData 节点数据
   * @param {} logConfig 记录其他配置 // 默认都是编辑的
   *  - logtype 当前操作类型 new 新增 del 删除 edit 编辑
   *  - dataType 当前记录数据的类型 node 节点数据  background 背景数据
   * @returns
   */
  push(preData, newData, logConfig = { logType: 'edit', dataType: 'node' }) {
    //console.log('history push-----', this[this.mainStackName]);
    if (!this[this.mainStackName]) {
      console.warn('添加历史记录出错，找不到栈');
      return false;
    }
    const len = this[this.mainStackName].length;
    const newLog = {
      nodeData: {
        preData: [...preData],
        newData: [...newData],
      },
      index: len,
      ...logConfig,
    };

    // 当前锁定的能操作位置-如果跟最后操作的位置不一致就跳一下
    if (this.cursorIndex === this.lastCursorIndex) {
      // 把锁定位置变成最后一次操作上一步下一步的位置
      // this.lockCursorIndex = this.lastCursorIndex

      // 把上一步下一步最后的的位置后面的记录清除（因为重新开始做操作记录了）
      const startDelIndex = this.lastCursorIndex + 1;
      const delNum = len - startDelIndex;
      this[this.mainStackName].splice(startDelIndex, delNum);
    }

    // 最后开始记录新操作
    this[this.mainStackName].push(newLog);
    // 处理游标-当前
    this.cursorIndex = this[this.mainStackName].length - 1;

    // console.log('-----当前刀板的历史数据', this[this.mainStackName], this.cursorIndex);
    return this[this.mainStackName].length;
  }

  /**
   * 添加新增记录
   * @param {*} nodeData 新增的节点数据
   * @param {*} dataType 当前记录数据的类型 node 节点数据  background 背景数据
   */
  pushAddLog(nodeData, dataType) {
    const len = this.push(nodeData, nodeData, {
      logType: 'add',
      dataType,
    });
    return len;
  }

  /**
   * 添加删除记录
   * @param {*} nodeData 删除的节点数据
   * @param {*} dataType 当前记录数据的类型 node 节点数据  background 背景数据
   */
  pushDelLog(nodeData, dataType) {
    const len = this.push(nodeData, nodeData, {
      logType: 'del',
      dataType,
    });
    return len;
  }

  /**
   * 返回上一步
   * @param {*} step  上一步的步数 默认是1步
   *
   * return 返回跳转到的历史记录的节点数据，如果是false代表不可再后退了
   */
  back(step = 1) {
    // 能上一步的最小的记录位置
    const minIndex = this.lockCursorIndex;
    if (this.cursorIndex <= minIndex) {
      return false;
    }

    // 需要撤回的数据
    const nodeData = this[this.mainStackName][this.cursorIndex];

    // 指针回退
    this.cursorIndex -= step;

    // 不能低于最小的位置
    this.cursorIndex = this.cursorIndex <= minIndex ? minIndex : this.cursorIndex;
    this.lastCursorIndex = this.cursorIndex;
    //console.log('操作了返回上一步------',minIndex,this.cursorIndex,this.lastCursorIndex)
    return {
      ...nodeData,
      // 上一步是设置旧的数据
      nodeData: nodeData.nodeData.preData,
    };
  }

  /**
   * 下一步
   * @param {*} step 下一步的步数 默认是1步
   */
  next(step = 1) {
    const len = this[this.mainStackName].length;
    // 能下一步的最大位置
    const maxIndex = len - 1;
    if (this.cursorIndex >= maxIndex) {
      return false;
    }

    this.cursorIndex += step;

    const nodeData = this[this.mainStackName][this.cursorIndex];

    // 不能超过最大的位置
    this.cursorIndex = this.cursorIndex >= maxIndex ? maxIndex : this.cursorIndex;
    this.lastCursorIndex = this.cursorIndex;

    return {
      ...nodeData,
      // 下一步是设置新的数据
      nodeData: nodeData.nodeData.newData,
    };
  }

  /**
   * 是否可以回退
   */
  canPre() {
    return this.lockCursorIndex < this.cursorIndex;
  }

  /**
   * 是否可以下一步
   */
  canNext() {
    return this.cursorIndex < this[this.mainStackName].length - 1;
  }

  length() {
    return this[this.mainStackName].length;
  }

  getCursorIndex() {
    return this.cursorIndex;
  }
}
