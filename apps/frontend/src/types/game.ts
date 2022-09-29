import { Area } from "../components/catan-single/model/Area"
import { Node } from "../components/catan-single/model/Node"
import { Edge } from "../components/catan-single/model/Edge"
import { Player, Color, CardType } from '../components/catan-single/model/Player';
import { Resources } from '../components/catan-single/model/Resource';

export interface Game {
    id: string
    type: 'ConnectFour' | 'Catan'
    status: 'CREATED' | 'STARTED' | 'FINISHED'
    owner: string
    guest?: string
}

export type Position = 0 | 1 | 2 | 3 | 4 | 5 | 6
export interface ConnectFour extends Game {
    moves: Position[]
    type: 'ConnectFour'
}

export class Dice {
    constructor(readonly first: number, readonly second: number) { }
    sum = () => this.first + this.second
}

export interface Update {
    type: "CREATED" | "UPDATED" | "DELETED"
    content: Catan
}

export interface Catan extends Game {
    type: 'Catan',
    fields: Area[],
    nodes: Node[],
    edges: Edge[],
    players: Player[],
    me?: Player,
    state: 'creation' | 'play'| 'init',
    exchanges: ExchangeRequest[],
    dice?: Dice
}

export type ExchangeRequest = {
    requestId: string
    resources: Resources
    sender: Color
    recipient: Color
}

export interface GameState {
    game?: Catan,
    cardSelected?: CardType,
    loading: boolean,
    error: string | null
}

export enum GameActionTypes {
    FETCH = 'FETCH_GAME',
    MOVE = 'MOVE_GAME',
    FETCH_SUCCESS = 'FETCH_GAME_SUCCESS',
    FETCH_ERROR = 'FETCH_GAME_ERROR',
    CLEAR_GAME = 'CLEAR_GAME',
    CARD_SELECTED = 'CARD_SELECTED',
}

interface FetchGameAction {
    id: string
    type: GameActionTypes.FETCH
}

interface MoveGameAction {
    id: string
    position: Position
    type: GameActionTypes.MOVE
}

interface FetchGameSuccessAction {
    type: GameActionTypes.FETCH_SUCCESS
    payload: Catan
}

interface FetchGameErrorAction {
    type: GameActionTypes.FETCH_ERROR
    payload: string
}

interface ClearGameAction {
    type: GameActionTypes.CLEAR_GAME
}

interface CardSelectedAction {
    type: GameActionTypes.CARD_SELECTED
    payload: CardType
}

export type GameAction =
    FetchGameAction |
    FetchGameSuccessAction |
    FetchGameErrorAction|
    MoveGameAction | 
    ClearGameAction | 
    CardSelectedAction;

