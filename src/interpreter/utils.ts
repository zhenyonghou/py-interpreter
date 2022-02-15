import {State} from './state'

const evalBegin = (state: State) => {
    console.log('->', state.node.type, state)
}

const evalEnd = (state: State) => {
    console.log('<-', state.node.type, state.ctx)
}

export {evalBegin, evalEnd}