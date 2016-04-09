<style lang="less" scoped>
  .klink-user-avatar {
    position: fixed;
    right: 15px;
    margin-top: -10px;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    transition: top 0.3s ease-out;
    &.big {
      margin-top: -15px;
      height: 30px;
      width: 30px;
    }
  }
</style>

<template>
  <img :src="gravatar(user)" class="klink-user-avatar" v-if="socketId != user.id" v-for="user in users" :style="styleOf(user)">
  <img :src="gravatar(me)" class="klink-user-avatar big" :style="styleOf(me)">
</template>

<script>
import md5 from 'blueimp-md5'
import SocketIO from 'socket.io-client'

function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}

function getLocation() {
  return (document.body.scrollTop + window.innerHeight / 2.0) / document.body.scrollHeight
}

export default {
  data() {
    let userInfo = JSON.parse(sessionStorage.klinkData)
    userInfo.email = md5(userInfo.email)
    userInfo.location = getLocation()
    return {
      users: [],
      socketId: '',
      me: userInfo
    }
  },
  ready() {
    let socket = SocketIO('http://121.201.29.57:3000')
    let room = document.URL
    this.socket = socket
    socket.on('connect', () => {
      this.socketId = socket.id
      socket.emit('join', room)
      socket.emit('scroll', this.me)
    })
    socket.on('users', users => this.users = users)
    document.addEventListener('scroll', () => {
      this.me.location = getLocation()
    })
  },
  watch: {
    'me.location': throttle(function() {
      this.socket.emit('scroll', this.me)
    }, 500)
  },
  methods: {
    styleOf(user) {
      return {
        'background-color': '#AAA',
        top: user.location * 100 + '%'
      }
    },
    gravatar(user) {
      return `//www.gravatar.com/avatar/${user.email}`
    },
  }
}
</script>
