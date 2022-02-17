
class Tuple {
    constructor() {
        var i = this.length = arguments.length
        while (i--) {
            this[i] = arguments[i]
        }
    }
}

export default Tuple