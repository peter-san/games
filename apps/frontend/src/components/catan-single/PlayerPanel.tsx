import React from "react";
import { Player } from "./model/Player";
import { Modal } from "../modal/Modal";
import { useState } from "react";
import Cards from "./Cards";
import Market from "./market/Market";
import { Resources } from "./model/Resource";
import { ConstructionType as CT } from "./model/Construction";

const PlayerPanel = ({
  player,
  ...props
}: {
  player: Player;
  onShowPurchasable: (type: CT) => void;
  isPurchasable: (type: CT) => boolean,
  onMarketAction: (resources: Resources) => void;
  active: boolean;
}) => {
  const [modal, setModal] = useState(false);

  return (
    <div className={!props.active ? "disabled" : ""}>
      <Modal visible={modal} setVisible={setModal}>
        <Market
          player={player}
          onBuy={(prop) => {
            props.onMarketAction(prop);
            setModal(false);
          }}
        ></Market>
      </Modal>

      {[CT.ROAD, CT.SETTLEMENT, CT.CITY].map((type) => (
        <button
          onClick={() => props.onShowPurchasable(type)}
          disabled={!props.isPurchasable(type)}
        >
          {type}
        </button>
      ))}

      <button onClick={() => setModal(true)}>market</button>
      <div className="card" style={{ backgroundColor: player.color }}></div>
      <Cards cards={player.resources}></Cards>
    </div>
  );
};

export default PlayerPanel;
