try {
    module.exports = Promise
} catch (e) {}

function Promise(executor) {
    if (typeof executor !== 'function') {
        throw new Error('Promise executor must be fucntion')
    }

    let status = 'pending'
    let value = void 0

    const notify = (target, val) => {
        target === 'resolved'
            ? this.resolveListeners.forEach(cb => cb(val))
            : this.rejectListeners.forEach(cb => cb(val))
    }

    const resolve = val => {
        if (val instanceof Promise) {
            return val.then(resolve, reject)
        }

        setTimeout(() => {
            if (status !== 'pending') return
            
            status = 'resolved'
            value = val
            notify('resolved', val)
        }, 0)
    }

    const reject = reason => {
        setTimeout(() => {
            if (status !== 'pending') return

            status = 'rejected'
            value = reason
            notify('rejected', reason)
        }, 0)
    }

    this.resolveListeners = []
    this.rejectListeners = []

    Object.defineProperty(this, 'status', {
        get() {
            return status
        },
        set() {
            console.warn('status is read-only')
        }
    })

    Object.defineProperty(this, 'value', {
        get() {
            return value
        },
        set() {
            console.warn('value is read-only')
        }
    })

    try {
        executor(resolve, reject)
    } catch (e) {
        reject(e)
    }
}

const thenCallBack = (cb, res, rej, target, promise, val) => {
    if (typeof cb !== 'function') {
        target === 'resolve'
            ? res(val)
            : rej(val)
        return
    }

    try {
        const x = cb(val)
        resolveThenable(promise, x, res, rej)
    } catch (e) {
        rej(e)
    }
}

const resolveThenable = (promise, x, resolve, reject) => {
    if (x === promise) {
        return reject(new TypeError('chain call found'))
    }

    if (x instanceof Promise) {
        return x.then(v => {
            resolveThenable(promise, v, resolve, reject)
        }, reject)
    }

    if (x === null || (typeof x !== 'object' && typeof x !== 'function')) {
        return resolve(x)
    }

    let called = false
    try {
        // 这里有一个有意思的技巧。标准里解释了，如果then是一个getter，那么通过赋值可以保证getter只被触发一次，避免副作用
        const then = x.then

        if (typeof then !== 'function') {
            return resolve(x)
        }

        then.call(x, v => {
            if (called) return
            called = true
            resolveThenable(promise, v, resolve, reject)
        }, r => {
            if (called) return
            called = true
            reject(r)
        })
    } catch (e) {
        if (called) return
        reject(e)
    }
}

Promise.prototype.then = function (resCb, rejCb) {
    const status = this.status
    const value = this.value
    let thenPromise

    thenPromise = new Promise((res, rej) => {
        const resolveCb = val => {
            thenCallBack(resCb, res, rej, 'resolve', thenPromise, val)
        }
        const rejectCb = val => {
            thenCallBack(rejCb, res, rej, 'reject', thenPromise, val)
        }

        if (status === 'pending') {
            this.resolveListeners.push(resolveCb)
            this.rejectListeners.push(rejectCb)
        }

        if (status === 'resolved') setTimeout(() => resolveCb(value), 0)
        if (status === 'rejected') setTimeout(() => rejectCb(value), 0)
    })

    return thenPromise
}

Promise.deferred = Promise.defer = function () {
    var dfd = {}
    dfd.promise = new Promise(function (resolve, reject) {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}
