import { Resource, Resources } from '../components/catan-single/model/Resource';
import axios from "axios"
import { ActionType, Color, DevelopmentCard } from '../components/catan-single/model/Player';
import { CatanConstructor } from './CatanConstructor';

//const HOST = 'https://b6fblpe4i6.execute-api.eu-north-1.amazonaws.com/api' //process.env.REACT_APP_API_URL
const HOST = process.env.REACT_APP_API_URL

export type CatType = {
    id: string
    fields: AreaType[]
    players: Map<Color, PlayerType>
    harbors: HarborType[]
    moves: Move[],
    state: 'init'|'play'
}

export type PlayerType = {
    name: string
    towns: Point[]
    cities: Point[]
    roads: Line[]
    resources: Resources
    cards: DevelopmentCard[]
    allowedActions: ActionType[]
}

export type Move = {
    color: Color
    actions: Action[]
}

export interface Action {
    type: 'dice' | 'close' | 'exchange-request' | 'exchange-response' // TODO merge with ActionType in Player
    [key: string]: any;
}

export interface ExchangeRequestType extends Action{
    type: 'exchange-request'
    requestId: string
    exchange: Resources
    recipient: Color
    sender: Color
}  

export type Point = { x: number, y: number }
export type Line = { from: Point, to: Point }

type AreaType = {
    x: number,
    y: number,
    value: number,
    resource?: Resource,
    robber?: boolean
}

export type HarborType = {
    line: Line,
    resource?: Resource
}

export const reset = async (id: string, standard: boolean, players: Map<Color, String>): Promise<any> =>{
    const response = await axios.put<CatType>(HOST + `/games/catan/${id}`, {
        standard,
        players: Object.fromEntries(players)
    })
    return new CatanConstructor(response.data).toGame()
}


export const join = async (id: string, color: Color): Promise<any> =>{
    const response = await axios.put<CatType>(HOST + `/games/catan/${id}/players`, {
        color
    })
    return new CatanConstructor(response.data).toGame()
}

export const create = async (standard: boolean, color: Color): Promise<any> =>{
    const response = await axios.post<CatType>(HOST + `/games/catan`, {
        standard,
        color
    })
    return new CatanConstructor(response.data).toGame()
}

