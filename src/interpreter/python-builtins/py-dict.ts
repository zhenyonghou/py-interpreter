
class Dict {
    [index: string]: any

    keys() : Array<string> {
        return Object.keys(this)
    }
}

export default Dict