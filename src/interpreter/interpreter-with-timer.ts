import StepInterpreter from './interpreter'
import {ITimer, Timer, TimerState } from "../external/timer"

class InterpreterWithTimer extends StepInterpreter {
    /**
     * 在调用run或runWithOver时候才会使用
     */
    public timer: ITimer = null

    /**
     * 由于StepInterpreter里的几个callback被使用了，所以当使用Interpreter时应该使用这些callback
     */
    // step时回调, debugger里判断何时应当stay
    public onStep: (lineno: number) => void

    // 程序执行结束时回调
    public onDone: () => void

    // 出错时回调
    public onError: (msg: string, lineno: number) => void

    constructor() {
        super()

        this.whenStep = (lineno: number) => {
            this.onStep && this.onStep(lineno)
        }

        this.whenDone = () => {
            this.onDone && this.onDone()
            this.timer.stop()
        }

        this.whenError = (errMsg: string, lineno: number) => {
            this.onError && this.onError(errMsg, lineno)
            this.timer.stop()
        }
    }

    setTimer(timer: ITimer) {
        this.timer = timer
    }

    run() {
        // 如果没有设置_timer, 就用默认的timer
        if (this.timer == null) {
            this.timer = new Timer(0)
        }
        
        this.timer.do = () => {
            this.stepOver()
        }
        this.timer.start()
    }
}

export default InterpreterWithTimer