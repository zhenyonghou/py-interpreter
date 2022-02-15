import {State, StateStack} from './state'

interface KV {  // 这么做是为了解决ts(7053)问题
    [index: string]: any;
}

type EvalFunction = (ss: StateStack, state: State) => any

interface IEval {
    type: string
    eval: EvalFunction
}

export {IEval, EvalFunction, KV}