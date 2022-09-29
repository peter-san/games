import { Catan } from "../../types/game";
import GameField from "./GameField";

export default function SettlerGame({ game }: { game: Catan }) {


  return (
    <div className="catan-game">   
      <div className="main-field">
        <GameField game={game}></GameField>
      </div>
    </div>
  );
}
