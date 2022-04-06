
enum TimerStatus {
    Running = 1,
    Stop = 2,
}

interface ITimer {
    do: () => void
    start: () => void
    stop: () => void
    updateInterval: (interval: number) => void
}

class Timer implements ITimer {
    status: TimerStatus = TimerStatus.Stop
    interval: number = 0    // 单位: ms
    do: () => void
    
    _id: number = 0

    constructor(interval: number) {
        this.interval = interval
    }

    updateInterval(interval: number) {
        this.interval = interval
    }

    start() {
        if (this.status == TimerStatus.Running) {
            console.error('重复执行start被阻止')
            return
        }

        this.status = TimerStatus.Running

        const self = this
        function next() {
            if (self.status == TimerStatus.Stop) {
                return
            }
            self.do()
            self._id = window.setTimeout(next, self.interval)
        }
        next()
    }

    stop() {
        this.status = TimerStatus.Stop
        if (this._id > 0) {
            window.clearTimeout(this._id)
            this._id = 0
        }
    }
}

export {ITimer, Timer, TimerStatus}