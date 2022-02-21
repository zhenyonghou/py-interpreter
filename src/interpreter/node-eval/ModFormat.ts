import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Assert, evalBegin, evalEnd} from '../utils'
import {ModFormatContext} from '../eval-context'
import {ConstantRet} from '../types'
import { _tuple } from '../python/builtins'

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
            Assert(false, `不支持的字符:${String.fromCharCode(c)}`)
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

const ModFormat = {
    type: "ModFormat",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.ModFormat
        const ctx = state.ctx as ModFormatContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.rightDone_) {
            ctx.rightDone_ = true
            return new State(node.right, state.scope)
        }

        let s = node.left
        let rightValue = (ctx.value_ as ConstantRet).value

        if (!(rightValue instanceof _tuple)) {
            rightValue = new _tuple(rightValue)
        }

        s = format(s, rightValue)

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new ConstantRet(s)
        evalEnd(state)
    }
}

export default ModFormat