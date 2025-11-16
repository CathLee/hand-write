function compose(...fns) {
    if (fns.length === 0) {
        return (arg) => arg;
    }
    return fns.reduce((a, b) => {
        return (...arg) => a(b(...arg))
    });
}


const add10 = (x) => x + 10;
const mul10 = (x) => x * 10;
const add100 = (x) => x + 100;

// (10 + 100) * 10 + 10 = 1110
const a = compose(add10, mul10, add100)(10);
console.log(a)