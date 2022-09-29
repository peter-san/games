import classes from "./Field.module.scss";
import Tile from "./tile/Tile";
import Street from "./street/Street";
import Place from "./place/Place";
import { Node, GameElement } from "./model/Node";
import { Edge } from "./model/Edge";
import { Area } from "./model/Area";
import { ConstructionType } from "./model/Construction";
import { notNull } from "../../Util";

type FieldProps = {
  edges: Edge[];
  nodes: Node[];
  areas: Area[];
  selectedCities: Set<Node>;
  dicedAreas: Set<Area>;
  buildable?: Buildable;
  onBuild: (type: ConstructionType, item: GameElement) => void;
  onRobberSelect?: (area: Area) => void;
};

export type Buildable = {
  items: Set<GameElement>;
  type: ConstructionType;
};

function Field({
  edges,
  nodes,
  areas,
  selectedCities,
  dicedAreas,
  ...props
}: FieldProps) {
  return (
    <div className={classes.Field}>
      {areas.map((area, index) => (
        <Tile
          area={area}
          key={area.key()}
          activated={dicedAreas.has(area)}
          onRobberSelect={
            props.onRobberSelect && !area.robber
              ? props.onRobberSelect
              : undefined
          }
        />
      ))}
      {edges.map((edge) => (
        <Street
          edge={edge}
          key={edge.key()}
          onBuy={
            props.buildable?.type === ConstructionType.ROAD &&
            props.buildable.items.has(edge)
              ? () => props.onBuild(ConstructionType.ROAD, edge)
              : undefined
          }
        />
      ))}

      {nodes.map((node, index) => (
        <Place
          node={node}
          key={node.key()}
          activated={selectedCities.has(node)}
          onBuy={
            props.buildable && props.buildable.items.has(node)
              ? () => props.onBuild(notNull(props.buildable).type, node)
              : undefined
          }
        />
      ))}
    </div>
  );
}

export default Field;
