import { Catan, Dice, ExchangeRequest } from "../types/game";
import { Area } from "../components/catan-single/model/Area";
import { Node } from "../components/catan-single/model/Node";
import { Edge } from "../components/catan-single/model/Edge";
import { castToMap, notNull } from '../Util';
import { Color, Player, ActionType } from '../components/catan-single/model/Player';
import { Building, ConstructionType } from "../components/catan-single/model/Construction";
import { store } from "../store";
import { Harbor } from '../components/catan-single/model/Harbor';
import { PlayerType, CatType, HarborType, Line, Point, Action, ExchangeRequestType } from './SettlerService';

export class CatanConstructor {

    readonly areas: Area[];
    readonly nodes: Map<String, Node>;
    readonly edges: Map<String, Edge>;
    readonly playerMap: Map<Color, PlayerType>;

    constructor(private dto: CatType) {
        this.playerMap = castToMap<Color, PlayerType>(dto.players);
        this.areas = dto.fields.map(f => new Area(f.x, f.y, f.value, f.resource, f.robber));
        this.nodes = this.constructNodes();
        this.edges = this.constructEdges(dto.harbors);

    }

    public toGame = (): Catan => {

        const myId = store.getState().authReducer.username;
        const currentMove = this.dto.moves[this.dto.moves.length - 1];

        let me: Player | undefined = undefined;
        const players: Player[] = [];

        this.playerMap.forEach((player, color) => {

            if(!!player.longestPath){
                player.longestPath.forEach(key => this.edges.get(this.convertEdgeKey(key))!!.longestPath = true)
            }

            const pl = new Player(
                color,
                castToMap(player.resources),
                player.cards,
                currentMove.color === color,
                player.allowedActions,
                !!player.longestPath
                );
            players.push(pl);

            if (player.name === myId) {
                me = pl;

            }
        });

        const toDice = (action?: Action) => action ? new Dice(action.first, action.second ) : undefined

        const catan = {
            id: this.dto.id,
            type: 'Catan',
            fields: this.areas,
            status: 'STARTED',
            owner: '1',
            nodes: Array.from(this.nodes.values()),
            edges: Array.from(this.edges.values()),
            players: players,
            me: me,
            state: this.dto.state,
            exchanges: me ? this.findExchangeRequests(currentMove.actions, me['color']) : [],
            dice: toDice(currentMove.actions.find(act => act.type === ActionType.DICE)),
        } as Catan


        console.log(catan)
        return catan;
    };

    private findExchangeRequests(actions: Action[], recipient: Color): ExchangeRequest[] {
        const toReq = (type: ExchangeRequestType): ExchangeRequest => {
            return {
                ...type,
                resources: castToMap(type.exchange)
            }
        }

        const requests = actions
            .filter(a => a.type === 'exchange-request' && a.recipient === recipient)
            .filter(a => !actions.some(b => b.type === 'exchange-response' && b.requestId === a.requestId))
            .map(a => a as ExchangeRequestType)
            .map(toReq)

        return Array.from(new Map(requests.map(request => [request.sender, request]))).map(e => e[1]);
    }

    private constructNodes = () => {
        const nodes = new Map<String, Node>();
        this.areas.forEach(area => {
            for (let i = 0; i < 6; i++) {
                const node = new Node(area.x + i % 3, area.y + (i > 2 ? 1 : 0));
                this.addConstruction(node);

                nodes.set(node.key(), node);
            }
        });

        return nodes;
    };

    private constructEdges = (harbors: HarborType[]) => {
        const edges = new Map<String, Edge>();

        const findNode = (area: Area, x: number, y: number) => notNull(this.nodes.get(Node.key(area.x + x, area.y + y)));
        const addEdge = (area: Area, x1: number, y1: number, x2: number, y2: number) => {
            const edge = new Edge(findNode(area, x1, y1), findNode(area, x2, y2));
            this.addRoad(edge);
            edges.set(edge.key(), edge);
        };

        this.areas.forEach(area => {
            addEdge(area, 0, 0, 1, 0);
            addEdge(area, 1, 0, 2, 0);
            addEdge(area, 0, 1, 1, 1);
            addEdge(area, 1, 1, 2, 1);
            addEdge(area, 0, 0, 0, 1);
            addEdge(area, 2, 0, 2, 1);
        });

        const lineKey = (line: Line) => Edge.key(Node.key(line.from.x, line.from.y), Node.key(line.to.x, line.to.y));

        const harborSide = ({ from, to }: { from: Point; to: Point; }): boolean => {

            var left: Area | undefined;
            var right: Area | undefined;

            const get = (dX: number, dY: number) => this.areas.find(area => area.x === from.x + dX && area.y === from.y + dY);

            if (from.y === to.y) {
                if ((from.x % 2 === 0 && from.y % 2 === 0) || (from.x % 2 === 1 && from.y % 2 === 1)) {
                    left = get(-1, -1);
                    right = get(0, 0);
                } else {
                    left = get(0, -1);
                    right = get(-1, 0);
                }
            } else if (from.x === to.x) {
                left = get(0, 0);
                right = get(-2, 0);
            } else {
                console.error("unexpected line");
            }

            if (!left && !right) {
                throw new Error(`no area found for ${JSON.stringify(from)} > ${JSON.stringify(to)}`);
            }

            if (left && right) {
                throw new Error(`harbor is inside ${JSON.stringify(from)} > ${JSON.stringify(to)} 
                left: ${JSON.stringify(left)} right ${JSON.stringify(right)}`);
            }

            return left === undefined;
        };

        harbors.forEach(harbor => {
            notNull(edges.get(lineKey(harbor.line))).harbor = new Harbor({ resource: harbor.resource, leftSide: harborSide(harbor.line) });
        });

        return edges;
    };

    private addRoad = (edge: Edge) => {
        this.playerMap.forEach((player, color) => {
            const filtered = player.roads.filter(line => this.checkPoint(line.from, edge.from) && this.checkPoint(line.to, edge.to));
            if (filtered.length > 0) {
                edge.street = color;
            }
        });
    };

    private convertEdgeKey = (key: string) => {
        const regex = new RegExp("(\\d+)([><])(\\d+)")
        const exp: RegExpExecArray = regex.exec(key)!!

        const horizontal = exp[2] === ">"

        const nodeFromKey = exp[1]+"|"+exp[3]
        const nodeToKey = (+exp[1] + (horizontal?1:0)) +"|"+(+exp[3]+ (horizontal?0:1))
        return Edge.key(nodeFromKey, nodeToKey)
    }


    private checkPoint(first: Point, second: Point) {
        return first.x === second.x && first.y === second.y;
    }

    private addConstruction(node: Node) {
        this.playerMap.forEach((player, color) => {
            const filteredTowns = player.towns.filter(point => this.checkPoint(point, node));
            if (filteredTowns.length > 0) {
                node.building = new Building(ConstructionType.SETTLEMENT, color);
            }

            const filteredCities = player.cities.filter(point => this.checkPoint(point, node));
            if (filteredCities.length > 0) {
                node.building = new Building(ConstructionType.CITY, color);
            }
        });
    }
}
