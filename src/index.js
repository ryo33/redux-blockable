const BLOCKED = '@@redux-saga-block/BLOCKED'

export const isBlocked = action => {
  return action[BLOCKED] === true
}

export const block = action => {
  if (typeof action === 'string') {
    // block(type)
    const type = action
    return action => {
      return action.type === type && isBlocked(action)
    }
  } else {
    // block(action)
    return Object.assign({[BLOCKED]: true}, action)
  }
}

export const blockable = middleware => store => next => {
  const dispatch = action => {
    if (isBlocked(action)) {
      next(action)
    } else {
      store.dispatch(action)
    }
  }
  const nextDispatch = action => {
    if (!isBlocked(action)) {
      next(action)
    }
  }
  return middleware({dispatch, getState: store.getState})(nextDispatch)
}
