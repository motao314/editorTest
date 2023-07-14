import { createApp } from 'vue';
import './style.less';
import 'ant-design-vue/dist/antd.less';
import App from './App.vue';
import router from './router';
import store from './store';
import Antd from 'ant-design-vue';

let app = createApp(App);
app.use(Antd).use(router).use(store).mount('#app');
