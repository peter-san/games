import React, { CSSProperties } from "react";
import classes from "./Street.module.scss";
import { join } from "../../../Util";
import { fa3, fa1, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function Street({ edge, onBuy, ...props }: any) {
  const radius = 11.5;

  const horizontal = edge.from.y === edge.to.y;
  const even = edge.from.x % 2 !== edge.from.y % 2;

  let angle = horizontal ? (even ? 30 : -30) : 90;
  let yOffset = horizontal
    ? (even ? 2.3 : -3.6) //+ (props.onBuy ? -0.5 : 0)
    : 5.15;
  let xOffset = horizontal ? 0.85 : -4.05// + (props.onBuy ? -0.4 : 0);

  const point = edge.from.position(radius);

  const styles: CSSProperties = {
    left: point.x + xOffset + "%",
    top: point.y + yOffset + "%",
    transform: "rotate(" + angle + "deg)",
    backgroundColor: edge.street ? edge.street : "lightgrey",
  };

  if (props.onBuy) { styles.border = "1px dashed blue" }

  if(props.selected) {styles.border = "3px solid yellow"}

  return (
    <div
      onClick={onBuy ? () => onBuy(edge) : undefined}
      className={classes.street}
      {...props}
      style={styles}
    >
      {edge.harbor ? (
        <div
          style={{
            transform: edge.harbor.leftSide
              ? "rotate(0deg)"
              : "rotate(180deg)",
          }}
          className={join(
            classes.harbor,
            edge.harbor.leftSide ? classes.left : classes.right,
            edge.harbor.resource ? edge.harbor.resource : "three-to-one"
          )}
        >
          {!edge.harbor.resource ?
            <>
              <FontAwesomeIcon className={join(classes.number, classes.number1)} icon={fa3} style={{left:"0%"}} />
              <FontAwesomeIcon className={join(classes.number, classes.number1)} icon={faArrowRight} style={{left:"30%"}}/>
              <FontAwesomeIcon className={join(classes.number, classes.number2)} icon={fa1} style={{left:"60%"}}/>
            </>
                   : undefined}
        </div>
      ) : undefined}
    </div>
  );
}
