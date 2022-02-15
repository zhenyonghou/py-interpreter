import Module from './Module'
import Assign from './Assign'
import Name from './Name'
import Expr from './Expr'
import Call from './Call'
import Constant from './Constant'
import BinOp from './BinOp'
// import {Add, Sub, Mult, Div, Mod, Pow, LShift, RShift, BitOr, BitXor, BitAnd} from './operator'
import Compare from './Compare'
import BoolOp from './BoolOp'
import UnaryOp from './UnaryOp'
import List from './List'

import {State, StateStack} from '../state'

interface IEval {
    type: string
    eval: (ss: StateStack, state: State) => any
}

class NodeEval extends Map {
    init() {
        // 装载所有handler
        this.addEval(Module)
        this.addEval(Assign)
        this.addEval(Constant)
        this.addEval(Name)
        this.addEval(Expr)
        this.addEval(Call)
        this.addEval(BinOp)
        this.addEval(Compare)
        this.addEval(BoolOp)
        this.addEval(UnaryOp)
        this.addEval(List)

        // this.addEval(Add)
        // this.addEval(Sub)
        // this.addEval(Mult)
        // this.addEval(Div)
        // this.addEval(Mod)
        // this.addEval(Pow)
        // this.addEval(LShift)
        // this.addEval(RShift)
        // this.addEval(BitOr)
        // this.addEval(BitXor)
        // this.addEval(BitAnd)
    }

    addEval(e: IEval) {
        this.set(e.type, e)
    }

    getEval(nodeName: string) : IEval {
        return this.get(nodeName)
    }

    eval(nodeName: string, ss: StateStack, state: State) {
        const nodeEval = this.getEval(nodeName)
        if (!nodeEval) {
            throw new Error(`缺少实现:${nodeName}`)
        }
        return nodeEval.eval(ss, state)
    }
}

export default NodeEval