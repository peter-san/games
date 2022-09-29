import { join } from "../../../Util";
import cl from "./CardsDialog.module.scss";
import { ActionType, CardType, DevelopmentCard, Player } from "../../catan-single/model/Player";
import { Button } from "antd";

export default function CardsDialog({
  player,
  selected,
  onBuy,
}: {
  player: Player
  selected: (type: CardType) => void,
  onBuy: () => void
}) {

  const availableCards = player.cards
    .filter(c=>!c.played)
    .reduce((map, cur) => {
    map.set(cur.type, (map.get(cur.type) ?? 0)+1)
      return map
    }, new Map())

  console.log(availableCards)

  return (
    <div className={cl.dialog}>
      <div className={cl.message}>
        <span>Development Cards</span>
      </div>
      <Button  className={cl.button} onClick={onBuy} disabled={!player.can(ActionType.BUY_CARD)}> Buy card</Button> 
      <div className={cl.cards}>

        {
          Array.from(availableCards).map(([type, amount]) => (
            <div className={cl.container} key={type}>
              <div className={join("development-card", type, cl.card)}   onClick={() =>  selected(type)}/>
              <div className={cl.amount}>{" x "+amount}</div>
            </div>
          ))
        }

      </div>
    </div>
  );
}
