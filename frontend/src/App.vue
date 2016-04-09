<style lang="less" scoped>
  .klink-user-avatar {
    position: fixed;
    right: 15px;
    margin-top: -12px;
    height: 24px;
    width: 24px;
    border-radius: 50%;
    transition: top 0.3s ease-out;
    background-size: cover;
    box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    &.klink-big {
      margin-top: -15px;
      height: 30px;
      width: 30px;
      cursor: auto;
    }
    &[data-klink-tooltip]::after {
      content: attr(data-klink-tooltip);
      display: none;
      position: absolute;
      top: 50%;
      right: 100%;
      margin-top: -10px;
      margin-right: 10px;
      padding: 0px 10px;
      font-size: 10px;
      line-height: 20px;
      border-radius: 3px;
      background-color: rgba(0, 0, 0, 0.8);;
      color: white;
    }
    &[data-klink-tooltip]:hover::after {
      display: block;
    }
  }
</style>

<template>
  <div :data-klink-tooltip="user.name" class="klink-user-avatar" v-if="socketId != user.id" v-for="user in users" :style="styleOf(user)" @click="jumpTo(user)"></div>
  <div :data-klink-tooltip="me.name" class="klink-user-avatar klink-big" :style="styleOf(me)"></div>
  <chat></chat>
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

function regularizeURL(url) {
  return url.split('#')[0]
}

export default {
  data() {
    let socket = SocketIO('http://121.201.29.57:3000')
    let userInfo = JSON.parse(sessionStorage.klinkData)
    userInfo.email = md5(userInfo.email.trim().toLowerCase())
    userInfo.location = getLocation()
    return {
      users: [],
      socketId: '',
      me: userInfo,
      socket: socket,
    }
  },
  ready() {
    let socket = this.socket
    socket.on('connect', () => {
      this.socketId = socket.id
      socket.emit('join', regularizeURL(document.URL))
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
    }, 300)
  },
  methods: {
    styleOf(user) {
      return {
        'background-image': `url(//www.gravatar.com/avatar/${user.email}?d=identicon)`,
        top: user.location * 100 + '%'
      }
    },
    jumpTo(user) {
      window.scroll(0, document.body.scrollHeight * user.location - window.innerHeight / 2)
    }
  },
  components: {
    chat: require('./Chat.vue'),
  }
}
</script>
