import { combineReducers } from "redux"
import { gameReducer } from './gameReducer';
import { gameListReducer } from './gameListReducer';

import { authReducer } from './authReducer';

export const rootReducer = combineReducers({ gameReducer, gameListReducer, authReducer })

export type RootState = ReturnType<typeof rootReducer>