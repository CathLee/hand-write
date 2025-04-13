/*
 * @Date: 2025-04-13 14:35:07
 * @Description:
 */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { registerMicroApps, start } from '../../../micro-fronted/index'
const apps = [
  {
    name: 'app-vue2-app', // 应用的名字
    entry: 'http://localhost:5174/', // 默认加载这个html，解析里面的js动态的执行（子应用必须支持跨域，内部使用的是 fetch）
    container: '#micro-container', // 要渲染到的容器名id
    activeRule: '/vue2', // 通过哪一个路由来激活
  },
  {
    name: 'app-vue3-app',
    entry: 'http://localhost:5174/',
    container: '#micro-container',
    activeRule: '/vue3',
  },
]
registerMicroApps(apps) // 注册应用
start() // 开启应用
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
