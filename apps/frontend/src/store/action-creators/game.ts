import axios from "axios"
import {Dispatch} from "react"
import {toast} from "react-toastify";
import {CardType, Color} from "../../components/catan-single/model/Player";
import {Resource, Resources} from "../../components/catan-single/model/Resource";
import { CatanConstructor } from "../../services/CatanConstructor";
import {
    reset,
    join,
    CatType,
} from "../../services/SettlerService";
import {GameActionTypes, GameAction, Position, Catan} from '../../types/game';

export const fetchGame = (type : string, id : string) => playerAction(async () => {
    const response = await axios.get<CatType>(HOST + `/games/catan/${id}`)
    return new CatanConstructor(response.data).toGame()
})

type Point = {
    x: number,
    y: number
}
type Line = {
    from: Point,
    to: Point
}

export const roll = (id : string) => postAct(id, 'roll')
export const closeMove = (id : string) => postAct(id, 'close-move', 'close move')

export const buyTown = (id : string, position : Point) => postAct(id, 'towns', 'buy town '+ position, position)
export const buyCity = (id : string, position : Point) => postAct(id, 'cities', 'buy city '+ position, position)
export const buyStreet = (id : string, line : Line) => postAct(id, 'streets', 'buy street '+ line, line)
export const buyCard = (id : string) => postAct(id, 'cards', 'buy cards')

export const moveRobber = (id : string, position : Point) => 
    postAct(id, 'robber', 'move robber to '+ position, position)

export const playKnight = (id : string, position : Point) => 
    postAct(id, 'cards/knight', 'play knight to '+ position, position)
export const playMonopole = (id : string, resource : Resource) => 
    postAct(id, 'cards/monopole', 'play monopole for '+ resource, {resource})
export const playInvention = (id : string, first : Resource, second : Resource) => 
    postAct(id,  "cards/invention/",`play invention for  ${first} ${second}`, {first, second})
export const playRoads = (id : string, first : Line, second : Line) => 
    postAct(id, "cards/roads/",`play roads for  ${first} ${second}`, {first, second})

export const trade = (id : string, exchange : Resources) => postAct(id, "market",`market exchange ${Object.fromEntries(exchange)}`, Object.fromEntries(exchange))
export const exchange = (id : string, recipient : Color, resources : Resources) => 
    postAct(id,  "exchange", `exchange request to ${recipient} : ${Object.fromEntries(resources)}`, {recipient, resources: Object.fromEntries(resources)})

export const exchangeResponse = (id : string, requestId : string, accepted: boolean) => playerAction(async () => {
    const response = await axios.put<CatType>(HOST + `/games/catan/${id}/exchange/${requestId}`, {accepted})
    return new CatanConstructor(response.data).toGame()
})

export const resetGame = (id : string, standard : boolean, players : Map < Color, String >) => playerAction( () => reset(id, standard, players))

export const joinGame = (id : string, color : Color) => playerAction( () => join(id, color))


const post = async (id: string, suffix: string, message?: string, body?: any): Promise<Catan> => {
    message ?? console.log(message)
    const response = await axios.post<CatType>(HOST + `/games/catan/${id}/${suffix}`, body)
    return new CatanConstructor(response.data).toGame()
}

export const startGame = (id : string, history: any) => playerAction(  (async () => {
    const game = await post(id, 'close-move')
    history.push("/games/"+id)
    return game
}))

export const createGame = (standard : boolean, color : Color) => async(dispatch : Dispatch < GameAction >) => {

    console.log('create new game ')
    axios.post(HOST + `/games/catan`,{ standard, color})
        //.then(() => )
        .catch(e => toast.error(e.response.data.message, {autoClose: 1000}))
}

export const updateGame = (id : string, message : any, history: any) => async(dispatch : Dispatch < GameAction >) => {

    const update = JSON.parse(message)

    if(update.type === "UPDATED"){
        dispatch({
            type: GameActionTypes.FETCH_SUCCESS, 
            payload: new CatanConstructor(update.content).toGame()})
    }else if(update.type === "DELETED"){
        dispatch({
            type: GameActionTypes.CLEAR_GAME, 
        })
        history.push("/games")
    }
}


export const update = async (id: string, game: any): Promise<Catan> => {
    return new CatanConstructor(JSON.parse(game)).toGame()
}


const HOST = process.env.REACT_APP_API_URL
export const deleteGame = (id : string) => async(dispatch : Dispatch < GameAction >) => {

    console.log('delete game ' + id)
    axios.delete(HOST + `/games/catan/${id}`)
        .then(() => dispatch({type: GameActionTypes.CLEAR_GAME}))
        .catch(e => {
            console.error(e)
            toast.error(e.response.data.message, {autoClose: 1000})
        })
    
}

const postAct = (id: string, suffix: string, message?: string, body?: any) => playerAction(() => post(id, suffix, message, body))

const playerAction = (action : () => Promise < Catan >) => async(dispatch : Dispatch < GameAction >) => {
    action()
        .then(c => dispatch({type: GameActionTypes.FETCH_SUCCESS, payload: c}))
        .catch(e => {
            console.error("ERROR: " + JSON.stringify(e))

            if(e?.response?.data?.message){
                toast.error(e.response.data.message, {autoClose: 1000})
            }else{
                
                toast.error(e.message, {autoClose: 1000})
            }
        })
}

export const clearGame = () => {
    console.log("clear triggered")
    return async(dispatch : Dispatch < GameAction >) => {
        dispatch({type: GameActionTypes.CLEAR_GAME})
    }
}

export const cardSelected = (type: CardType) => {
    console.log("knight card selected")
    return async(dispatch : Dispatch < GameAction >) => {
        dispatch({type: GameActionTypes.CARD_SELECTED, payload: type})
    }
}

// move 4 in row
export const move = (id : string, position : Position) => {
    return async(dispatch : Dispatch < GameAction >) => {
        try {
            dispatch({type: GameActionTypes.MOVE, id, position})
            const response = await axios.post(process.env.REACT_APP_API_URL + `/games/connect-four/${id}/${position}`)
            dispatch({type: GameActionTypes.FETCH_SUCCESS, payload: response.data})
        } catch (e) {
            console.log(e)
            dispatch({
                type: GameActionTypes.FETCH_ERROR,
                payload: 'error: ' + e
            })
        }
    }
}
