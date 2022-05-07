import Interpreter from "./interpreter/interpreter"
import InterpreterWithTimer from './interpreter/interpreter-with-timer'
import {ITimer, Timer, TimerState} from './external/timer'

const PI = {
    Interpreter, 
    InterpreterWithTimer, 
    External: {Timer}
}

export default PI