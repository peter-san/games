import classes from "./Tile.module.scss";
import { Area } from "../model/Area";
import { Point } from "../model/Node";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fa0, fa1, fa2, fa3, fa4, fa5, fa6, fa7, fa8, fa9, faDiceD20 } from '@fortawesome/free-solid-svg-icons'
import { join } from '../../../Util';

function Tile({
  area,
  activated,
  onRobberSelect,
}: {
  area: Area;
  activated: boolean;
  onRobberSelect?: (area: Area) => void;
}) {
  const radius = 11.5;

  const width = 2 * radius * Math.cos(Math.PI / 6);
  const height = radius * 2;
  const point: Point = area.position(radius);

  const icon = (num: number) => {switch (num) {
    case 0: return fa0
    case 1: return fa1
    case 2: return fa2
    case 3: return fa3
    case 4: return fa4
    case 5: return fa5
    case 6: return fa6
    case 7: return fa7
    case 8: return fa8
    case 9: return fa9
    default:
      throw new Error("unexpected number  "+ num)}
  }


  const value = (value: number) => value<10 
    ? <FontAwesomeIcon className={join(classes.number)} icon={icon(value)} /> 
    : <>
        <FontAwesomeIcon className={join(classes.number, classes.number1)} icon={fa1} />
        <FontAwesomeIcon className={join(classes.number, classes.number2)} icon={icon(value-10)} />
      </>
  

  const redness = (value: number) => (7-Math.abs(7-value))*255/7

  return (
    <div
      className={classes.tile}
      style={{
        left: point.x + "%",
        top: point.y - radius / 2 + "%",
        width: width + "%",
        height: height + "%",
      }}
    >
      <div className={classes.content + (activated ? " " + classes.diced : "")}>
        <div className={classes.type + " " + (area.resource ?? "desert")}></div>
      
        {area.value!==-1 ?
          <div className={classes.value} style={{color: `rgb(${redness(area.value)},0,0)`}}> {value(area.value)} </div> 
        : undefined}

        {area.robber ? <div className={classes.robber}></div> : undefined}
        {onRobberSelect && !area.robber ? (
          <div
            className={classes.robberSelection}
            onClick={() => onRobberSelect(area)}
          ></div>
        ) : undefined}
      </div>
    </div>
  );
}

export default Tile;
