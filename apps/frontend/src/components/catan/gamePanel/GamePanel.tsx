
import Players from './Players'

import { Catan } from "../../../types/game";
import ResourcePanel from './ResourcePanel';

export default function GamePanel({game}: {game: Catan}) {
  return (  
    <>
        <Players game = {game} active = {true}/>
        {game.me ? <ResourcePanel resources={game.me.resources}/> : undefined }
    </>
  )
}
