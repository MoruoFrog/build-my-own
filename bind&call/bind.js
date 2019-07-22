Function.prototype._bind = function bind(context, ...curry) {
  const fn = this
  if (!fn || typeof fn !== 'function') {
    throw new TypeError('bind must be called on a function')
  }

  const result = function (...rest) {
    fn.call(context, ...curry, ...rest) // 直接使用curry形参即可，不用再额外声明一个变量
  }

  // 保持原性链和prototype属性
  result.prototype = fn.prototype
  Object.setPrototypeOf(result, Object.getPrototypeOf(fn))
  return result
}