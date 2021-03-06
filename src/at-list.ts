import { getRange, insertNode, setDataset } from './utils'

import { Config } from './editor'

export class AtList {
  container: HTMLElement
  config: Config['at']

  constructor(target: HTMLPreElement, config: Config['at']) {
    const { render } = config

    this.container = render.list()
    this.container.style.display = 'none'
    this.container.style.position = 'fixed'
    this.container.style.transform = 'translateY(-100%)'
    this.config = config

    document.body.appendChild(this.container)

    target.oninput = () => this.handleInput()
  }

  async handleInput() {
    const range = getRange()
    if (range.endContainer.nodeName !== '#text') return false

    const lastText = range.endContainer.textContent as string
    const avilable = /@.{0,8}$/.test(lastText)

    if (avilable) {
      let keyword = (/@(.{0,8})$/.exec(lastText) || ' ')[1]
      keyword = keyword.replace(/@/g, '')

      const users = await this.config.find(keyword)
      if (users.length) this.show(users)
    } else {
      this.hide()
    }
  }

  private show(users: object[]) {
    this.setUsers(users)

    const range = getRange()
    const { x, y } = range.getBoundingClientRect()

    const { offsetWidth } = this.container
    const maxLeft = innerWidth - offsetWidth - 8
    const left = x + offsetWidth > maxLeft ? maxLeft : x

    this.container.style.display = 'block'
    this.container.style.left = `${left}px`
    this.container.style.top = `${y}px`

    this.handleClickOutside()
  }

  private handleClickOutside() {
    const onClickOutside = (e: MouseEvent) => {
      if (!this.container.contains(e.target as HTMLElement)) {
        this.hide()
        window.removeEventListener('click', onClickOutside, true)
      }
    }

    window.addEventListener('click', onClickOutside, true)
  }

  private setUsers(users: object[]) {
    const range = getRange()
    this.container.innerHTML = ''
    users.forEach(user => {
      const item = this.config.render.item(user)
      item.onclick = e => {
        const { innerText } = e.target as HTMLElement
        this.insertUser(innerText, user, range)
      }
      this.container.appendChild(item)
    })
  }

  private insertUser(name: string, user: object, range: Range) {
    const { endContainer } = range
    const lastText = endContainer.textContent as string
    const offset = (/^.*@/.exec(lastText) || [''])[0].length

    const span = this.cretateSpan(name, user)
    range.setStart(endContainer, offset - 1)
    range.deleteContents()
    insertNode(range, span)
    insertNode(range, document.createTextNode(' '))
    this.hide()
  }

  private cretateSpan(name: string, user: object) {
    const span = document.createElement('span')
    span.contentEditable = 'false'
    span.innerText = `@${name}`
    setDataset(span, user)
    return span
  }

  private hide() {
    this.container.style.display = 'none'
  }
}
