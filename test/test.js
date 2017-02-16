import assert from 'assert'
import sinon from 'sinon'
import { blockable, block, isBlocked } from '../src/index.js'

describe('blockable(middleware)', function() {
  const state = {}
  const getState = () => state
  const dispatch = sinon.spy()
  const store = {getState, dispatch}
  const next = sinon.spy()
  const action = {type: 'ACTION', payload: {}}
  const blockedAction = block(action)

  beforeEach(function() {
    dispatch.reset()
    next.reset()
  })

  it('should block actions marked', function() {
    const m = store => next => action => {
      return next(action)
    }
    blockable(m)(store)(next)(blockedAction)
    assert.equal(false, next.called)
    assert.equal(false, dispatch.called)
  })

  it('should not block actions unmarked', function() {
    const m = store => next => action => {
      return next(action)
    }
    blockable(m)(store)(next)(action)
    assert.equal(true, next.called)
    assert.equal(false, dispatch.called)
  })

  it('should call next instead of dispatch if the actions is marked', function() {
    const m = store => next => action => {
      return store.dispatch(action)
    }
    blockable(m)(store)(next)(blockedAction)
    assert.equal(true, next.called)
    assert.equal(false, dispatch.called)
  })

  it('should call dispatch if the actions is unmarked', function() {
    const m = store => next => action => {
      return store.dispatch(action)
    }
    blockable(m)(store)(next)(action)
    assert.equal(false, next.called)
    assert.equal(true, dispatch.called)
  })
})

describe('block(action)', function() {
  it('should mark the action and keep the type of action', function() {
    const action = {type: 'ACTION', payload: {}}
    const blockedAction = block(action)
    assert.deepEqual(blockedAction, Object.assign({
      '@@redux-saga-block/BLOCKED': true
    }, action))
  })
})

describe('block(type)', function() {
  it('should return the function which', function() {
    const ACTION_ONE = 'ACTION_ONE'
    const ACTION_TWO = 'ACTION_TWO'
    const actionOne = {type: ACTION_ONE, payload: {}}
    const blockedActionOne = block(actionOne)
    const actionTwo = {type: ACTION_TWO, payload: {}}
    const blockedActionTwo = block(actionTwo)
    assert.equal(block(ACTION_ONE)(actionOne), false)
    assert.equal(block(ACTION_ONE)(blockedActionOne), true)
    assert.equal(block(ACTION_ONE)(actionTwo), false)
    assert.equal(block(ACTION_ONE)(blockedActionTwo), false)
    assert.equal(block(ACTION_TWO)(actionOne), false)
    assert.equal(block(ACTION_TWO)(blockedActionOne), false)
    assert.equal(block(ACTION_TWO)(actionTwo), false)
    assert.equal(block(ACTION_TWO)(blockedActionTwo), true)
  })
})

describe('isBlocked(action)', function() {
  it('should return true only if the action is marked', function() {
    const action = {type: 'ACTION', payload: {}}
    const blockedAction = block(action)
    assert.equal(isBlocked(action), false)
    assert.equal(isBlocked(blockedAction), true)
  })
})
