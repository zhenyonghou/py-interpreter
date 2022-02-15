/**
 * 创建一个普通变量值
 */

//  enum SimpleValueKind {
//     Empty = "",
//     Var = "var",
//     Let = "let",
//     Const = "const"
//   }

//   class SimpleValue {
//     value: any
//     kind: string

//     constructor(value: any, kind: SimpleValueKind = SimpleValueKind.Empty) {
//       this.value = value
//       this.kind = kind
//     }

//     set(value: any) {
//       // 禁止重新对const类型变量赋值
//       if (this.kind === 'const') {
//         throw new TypeError('Assignment to constant variable')
//       } else {
//         this.value = value
//       }
//     }

//     get() {
//       return this.value
//     }
//   }





/**
 * 创建一个类变量
 * 
 * @class
 * @param any obj 类
 * @param prop any 属性
 * @method set 设置类的属性的值
 * @method get 获取类的属性的值
 */
class MemberValue {
  obj: any
  prop: string
  constructor(obj: any, prop: string) {
    this.obj = obj
    this.prop = prop
  }

  set(value: any) {
    this.obj[this.prop] = value
  }

  get() {
    return this.obj[this.prop]
  }
}

export { MemberValue }