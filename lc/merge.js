const merge = (num1, m, num2, n) => {
    const a = num2.slice(0, n)
    const b = num1.slice(0, m)
    const c = b.concat(a).sort((a, b) => a - b)
    num1 = c
    return num1

}


const another = (num1, m, num2, n) => {
    num1.splice(m, n, ...num2)
    return num1.sort((a, b) => a - b)
}
const ss = merge([1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3)
console.log(ss);