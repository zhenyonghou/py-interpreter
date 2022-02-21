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
}

const globalDeclaration = new Declaration()
// globalDeclaration.setWithSets(standard)

export {globalDeclaration, Declaration}