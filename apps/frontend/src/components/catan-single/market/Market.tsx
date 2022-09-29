import React from "react";
import cl from "./Market.module.scss";
import { Player } from "../model/Player";
import { Resource, Resources } from "../model/Resource";
import { useState } from "react";
import { join, notNull } from "../../../Util";
import Card from "../Card";
import { Harbor } from "../model/Harbor";
import MarketItem from "./MarketItem";

function Market({
  player,
  harbours,
  onBuy,
}: {
  player: Player;
  harbours?: Harbor[]
  onBuy: (resources: Resources) => void;
}) {
  const [selectedWare, setSelectedWare] = useState<Resource | undefined>(
    undefined
  );

  const defaultPrice = () => (harbours!!.filter(h=>!h.resource).length > 0 ? 3 : 4);
  const evaluatePrice = (ware: Resource) => harbours!!.filter(h=>h.resource === ware).length > 0 ? 2 : defaultPrice();

  const [price, setPrice] = useState<number>(defaultPrice());

  const [selectedResource, setSelectedResource] = useState<Resource | undefined>(undefined);

  const selectResource = (resource: Resource | undefined) => {
    setSelectedResource(resource)
    setSelectedWare(undefined)

    if (resource) {
      setPrice(evaluatePrice(resource))
    } else {
      setPrice(defaultPrice)
    }
  };

  const checkOption = (type: Resource, count: number): boolean => {
   // if (!selectedWare) return false;
    return type !== selectedWare && count >= evaluatePrice(type); //FIXME
  };

  const buy = () => {
    onBuy(
      new Map([
        [notNull(selectedWare), 1],
        [notNull(selectedResource), -price],
      ])
    );
    selectResource(undefined);
  };

  return (

        
    <div className={cl.market}>

      <div className={cl.resources} style={{ backgroundColor: player.color }}>
        {Array.from(player.resources).map((e) => (
          <Card
            type={e[0]}
            value={e[1]}
            key={e[0]}
            className={checkOption(e[0], e[1]) ? "" : "disabled"}
            onClick={() => selectResource(e[0])}
          ></Card>
        ))}
      </div>

      <div className={cl.selectedResources}>
        {selectedResource
          ? Array.from({ length: price }).map((value, index) => (
            <div className={join("card", selectedResource)} key={index} onClick={() => selectResource(undefined)}></div>
              // <MarketItem type={selectedResource} onClick={() => selectResource(undefined)}/>
            )): undefined}
      </div>

      {/* <div {join(cl.ware, selectedWare ? "disabled" : undefined)}> */}
      <div className={cl.ware}>
        {Resource.values().map((type) => (
          <div className={join("card", type, (selectedResource === undefined || type === selectedResource) ? 'disabled' : undefined)}  key={type} onClick={() => setSelectedWare(type)}></div>
        ))}
      </div>

      <div className={cl.selectedWare}>
        {selectedWare ? (
          <MarketItem type={selectedWare} onClick={() => setSelectedWare(undefined)} />
          ) : undefined}
      </div>
      
      

      <span className={cl.price}>{`${price} : 1`}</span>
      <button
        className={join(cl.buttons, selectedWare ? undefined : "disabled")}
        onClick={buy}
      >
        Buy!
      </button>
    </div>
  );
}

export default Market;
