import { Color } from './Player';
import { Resource } from './Resource';
export enum ConstructionType {
    SETTLEMENT = 'settlement',
    CITY = 'city',
    ROAD = 'road'
}

export namespace ConstructionType {
    export const costs = (type: ConstructionType) => {
        switch (type) {
            case ConstructionType.ROAD:
                return Resource.batch({ lumber: -1, brick: -1 })
            case ConstructionType.SETTLEMENT:
                return Resource.batch({ lumber: -1, wool: -1, brick: -1, grain: -1 })
            case ConstructionType.CITY:
                return Resource.batch({ ore: -3, grain: -2 })
        }
    }

    export const limit = (type: ConstructionType): number => {
        switch (type) {
            case ConstructionType.ROAD:
                return 15
            case ConstructionType.SETTLEMENT:
                return 5
            case ConstructionType.CITY:
                return 4
        }
    }
}

export class Building {
    constructor(public type: ConstructionType.SETTLEMENT | ConstructionType.CITY, public color: Color) { }
}