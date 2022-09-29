import { Edge } from "./model/Edge";
import { Area } from "./model/Area";
import { Node } from "./model/Node";
import { Color, Player } from "./model/Player";
import { Resource, Resources } from "./model/Resource";
import { notNull } from "../../Util";
import { Harbor } from "./model/Harbor";
import { Building, ConstructionType } from './model/Construction';

export interface GameInitialization {
  nodes: Node[];
  edges: Edge[];
  areas: Area[];
  player: Player[];
}

export class GameCreator {
  private nodeLine = (line: number, first: number, last: number): Node[] => {
    const nodes = [];
    for (let i = first; i <= last; i++) {
      nodes.push(new Node(i, line));
    }

    return nodes;
  };

  public static findNode = (nodes: Node[], x: number, y: number): Node => {
    return notNull(nodes.find((n) => n.x === x && n.y === y));
  };

  public static findEdge = (edges: Edge[], key: string): Edge => {
    return notNull(edges.find((edge) => edge.key() === key));
  };

  private edgeLine = (
    line: number,
    first: number,
    last: number,
    nodes: Node[]
  ): Edge[] => {
    const items = [];
    for (let i = first; i < last; i++) {
      items.push(
        new Edge(
          GameCreator.findNode(nodes, i, line),
          GameCreator.findNode(nodes, i + 1, line)
        )
      );
    }

    return items;
  };

  private shuffleArray = <T,>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  private VALUES: number[] = [
    6, 3, 8, 2, 4, 5, 10, 5, 9, 6, 9, 10, 11, 3, 12, 8, 4, 11,
  ];

  private FIELDS: (Resource | undefined)[] = [
    Resource.LUMBER,
    Resource.WOOL,
    Resource.WOOL,
    Resource.GRAIN,
    Resource.ORE,
    Resource.GRAIN,
    Resource.LUMBER,
    Resource.LUMBER,
    Resource.BRICK,
    undefined,
    Resource.ORE,
    Resource.GRAIN,
    Resource.GRAIN,
    Resource.ORE,
    Resource.LUMBER,
    Resource.WOOL,
    Resource.BRICK,
    Resource.WOOL,
    Resource.BRICK,
  ];

  private constructAreas = (shuffle: boolean = false): Area[] => {
    let values = !shuffle
      ? this.VALUES
      : this.shuffleArray(this.VALUES.slice());
    let fields = !shuffle
      ? this.FIELDS
      : this.shuffleArray(this.FIELDS.slice());
    let areas: Area[] = fields.map((element) => new Area(-1, -1, 0, element));

    let lines = [
      [2, 6],
      [1, 7],
      [0, 8],
      [1, 7],
      [2, 6],
    ];

    let k = 0;
    let hadDesert = 0;
    for (let y = 0; y < lines.length; y++) {
      for (let x = lines[y][0]; x <= lines[y][1]; x += 2) {
        areas[k].x = x;
        areas[k].y = y;
        if (!areas[k].resource) {
          hadDesert = -1;
          areas[k].robber = true
        } else {
          areas[k].value = values[k + hadDesert];
        }
        k++;
      }
    }



    return areas;
  };

  private edgeColumn = (
    line: number,
    first: number,
    last: number,
    nodes: Node[]
  ): Edge[] => {
    const items = [];
    for (let i = first; i <= last; i += 2) {
      items.push(
        new Edge(
          GameCreator.findNode(nodes, i, line),
          GameCreator.findNode(nodes, i, line + 1)
        )
      );
    }

    return items;
  };

  private player = (color: Color): Player => {
    return new Player(
      color,
      Resource.values().reduce((map: Resources, value: Resource): Resources => {
        map.set(value, 10);
        return map;
      }, new Map()),
      []
    );
  };

  public create = (): GameInitialization => {
    const nodes = this.nodeLine(0, 2, 8)
      .concat(this.nodeLine(1, 1, 9))
      .concat(this.nodeLine(2, 0, 10))
      .concat(this.nodeLine(3, 0, 10))
      .concat(this.nodeLine(4, 1, 9))
      .concat(this.nodeLine(5, 2, 8));

    const edges = this.edgeLine(0, 2, 8, nodes)
      .concat(this.edgeColumn(0, 2, 8, nodes))
      .concat(this.edgeLine(1, 1, 9, nodes))
      .concat(this.edgeColumn(1, 1, 9, nodes))
      .concat(this.edgeLine(2, 0, 10, nodes))
      .concat(this.edgeColumn(2, 0, 10, nodes))
      .concat(this.edgeLine(3, 0, 10, nodes))
      .concat(this.edgeColumn(3, 1, 9, nodes))
      .concat(this.edgeLine(4, 1, 9, nodes))
      .concat(this.edgeColumn(4, 2, 8, nodes))
      .concat(this.edgeLine(5, 2, 8, nodes));

    GameCreator.findEdge(edges, "2|0>3|0").harbor = new Harbor({});
    GameCreator.findEdge(edges, "5|0>6|0").harbor = new Harbor({
      resource: Resource.WOOL,
    });
    GameCreator.findEdge(edges, "8|1>9|1").harbor = new Harbor({});
    GameCreator.findEdge(edges, "10|2>10|3").harbor = new Harbor({});
    GameCreator.findEdge(edges, "8|4>9|4").harbor = new Harbor({
      resource: Resource.BRICK,
      leftSide: false,
    });
    GameCreator.findEdge(edges, "5|5>6|5").harbor = new Harbor({
      resource: Resource.LUMBER,
      leftSide: false,
    });
    GameCreator.findEdge(edges, "2|5>3|5").harbor = new Harbor({
      leftSide: false,
    });
    GameCreator.findEdge(edges, "1|3>1|4").harbor = new Harbor({
      resource: Resource.GRAIN,
      leftSide: false,
    });
    GameCreator.findEdge(edges, "1|1>1|2").harbor = new Harbor({
      resource: Resource.ORE,
      leftSide: false,
    });

    GameCreator.findNode(nodes, 2, 3).building = new Building(ConstructionType.SETTLEMENT, Color.ORANGE);
    GameCreator.findNode(nodes, 7, 3).building = new Building(ConstructionType.SETTLEMENT, Color.ORANGE);
    GameCreator.findEdge(edges, "2|3>3|3").street = Color.ORANGE;
    GameCreator.findEdge(edges, "7|3>7|4").street = Color.ORANGE;

    GameCreator.findNode(nodes, 3, 2).building = new Building(ConstructionType.SETTLEMENT, Color.MAGENTA);
    GameCreator.findNode(nodes, 7, 1).building = new Building(ConstructionType.SETTLEMENT, Color.MAGENTA);
    GameCreator.findEdge(edges, "2|2>3|2").street = Color.MAGENTA;
    GameCreator.findEdge(edges, "6|1>7|1").street = Color.MAGENTA;




    let reducer = (
      mm: Map<Resource, number>,
      t: Resource
    ): Map<Resource, number> => {
      mm.set(t, 0);
      return mm;
    };

    let m: Map<Resource, number> = new Map();
    Resource.values().forEach((t) => m.set(t, 0));

    Resource.values().reduce(reducer, new Map());

    return {
      nodes,
      edges,
      areas: this.constructAreas(),
      player: [this.player(Color.ORANGE), this.player(Color.MAGENTA)],
    };
  };
}
