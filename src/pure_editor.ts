import { getRange, insertNode } from './utils'
import AtList from './at_list'

type Text = {
  type: 'text'
  text: string
}

interface Emoji {
  type: 'emoji'
  name: string
}

interface At {
  type: 'at'
  id: string
  name: string
}

type Content = Text | Emoji | At

interface Props {
  target: HTMLDivElement
  searchUser: (keyword: string) => Promise<User[]>
  emojiURL: string
}

export default class PureEditor {
  el: HTMLDivElement
  value: Array<Content>
  atList: AtList

  constructor({ target, searchUser }: Props) {
    this.atList = new AtList({ area: target, searchUser })

    target.onpaste = e => {
      e.preventDefault()
      const { clipboardData } = e

      if (e.clipboardData?.files) {
        this.onPasteImg(clipboardData?.files[0] as File)
      }

      if (clipboardData?.items.length) {
        clipboardData?.items[0].getAsString(text => this.onPasteText(text))
      }
    }

    // target.onkeydown = e => {
    //   if (e.key === 'Enter') {
    //     // e.preventDefault()
    //     return this.format()
    //   }
    // }

    target.focus()
    this.el = target
  }

  insertEmoji(em: Emoji) {
    const range = getRange()

    const img = document.createElement('img')
    img.src = '//via.placeholder.com/20'
    img.dataset.type = 'emoji'
    img.dataset.name = em.name

    insertNode(range, img)
    this.el.focus()
  }

  private onPasteText(text: string) {
    const range = getRange()
    insertNode(range, document.createTextNode(text))
  }

  private onPasteImg(file: File) {
    console.log(file)
  }

  submit() {
    const nodes = Array.from(this.el.childNodes)

    const contents = nodes
      .map(it => {
        const { dataset } = it as HTMLElement

        switch (it.nodeName) {
          case 'IMG':
            return {
              type: 'emoji',
              name: dataset.name,
            }
          case 'SPAN':
            return {
              type: 'at',
              id: dataset.id,
              name: dataset.name,
            }
          default:
            return { type: 'text', text: it.textContent }
        }
      })
      .filter(it => it.type !== 'text' || it.text)

    console.log(contents)
  }

  format() {}
}
