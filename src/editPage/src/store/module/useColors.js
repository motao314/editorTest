/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2022-09-30 23:35:20
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-26 15:49:11
 * @FilePath: /project-20220906-xiaoxiang/src/XXEditor/src/store/module/useColors.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineStore } from 'pinia';
import tinycolor from 'tinycolor2';
// 用于对应用中的颜色进行管理
export const useColorStore = defineStore('colors', {
  state: () => {
    return {
      colors: [], //用于存放颜色选择器中，颜色列表的颜色
      historyColors: [], //用于存放历史颜色值
      userId: '', //用户id
    };
  },
  actions: {
    // 初始化userid
    initUserId(userId) {
      this.userId = userId;
    },
    // 初始化颜色列表
    initColors(colors) {
      colors = colors.map((item) => '#' + item.name);
      this.colors = colors;
      this.addTransparent();
    },
    // 初始化历史颜色
    initHistoryColors(colors) {
      //console.log(colors,"---historycolors");
      this.historyColors = colors;
    },
    // 添加历史颜色
    addHistoryColor(color) {
      let index = this.historyColors.findIndex((item) => {
        return tinycolor(item.dataTypeId).toHexString() === tinycolor(color).toHexString();
      });
      if (index < 0) {
        if (this.historyColors.length >= 11) {
          this.historyColors.pop();
        }
      } else {
        this.historyColors.splice(index, 1);
      }
      this.historyColors.unshift({
        id: color,
        userId: this.userId,
        dataType: 'CUSTOMCOLOR',
        dataTypeId: color,
      });
    },
    // 添加透明色
    addTransparent() {
      this.colors.unshift('transparent');
    },
    // 删除透明色
    removeTransparent() {
      this.colors.shift('transparent');
    },
  },
});
