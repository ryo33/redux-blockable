import 'babel-polyfill'
import assert from 'assert'
import sinon from 'sinon'
import { createStore, applyMiddleware } from 'redux'
import { blockable, block } from '../src/index.js'
import createSagaMiddleware, { takeEvery } from 'redux-saga'
import { fork, race, take, put } from 'redux-saga/effects'

describe('redux-saga', function() {
  const reducer = (state, action) => ({})
  const sagaMiddleware = createSagaMiddleware()
  const dispatch = sinon.spy() 
  const middleware = store => next => {
    return dispatch
  }
  const store = createStore(
    reducer,
    applyMiddleware(blockable(sagaMiddleware), middleware)
  )
  const ACTION = 'ACTION'
  const SIDE_ACTION = 'SIDE_ACTION'
  const RELEASE = 'RELEASE'
  const REJECT = 'REJECT'
  const FINISH = 'FINISH'
  const action = {type: ACTION}
  const sideAction = {type: SIDE_ACTION}
  const release = {type: RELEASE}
  const reject = {type: REJECT}
  const finish = {type: FINISH}
  function* blockSaga() {
    while (true) {
      const action = yield take(block(ACTION))
      const { release, reject } = yield race({
        release: take(RELEASE),
        reject: take(REJECT)
      })
      if (release) {
        yield put(action)
      } // else { /* Do nothing */ }
      yield put(finish)
    }
  }
  function* sideActionSaga() {
    while (true) {
      yield take(ACTION)
      yield put(sideAction)
    }
  }
  sagaMiddleware.run(function*() {
    yield fork(blockSaga)
    yield fork(sideActionSaga)
  })

  beforeEach(function() {
    dispatch.reset()
  })

  it('should not block', function() {
    store.dispatch(action)
    assert(dispatch.calledWith(action))
  })

  it('should block', function() {
    const blockedAction = block(action)
    store.dispatch(blockedAction)
    assert(dispatch.neverCalledWith(blockedAction))
    assert(dispatch.neverCalledWith(finish))
  })

  it('should release', function() {
    const blockedAction = block(action)
    store.dispatch(blockedAction)
    store.dispatch(release)
    assert(dispatch.calledWith(blockedAction))
    assert(dispatch.calledWith(finish))
  })

  it('should reject', function() {
    const blockedAction = block(action)
    store.dispatch(blockedAction)
    store.dispatch(reject)
    assert(dispatch.neverCalledWith(blockedAction))
    assert(dispatch.calledWith(finish))
  })

  it('should dispatch a side action with a not blocked action', function() {
    store.dispatch(action)
    assert(dispatch.calledWith(sideAction))
  })

  it('should dispatch a side action with a blocked action', function() {
    const blockedAction = block(action)
    store.dispatch(blockedAction)
    assert(dispatch.calledWith(sideAction))
  })
})
