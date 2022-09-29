import React, { useState } from "react";
import Field, { Buildable } from "../Field";
import Dice from "../dices/Dice";
import { GameCreator, GameInitialization } from "../GameCreator";
import { Area } from "../model/Area";
import { Node, GameElement } from "../model/Node";
import { Color, Player } from "../model/Player";
import { Resources } from "../model/Resource";
import PlayerPanel from "../PlayerPanel";
import { ConstructionType } from "../model/Construction";
import { ConstructionProcessor } from "./ConstructionProcessor";
import { SettlementProcessor } from "./SettlementProcessor";
import { RoadProcessor } from "./RoadProcessor";
import { CityProcessor } from "./CityProcessor";
import { DiceProcessor } from "./DiceProcessor";
import { join } from "../../../Util";
import { Catan } from "../../../types/game";

function Game({game, id}: {game:Catan, id: string}) {

  console.log(game)

  const initialization: GameInitialization = new GameCreator().create();
  const [nodes] = useState(initialization.nodes);
  const [edges] = useState(initialization.edges);
  const [areas] = useState(initialization.areas);
  const [selectedCities, setSelectedCities] = useState<Set<Node>>(new Set());
  const [dicedAreas, setDicedAreas] = useState<Set<Area>>(new Set());

  const [buildable, setBuildable] = useState<Buildable | undefined>(undefined);

  const [players, setPlayers] = useState(initialization.player);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [robberSelection, setRobberSelection] = useState(false)

  const settlements = new SettlementProcessor(nodes, edges);
  const roads = new RoadProcessor(nodes, edges);
  const cities = new CityProcessor(nodes, edges);
  const diceProcessor = new DiceProcessor(nodes, areas);

  function processor(
    type: ConstructionType
  ): ConstructionProcessor<GameElement> {
    switch (type) {
      case ConstructionType.SETTLEMENT:
        return settlements;
      case ConstructionType.CITY:
        return cities;
      case ConstructionType.ROAD:
        return roads;
    }
  }

  const cleanHighlighting = () => {
    setDicedAreas(new Set());
    setSelectedCities(new Set());
    setBuildable(undefined);
  };

  const showPurchasable = (
    player: Player,
    construction: ConstructionType
  ): void => {
    cleanHighlighting();

    setBuildable({
      items: processor(construction).findPurchasable(player),
      type: construction,
    });
  };

  const canPurchase = (
    player: Player,
    construction: ConstructionType
  ): boolean => {
    return processor(construction).canBuild(player);
  };

  const build = (type: ConstructionType, item: GameElement): void => {
    processor(type).build(players[currentIndex], item);
    cleanHighlighting();
  };

  const marketAction = (update: Resources) => {
    ConstructionProcessor.updateCards(players[currentIndex], update);
  };

  const setNewDiceValue = (value: number) => {
    cleanHighlighting();

    setCurrentIndex((currentIndex + 1) % players.length);
    if(value === 7){
      setRobberSelection(true)
      return
    }

    const update = diceProcessor.update(value);

    setDicedAreas(update.areas);
    setSelectedCities(update.nodes);

    players.forEach((player) => {
      const up = update.playerUpdates.get(player.color);

      if (up) {
        ConstructionProcessor.updateCards(player, up);
      }
    });
  };

  const onNewRobberPositionSelected = (area:Area) =>{
    areas.forEach(a=>a.robber=false)
    area.robber=true
    setRobberSelection(false)
  }



  return (
    <div className="game">
      <div className="header">
        <Dice setDice={setNewDiceValue} className={join(robberSelection ? 'disabled':undefined)}></Dice>
      </div>

      <div className="main-field">
        <Field
          edges={edges}
          nodes={nodes}
          areas={areas}
          selectedCities={selectedCities}
          dicedAreas={dicedAreas}
          buildable={buildable}
          onBuild={build}
          onRobberSelect = {robberSelection ? onNewRobberPositionSelected: undefined}
        ></Field>
      </div>
      <div className="player left-panel">
        <PlayerPanel
          player={players[0]}
          active={Color.ORANGE === players[currentIndex].color}
          onShowPurchasable={(type) => showPurchasable(players[0], type)}
          isPurchasable={(type) => canPurchase(players[0], type)}
          onMarketAction={marketAction}
        ></PlayerPanel>
      </div>
      <div className="player right-panel">
        <PlayerPanel
          player={players[1]}
          active={Color.MAGENTA === players[currentIndex].color}
          onShowPurchasable={(type) => showPurchasable(players[1], type)}
          isPurchasable={(type) => canPurchase(players[1], type)}
          onMarketAction={marketAction}
        ></PlayerPanel>
      </div>
      <div className="footer"></div>
    </div>
  );
}

export default Game;
