# redux-blockable

## API

### isBlocked(action)
Returns true if the action is marked as blocked.

### block(action)
Mark the action as blocked.

### blockable(middleware)
Prevents nextDispatch and calls nextDispatch with store.dispatch, if the action is marked as blocked.
