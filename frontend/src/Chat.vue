<style lang="less" scoped>
  .klink-style() {
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
    font-size: 16px;
    font-family: sans-serif;
    line-height: 24px;
    font-weight: normal;
    &.klink-hide {
      left: -280px;
    }
  }
  .klink-chat {
    .klink-style();
    box-sizing: border-box;
    position: fixed;
    overflow: scroll;
    left: 0;
    bottom: 30%;
    width: 300px;
    height: 50%;
    padding: 10px;
    background-color: rgba(240, 240, 240, 0.7);
    box-shadow: inset -1px 1px 0px rgba(0, 0, 0, 0.05);
    span {
      margin-right: 4px;
      font-weight: bold;
      cursor: pointer;
    }
  }
  #klink-chat-input {
    .klink-style();
    box-sizing: border-box;
    position: fixed;
    top: 70%;
    left: 0;
    padding: 2px 10px;
    width: 300px;
    background-color: rgba(240, 240, 240, 0.9);;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.2);
    &:focus {
      border: none;
      background-color: rgba(250, 250, 250, 0.9);;
    }
  }
</style>

<template>
  <div class="klink-chat" :class="{'klink-hide': hidden}" @click="hidden = false" v-el:chat>
    <div v-for="chat in chats">
      <span :style="{color: '#'+chat.user.email.slice(0, 6)}" @click="jumpTo(chat.user)">{{chat.user.name}}</span>
      {{chat.content}}
    </div>
  </div>
  <form @submit.prevent="submit">
    <input type="text" id="klink-chat-input" v-el:input v-model="input" :class="{'klink-hide': hidden}"  @click="hidden = false">
  </form>
</template>

<script>
export default {
  data() {
    return {
      chats: [],
      input: '',
      hidden: true,
    }
  },
  ready() {
    document.addEventListener('keyup', (e) => {
      if (e.keyCode === 27 && this.$els.input === document.activeElement) {
        this.$els.input.blur()
        this.hidden = true
      }
    })
    document.addEventListener('keypress', (e) => {
      if (e.keyCode === 13 && e.target === document.body) {
        this.startInput()
      }
    })
    let socket = this.socket = this.$parent.socket
    socket.on('message', message => {
      this.hidden = false
      this.chats.push(message)
    })
  },
  watch: {
    chats() {
      let chat = this.$els.chat
      chat.scrollTop = chat.scrollHeight
    }
  },
  methods: {
    submit() {
      this.input = this.input.trim()
      if (this.input === '') {
        this.$els.input.blur()
        return
      }
      this.socket.emit('message', {
        user: this.$parent.me,
        content: this.input
      })
      this.input = ''
    },
    startInput() {
      this.hidden = false
      this.$els.input.focus()
    },
    jumpTo(user) {
      this.$parent.jumpTo(user)
    }
  }
}
</script>
