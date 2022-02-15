import Module from './Module'
import Assign from './Assign'
import Name from './Name'
import Expr from './Expr'
import Call from './Call'
import Constant from './Constant'
import BinOp from './BinOp'
import Compare from './Compare'
import BoolOp from './BoolOp'
import UnaryOp from './UnaryOp'
import List from './List'
import While from './While'
import Pass from './Pass'
import AugAssign from './AugAssign'

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
        this.addEval(While)
        this.addEval(Pass)
        this.addEval(AugAssign)
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