# PureEditor | [中文文档](/README.zh_CN.md)

![example](https://user-images.githubusercontent.com/13190639/176615872-9c2ec97f-a309-4665-b56a-47f7e7c090aa.png)

PureEditor is pure text editor, 'pure' means the childNodes of the editor are only pure text and buildin components. so it is used for chat box, comment box or something like that.

- light-weight, only 200 lines code, without any dependences .

- fully featured, support @, emoji, picture, file, link...

- 100% customizable, every parts of ui accept a render function.

- 0 constraints, PureEditor has no contraints for data format, you can use it in any system without any adaptation codes.

this result of PureEditor is structured,fully-messaged array, you can translate it to anything you want(html, template string), this is a standard one:

```
[
  'I send a emoji',
  {type: 'emoji', name: 'smile'},
  'and will',
  {type: 'at', name: 'lucy'}
]
```

the data format of the item(except text) is upto you, ervey entity's data format will be consistent with the incoming. but it's recommanded every entity include a `type` propertity for distinguish them. the machanism is sipmle, PureEditor just set the dataset of the element with the data you give, and get the dataset when submit:

```
// render flow
render(data) --> element -> element.dataset = data --> append(element)

// parse flow
element --> element.nodeName === '#text' ? element.textContent : element.dataset

```

## Install

```
npm i 'pure-editor'
```

there are only three files in the src, so you can copy them either for free modification .

## Use

```
import Editor from 'pure-editor'

const editor =  new PureEditor(target, config)
```

### target

target should be html pre element to make `\n` rendered normally.

why not generate it inside ? to leave the full ability for you to control it, for example, you can offer extra features directly:

```
colorBtn.onclick = color => pre.style.color = color
fontBtn.onclick = fontFamily => pre.style.fontFamily = fontFamily
```

### config

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

#### submit

this submit trigger setting, if you needn't this, just ignore it and get the result by call the instance method `submit`

- `will(e: KeyboardEvent): boolean`: if it return true, PureEditor will trigger submit immediately. example: `will: e => e.key === 'Enter'`

- `done(values: Array<string | object>): void`: the submit callback function. example: `done: console.log`.

#### at

- `find(keyword: string): Promise<object[]>`: the fuzzy finding function of users, will be triggered when people input `@`. why it is aync? for users may be thousands. if you needn't this, just return a sync list. for example: `async find: () => [user1, user2]`.

- `render.list(): HTMLElement`: the float user list , PureEditor will set it's position be `fixed`, all you need is set it's style, be sure to give it a specific width, example: `width: 120px`.

- `render.item(user):HTMLElement`: then render function of user, then element will be appended to the list, you should set it's `innerText` to be the user's name .

> PureEditor does not care what the user's format is, it just return the _same_ format as it is. for example, if the find function return the value `[{type:'user',id:'1', name: 'Susan'}]`, the item in the result will be `{type:'user',id:'1', name: 'Susan'}` if people @ Susan. other entities follow the same pattern.

#### emoji

- `render(emoji: object): HTMLElement`: the render function of emoji. PureEditor will insert the return element to the box.

#### file

- `upload(file: File): Promise<object>`: when paste a picture, or when the instance method `insertFile` be called, PureEditor will call this function to upload the file.

- `render(fileResult: object): HTMLElement`: after upload, PureEditor will call this function with the return value of upload,and then insert the return element to end of the box .

#### reply

- `render(reply: object): HTMLElement`: the render function of reply data, PureEditor will insert the return Element to the start of the box. one message can have only one reply, if you insert another, it will repalce the old one.

### Instance Methods

- `insertEmoji(emoji)`: insert emoji
- `insertFile(file)`: insert file
- `insertReply(reply)`: insert replay
- `submit`: return the values and clear the box

## Full Example

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

## Attention

PureEditor has not a toolbar and any default ui, you should provide all the render functions, this is for leave the full ability to you to controll them(or just because I'm lazy?). any thing I may help,submit an issue.
