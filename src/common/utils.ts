import {State} from '../state'

// const printLog = (process.env.NODE_ENV == 'development')
const printLog = (process.env.INTERPRETER_STACK_LOG == '1')

export const evalBegin = (level: number, state: State) => {
    if (printLog) {
        let s = ''
        for (let i = 0; i < level; i++) {
            s += '  '
        }
        s += '->'
        console.log(s, state.node.type, state)
    }
}

export const evalEnd = (level: number, state: State) => {
    if (printLog) {
        let s = ''
        for (let i = 0; i <= level; i++) {
            s += '  '
        }
        s += '<-'
        console.log(s, state.node.type, state.ctx)
    }
}
