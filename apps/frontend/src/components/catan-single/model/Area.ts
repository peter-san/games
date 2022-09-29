import { Point } from './Node';
import { Resource } from './Resource';

export class Area extends Point {
    constructor(
        public x: number,
        public y: number,
        public value: number,
        readonly resource?: Resource,
        public robber?: boolean) {
        super(x, y)
    }
}