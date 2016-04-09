import Vue from 'vue'
import App from './App.vue'

let el = document.createElement('div')
el.appendChild(document.createElement('app'))
document.body.appendChild(el)

new Vue({
  el: el,
  components: { App }
})
