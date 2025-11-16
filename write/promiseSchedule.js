class Scheduler {
    constructor() {
        this.runings = 0;
        this.queue = [];
        this.maxTasks = 2;
    }
    async add(promiseCreator) {

        while (this.runings >= this.maxTasks) {
            await Promise.race(this.queue);
        }
        this.runings++;
        const p = promiseCreator().then(() => {
            this.runings--;
            const index = this.queue.indexOf(promiseCreator);
            this.queue.splice(index, 1);
        })
        this.queue.push(p);
        return p;
    }
}

const timeout = time => new Promise(resolve => {
    setTimeout(resolve, time);
})

const scheduler = new Scheduler();

const addTask = (time, order) => {
    scheduler.add(() => timeout(time).then(() => console.log(order)))
}


addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');
