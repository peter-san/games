import Place from "../catan-single/place/Place";
import Street from "../catan-single/street/Street";
import Tile from "../catan-single/tile/Tile";
import classes from "./GameField.module.scss";
import { Catan } from '../../types/game';
import { Area } from "../catan-single/model/Area";
import { Edge } from "../catan-single/model/Edge";
import { Node } from "../catan-single/model/Node";
import { RoadProcessor } from "../catan-single/game/RoadProcessor";
import { SettlementProcessor } from "../catan-single/game/SettlementProcessor";
import { useState } from 'react';
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { ActionType, CardType } from "../catan-single/model/Player";
import { useActions } from "../../hooks/useActions";
import { ActionsPanel } from './gamePanel/ActionsPanel';


function GameField({
  game, 
}: {
  game: Catan,
}) {


  const { cardSelected } = useTypedSelector(
    (state) => state.gameReducer
  );

  const gameId = game.id

  const { buyTown, buyCity, buyStreet, playRoads, moveRobber, playKnight } = useActions();

  const roadsProcessor = new RoadProcessor(game.nodes, game.edges)
  const townProcessor = new SettlementProcessor(game.nodes, game.edges)

  const [firstEdge, setFirstEdge] = useState<Edge|undefined>(undefined)

  let purchasableRoads: Set<Edge> = new Set();
  let purchasableTowns: Set<Node> = new Set();

  if(game.me?.active){
    purchasableRoads = roadsProcessor.findPurchasable(game.me)
    console.log("purchasable roads: "+ JSON.stringify(purchasableRoads))

    purchasableTowns = game.state === 'init' 
      ? townProcessor.initializationTowns(game.me) 
      : townProcessor.findPurchasable(game.me)
  }

  const isSelectableOverFirst = (edge: Edge) => {
     if(firstEdge !==undefined && edge.street === undefined) {
      console.log( "common: " + edge.hasCommonNode(firstEdge))
      return edge.hasCommonNode(firstEdge)
     }
    return false;
  }

  const edgeSelected = (edge: Edge) => {
    if(cardSelected === CardType.ROADS) {
      if(purchasableRoads.has(edge) || isSelectableOverFirst(edge)){
        return () => {
          if(!firstEdge){
            setFirstEdge(edge)
            console.log("select second road")
          }else {
            console.log(`selected for roads: ${JSON.stringify(firstEdge)} and ${JSON.stringify(edge)}`)
            playRoads(gameId, firstEdge, edge)
            setFirstEdge(undefined)
          }
        }
      }

    }else {
      if(purchasableRoads.has(edge)){
        return ()=>buyStreet(gameId, edge)
      }
    }
    return undefined
  }

  const nodeSelected = (node: Node) => {
    if(game.me?.active){

      if(node.isSettlement() 
        && node.building?.color === game.me.color
        && game.state !== 'init'){
        return ()=> buyCity(gameId, node)
      }else if(purchasableTowns.has(node)){
        return ()=> buyTown(gameId, node)
      }
    }
    return undefined
  }

  const robber = game.me?.can(ActionType.MOVE_ROBBER) || cardSelected === CardType.KNIGHT

  const moveRobberF = (area: Area) => {
    (cardSelected === CardType.KNIGHT ? playKnight : moveRobber)(gameId, area)
  }


  return (
    <>


      <div className={classes.Field} >
  
        { game.dice ? (<div style = {{color: 'yellow', fontSize: 30}}>{game.dice?.first + " " +game.dice?.second}</div>): undefined }

        {game.fields.map((area, index) => (
          <Tile
            area={area}
            key={area.key()}
            activated={game.dice?.sum() === area.value} //{dicedAreas.has(area)}
            onRobberSelect={robber ? moveRobberF: undefined}
          />
        ))}

        {game.edges.map((edge) => (
          <Street edge={edge} key={edge.key()} onBuy={edgeSelected(edge)} selected = {edge === firstEdge}/>
        ))}

        {game.nodes.map((node, index) => (
          <Place
            node={node}
            key={node.key()}
            activated={false} //{selectedCities.has(node)}
            onBuy={nodeSelected(node)}
          />
        ))}
      </div>
    </>
  );
}

export default GameField;
