import PureEditor from './src/pure_editor'
import { searchUser } from './src/mock'

const editor = new PureEditor({
  target: document.getElementById('app'),
  searchUser,
})

emoji.onclick = () => {
  editor.insertEmoji('微笑')
}

submit.onclick = () => {
  editor.submit()
}
