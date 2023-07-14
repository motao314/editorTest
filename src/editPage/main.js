import { createApp } from 'vue';
import './style.less';
import 'ant-design-vue/dist/antd.less';
import App from './src/App.vue';
import store from './src/store';
import router from './src/router';
import Antd from 'ant-design-vue';

let app = createApp(App);
app.use(Antd).use(router).use(store).mount('#app');