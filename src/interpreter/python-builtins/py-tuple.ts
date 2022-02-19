
class Tuple {
    [index: number]: any

    length: number = 0
    
    constructor(...restArgs: any[]) {
        this.length = restArgs.length

        restArgs.forEach((item, index) => {
            this[index] = item
        })
        // var i = this.length = arguments.length
        // while (i--) {
        //     this[i] = arguments[i]
        // }
    }

    push(item: any) {
        this[this.length++] = item
    }
}

// type Tuple = Array<any>

export default Tuple