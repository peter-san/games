import { Building, ConstructionType } from "./Construction";

export class Point {

    constructor(readonly x: number, readonly y: number) { }

    public position = (radius: number): Point => {
        const width = radius * Math.cos(Math.PI / 6)
        const height = radius * Math.cos(Math.PI / 3)

        let r = this.y % 2 === 0;
        let c = this.x % 2 === 0;

        let left = this.x * width;
        let top = 4 + this.y * 1.5 * radius + (c !== r ? 0 : height);

        return new Point(left, top);
    }

    public key = (): string => `${this.x}|${this.y}`

    public static key = (x: number, y: number): string => `${x}|${y}`
}

export interface GameElement {
    key(): string
}

export class Node extends Point implements GameElement {
    constructor(readonly x: number, readonly y: number, public building?: Building) {
        super(x, y)
    }

    public isSettlement = () => this.building && this.building.type === ConstructionType.SETTLEMENT
    public isCity = (): boolean => {
        if(!this.building) return false
        return this.building.type === ConstructionType.CITY
    }
}