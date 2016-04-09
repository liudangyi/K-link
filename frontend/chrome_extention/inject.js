chrome.storage.sync.get(['name', 'email'], function(ret) {
  sessionStorage.klinkData = JSON.stringify(ret)
  var el = document.createElement('script')
  el.src = '//127.0.0.1:8080/dist/build.js'
  el.async = 1
  document.body.appendChild(el)
})
