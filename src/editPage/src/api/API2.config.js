const BASEURL = '/api';
const MATERIALGROUP = '/materialGroup'; // 素材组
const MATERIAL = '/material'; // 素材
const JD = '/v2/jd'; // 多部件编辑器 /京东模板
const WX = '/wx/compiler'; // 微信自定制编译器

export const API_WX_CRAFTLISTV2 = BASEURL + WX + '/craftListV2'; // 工艺数据 （√）
export const API_WX_UPLOADIMAGE = BASEURL + WX + '/designImage'; // 图片上传
export const API_WX_IMAGELISTS = BASEURL + WX + '/materialUserDesign'; // 历史图片列表
export const API_WX_DESIGNIMAGETAILOR = BASEURL + WX + '/designImageTailor'; // 图片裁剪
export const API_WX_MATERIALFONT = BASEURL + WX + '/materialFont'; // 获取字体
export const API_WX_FONTBASE64 = BASEURL + WX + '/fontToBase64ById'; // 获取字体base64
export const API_WX_MATERIALUSERDESIGN = BASEURL + WX + '/materialUserDesign'; // 用户个人素材
export const API_WX_UPLOADUSERMATERIAL = BASEURL + WX + '/uploadUserMaterial'; // 上传用户个人素材
export const API_WX_UPLOADUSERDESIGN = BASEURL + WX + '/updateUserDesign'; // 删除用户个人素材
export const API_WX_NEAREDITPRODUCTS = BASEURL + '/pceditor/compilerDesign/pageFindDesignByUser'; // 我的设计分页查询
