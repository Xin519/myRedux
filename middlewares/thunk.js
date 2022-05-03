const thunk = store => next => action => {
    console.log('thunk')
    next(action)
}
