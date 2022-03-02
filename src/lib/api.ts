import pako from 'pako'
import MMFetch from './mm-fetch'
// var CryptoJS = require("crypto-js")

interface KV {
    [key: string]: any
}

const codeParse = async (pyCode: string) => {
    const data = {
        "lan": "python",
        "code": encodeURIComponent(pyCode),
    }
    let binaryString = pako.gzip(JSON.stringify(data), { to: 'string' });
    const blob = await MMFetch.postRaw('/api/v1/code_parse', binaryString).then(resp => resp.blob())
    const buf: any = await readBlob(blob)
    try {
        // 解压
        let data = pako.ungzip(new Uint8Array(buf), { "to": "string" })

        // 解密
        // data = decrypt_eas_cbc(data)
        let obj = JSON.parse(data)

        let ret: KV = {
            'err_code': obj.err_code,
            'msg': '',
            'ast': null
        }

        if (obj.data) {
            ret.ast = JSON.parse(decodeURIComponent(obj.data))
            // 打印出ast
            // console.log(JSON.stringify(ret.ast, null, 4))
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

// const decrypt_eas_cbc = (ciphertext: string) => {
//     const key = CryptoJS.enc.Hex.parse('xDR7DxbsWZTk8Xw7')
//     // const iv = CryptoJS.enc.Hex.parse('InitializationVe')
//     const bytes = CryptoJS.AES.decrypt(ciphertext, key, {
//         // iv: iv,
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.Pkcs7,
//     })
//     return bytes.toString(CryptoJS.enc.Utf8)
// }

const readBlob = (bolb: Blob) => {
    return new Promise(function (resolve, reject) {
        let reader = new FileReader()

        reader.onload = () => {
            resolve(reader.result)
        }
        reader.readAsArrayBuffer(bolb)
    })
}

export {codeParse}