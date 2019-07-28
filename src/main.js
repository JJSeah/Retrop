import Vue from 'vue'
import App from './App'
import Vue2TouchEvents from 'vue2-touch-events'

import VueDraggable from './directives/draggable'
Vue.config.productionTip = false
Vue.directive('draggable', VueDraggable)
Vue.use(Vue2TouchEvents)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
