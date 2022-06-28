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
  range.setEndAfter(node)
}

export function insertNode(range: Range, node: Node) {
  range.insertNode(node)
  setCursorAfter(range, node)
  useRange(range)
}
