let config = {};
const DEV = {
  api: '/api', // 接口地址
  image: '/img', // 图片服务器
  upload: '/upload', // 上传文件
};
const PROD = {
  api: '/api', // 接口地址
  image: '/img', // 图片服务器
  upload: '/upload', // 上传文件
};
switch (import.meta.env.MODE) {
  case 'development':
    config = DEV;
    break;
  case 'production':
    config = PROD;
    break;
  default:
    break;
}
config.env = import.meta.env.MODE;
export default config;
