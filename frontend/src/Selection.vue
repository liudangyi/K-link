<style lang="less">
  .klink-note-block {
    position: absolute;
    right: 60px;
    width: 200px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    span {
      margin-right: 4px;
      font-weight: bold;
    }
    textarea {
      background-color: transparent;
    }
  }
  .klink-highlight {
    background-color: rgba(255, 255, 0, 0.3);
    box-shadow: 0 0 0 3px yellow;
  }
</style>

<template>
  <div class="klink-note-block" :style="styleOf(note)" v-for="note in notes" @mouseenter="mouseEnter(note)" @mouseleave="mouseLeave(note)">
    <span :style="{color: '#'+note.author.email.slice(0, 6)}">{{note.author.name}}</span>
    {{note.content}}
  </div>
  <div class="klink-note-block" :style="styleOf(newNote)" v-if="newNote" @mouseEnter="mouseEnter(newNote)" @mouseLeave="mouseLeave(newNote)">
    <form @submit.prevent="createNote">
      <textarea v-model="newNote.content" rows="2"></textarea>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // { elementPath, nodeIndex, selectionStart, selectionEnd, content }
      newNote: null,
      notes: [],
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
      }
    })
  },
  methods: {
    styleOf(note) {
      let node = getNodeFromPath(note.elementPath)
      let range = document.createRange()
      range.selectNodeContents(node)
      return {
        top: range.getBoundingClientRect().top + document.body.scrollTop + 'px'
      }
    },
    createNote() {
      this.newNote.content = this.newNote.content.trim()
      if (!this.newNote.content) return;
      this.newNote.author = this.$parent.me
      this.mouseLeave(this.newNote)
      this.newNote.node = undefined
      this.newNote.backup = undefined
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
        if (j === note.nodeIndex) {
          let original = siblings[i].textContent
          newHTML += original.slice(0, note.selectionStart)
          newHTML += '<span class="klink-highlight">' + original.slice(note.selectionStart, note.selectionEnd) + '</span>'
          newHTML += original.slice(note.selectionEnd)
        } else {
          if (siblings[i].nodeType === 3) {
            newHTML += siblings[i].textContent
          } else {
            newHTML += siblings[i].outerHTML
          }
        }
        if (siblings[i].nodeType === 3) {
          j++
        }
      }
      node.parentElement.innerHTML = newHTML
    },
    mouseLeave(note) {
      note.parentNode.innerHTML = note.backup
      note.node = note.node || getNodeFromPath(note.elementPath)
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
