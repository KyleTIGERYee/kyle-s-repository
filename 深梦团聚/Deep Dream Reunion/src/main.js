/**
 * 深梦团聚 - Vue 2 入口文件
 * 初始化 Vue 实例并挂载到 #app 节点
 */
import Vue from 'vue'
import App from './App.vue'
import './index.css'

// 关闭 Vue 生产提示
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
