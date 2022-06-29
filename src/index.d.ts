interface AtConfig {
  find(keyword: string): Promise<object[]>
  render: {
    list(): HTMLElement
    item(user: object): HTMLElement
  }
}

interface Config {
  submit?: {
    will(e: KeyboardEvent): boolean
    done(values: Array<string | object>): void
  }
  at: {
    find(keyword: string): Promise<object[]>
    render: {
      list(): HTMLElement
      item(user: object): HTMLElement
    }
  }
  emoji: {
    render(emoji: object): HTMLElement
  }
  file: {
    upload(file: File): Promise<object>
    render(file: object): HTMLElement
  }
  reply: {
    render(reply: object): HTMLElement
  }
}
