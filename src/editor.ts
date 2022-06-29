import {
  setDataset,
  insertNode,
  getRange,
  moveCursorToStart,
  moveCursorToEnd,
} from './utils'

import { AtList } from './at-list'

export default class Editor {
  target: HTMLPreElement
  config: Config

  constructor(target: HTMLPreElement, config: Config) {
    this.target = target
    this.config = config

    new AtList(this.target, config.at)

    this.target.onpaste = e => this.handlePaste(e)
    this.target.onkeydown = e => this.handleKeyDown(e)
    this.target.focus()
  }

  insertText(text: string) {
    const range = getRange()
    insertNode(range, document.createTextNode(text))
  }

  insertEmoji(emoji: object) {
    moveCursorToEnd(this.target)
    const range = getRange()

    const node = this.config.emoji.render(emoji)
    setDataset(node, emoji)
    insertNode(range, node)
    this.target.focus()
  }

  insertReply(reply: object) {
    this.target.focus()
    const isEmpty = this.target.childNodes.length === 0

    const range = getRange()
    const node = this.config.reply.render(reply)
    const article = document.createElement('article')
    article.appendChild(node)
    article.contentEditable = 'false'
    setDataset(article, reply)

    moveCursorToStart(this.target)
    if (this.target.firstChild?.nodeName === 'ARTICLE') {
      range.setEndAfter(this.target.firstChild)
      range.deleteContents()
    }

    insertNode(range, article)
    if (isEmpty) range.insertNode(document.createTextNode(' '))
    else moveCursorToEnd(this.target)
  }

  async insertFile(file: File) {
    this.target.focus()

    const { upload, render } = this.config.file
    const fileData = await upload(file)
    const node = render(fileData)
    node.contentEditable = 'false'
    setDataset(node, fileData)

    const range = getRange()
    moveCursorToEnd(this.target)
    insertNode(range, node)
    range.insertNode(document.createTextNode(' '))
  }

  getValues() {
    return Array.from(this.target.childNodes)
      .filter(it => it.textContent && it.textContent !== ' ')
      .map(it => {
        const { nodeName, dataset, textContent } = it as HTMLElement
        return nodeName === '#text' ? textContent : Object.assign({}, dataset)
      }) as Array<string | object>
  }

  private handlePaste(e: ClipboardEvent) {
    e.preventDefault()

    const file = e.clipboardData?.files[0] as File
    if (file?.type.includes('image')) return this.insertFile(file)

    const item = e.clipboardData?.items[0]
    if (item) return item.getAsString(text => this.insertText(text))
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const { submit } = this.config

      if (submit?.will(e)) {
        this.target.innerHTML = ''
        return submit.done(this.getValues())
      }

      const range = getRange()
      insertNode(range, document.createTextNode('\n'))
      range.insertNode(document.createTextNode(' '))
    }
  }
}
