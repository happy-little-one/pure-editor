# PureEditor

![example](https://user-images.githubusercontent.com/13190639/176615872-9c2ec97f-a309-4665-b56a-47f7e7c090aa.png)

PureEditor 是一个纯文本的编辑器，所谓纯文本是指除了内置组件，其他内容都是纯字符。因此它适用于聊天输入框，评论框等类似场景。

- 轻量，纯 dom 操作，源码 200 行左右，不依赖任何框架和库。
- 功能完整，支持@，表情， 图片，回复，文件等功能。
- 100%定制度，PureEditor 里几乎每一部分都是可定制的。
- 0 约定，对数据结构没有任何要求，你可以在任何系统里使用。

PureEditor 的 values 是一个完全结构化，信息完整的数据，你可以用它来转成你想要的任何结构，如 html,模板字符串等，同时也预防了 XSS 攻击。这是一个标准格式：

```
[
  '我',
  {type: 'at', id: '1', name: '张三'},
  '并发送了一个表情',
  {type: 'emoji', name: '微笑', url: '/smile.png'}
]
```

数组里除文字外的每一个的构完全是由你传入的，PureEditor 不对结构做任何要求，提交的时候会把数据原样返回给你，建议都有个`type`字段，这样方便你做区分。PureEditor 机制非常简单，渲染时把 data 设置为元素的 dataset，提交时再读取 dataset 并返回。

```
// render flow
render(data) --> element -> element.dataset = data --> append(element)

// parse flow
element --> element.nodeName === '#text' ? element.textContent : element.dataset

```

# 安装

```
npm i 'pure-editor'
```

只有三个文件，如果你嫌麻烦，也可以直接 copy 文件。

# 使用

```
import Editor from 'pure-editor'

const editor =  new PureEditor(target, config)
```

## target

`target`必须为一个`pre`元素，因为这是一个无格式编辑器，`pre`里可以争取渲染`\n`换行和连续空格。

之所以没有在内部生成这个元素，是为了让你可以无需借助本库就可以方便的添加额外的功能，设置文字颜色，大小，字体，背景等功能，比如：

```
colorIcon.onclick = color => pre.style.color = color
fontIcon.onclick = fontFamily => pre.style.fontFamily = fontFamily
```

## config

```
export interface Config {

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
    render(fileResult: object): HTMLElement
  }
  reply: {
    render(reply: object): HTMLElement
  }
}
```

### submit

提交触发配置，如果你不需要可以不填，通过实例方法`submit`来获取结果。

- `will(e: KeyboardEvent): boolean`: 根据`KeyboardEvent`对象来判断是否触发提交， 返回`true`就会触发提交，如：`will: e => e.key === 'Enter'`.

- `done(values: Array<string | object>): void`: 提交的回调函数， 如：`done: cosole.log`

### at

- `find(keyword: string): Promise<object[]>`: 当用户输入`@`时用于模糊查找用户列表的函数，因为用户可能有很多，如果你不需要此功能可以直接返回一个静态列表, 如：`async find: () => [user1, user2]`。

- `render.list`: 备选用户列表的渲染函数, 这是一个悬浮列表，内部会设置`position: fixed`，你需要做的是设置的外观以及给一个固定宽度，如：`width: 120px`

- `render.item`： 备选用户列表 item 的渲染函数，你需要用户名称设为它的`innerTEXT`。

> PureEditor 并不关心返回 user 的数据结构，只是把数据原样返回，比如，如果`find`函数返回的是`[{type:'user',id:'1', name: 'Susan'}]`, 那么`@Susan`的结果将会是`{type:'user',id:'1', name: 'Susan'}`。

### emoji

- `render(emoji: object): HTMLElement`: 表情的渲染函数，当调用实例方法`inserEmoji(emoji)`时，会用此函数渲染一个表情到输入框内。emoji 的结构和 user 一样，完全由你来定，会在结果中原样返回。

### file

- `upload(file: File): Promise<object>`: 当用户粘贴一个图片，或者调用实例方法`insertFile(file)`时，会调用此函数上传。

- `render(fileResult: object): HTMLElement`: 当上传完毕，PureEditor 会用上传返回的数据调用此函数，并把结果插入到输入框中，文件总是插入到输入框底部。

### reply

- `render(reply: object): HTMLElement`: 回复的渲染函数，当调用实例方法`insertReply(reply)`时，会调用此函数并把返回结果插入到输入框顶部，一次提交中只能有一条回复，插入新的回复会替换调老的。

## 实例方法

- `insertEmoji(emojiData)`: 插入表情
- `insertFile(file)`: 插入文件
- `insertReply(replyData)`: 插入回复
- `submit`: 返回输入结果并清空输入框
- `getValues`: submit 方法会清空输入框，不方便做调试，这是函数只返回结果

## 完整示例

```
const editor = new Editor(document.getElementById('app'), {
  at: {
    async find(keyword) {
      return [
        { type: 'user', id: 1, name: `${keyword}Susan` },
        { type: 'user', id: 2, name: `${keyword}Catherine` },
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
      img.src = '/smile.png'
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
    render(fileResult) {
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

emoji.onclick = () => editor.insertEmoji({ type: 'emoji', name: 'smile' })
reply.onclick = () => editor.insertReply({ type: 'reply', to: 'foo' })
file.onclick = () => editor.insertFile({name: 'file.zip'})
submit.onclick = () => console.log(editor.submit())
```

# 注意

PureEditor 没有工具条，也不提供任何默认 ui，这些都是为了方便做自由定制(或者仅仅是因为我懒？)，有任何问题，欢迎提 issue，源码很简单，你也可以复制下自己去改。
