import React from "react";
import { Link } from "react-router-dom";
import { ConnectFour } from "../../types/game";
import cl from "./GameItem.module.scss";
import { useActions } from "../../hooks/useActions";
import { join } from "../../Util";

export const GameItem = ({ game }: { game: ConnectFour }) => {
  
  const {connectToGame} = useActions()

  return (
    <Link className={join(cl.item, cl[game.status.toLocaleLowerCase()])} to={`${game.id}`} >
     
      <span>id: {game.id}</span>{" "}
      <span>owner: {game.owner}</span>{" "}
      <span>guest: {game.guest}</span>{" "}
      <span>#{game.moves.length}</span>{" "}
      <button onClick={e=>{
        e.preventDefault()
        connectToGame(game.id)
      }}>join</button>
     
    </Link>
  );
};
