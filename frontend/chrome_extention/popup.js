document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('form').addEventListener('submit', function(e) {
    chrome.storage.sync.set({name: this.name.value, email: this.email.value})
    document.querySelector('label').innerHTML = 'Successfully saved!'
    document.querySelector('label').style = "color: red"
    e.preventDefault()
  })
  chrome.storage.sync.get(['name', 'email'], function(ret) {
    document.querySelector('[name=name]').value = ret['name']
    document.querySelector('[name=email]').value = ret['email']
  })
})
