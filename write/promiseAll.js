function myPromiseAll(promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray[promises])
           return reject('必须得是数组')
        // 空数组直接返回
        if (promises.length === 0) {
            return resolve([]);
        }


        const total = promises.length;
        const count = 0;
        const resultArr = []
        promises.forEach((element, index) => {
            // 使用 Promise.resolve 包装，处理非 Promise 值
            Promise.resolve(element).then((value) => {
                // 保存结果到对应的位置（保持顺序）
                resultArr[index] = value
                count++
                if (count === total) {
                    resolve(resultArr)
                }
            }).catch((error) => {
                reject(error)
            })
        });
    })
}

console.log('=== 测试 1: 所有 Promise 都成功 ===');
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = new Promise(resolve => setTimeout(() => resolve(3), 100));

myPromiseAll([p1, p2, p3])
  .then(results => console.log('成功:', results)) // [1, 2, 3]
  .catch(error => console.log('失败:', error));

console.log('\n=== 测试 2: 有一个 Promise 失败 ===');
const p4 = Promise.resolve(10);
const p5 = Promise.reject('出错了！');
const p6 = Promise.resolve(30);

myPromiseAll([p4, p5, p6])
  .then(results => console.log('成功:', results))
  .catch(error => console.log('失败:', error)); // '出错了！'

console.log('\n=== 测试 3: 包含非 Promise 值 ===');
myPromiseAll([1, 2, Promise.resolve(3), 4])
  .then(results => console.log('成功:', results)) // [1, 2, 3, 4]
  .catch(error => console.log('失败:', error));

console.log('\n=== 测试 4: 空数组 ===');
myPromiseAll([])
  .then(results => console.log('成功:', results)) // []
  .catch(error => console.log('失败:', error));

console.log('\n=== 测试 5: 保持结果顺序 ===');
const slow = new Promise(resolve => setTimeout(() => resolve('慢'), 200));
const fast = new Promise(resolve => setTimeout(() => resolve('快'), 50));

myPromiseAll([slow, fast])
  .then(results => console.log('成功:', results)) // ['慢', '快']
  .catch(error => console.log('失败:', error));