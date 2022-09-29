import axios from "axios"
import { Dispatch } from "react"
import {  GameActionTypes, GameAction, ConnectFour, Catan, Update } from "../../types/game"
import { GameListActionTypes, GamesAction} from "../../types/games"
import { CatanConstructor } from '../../services/CatanConstructor';
import { CatType } from '../../services/SettlerService';

//const HOST = 'https://b6fblpe4i6.execute-api.eu-north-1.amazonaws.com/api' //process.env.REACT_APP_API_URL
const HOST = process.env.REACT_APP_API_URL

export const fetchGames = () => {
    return async (dispatch: Dispatch<GamesAction>) => {
        try{
            dispatch({type: GameListActionTypes.FETCH})
            //const {username} = useTypedSelector(state => state.authReducer)
            const response = await axios.get(HOST+`/games/catan`)

            console.log(response)
            //const constructor = new CatanConstructor()
            dispatch({type: GameListActionTypes.FETCH_SUCCESS, payload: response.data.map((g: CatType) => new CatanConstructor(g).toGame())})
        }catch (e) {
            console.log(e)
            dispatch({type: GameListActionTypes.FETCH_ERROR, payload: 'error: ' + e})
        }
    }
}

export const connectToGame = (id:string) => {
    return async (dispatch: Dispatch<GameAction>) => {
        try {
            const response = await axios.put<ConnectFour>(HOST+`/games/connect-four/${id}/guest`)
        }catch(e) {
            console.log(e)
            dispatch({type: GameActionTypes.FETCH_ERROR, payload: 'error: ' + e})
        }
    }
}

export const createGame = () => {
    return async (dispatch: Dispatch<GameAction>) => {
        try {
            const response = await axios.post<ConnectFour>(HOST+`/games/connect-four`)
        }catch(e) {
            console.log(e)
           
        }
    }
}

export const updateSingleGame = (update: Update) => {
    return async (dispatch: Dispatch<GamesAction>) => {
        dispatch({type: GameListActionTypes.UPDATE_GAME, payload: update})
    }
}
