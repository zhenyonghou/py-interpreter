/**
 * 被Scope所使用
 */

// import standard from './standard'

const KeyPrefix = "MM_"

class Declaration {
    [key: string]: any

    set(key: string, value: any) {
        this[KeyPrefix + key] = value
    }

    get(key: string) : any {
        return this[KeyPrefix + key]
    }

    has(key: string) : boolean {
        return this.hasOwnProperty(KeyPrefix + key)
    }

    del(key: string) {
        delete this[KeyPrefix + key]
    }

    setWithSets(obj: any) {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                this.set(prop, obj[prop])
            }
        }
    }

    // 遍历存储的数据
    forEach(callbackfn: (key: string, value: any) => void) {
        Object.getOwnPropertyNames(this).forEach((key: string) => {
            if (key.startsWith(KeyPrefix)) {
                callbackfn(key.substring(KeyPrefix.length), this[key])
            }
        })
    }
}

const globalDeclaration = new Declaration()
// globalDeclaration.setWithSets(standard)

export {globalDeclaration, Declaration}