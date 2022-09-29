import { ConstructionType } from "../model/Construction";
import { Edge } from '../model/Edge';
import { GameElement, Node } from "../model/Node";
import { Player } from "../model/Player";
import { Resources, Resource } from '../model/Resource';

export abstract class ConstructionProcessor<T extends GameElement> {

    constructor(protected type: ConstructionType, protected nodes: Node[], protected edges: Edge[]) { }

    public abstract findPurchasable(player: Player): Set<T>

    public canBuild(player: Player): boolean {
        return this.areItemsLeft(player)
            && this.hasEnoughResources(player)
            && this.findPurchasable(player).size > 0
    }

    public abstract count(player: Player): number

    public build(player: Player, item: T): void {
        ConstructionProcessor.updateCards(
            player, ConstructionType.costs(this.type));

        this.updateItemAfterBuild(player, item)
    }
    public abstract updateItemAfterBuild(player: Player, item: T): void

    private areItemsLeft = (player: Player): boolean =>
        this.count(player) < ConstructionType.limit(this.type)

    private hasEnoughResources = (player: Player): boolean =>
        Array.from(ConstructionType.costs(this.type)).every(entry => {
            return (player.resources.get(entry[0]) ?? 0) + entry[1] >= 0
        })

    static updateCards = (player: Player, update: Resources) => {
        update.forEach((value: number, key: Resource) => {
            const currentValue: number = player.resources.get(key) ?? 0;
            player.resources.set(key, currentValue + value);
        });
    };

    static merge = (cards: Resources, update: Resources) => {
        update.forEach((value: number, key: Resource) => {
            const currentValue: number = cards.get(key) ?? 0;
            cards.set(key, currentValue + value);
        });
        return cards;
    };

    protected connections = (node: Node): Edge[] => {
        return this.edges.filter((edge) => edge.from === node || edge.to === node);
    };
}