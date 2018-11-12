// 多次band就像栈一样，最先绑定的最后执行，所以就会复写完成绑定的this，所以不能更改绑定的对象

// 思路1: 维护最新的想要bind to的target
const bind1 = (function generateBind() {
  let target = null

	return function(obj, ...args) {
    target = obj
    const curried = args
    const that = this
    return function(...args){
      return that.apply(
        target,
        [...curried, ...args]
      )
    }
	}
})()

// 思路2： 如果已经被绑定了this，就不再绑定新的this
function bind2(obj, ...args) {
  const fn = this
  const curried = args

  return function (...args) {
    const target = ( !this ||
      (typeof window !== "undefined" && this === window) ||
      (typeof global !== "undefined" && this === global)
    ) ? obj : this

    return fn.apply(
      target,
      [...curried, ...args]
    )
  }
}

module.exports = {
  bind1,
  bind2,
}