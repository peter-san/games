import { Catan, Update } from "./game"

export interface GameListState {
    games: Catan[],
    loading: boolean,
    error: string | null
}

export enum GameListActionTypes {
    FETCH = 'FETCH_GAMES',
    FETCH_SUCCESS = 'FETCH_GAMES_SUCCESS',
    FETCH_ERROR = 'FETCH_GAMES_ERROR',
    CREATE_GAME = 'CREATE_GAME',
    UPDATE_GAME = 'UPDATE_GAME'
}

interface FetchGamesAction {
    type: GameListActionTypes.FETCH
}

interface FetchGamesSuccessAction {
    type: GameListActionTypes.FETCH_SUCCESS
    payload: Catan[]
}

interface FetchGamesErrorAction {
    type: GameListActionTypes.FETCH_ERROR
    payload: string
}

interface UpdateGameAction {
    type: GameListActionTypes.UPDATE_GAME
    payload: Update
}

interface CreateGameAction {
    type: GameListActionTypes.CREATE_GAME
}


export type GamesAction = FetchGamesAction | FetchGamesSuccessAction | FetchGamesErrorAction | UpdateGameAction | CreateGameAction;