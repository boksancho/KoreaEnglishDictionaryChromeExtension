import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createBootstrap } from 'bootstrap-vue-next'

// Import Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'


createApp(App)
  .use(createBootstrap())
  .mount('#app');
