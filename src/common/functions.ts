export const _assert = (condition: boolean, message: string="Assert警告") => {
    if (!condition) {
        throw new Error(message)
    }
}