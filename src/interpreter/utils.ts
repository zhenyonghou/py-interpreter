import {State} from './state'

const printLog = (process.env.INTERPRETER_STACK_LOG == '1')

// const evalBegin = (state: State) => {
//     if (printLog) {
//         console.log('->', state.node.type, state)
//     }
// }

// const evalEnd = (state: State) => {
//     if (printLog) {
//         console.log('<-', state.node.type, state.ctx)
//     }
// }

const evalBegin = (level: number, state: State) => {
    if (printLog) {
        let s = ''
        for (let i = 0; i < level; i++) {
            s += '  '
        }
        s += '->'
        console.log(s, state.node.type, state)
    }
}

const evalEnd = (level: number, state: State) => {
    if (printLog) {
        let s = ''
        for (let i = 0; i <= level; i++) {
            s += '  '
        }
        s += '<-'
        console.log(s, state.node.type, state.ctx)
    }
}

const Assert = (condition: boolean, message: string="Assert警告") => {
    if (!condition) {
        throw new Error(message)
    }
}

export {evalBegin, evalEnd, Assert}