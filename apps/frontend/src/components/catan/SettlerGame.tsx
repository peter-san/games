import { faDice } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "antd";
import { Catan } from "../../types/game";
import GameField from "./GameField";
import { ActionsPanel } from "./gamePanel/ActionsPanel";
import cl from "./SettlerGame.module.scss";


export default function SettlerGame({ game }: { game: Catan }) {


  return (
    <div className={cl.catanGame}>   
      <div className={cl.mainField}>
        <GameField game={game}></GameField>
        {game.me ? (
          <div className={cl.actions}>
            <ActionsPanel game = {game} />
          </div> ) : undefined }

      </div>

    </div>
  );
}
