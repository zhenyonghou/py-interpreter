
class json {
    loads(jsonText) {
        return JSON.parse(jsonText)
    }

    dumps(obj) {
        return JSON.stringify(obj)
    }
}

export default json