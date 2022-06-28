import { getRange, insertNode, useRange, setCursorAfter } from './utils'

interface Props {
  area: HTMLElement
  searchUser: (keyword: string) => Promise<User[]>
}

export default class AtList {
  el: HTMLDivElement
  onClick: (user: User) => void

  constructor({ area, searchUser }: Props) {
    const el = document.createElement('div')
    el.className = 'at-list'
    document.body.appendChild(el)
    this.el = el

    area.oninput = async e => {
      const range = getRange()
      if (range.endContainer.nodeName !== '#text') return false

      const lastText = range.endContainer.textContent as string
      const active = /@.{0,6}$/.test(lastText)
      if (active) {
        let keyword = (/@(.{0,6})$/.exec(lastText) || ' ')[1]
        keyword = keyword.replace(/@/g, '')

        const users = await searchUser(keyword)
        if (users.length) this.show(users)
        else this.hide()
      } else this.hide()
    }
  }

  show(users: User[]) {
    this.insertUsers(users)

    const range = getRange()
    const { x, y } = range.getBoundingClientRect()

    let right = innerWidth - x - 120
    right = right < 0 ? 8 : right

    this.el.style.display = 'block'
    this.el.style.right = `${right}px`
    this.el.style.top = `${y}px`

    // const onClickOutside = (e: any) => {
    //   if (!this.el.contains(e.target)) {
    //     this.hide()
    //     window.removeEventListener('click', onClickOutside, false)
    //   }
    // }

    // window.addEventListener('click', onClickOutside, false)
  }

  private hide() {
    this.el.style.display = 'none'
  }

  private insertUsers(users: User[]) {
    const range = getRange()
    this.el.innerHTML = ''

    users.forEach(user => {
      const item = document.createElement('div')
      item.className = 'at-item'
      item.innerText = user.name
      item.onclick = () => this.atUser(user, range)

      this.el.appendChild(item)
    })
  }

  private atUser(user: User, range: Range) {
    const { endContainer } = range
    const lastText = endContainer.textContent as string
    const offset = (/^.*@/.exec(lastText) || [''])[0].length

    const node = this.createNode(user)
    range.setStart(endContainer, offset - 1)
    range.deleteContents()
    insertNode(range, node)
    insertNode(range, document.createTextNode('\u00A0'))
    this.hide()
  }

  private createNode(user: User) {
    const span = document.createElement('span')
    span.contentEditable = 'false'
    span.dataset.type = 'at'
    span.dataset.id = user.id
    span.dataset.name = user.name
    span.innerText = `@${user.name}`

    return span
  }
}
