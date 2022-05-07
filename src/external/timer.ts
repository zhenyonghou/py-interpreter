
enum TimerState {
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

    state: TimerState = TimerState.Stop

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
        if (this.state == TimerState.Running) {
            console.error('重复执行start被阻止')
            return
        }

        this.state = TimerState.Running

        const self = this
        function next() {
            if (self.state == TimerState.Stop) {
                return
            }
            self.do()
            self._id = window.setTimeout(next, self.interval)
        }
        next()
    }

    stop() {
        this.state = TimerState.Stop
        if (this._id > 0) {
            window.clearTimeout(this._id)
            this._id = 0
        }
    }
}

export {ITimer, Timer, TimerState}