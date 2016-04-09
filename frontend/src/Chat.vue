<style lang="less" scoped>
  .klink-style() {
    font-size: 16px;
    font-family: sans-serif;
    line-height: 24px;
    font-weight: normal;
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
    span {
      margin-right: 4px;
      font-weight: bold;
    }
  }
  input {
    .klink-style();
    box-sizing: border-box;
    position: fixed;
    top: 70%;
    left: 0;
    border: 1px solid #CCC;
    border-width: 1px 0 0 0;
    outline: none;
    padding: 2px 10px;
    width: 300px;
    background-color: rgba(240, 240, 240, 0.9);;
  }
</style>

<template>
  <div class="klink-chat" v-el:chat>
    <div v-for="chat in chats">
      <span :style="{color: '#'+chat.user.email.slice(0, 6)}">{{chat.user.name}}</span>
      {{chat.content}}
    </div>
  </div>
  <form @submit.prevent="submit">
    <input type="text" v-el:input v-model="input">
  </form>
</template>

<script>
export default {
  data() {
    return {
      chats: [],
      input: '',
    }
  },
  ready() {
    document.addEventListener('keyup', (e) => {
      if (e.keyCode === 13 && e.target === document.body) {
        this.startInput()
      }
    })
    let socket = this.socket = this.$parent.socket
    socket.on('message', message => {
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
      if (this.input === '') return
      this.socket.emit('message', {
        user: this.$parent.me,
        content: this.input
      })
      this.input = ''
    },
    startInput() {
      this.$els.input.focus()
    }
  }
}
</script>
