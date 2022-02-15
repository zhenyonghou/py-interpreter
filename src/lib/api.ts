import pako from 'pako'
import MMFetch from './mm-fetch';

interface Kv {
    [key: string]: any
}

const genAst = async (pyCode: string) => {
    const data = {
        "lan": "python",
        "code": encodeURIComponent(pyCode),
    }
    let binaryString = pako.gzip(JSON.stringify(data), { to: 'string' });
    const blob = await MMFetch.postRaw('/api/ast/gen', binaryString).then(resp => resp.blob())
    const buf: any = await readBlob(blob)
    try {
        let decompressData = pako.ungzip(new Uint8Array(buf), { "to": "string" })
        let obj = JSON.parse(decompressData)

        let ret: Kv = {
            'err_code': obj.err_code,
            'msg': '',
            'ast': null
        }

        if (obj.data) {
            ret.ast = JSON.parse(decodeURIComponent(obj.data))
            // 打印出ast
            console.log(JSON.stringify(ret.ast, null, 4))
        }

        if (obj.msg) {
            ret.msg = decodeURIComponent(obj.msg)
        }
        return ret
    } catch (err) {
        console.error("Error " + err)
        return null
    }
}

const readBlob = (bolb: Blob) => {
    return new Promise(function (resolve, reject) {
        let reader = new FileReader()

        reader.onload = () => {
            resolve(reader.result)
        }
        reader.readAsArrayBuffer(bolb)
    })
}

export {genAst}