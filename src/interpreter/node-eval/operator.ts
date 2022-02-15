import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {NameContext} from '../eval-context'

const Add = {
    type: "Add",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "Add"
    }
}

const Sub = {
    type: "Sub",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "Sub"
    }
}

const Mult = {
    type: "Mult",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "Mult"
    }
}

const Div = {
    type: "Div",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "Div"
    }
}

const Mod = {
    type: "Mod",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "Mod"
    }
}

const Pow = {
    type: "Pow",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "Pow"
    }
}

const LShift = {
    type: "LShift",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "LShift"
    }
}

const RShift = {
    type: "RShift",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "RShift"
    }
}

const BitOr = {
    type: "BitOr",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "BitOr"
    }
}

const BitXor = {
    type: "BitXor",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "BitXor"
    }
}

const BitAnd = {
    type: "BitAnd",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "BitAnd"
    }
}

// compare operator
const Eq = {
    type: "Eq",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "Eq"
    }
}

const NotEq = {
    type: "NotEq",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "NotEq"
    }
}

const Gt = {
    type: "Gt",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "Gt"
    }
}

const GtE = {
    type: "GtE",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "GtE"
    }
}

const Lt = {
    type: "Lt",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "Lt"
    }
}

const LtE = {
    type: "LtE",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.value_ = "LtE"
    }
}

export {Add, Sub, Mult, Div, Mod, Pow, LShift, RShift, BitOr, BitXor, BitAnd, Eq, NotEq, Gt, GtE, Lt, LtE}