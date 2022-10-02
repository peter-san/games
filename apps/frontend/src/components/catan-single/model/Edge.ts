import { Harbor } from './Harbor';
import { GameElement, Node } from './Node';
import { Color } from './Player';

export class Edge implements GameElement {
    constructor(
        readonly from: Node, 
        readonly to: Node, 
        public street?: Color, 
        public harbor?: Harbor,
        public longestPath: Boolean = false) { }

    public static key = (fromKey: String, toKey: string) => `${fromKey}>${toKey}`
    public key = (): string => Edge.key(this.from.key(), this.to.key())

    public hasCommonNode = (edge: Edge) => this.to === edge.to
        || this.from === edge.to
        || this.to === edge.from
        || this.from === edge.from
}