import Vue from 'vue'
import App from './App.vue'

let el = document.createElement('div')
el.appendChild(document.createElement('app'))
el.id = 'klink-top-element'
document.body.appendChild(el)

new Vue({
  el: el,
  components: { App }
})
