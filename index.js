function createStore(reducer, preloadedState, enhancer) {
    // reducer 类型判断 
    if (typeof reducer !== 'function') throw new Error('redcuer必须是函数');
    // 判断 engancer 是否传递
    if (typeof enhancer !== 'undefined') {
        if (typeof enhancer !== 'function') {
            throw new Error('enhancer必须是函数')
        }
        return enhancer(createStore)(reducer, preloadedState);
    }
    // store 对象存储的状态
    var currentState = preloadedState
    // 存放订阅者
    var currentListeners = [];
    // 获取状态
    const getState = () => currentState
    // 触发 action
    const dispatch = (action) => {
        // 判断action是否是一个对象
        if (!isPlainObject(action)) throw new Error('action必须是一个对象');
        // 判断action中的type属性是否存在
        if (typeof action.type === 'undefined') throw new Error('action对象中必须有type属性');
        // 调用reducer函数 处理状态
        currentState = reducer(currentState, action)
        // 调用订阅者
        for (var i = 0; i < currentListeners.length; i++) {
            var listener = currentListeners[i];
            listener();
        }
    }
    // 订阅状态
    const subscribe = listener => {
        currentListeners.push(listener)
    }
    return { getState, dispatch, subscribe }
}

// 判断参数是否是对象类型
// 判断对象的当前原型对象是否和顶层原型对象相同
function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = obj;
    while (Object.getPrototypeOf(proto) != null) {
        proto = Object.getPrototypeOf(proto)
    }
    return Object.getPrototypeOf(obj) === proto;
}

// 
function applyMiddleware(...middlewares) {
    return function (createStore) {
        return function (reducer, preloadedState) {
            // 创建 store
            var store = createStore(reducer, preloadedState)
            var { getState, dispatch } = store
            var middlewareAPI = {
                getState,
                dispatch
            }
            // 调用第一层 传递 middlewareAPI
            var chain = middlewares.map(middleware => middleware(middlewareAPI))
            // chain = [ next => action => { next(action) }, ....... ]
            const dispatchs = compose(...chain)(dispatch)
            // 从写dispatch函数 当前函数nex() 是下一个中间件 。。。 最后一个next() 是原dispath
            return {
                ...store,
                dispatch: dispatchs
            }
        }
    }
}

function compose() {
    var funcs = [...arguments]
    return (dispatch) => {
        // 从后向前遍历 最后一个 next = dispath
        for (let i = funcs.length - 1; i >= 0; i--) {
            // 前面一个 next = 当前 () => {} 
            dispatch = funcs[i](dispatch)
        }
        // 返回第一个 函数 
        return dispatch
    }
}

function bindActionCreators(actionCreators, dispatch) {
    console.log(actionCreators.increment)
    var boundActionCreators = {}
    for (let key in actionCreators) {
        boundActionCreators[key] = function () {
            dispatch(actionCreators[key]())
        }
        // (function(key) { // 闭包
        //     boundActionCreators[key] = function () {
        //         dispatch(actionCreators[key]())
        //     }
        // })(key)
    }
    return boundActionCreators
}

function combineReducers (reducers) {
    // 1. 检查reducer类型 它必须是函数
    var reducerKeys = Object.keys(reducers);
    for (var i = 0; i < reducerKeys.length; i++) {
        var key = reducerKeys[i];
        if (typeof reducers[key] !== 'function') throw new Error('reducer必须是函数');
    }
    // 2. 调用一个一个的小的reducer 将每一个小的reducer中返回的状态存储在一个新的大的对象中
    return function (state, action) {
        var nextState = {}
        for(let i = 0; i < reducerKeys.length; i++) {
            const key = reducerKeys[i]
            const reducer = reducers[key]
            const previousStateForKey = state[key]
            nextState[key] = reducer(previousStateForKey, action)
        }
        return nextState
    }
}
