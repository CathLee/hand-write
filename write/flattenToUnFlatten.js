/*
 * @Date: 2025-12-09 20:42:02
 * @Description: 将嵌套的数组扁平化 
 */
const arr = [
  { "name": "数据1", "parent": null, "id": 1 },
  { "name": "数据2", "id": 2, "parent": 1 },
  { "name": "数据3", "parent": 2, "id": 3 },
  { "name": "数据4", "parent": 3, "id": 4 },
  { "name": "数据5", "parent": 4, "id": 5 },
  { "name": "数据6", "parent": 2, "id": 6 }
]

const flattenToUnFlatten = (arr) => {
  // 使用 Map 存储所有节点，key 是节点的 id，value 是添加了 children 属性的节点
  const map = new Map()
  const res = []

  // 第一遍遍历：为所有节点添加 children 数组，并存入 map
  arr.forEach(element => {
    map.set(element.id, { ...element, children: [] })
  })

  // 第二遍遍历：建立父子关系
  arr.forEach(element => {
    const node = map.get(element.id)

    if (element.parent === null) {
      // 如果是根节点，添加到结果数组
      res.push(node)
    } else {
      // 如果不是根节点，找到父节点并添加到父节点的 children 中
      const parent = map.get(element.parent)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  return res
}

const finalRes = flattenToUnFlatten(arr)
console.log(JSON.stringify(finalRes, null, 2));
// const res =
// [
//   {
//     "name": "数据1",
//     "parent": null,
//     "id": 1,
//     "children": [
//       {
//         "name": "数据2",
//         "id": 2,
//         "parent": 1,
//         "children": [
//           {
//             "name": "数据3",
//             "parent": 2,
//             "id": 3,
//             "children": [
//               {
//                 "name": "数据4",
//                 "parent": 3,
//                 "id": 4,
//                 "children": [
//                   {
//                     "name": "数据5",
//                     "parent": 4,
//                     "id": 5,
//                     "children": []
//                   }
//                 ]
//               }
//             ]
//           },
//           {
//             "name": "数据6",
//             "parent": 2,
//             "id": 6,
//             "children": []
//           }
//         ]
//       }
//     ]
//   }
// ]