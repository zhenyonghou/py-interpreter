import * as AstTree from './ast-node'
import Module from './node-interpreter/Module'
import Assign from './node-interpreter/Assign'
import AugAssign from './node-interpreter/AugAssign'
import Assert from './node-interpreter/Assert'
import Name from './node-interpreter/Name'
import Expr from './node-interpreter/Expr'
import Call from './node-interpreter/Call'
import Constant from './node-interpreter/Constant'
import BinOp from './node-interpreter/BinOp'
import Compare from './node-interpreter/Compare'
import BoolOp from './node-interpreter/BoolOp'
import UnaryOp from './node-interpreter/UnaryOp'
import List from './node-interpreter/List'
import Dict from './node-interpreter/Dict'
import Tuple from './node-interpreter/Tuple'
import While from './node-interpreter/While'
import For from './node-interpreter/For'
import If from './node-interpreter/If'
import IfExp from './node-interpreter/IfExp'
import Pass from './node-interpreter/Pass'
import Continue from './node-interpreter/Continue'
import Break from './node-interpreter/Break'
import Return from './node-interpreter/Return'
import FunctionDef from './node-interpreter/FunctionDef'
import FunctionRun from './node-interpreter/FunctionRun'
import Starred from './node-interpreter/Starred'
import keyword from './node-interpreter/keyword'
import Global from './node-interpreter/Global'
import ModFormat from './node-interpreter/ModFormat'
import Subscript from './node-interpreter/Subscript'
import Attribute from './node-interpreter/Attribute'
import Delete from './node-interpreter/Delete'
import Slice from './node-interpreter/Slice'
import Import from './node-interpreter/Import'
import ClassDef from './node-interpreter/ClassDef'
import CreateInstance from './node-interpreter/CreateInstance'
import comprehension from './node-interpreter/comprehension'
import ListComp from './node-interpreter/ListComp'
import { State, StateStack } from '../state'

interface INodeInterpreter {
    type: string

    beginStep: (ty: string, node: AstTree.Node) => boolean
    keyStep: (ty: string, node: AstTree.Node) => void
    end: (ty: string, node: AstTree.Node) => void

    // 返回下一个State
    interpret: (ss: StateStack, state: State) => void
}

class NodeInterpreterSets extends Map {
    init() {
        // 装载所有handler
        this.addInterpreter(new Module())
        this.addInterpreter(new Assign())
        this.addInterpreter(new AugAssign())
        this.addInterpreter(new Assert())
        this.addInterpreter(new Constant())
        this.addInterpreter(new Name())
        this.addInterpreter(new Expr())
        this.addInterpreter(new Call())
        this.addInterpreter(new BinOp())
        this.addInterpreter(new Compare())
        this.addInterpreter(new BoolOp())
        this.addInterpreter(new UnaryOp())
        this.addInterpreter(new List())
        this.addInterpreter(new Dict())
        this.addInterpreter(new Tuple())
        this.addInterpreter(new While())
        this.addInterpreter(new For())
        this.addInterpreter(new If())
        this.addInterpreter(new IfExp())
        this.addInterpreter(new Pass())
        this.addInterpreter(new Continue())
        this.addInterpreter(new Break())
        this.addInterpreter(new Return())
        this.addInterpreter(new FunctionDef())
        this.addInterpreter(new FunctionRun())
        this.addInterpreter(new Starred())
        this.addInterpreter(new keyword())
        this.addInterpreter(new Global())
        this.addInterpreter(new ModFormat())
        this.addInterpreter(new Subscript())
        this.addInterpreter(new Attribute())
        this.addInterpreter(new Delete())
        this.addInterpreter(new Slice())
        this.addInterpreter(new Import())
        this.addInterpreter(new ClassDef())
        this.addInterpreter(new CreateInstance())
        this.addInterpreter(new comprehension())
        this.addInterpreter(new ListComp())
    }

    addInterpreter(e: INodeInterpreter) {
        this.set(e.type, e)
    }

    getInterpreter(nodeName: string): INodeInterpreter {
        return this.get(nodeName)
    }

    interpret(
        ss: StateStack,
        onBegin: (ty: string, state: AstTree.Node) => boolean,
        onStep: (ty: string, state: AstTree.Node) => void,
        onEnd: (ty: string, state: AstTree.Node) => void) {

        const state = ss[ss.length - 1]
        const ty = state.node.type

        const i = this.getInterpreter(ty)
        if (!i) {
            throw new Error(`缺少实现:${ty}`)
        }

        i.beginStep = onBegin
        i.keyStep = onStep
        i.end = onEnd

        i.interpret(ss, state)
    }
}

export { NodeInterpreterSets, INodeInterpreter }