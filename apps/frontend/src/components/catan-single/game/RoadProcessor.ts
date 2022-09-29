import { ConstructionProcessor } from './ConstructionProcessor';
import { Color, Player } from '../model/Player';
import { Node } from '../model/Node';
import { Edge } from '../model/Edge';
import { ConstructionType } from '../model/Construction';


export class RoadProcessor extends ConstructionProcessor<Edge> {

    constructor(nodes: Node[], edges: Edge[]) {
        super(ConstructionType.ROAD, nodes, edges)
    }

    public findPurchasable(player: Player): Set<Edge> {
        return new Set(this.edges.filter(
            (edge) =>
                !edge.street &&
                (this.isConnectable(edge.from, player.color) ||
                    this.isConnectable(edge.to, player.color))));
    }

    public isConnectable(over: Node, color: Color): boolean {
        return (over.building && over.building.color === color) ||
            (!over.building && this.connections(over).some((to) => to.street === color));
    }

    public count(player: Player): number {
        return this.edges.filter((e) => e.street && e.street === player.color).length;
    }

    public updateItemAfterBuild(player: Player, item: Edge): void {
        item.street = player.color;
    }

}