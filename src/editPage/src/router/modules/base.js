/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-03-31 15:27:39
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-04 11:24:23
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/src/router/modules/base.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import EditorHome from '@/EditorHome.vue';
export default [
  {
    path: '/edit.html',
    name: 'home',
    component: EditorHome
  }
];
