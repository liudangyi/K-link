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
  <div :data-klink-tooltip="user.name" class="klink-user-avatar" v-if="id != user.id" track-by="id" v-for="user in users" :style="styleOf(user, user.location)" @click="jumpTo(user)"></div>
  <div :data-klink-tooltip="me.name" class="klink-user-avatar klink-big" :style="styleOf(me)"></div>
  <!-- <chat></chat>
  <selection></selection> -->
</template>

<script>
import md5 from 'blueimp-md5'

function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250)
  let last
  let deferTimer
  return function() {
    let context = scope || this
    let now = +new Date()
    let args = arguments
    if (last && now < last + threshhold) {
      clearTimeout(deferTimer)
      deferTimer = setTimeout(function() {
        last = now
        fn.apply(context, args)
      }, threshhold)
    } else {
      last = now
      fn.apply(context, args)
    }
  }
}

function getLocation() {
  return (document.body.scrollTop + window.innerHeight / 2.0) / document.body.scrollHeight
}

function regularizeURL(url) {
  return url.split('#')[0]
}

export default {
  data() {
    let port = chrome.runtime.connect({name: "klink"})
    port.onMessage.addListener((msg) => {
      if (msg.type === 'user') {
        this.me = msg.user
        this.id = msg.id
      } else if (msg.type === 'users') {
        console.log(msg.users, this.me)
        this.users = msg.users
      }
    })
    port.postMessage({ type: 'user' })
    return {
      users: [],
      me: {},
      id: '',
      location: getLocation(),
      port: port,
    }
  },
  ready() {
    this.location = getLocation()
    document.addEventListener('scroll', () => {
      this.location = getLocation()
    })
  },
  watch: {
    'location': throttle(function() {
      this.port.postMessage({
        type: 'location',
        location: this.location,
      })
    }, 300),
  },
  methods: {
    styleOf(user, location) {
      location || (location = this.location)
      return {
        'background-image': `url(//www.gravatar.com/avatar/${md5(user.email)}?d=identicon)`,
        top: `${location * 100}%`,
      }
    },
    jumpTo(user) {
      window.scroll(0, document.body.scrollHeight * user.location - window.innerHeight / 2)
    },
  },
  // components: {
  //   chat: require('./Chat.vue'),
  //   selection: require('./Selection.vue'),
  // },
}
</script>
