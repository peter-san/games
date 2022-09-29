import { join } from "../../../Util";
import { Resource, Resources } from "../../catan-single/model/Resource";
import cl from "./OfferDialog.module.scss";
import { useState, useEffect } from "react";
import Card from "../../catan-single/Card";
import { Color, Player } from "../../catan-single/model/Player";
import { Button } from "antd";


export default function OfferDialog({
  accept, decline,
  me,
  sender,
  offer
}: {
  message: string;
  me: Player;
  accept: () => void;
  decline: () => void;
  sender: Color,
  offer: Resources
}) {

  const price = () => Array.from(offer).filter(e=>e[1]<0)
  const ware = () => Array.from(offer).filter(e=>e[1]>0)

  const enoughResources = () => price().every(e=> (me.resources.get(e[0]) ?? 0) >= -e[1])

  return (
    <div className={cl.dialog}>
      <div className={cl.message}> would you accept?
      </div>

      <div className={cl.my} style={{ backgroundColor: me.color }}>
        {price().map((e) => (<Card type={e[0]} value={-e[1]} key={e[0]} />))}
      </div>
      <div className={cl.offered} style={{ backgroundColor: sender }}>
        {ware().map((e) => (<Card type={e[0]} value={e[1]} key={e[0]} />))}
      </div>

      <div className={cl.buttons}>
        <Button  className={ enoughResources() ? "" : "disabled"} onClick={accept}> accept</Button>
        <Button onClick={decline}> decline</Button>
      </div>
    </div>
  );
}