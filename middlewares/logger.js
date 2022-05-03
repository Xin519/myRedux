const logger = store => next => action => {
    console.log('logger')
    next(action)
}
