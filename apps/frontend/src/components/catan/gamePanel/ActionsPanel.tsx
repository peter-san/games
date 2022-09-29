import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'antd';
import React, { useState } from 'react'
import { useActions } from '../../../hooks/useActions';
import { Catan } from '../../../types/game';
import Market from '../../catan-single/market/Market';
import { ActionType, CardType, Player } from '../../catan-single/model/Player';
import { Modal } from "../../modal/Modal";
import { faCartShopping, faCheck, faDice, faSdCard } from '@fortawesome/free-solid-svg-icons';
import CardsDialog from '../modal/CardsDialog';
import DevelopmentCardDialog from '../modal/DevelopmentCardDialog';
import { Resource } from '../../catan-single/model/Resource';
import { toast } from 'react-toastify';

export const ActionsPanel = ({game}: {game: Catan}) => {

    const {roll, closeMove, trade , buyCard, playInvention, playMonopole, cardSelected} = useActions()
    const [marketModal, setMarketModal] = useState(false)
    const [cardsModal, setCardsModal] = useState(false)

    const [monopolyModal, setMonopolyModal] = useState(false)
    const [inventionModal, setInventionModal] = useState(false)


    const triggerCard = (type: CardType) => {
        switch(type) {
          case CardType.INVENTION:  setInventionModal(true); break
          case CardType.MONOPOLE:   setMonopolyModal(true); break
          case CardType.KNIGHT:     cardSelected(type); break
          case CardType.ROADS:  
            toast.info("select 2 roads")
            cardSelected(type)
        }
        setCardsModal(false)
      }

    const id = game!!.id

    const myHarbours = () => {
        const color = game.me?.color
    
        return game.edges.filter(
          edge => edge.harbor != null 
          && ( edge.from.building?.color === color || edge.to.building?.color === color))
          .map(e => e.harbor!!)
      }

    const me = game.me!!

    const buttonStyle = {verticalAlign: -2, marginRight: 3}

    const cardsActions = [ActionType.BUY_CARD, ActionType.PLAY_KNIGHT,ActionType.PLAY_MONOPOLE,ActionType.PLAY_INVENTION,ActionType.PLAY_ROADS]

    console.log(me.allowedActions)

    return (
        <>
            {marketModal ? <Modal visible={true} setVisible={setMarketModal}>
                <Market
                    player={me}
                    harbours = {myHarbours()}
                    onBuy={prop => {
                        trade(id, prop)
                        setMarketModal(false)
                    }}
                ></Market>
            </Modal>: undefined}
            {cardsModal ? <Modal visible={true} setVisible={setCardsModal}>
                <CardsDialog
                    player={me}
                    selected = {triggerCard}
                    onBuy={() => {
                        buyCard(id)
                        //setCardsModal(false)
                    }}
                />
            </Modal>: undefined}

            {inventionModal ? <Modal visible = {true} setVisible={setInventionModal}>
                <DevelopmentCardDialog message="select 2 cards you would like to get" callback={(types: Resource[])=>{
                    console.log("invention: " + types)
                    playInvention(id, types[0], types[1])
                    setInventionModal(false)
                }} amount={2} />
            </Modal>: undefined}


            {monopolyModal ? <Modal visible = {true} setVisible={setMonopolyModal}>
                <DevelopmentCardDialog message="select what only you should own" callback={(types: Resource[])=>{
                    console.log("monopoly: " + types)
                    playMonopole(id, types[0])
                    setMonopolyModal(false)
                }} amount={1} />
            </Modal>: undefined}

            <span > 
                <Button style={buttonStyle} icon={<FontAwesomeIcon icon={faDice}/>} onClick={() => roll(id)} disabled = {!me.can(ActionType.DICE)} />                      
                <Button style={buttonStyle} icon={<FontAwesomeIcon icon={faCartShopping} />} onClick={() => setMarketModal(true)} disabled = {!me.can(ActionType.MARKET)}></Button>
                <Button style={buttonStyle} icon={<FontAwesomeIcon icon={faSdCard} />} onClick={() => setCardsModal(true)} disabled = {!me.canAny(cardsActions)}></Button>
                {/* <Button style={buttonStyle} icon={<FontAwesomeIcon icon={faSdCard} />} onClick={() => buyCardAction(id)} disabled = {!me.can(ActionType.BUY_DEVELOPMENT_CARD)}></Button> */}
                <Button style={buttonStyle} icon={<FontAwesomeIcon icon={faCheck} />} onClick={() => closeMove(id)} disabled = {!me.can(ActionType.CLOSE)}></Button>
            </span>
        </>

    )
}
