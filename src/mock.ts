export function searchUser(keyword: string) {
  return Promise.resolve([
    { id: '1', name: `${keyword}张三` },
    { id: '2', name: `${keyword}李四` },
  ])
}
