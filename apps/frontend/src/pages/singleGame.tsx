import { FC, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useActions } from "../hooks/useActions";
import { useTypedSelector } from "../hooks/useTypedSelector";
import ConnectFourField from '../components/connect-four/ConnectFourField';
import { ConnectFour } from "../types/game";


const GamePage: FC = () => {
  const { game, loading, error } = useTypedSelector(
    (state) => state.gameReducer
  );
  const { fetchGame } = useActions();

  const {id} = useParams<{id:string}>()

  useEffect(() => {
    fetchGame('connect-four', id);
  }, [id]);



  if (loading) {
    return <div>lade</div>;
  }

  if (error) {
    return <div>error: ${error}</div>;
  }

  console.log(game)

  return <div>game</div>
  // return <ConnectFourField game = {game! as ConnectFour} id = {id}></ConnectFourField>
}

export default GamePage;
