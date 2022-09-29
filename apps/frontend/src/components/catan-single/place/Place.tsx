import React, { CSSProperties } from "react";
import classes from "./Place.module.scss";

import { Node, Point } from "../model/Node";
import { ConstructionType } from "../model/Construction";

function Place({
  node,
  activated,
  onBuy
}: {
  node: Node;
  activated: boolean;
  onBuy?: (node: Node) => void;
}) {
  const radius = 11.5;
  const placeSize = 2.7;

  const point: Point = node.position(radius);

  const border = onBuy
    ? "4px solid white"
    : activated && node.building
    ? "4px solid yellow"
    : "1px solid darkblue";

  const offset = placeSize / 1.85 + (activated || onBuy ? 0 : 0) + (node.isCity() ? 1.2 : 0);

  const styles: CSSProperties = {
    left: point.x - offset + "%",
    top: point.y - offset + "%",
    backgroundColor: "lightgrey",
    border: border,
  };

  if(node.building){
    styles.backgroundColor = node.building.color
    styles.border = '1px solid darkblue'

    if(node.building.type === ConstructionType.CITY){
      console.log("city")
      styles.width = '5%'
      styles.height = '5%'
      styles.border = '1px solid darkblue'
    }
  }
    

  if(onBuy){
    styles.border = '1px dashed darkblue'
  }else if (node.building) {
    styles.backgroundColor = node.building.color
  }

  return (
    <div
      onClick={() => (onBuy ? onBuy(node) : undefined)}
      className={classes.Place}
      style={styles}
    >
      {""}
    </div>
  );
}

export default Place;
