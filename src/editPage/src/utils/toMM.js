/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-11 10:03:48
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-11 20:53:03
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srcutils/toMM.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 *
 */

/*
//毫米转pt
private static float mm2pt(float mm) {
    return mm * 72f / 25.4f;
}

private static float px2pt(float px) {
    if(px == 0){
        return px;
    }
    return px * 72f/96f;
}

*/

export function pxTOMM(px) {
  if (px == 0) {
    return 0;
  }
  let pt = (px * 72) / 96;
  return pt / (72 / 25.4);
}
export function mmToPX(mm) {
  if (mm == 0) {
    return 0;
  }
  let pt = (mm * 72) / 25.4;
  return (pt * 96) / 72;
}
