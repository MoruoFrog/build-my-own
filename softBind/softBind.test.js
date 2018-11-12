const { bind1, bind2 } = require('./softBind')

function foo() {
  return this.bar
}

Function.prototype.bind = bind1
Function.prototype._bind = bind2

test('bind more than 1 time', () => {
  const origin = foo

  foo = foo.bind({bar: 1})
  expect(foo()).toBe(1)
  foo = foo.bind({bar: 2})
  expect(foo()).toBe(2)

  foo = origin
  foo = foo._bind({bar: 1})
  expect(foo()).toBe(1)
  foo = foo._bind({bar: 2})
  expect(foo()).toBe(2)
})

function curry(a) {
  return this.bar + (a || 0)
}

test('curry works fine', () => {
  const origin = curry

  curry = curry.bind({bar: 1}, 3)
  expect(curry()).toBe(4)

  curry = origin
  curry = curry._bind({bar: 1}, 3)
  expect(curry()).toBe(4)
})

function curry2(...args) {
  return this.bar + args.reduce((total, v) => total + v, 0)
}

test('curry superposition', () => {
  const origin = curry2

  curry2 = curry2.bind({bar: 1}, 3)
  expect(curry()).toBe(4)
  curry2 = curry2.bind({bar: 3}, 5)
  expect(curry2(4)).toBe(15)

  curry2 = origin
  curry2 = curry2._bind({bar: 1}, 3)
  expect(curry()).toBe(4)
  curry2 = curry2._bind({bar: 3}, 5)
  expect(curry2(4)).toBe(15)
})