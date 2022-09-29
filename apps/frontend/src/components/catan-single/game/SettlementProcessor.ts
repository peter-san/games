import { ConstructionProcessor } from './ConstructionProcessor';
import { Player } from '../model/Player';
import { Node } from '../model/Node';
import { Edge } from '../model/Edge';
import { Building, ConstructionType } from '../model/Construction';

export class SettlementProcessor extends ConstructionProcessor<Node> {
    constructor(nodes: Node[], edges: Edge[]) {
        super(ConstructionType.SETTLEMENT, nodes, edges)
    }

    public initializationTowns(player: Player): Set<Node> {
        return new Set(this.nodes.filter(this.isGroundable))
    }

    public findPurchasable(player: Player): Set<Node> {
        const purchasable: Node[] = [];
        this.edges
            .filter((e) => e.street && e.street === player.color)
            .forEach((e) => {
                if (this.isGroundable(e.from)) {
                    purchasable.push(e.from);
                }
                if (this.isGroundable(e.to)) {
                    purchasable.push(e.to);
                }
            });

        return new Set(purchasable);
    }

    public isGroundable = (node: Node) =>
        !node.building && this.neighbours(node).every((n) => !n.building);

    private neighbours = (node: Node): Node[] => {
        return this.connections(node).map((edge) =>
            edge.from === node ? edge.to : edge.from
        );
    };

    public count(player: Player): number {
        return this.nodes.filter(
            (n) =>
                n.building &&
                n.building.type === ConstructionType.SETTLEMENT &&
                n.building.color === player.color
        ).length;
    }

    public updateItemAfterBuild(player: Player, item: Node): void {
        item.building = new Building(ConstructionType.SETTLEMENT, player.color);
    }
}