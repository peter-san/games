
import * as GameListActions from './games'
import * as GameActions from './game'
import * as AuthorizationActions from './authorization'

export default {
    ...GameListActions, ...GameActions, ...AuthorizationActions
}