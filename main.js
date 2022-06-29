import Editor from './src/editor'

const editor = new Editor(document.getElementById('app'), {
  at: {
    async find(keyword) {
      return [
        { type: 'user', id: 1, name: `${keyword}foo` },
        { type: 'user', id: 2, name: `${keyword}bar` },
      ]
    },
    render: {
      list() {
        const el = document.createElement('div')
        el.className = 'at-list'
        return el
      },
      item(user) {
        const item = document.createElement('div')
        item.className = 'at-item'
        item.innerText = user.name
        return item
      },
    },
  },
  emoji: {
    render(emoji) {
      const img = document.createElement('img')
      img.className = 'emoji'
      img.src = '//via.placeholder.com/40'
      return img
    },
  },
  reply: {
    render(reply) {
      const div = document.createElement('div')
      div.innerText = 'reply to...'
      div.className = 'block'
      return div
    },
  },
  file: {
    async upload(file) {
      return {
        type: 'file',
        contentType: 'zip',
      }
    },
    render(file) {
      const div = document.createElement('div')
      div.innerText = 'a file...'
      div.className = 'block'
      return div
    },
  },
  submit: {
    will: e => e.key === 'Enter' && e.ctrlKey,
    done: console.log,
  },
})

emoji.onclick = () => editor.insertEmoji({ type: 'emoji', name: '微笑' })
reply.onclick = () => editor.insertReply({ type: 'reply', to: 'foo' })
file.onclick = () => editor.insertFile()
submit.onclick = () => console.log(editor.getValues())
