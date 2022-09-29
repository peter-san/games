import { Area } from "../model/Area";
import { Building, ConstructionType } from "../model/Construction";
import { Node, Point } from "../model/Node";
import { Color } from "../model/Player";
import { Resource, Resources } from "../model/Resource";
import { getOrCreate, notNull } from "../../../Util";

export type DiceUpdate = {
  areas: Set<Area>;
  nodes: Set<Node>;
  playerUpdates: Map<Color, Resources>;
};

export class DiceProcessor {
  constructor(private nodes: Node[], private areas: Area[]) {}

  public update = (dice: number): DiceUpdate => {
    const areas = new Set<Area>(
      this.areas.filter((area) => !area.robber && area.value === dice)
    );
    const nodes = new Set<Node>();
    const playerUpdates = new Map<Color, Resources>();
    areas.forEach((area) => {
      const resource: Resource = notNull(area.resource);
      for (const node of this.surroundingCities(area)) {
          console.log(node.building)
        this.processUpdates(node, resource, playerUpdates);
        nodes.add(node);
      }
    });

    return { areas, nodes, playerUpdates };
  };

  private processUpdates = (
    node: Node,
    resource: Resource,
    updates: Map<Color, Resources>
  ) => {
    const building: Building = notNull(node.building);
    const resources = getOrCreate(updates, building.color, () => new Map());

    const current = getOrCreate(resources, resource, () => 0);
    resources.set(
    resource,
    current + (building.type === ConstructionType.CITY ? 2 : 1)
    );
   
  };

  private surroundingPlaceKeys = (area: Area): string[] => {
    const keys: string[] = [];

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        keys.push(Point.key(area.x + j, area.y + i));
      }
    }
    return keys;
  };

  private surroundingCities = (area: Area): Node[] => {
    const keys: string[] = this.surroundingPlaceKeys(area);
    return this.nodes.filter((n) => keys.includes(n.key()) && n.building);
  };
}
