import { GameListState, GamesAction, GameListActionTypes} from '../../types/games';


const initialGamesState: GameListState = {
    games: [],
    loading: false,
    error: null
}

export const gameListReducer = (state = initialGamesState, action: GamesAction): GameListState => {
    switch (action.type) {
        case GameListActionTypes.FETCH:
            return { loading: true, error: null, games: [] }
        case GameListActionTypes.CREATE_GAME:
            return state
        case GameListActionTypes.FETCH_SUCCESS:
            return { loading: false, error: null, games: action.payload }
        case GameListActionTypes.FETCH_ERROR: {
            return { loading: false, error: action.payload, games: [] }
        }
        case GameListActionTypes.UPDATE_GAME: {

            const game = action.payload.content
            const index = state.games.findIndex(g=>g.id === game.id)

            console.log("game index: "+index)
            console.log(game)
            let games = [...state.games]

            switch(action.payload.type){
                case "CREATED": games.push(game); break
                case "UPDATED": games[index] = game; break
                case "DELETED": games.splice(index, 1); break

            }

            return {...state, games: games}
        }
        default: 
            return state
    }
}