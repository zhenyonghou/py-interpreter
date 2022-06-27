import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {_assert} from '../../common/functions'
import {ModFormatContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import {ConstantRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import { _tuple, _str} from '../../python/builtins'
import { BaseInterpreter } from './__base'

class ConversionNode {
    conversion: string = "" // 转换字符，如: "s", "d"...
    fmtflags: string = ""   // 格式控制，如: "-", "0", "-0"
    fmtwidth: string = ""   // 宽度, 如: "5"
    fmtprec: string = ""    // 精确位数, 如: ".2"
    raw: string = ""
}

function tokenize(f: string) {
    let s = f
    let out: Array<ConversionNode> = []
	let start = 0
    let infmt = false

    let fmtflags = "", fmtwidth = "", fmtprec = "" // fmtlen = ""

    let c = 0;
	let L = s.length

    for(let i = 0; i < L; ++i) {
        c = s.charCodeAt(i)
        if (!infmt) {
            if (c != 37) continue
            start = i
            infmt = true

            fmtflags = fmtwidth = fmtprec = ""// , fmtlen = ""
            continue
        }

        if (c >= 48 && c < 58) { // [0, 9]
            if(fmtprec.length) {    // 精确位数
                fmtprec += String.fromCharCode(c)
            } else if (c == 48 && !fmtwidth.length) {   // 占位符
                fmtflags += String.fromCharCode(c)
            } else {    // 宽度
                fmtwidth += String.fromCharCode(c)
            }
        } else if (c == 45) {   // -
            fmtflags += "-"
        } else if (c == 46) {   // .
            fmtprec = "."
        } else if (c == 115 || c == 100 || c == 102 || c == 111) {  // 's', 'd', 'x', 'o'
            const item = new ConversionNode()
            item.conversion = String.fromCharCode(c)
            item.fmtflags = fmtflags
            item.fmtprec = fmtprec
            item.fmtwidth = fmtwidth
            item.raw = s.substring(start, i+1)

            infmt = false
            out.push(item)
            continue
        } else if (c == 37) {   // %
            infmt = false
            s = s.replace("%%", "%")
            L--
            i--
            continue
        } else {
            _assert(false, `不支持的字符:${String.fromCharCode(c)}`)
        }
    }

    return {fmt: s, tokens: out}
}

function format(s: string, args: _tuple) {
    let ret = tokenize(s)
    let fmt = ret.fmt
    let tokens = ret.tokens
    
    let out = fmt
    for (let i = 0; i < tokens.length; i++) {
        let t = tokens[i]
        if (t.conversion == "s") {  // %5s, %-5s
            let arg = String(args.__getitem__(i))
            let fmtStr = ""
            if (t.fmtwidth) {
                let width = parseInt(t.fmtwidth)
                if (t.fmtflags == "-") {
                    fmtStr = arg.padEnd(width, ' ')
                } else {
                    fmtStr = arg.padStart(width, ' ')
                }
            } else {
                fmtStr = arg
            }
            out = out.replace(t.raw, fmtStr)
        } else if (t.conversion == "d") {
            // %5d 左边补空格; %05d 左边补0; %-5d 右边补空格
            let arg = String(args.__getitem__(i))
            let fmtStr = ""
            if (t.fmtwidth) {
                let width = parseInt(t.fmtwidth)
                if (t.fmtflags == "0") {
                    fmtStr = arg.padStart(width, '0')
                } else if (t.fmtflags == "-") {
                    fmtStr = arg.padEnd(width, ' ')
                } else if (t.fmtflags == "-0") {
                    fmtStr = arg.padEnd(width, '0')
                } else {
                    fmtStr = arg.padStart(width, ' ')
                }
            } else {
                fmtStr = arg
            }
            out = out.replace(t.raw, fmtStr)
        } else if (t.conversion == "f") {
            // %.2f 保留两位小数; %05.2f 宽5位，不足补0
            let arg = args.__getitem__(i) as number
            let fmtStr = ""
            if (t.fmtprec) {
                const n = Number(t.fmtprec.substring(1))
                fmtStr = arg.toFixed(n)
            } else {
                fmtStr = String(args.__getitem__(i))
            }
            out = out.replace(t.raw, fmtStr)
        } else if (t.conversion == "x") {
            let arg = args.__getitem__(i) as number
            let fmtStr = arg.toString(16)
            if (t.fmtwidth) {
                let width = parseInt(t.fmtwidth)
                if (t.fmtflags == "-") {
                    fmtStr = fmtStr.padEnd(width, ' ')
                } else {
                    fmtStr = fmtStr.padStart(width, ' ')
                }
            }
            out = out.replace(t.raw, fmtStr)
        } else if (t.conversion == "o") {
            let arg = args.__getitem__(i) as number
            let fmtStr = arg.toString(8)
            if (t.fmtwidth) {
                let width = parseInt(t.fmtwidth)
                if (t.fmtflags == "-") {
                    fmtStr = fmtStr.padEnd(width, ' ')
                } else {
                    fmtStr = fmtStr.padStart(width, ' ')
                }
            }
            out = out.replace(t.raw, fmtStr)
        }
    }
    return out
}

class ModFormat extends BaseInterpreter {
    type = AstTree.NodeType.ModFormat
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.ModFormat
        const ctx = state.ctx as ModFormatContext

        if (!ctx.rightDone_) {
            ctx.rightDone_ = true
            if (quickInterpret(node.right, state.scope, ss, ctx)) {
                return
            }
        }

        let rightValue = ScopeHelper.lookupX(state.scope, ctx.value_)

        if (!(rightValue instanceof _tuple)) {
            rightValue = new _tuple([rightValue])
        }

        let s = format(node.left._obj, rightValue)

        ss.pop()
        ss.setTopCtxValue(new ConstantRet(new _str(s)))
    }
}

export default ModFormat