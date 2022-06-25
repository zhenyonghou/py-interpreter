
export interface KV<T> {  // 这么做是为了解决ts(7053)问题
    [index: string]: T
}