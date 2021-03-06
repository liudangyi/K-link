<style lang="less" scoped>
  form {
    padding: 0;
    margin: 0;
  }
  .klink-note-block {
    position: absolute;
    right: 60px;
    width: 270px;
    background: white;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
    border-radius: 3px;
    font-size: 14px;
    line-height: 20px;
    z-index: 30000;
    span {
      margin-right: 4px;
      font-weight: bold;
    }
    #klink-note-textarea {
      background-color: transparent;
      width: 100%;
      margin: 0;
      padding: 10px;
      border: none;
      border-bottom: 1px solid #EEE;
      font-size: 14px;
      outline: none;
      resize: none;
    }
  }
  .klink-btn {
    outline: none !important;
    padding: 0;
    margin: 0 0 8px 16px;
    cursor: pointer;
    background: none;
    border: none;
    color: #337ab7;
    &:hover {
      text-decoration: underline;
      color: #23527c;
    }
    box-shadow: none !important;
  }
  .klink-note-item {
    border-top: 1px solid #EEE;
    padding: 10px;
    &:first-child {
      border-top: none;
    }
  }
</style>
<style>
  .klink-highlight {
    display: inline !important;
    background-color: rgba(255, 255, 0, 0.3);
    box-shadow: 0 0 0 3px yellow;
  }
</style>

<template>
  <div class="klink-note-block" :style="styleOf(notes[0])" v-for="notes in groupedNotes">
    <div class="klink-note-item" v-for="note in notes" @mouseenter="mouseEnter(note)" @mouseleave="mouseLeave(note)" @click="reply(note)">
      <span :style="{color: '#'+note.author.email.slice(0, 6)}">{{note.author.name}}</span>
      {{note.content}}
    </div>
    <form @submit.prevent="createNote" v-if="newNote.elementPath && newNoteReply === $key" style="border-top: 1px solid #EEE;">
      <textarea v-model="newNote.content" id="klink-note-textarea" rows="5"></textarea>
      <button class="klink-btn" type="submit">Submit</button>
      <a class="klink-btn" @click="mouseLeave(newNote), newNote={}">Cancel</a>
    </form>
  </div>
  <div class="klink-note-block" :style="styleOf(newNote)" v-if="newNote.elementPath && newNoteReply === null" @mouseEnter="mouseEnter(newNote)" @mouseLeave="mouseLeave(newNote)">
    <form @submit.prevent="createNote">
      <textarea v-model="newNote.content" id="klink-note-textarea" rows="5"></textarea>
      <button class="klink-btn" type="submit">Submit</button>
      <a class="klink-btn" @click="mouseLeave(newNote), newNote={}">Cancel</a>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // { elementPath, nodeIndex, selectionStart, selectionEnd, content }
      newNote: {},
      notes: [],
      newNoteReply: null,
    }
  },
  computed: {
    groupedNotes() {
      let res = {}
      this.notes.forEach(note => {
        if (res[note.elementPath])
          res[note.elementPath].push(note)
        else
          res[note.elementPath] = [note]
      })
      return res
    }
  },
  ready() {
    let socket = this.$parent.socket
    socket.on('note', note => this.notes.push(note))
    socket.on('notes', notes => notes.forEach(note => this.notes.push(note)))
    socket.emit('query', {})
    document.addEventListener('mouseup', () => {
      let selection = getSelection()
      if (selection.rangeCount < 1) return
      let range = selection.getRangeAt(0)
      // startContainer, startOffset, endContainer, endOffset
      if (range.collapsed) return
      if (range.startContainer === range.endContainer) {
        let elementPath = getPathTo(range.startContainer)
        if (elementPath.includes('id("klink-top-element")')) return
        let nodeIndex = getIndexForNodeInParent(range.startContainer)
        // let nodeOffsetTop = range.getBoundingClientRect().top - range.startContainer.parentElement.getBoundingClientRect().top
        let selectionStart = range.startOffset
        let selectionEnd = range.endOffset
        this.newNote = {elementPath, nodeIndex, selectionStart, selectionEnd}
        this.newNoteReply = null
      }
    })
  },
  methods: {
    styleOf(note) {
      if (!note.offsetTop) {
        let node = getNodeFromPath(note.elementPath)
        let range = document.createRange()
        range.selectNodeContents(node)
        note.offsetTop = range.getBoundingClientRect().top + document.body.scrollTop
      }
      return {
        top: note.offsetTop + 'px'
      }
    },
    createNote() {
      this.newNote.content = this.newNote.content.trim()
      if (!this.newNote.content) return;
      this.newNote.author = this.$parent.me
      this.mouseLeave(this.newNote)
      this.newNote.node = undefined
      this.newNote.backup = undefined
      this.newNote.offsetTop = undefined
      this.$parent.socket.emit('note', this.newNote)
      this.newNote = {}
    },
    mouseEnter(note) {
      let node = getNodeFromPath(note.elementPath)
      note.backup = note.backup || node.parentElement.innerHTML
      note.parentNode = node.parentElement
      let siblings = node.parentElement.childNodes
      let newHTML = ''
      for (let i = 0, j = 0; i < siblings.length; i++) {
        if (siblings[i].nodeType === 3) {
          if (j === note.nodeIndex) {
            let original = siblings[i].textContent
            newHTML += original.slice(0, note.selectionStart)
            newHTML += '<span class="klink-highlight">' + original.slice(note.selectionStart, note.selectionEnd) + '</span>'
            newHTML += original.slice(note.selectionEnd)
          } else {
            newHTML += siblings[i].textContent
          }
        } else {
          newHTML += siblings[i].outerHTML
        }
        if (siblings[i].nodeType === 3) {
          j++
        }
      }
      node.parentElement.innerHTML = newHTML
    },
    mouseLeave(note) {
      if (!note.parentNode) return
      note.parentNode.innerHTML = note.backup
      note.node = note.node || getNodeFromPath(note.elementPath)
    },
    reply(note) {
      this.newNote = {
        content: '',
        elementPath: note.elementPath,
        nodeIndex: note.nodeIndex,
        selectionStart: note.selectionStart,
        selectionEnd: note.selectionEnd,
      }
      this.newNoteReply = note.elementPath
    }
  }
}

function getIndexForNodeInParent(node) {
  var ix = 0
  var siblings = node.parentNode.childNodes
  for (var i = 0; i < siblings.length; i++) {
    var sibling = siblings[i]
    if (sibling === node) {
      return ix
    }
    if (sibling.nodeName === node.nodeName) {
      ix++
    }
  }
}

function getPathTo(element) {
  if (element.id && element.id !== '')
    return 'id("' + element.id + '")'
  if (element === document.body)
    return '//'  +  element.tagName

  var ix = 0
  var siblings = element.parentNode.childNodes
  for (var i = 0; i < siblings.length; i++) {
    var sibling = siblings[i]
    if (sibling === element) {
      let nodeName = element.nodeType === 3 ? 'text()' : element.tagName
      return getPathTo(element.parentNode) + '/' + nodeName + '[' + (ix + 1) + ']'
    }
    if (sibling.nodeName === element.nodeName) {
      ix++
    }
  }
}

function getNodeFromPath(path) {
  return document.evaluate(path, document, null, XPathResult.ANY_TYPE).iterateNext()
}

</script>
