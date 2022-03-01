import {State} from './state'

const printLog = false

const evalBegin = (state: State) => {
    if (printLog) {
        console.log('->', state.node.type, state)
    }
}

const evalEnd = (state: State) => {
    if (printLog) {
        console.log('<-', state.node.type, state.ctx)
    }
}

const Assert = (condition: boolean, message: string="Assert警告") => {
    if (!condition) {
        throw new Error(message)
    }
}

export {evalBegin, evalEnd, Assert}