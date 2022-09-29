import { ConstructionProcessor } from './ConstructionProcessor';
import { Player } from '../model/Player';
import { Node } from '../model/Node';
import { Edge } from '../model/Edge';
import { Building, ConstructionType } from '../model/Construction';

export class CityProcessor extends ConstructionProcessor<Node> {
    
    constructor(nodes: Node[], edges: Edge[]) {
        super(ConstructionType.CITY, nodes, edges)
    }

    public findPurchasable(player: Player): Set<Node> {
        return new Set(this.nodes.filter(
            (n) =>
                n.building &&
                n.building.type === ConstructionType.SETTLEMENT &&
                n.building.color === player.color
        ));
    }

    public count(player: Player): number {
        return this.nodes.filter(
            (n) =>
                n.building &&
                n.building.type === ConstructionType.CITY &&
                n.building.color === player.color
        ).length;
    }

    public updateItemAfterBuild(player: Player, item: Node): void {
        item.building = new Building(ConstructionType.CITY, player.color);
    }
}