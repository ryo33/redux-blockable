'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var BLOCKED = '@@redux-saga-block/BLOCKED';

var isBlocked = exports.isBlocked = function isBlocked(action) {
  return action[BLOCKED] === true;
};

var block = exports.block = function block(action) {
  if (typeof action === 'string') {
    // block(type)
    var type = action;
    return function (action) {
      return action.type === type && isBlocked(action);
    };
  } else {
    // block(action)
    return _extends(_defineProperty({}, BLOCKED, true), action);
  }
};

var blockable = exports.blockable = function blockable(middleware) {
  return function (store) {
    return function (next) {
      var dispatch = function dispatch(action) {
        if (isBlocked(action)) {
          next(action);
        } else {
          store.dispatch(action);
        }
      };
      var store = { dispatch: dispatch, getState: store.getState };
      var nextDispatch = function nextDispatch(action) {
        if (!isBlocked(action)) {
          next(action);
        }
      };
      return middleware(store)(nextDispatch);
    };
  };
};