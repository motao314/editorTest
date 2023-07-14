/*
 * @Author: motao “motao314@foxmail.com”
 * @Date: 2023-04-14 22:11:45
 * @LastEditors: motao “motao314@foxmail.com”
 * @LastEditTime: 2023-04-25 20:23:24
 * @FilePath: /project-20220906-xiaoxiang/src/pc-editor/srcapi/API.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const BASEURL = '/api';
/*.
登录 POST
  clientType	string
  password*	string
  minLength: 4
  maxLength: 50
  rememberMe	boolean
  username*	string
*/
export const LOGIN = BASEURL + '/admin/authenticate';
/*
初始化 POST
converId	string 面适配标识
designId	string 设计标识
templateId	string 模板标识
templateSourceEntranceEnum	Array 来源入口 [ 5 ]
userId	归属者标识
*/
export const DESIGN_EDITOR_INITIALIZE = BASEURL + '/editor/design/designEditorInitialize';
// 保存
export const SAVE_DESIGN = BASEURL + '/editor/design/saveDesign';
// 查询所有盒型
// export const TEMPLATE_BOX_CATEGORY = BASEURL + '/boxCategory/findByLevelWithOutChildren'
export const TEMPLATE_BOX_CATEGORY = BASEURL + '/boxCategory/findByLevelWithChildren';

export const BOX_CATEGORY = BASEURL + '/boxCategory/findLevel2CategoryWithEnableBox';
// 查询 盒型列表 POST { boxCategoryId,keyword }
export const BOX_TYPE_LIST = BASEURL + '/boxCategory/pageFindBoxCategoryBriefInfo';
//  获取空白模板id  POST  {username ,boxId}
export const GET_BLANK_TEMPLATE_ID = BASEURL + '/boxCategory/getBlankTemplateInfoIdByBoxIdAndUserName';

// 查询 模板类型 GET labelType : TRADE行业 SENCE 场景 DESIGNSTYLE 风格 BOX_SEARCH_MATERIAL 材质
export const FIND_LABEL_TYPE = BASEURL + '/label/findLabelType';
// 查询 模板列表 POST {designStyle设计风格,keyword 关键字，scene场景,trade行业，boxCagetoryId盒型分类,boxSearchMaterial材质,boxSearchType类型,}
export const TEMPLATE_LIST = BASEURL + '/v2/jd/template/pageFindTemplateBriefInfo';
// 查询 模板详情 POST {boxCategoryId ，templateInfoAlias }
export const TEMPLATE_DETAIL = BASEURL + '/v2/jd/template/findTemplateByAliasAndBoxCategoryId';
//  根据模板id获取 所属盒型下的盒型信息
export const BOX_INFO_BY_TEMPLATEID = BASEURL + '/v2/jd/template/findBoxInfoByTemplateId';
// 素材分类（素材、背景） POST  materialGroupUseType	0：素材 1：背景/图案
export const MATERIALGROUP_GETALLGROUNPLIST = BASEURL + '/materialGroup/getAllGroupList';
// 素材列表（素材、背景） POST  materialUseType	0：素材 1：背景/图案，gropuId	素材组标识，materialName	素材名称，pageIndex	页码，pageSize	每页数量
export const PAGEMATERIALLIST = BASEURL + '/material/pageMaterialList';
// 热门颜色
export const HOT_COLORS = BASEURL + '/wx/compiler/pageMaterialByGroupId?groupId=19&page=0&size=100';
// 保存最近使用字体or颜色
export const SAVE_USER_HISTORY_DATA = BASEURL + '/wx/compiler/saveDesignUserHistoryData';
// 查询最近使用字体or颜色
export const GET_USER_HISTORY_DATA = BASEURL + '/wx/compiler/getDesignUserHistoryData';
// 获取用户信息
export const GET_USER_INFOS = BASEURL + '/admin/user/getUserInfo';
// 获取阿里云上传相关配置
export const GET_ALIOSS_CONFIG = BASEURL + '/basic/getSignature';
// 解密
export const GET_STR_DECODE = BASEURL + '/basic/getDecode';
// 加密
export const GET_STR_ENCODE = BASEURL + '/basic/getEncryption';
// 获取我的作品
export const GET_MY_PRODUCTS = BASEURL + '/pceditor/compilerDesign/pageFindDesignByUser';
// 复合素材保存
export const API_JD_COMPOSITE_SAVE = BASEURL + '/editor/composite/save';
// 根据模板标识、刀版标识查询设计数据 diecutId templateInfoId
export const GET_BOX_ASSOCIATION_LIST = BASEURL + '/editor/design/getBoxAssociationList';

// 解密
export const getRedirectInfo = '/api/pceditor/getRedirectInfo';
