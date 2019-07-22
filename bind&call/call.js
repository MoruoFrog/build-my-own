// 思路是利用o[fn]使得this隐式绑定到o
Function.prototype._call = function (target, ...rest) {
  if (!target || typeof target !== 'object') {
    throw new TypeError('target must be an object')
  }

  const fn = this
  if (!fn || typeof fn !== 'function') {
    throw new TypeError('bind must be called on a function')
  }

  const fnName = '__' + Date.now + '__'
  target[fnName] = fn
  const result = target[fnName](...rest)
  delete target[fnName]
  return result
}