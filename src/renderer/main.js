import Vue from 'vue'

import App from './App'
import router from './router'
// import store from './store'
// 导入数据操作库
// import db from './api/operationalData'
// 引用element
// import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// Vue.use(ElementUI)

// import './icons'
import '@/styles/index.scss'
// import '@/styles/index.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

// Vue.prototype.$db = db

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  // store,
  template: '<App/>'
}).$mount('#app')
