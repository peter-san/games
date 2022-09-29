import { join } from "../../../Util";
import { Resource, Resources } from "../../catan-single/model/Resource";
import cl from "./ExchangeDialog.module.scss";
import { useState, useEffect } from "react";
import Card from "../../catan-single/Card";
import { Color, Player } from "../../catan-single/model/Player";
import { Button } from "antd";

export default function ExchangeDialog({
  message,
  callback,
  me,
  recipient
}: {
  message: string;
  me: Player;
  callback: (color: Color, resources: Resources) => void;
  recipient: Color
}) {
  const [selected, setSelected] = useState<Resource[]>([])
  const [expected, setExpected] = useState<Resource[]>([])

  const addResource = (resource: Resource) => {
    setSelected(selected.concat(resource))
    console.log("add  "+JSON.stringify(selected))
  };

  const checkOption = (type: Resource, count: number): boolean => {
   // if (!selectedWare) return false;

    const expCondition = expected.findIndex( e => e === type) === -1
    const resCondition = selected.filter(e => e === type).length < count

    console.log("add "+ expCondition +" "+resCondition+ " "+JSON.stringify(selected))
    return resCondition && expCondition
  };

  const combine = ()=>{
    const res = new Map()

    selected.forEach(r=>res.set(r, (res.get(r) ?? 0) + 1 ))
    expected.forEach(r=>res.set(r, (res.get(r) ?? 0) - 1 ))
    return res
  }

  useEffect(() => {
    return () => {
   //   setSelected([]);
    };
  }, []);

  return (
    <div className={cl.dialog}>
      <div className={cl.message}>
      </div>

      <div className={cl.resources} style={{ backgroundColor: me.color }}>
        {Array.from(me.resources).map((e) => (
          <Card
            type={e[0]}
            value={e[1]}
            key={e[0]}
            className={checkOption(e[0], e[1]) ? "" : "disabled"}
            onClick={() => addResource(e[0])}
          ></Card>
        ))}
      </div>
      <div className={cl.selected}>
        {selected.map((type, index) => (
          <div
            key={index}
            className={join("card", type)}
            onClick={() => {
              let arr = [...selected];
              arr.splice(index, 1);
              setSelected(arr);
            }}
          ></div>
        ))}
      </div>

      <div className={cl.expected}>
        {expected.map((type, index) => (
          <div
            key={index}
            className={join("card", type)}
            onClick={() => {
              let arr = [...expected];
              arr.splice(index, 1);
              setExpected(arr);
            }}
          ></div>
        ))}
      </div>

      <div className={cl.ware} style={{ backgroundColor: recipient }}>
        {Resource.values().map((type, index) => (
          <div
            className={join("card", type, selected.includes(type) ? "disabled" : "")}
            key={index}
            
            onClick={() => setExpected(expected.concat(type))}
          ></div>
        ))}
      </div>
      
      <Button 
        className={join(cl.buttons, (selected.length > 0 && expected.length > 0) ? "" : "disabled")}
        onClick={() => callback(recipient, combine())}
      >
        Offer
      </Button>
    </div>
  );
}
