import {State} from './state'

const evalBegin = (state: State) => {
    console.log('->', state.node.type, state)
}

const evalEnd = (state: State) => {
    console.log('<-', state.node.type, state.ctx)
}

const Assert = (condition: boolean, message: string="Assert警告") => {
    if (!condition) {
        throw new Error(message)
    }
}

export {evalBegin, evalEnd, Assert}