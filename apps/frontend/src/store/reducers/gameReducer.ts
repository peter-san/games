import {GameState, GameAction, GameActionTypes, Catan } from '../../types/game';


const initialGameState: GameState = {
    game: undefined,
    loading: false,
    error: null,
    cardSelected: undefined
}

export const gameReducer = (state = initialGameState, action: GameAction): GameState => {
    switch (action.type) {
        case GameActionTypes.FETCH:
            return { loading: true, error: null, game: undefined, cardSelected: undefined }
        case GameActionTypes.MOVE:
            return { loading: false, error: null, game: undefined, cardSelected: undefined }
        case GameActionTypes.FETCH_SUCCESS:
            return { loading: false, error: null, game: action.payload, cardSelected: undefined }
        case GameActionTypes.FETCH_ERROR: 
            return { loading: false, error: action.payload, game: undefined, cardSelected: undefined }
        case GameActionTypes.CLEAR_GAME: 
            return { loading: false, error: null, game: undefined, cardSelected: undefined }
        case GameActionTypes.CARD_SELECTED: 
            return { ...state, cardSelected: action.payload }
        default: 
            return state
    }
}
