// get the range of current selection, one slection can only has one range except firefox
export function getRange() {
  return getSelection()?.getRangeAt(0) as Range
}

// template code, let the range avilable
export function useRange(range: Range) {
  getSelection()?.removeAllRanges()
  getSelection()?.addRange(range)
}

export function setCursorAfter(range: Range, node: Node) {
  range.setStartAfter(node)
  range.collapse(true)
}

export function insertNode(range: Range, node: Node) {
  range.insertNode(node)
  setCursorAfter(range, node)
  useRange(range)
}

export function setDataset(el: HTMLElement, data: object) {
  Object.entries(data).forEach(([key, value]) => {
    el.dataset[key] = value
  })
}

export function moveCursorToStart(el: HTMLElement) {
  const range = getRange()

  if (el.firstChild) range.setStartBefore(el.firstChild)
  else el.focus()
}

export function moveCursorToEnd(el: HTMLElement) {
  const range = getRange()

  if (el.lastChild) range.setStartAfter(el.lastChild)
  else el.focus()
}
