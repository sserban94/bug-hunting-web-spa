import { applyMiddleware, createStore } from 'redux'

import logger from 'redux-logger'
import promise from 'redux-promise-middleware'
import reducer from '../reducers'

// const middlewareList = [promise, logger]
// const middleware = applyMiddleware(...middlewareList)

// const store = createStore(reducer, middleware)
const store = createStore(reducer, applyMiddleware(logger, promise))


export default store