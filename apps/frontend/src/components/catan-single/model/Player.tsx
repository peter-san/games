import { Resources } from "./Resource";

export enum Color {
  ORANGE = "orange",
  RED = "red",
  BLUE = "blue",
  MAGENTA = "magenta",
}

export enum CardType {
  KNIGHT = "knight",
  MONOPOLE = "monopole",
  ROADS = "roads",
  INVENTION = "invention",
  VICTORY = "victory",
}

export type DevelopmentCard = {
  type: CardType
  played: boolean
}

export enum ActionType {
  DICE = 'dice',
  CLOSE = 'close',
  MOVE_ROBBER = 'move-robber',
  MARKET = 'market',
  BUY_CARD = 'buy-card',
  PLAY_KNIGHT = 'play-knight',
  PLAY_MONOPOLE = 'play-monopole',
  PLAY_INVENTION = 'play-invention',
  PLAY_ROADS = 'play-roads'
}

export class Player {

  public contingent: {
    roads: number;
    settlements: number;
    cities: number;
  };

  constructor(
    readonly color: Color, 
    public resources: Resources, 
    readonly cards: DevelopmentCard[], 
    readonly active: boolean = false, 
    readonly allowedActions: ActionType[] = []) {

    this.contingent = {
      roads: 15,
      cities: 4,
      settlements: 5,
    };
  }

  public canAny = (actions: ActionType[]) => this.allowedActions.some(a => actions.indexOf(a) > -1) 
  public can = (action: ActionType) => this.allowedActions.some(a => a === action) 
  
}
