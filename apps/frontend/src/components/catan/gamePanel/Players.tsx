import { SmileFilled, SmileTwoTone } from '@ant-design/icons'
import React, { useState } from 'react'
import { useActions } from '../../../hooks/useActions'
import { Catan, ExchangeRequest } from '../../../types/game';
import { Color } from '../../catan-single/model/Player'
import { Resources } from '../../catan-single/model/Resource'
import { Modal } from "../../modal/Modal";
import ExchangeDialog from '../modal/ExchangeDialog'
import OfferDialog from '../modal/OfferDialog'
import cl from "./Players.module.scss";

export default function Players({game, active = false}: {game: Catan, active?: Boolean}) {

  const [exchangeModal, setExchangeModal] = useState<Color|undefined>(undefined)
  const [offerModal, setOfferModal] = useState<Color|undefined>(undefined)
  const {exchange, exchangeResponse} = useActions()


  const onExchange = (color: Color, resources: Resources) => {
    exchange(game!!.id, color, resources)
    setExchangeModal(undefined)
  }

  const offer = (color: Color) =>  game.exchanges.find(e => e.sender === color)

  const response = (requestId: string, accepted: boolean) => () => {
    exchangeResponse(game!!.id, requestId, accepted)
    setOfferModal(undefined)
  }

  const offerDialog = (sender: Color, req: ExchangeRequest) => 
    (<Modal setVisible={()=>setOfferModal(undefined)} visible="true">
          <OfferDialog 
            message="hallo" 
            accept={response(req.requestId, true)}
            decline={response(req.requestId, false)}
            me = {game.me!!} 
            sender = {sender} 
            offer = {req.resources}/>
    </Modal> )

  return (
    <>
      {game.me && exchangeModal !== undefined ?
        <Modal setVisible={()=>setExchangeModal(undefined)} visible="true">
          <ExchangeDialog message="hallo" callback={onExchange} me = {game.me!!} recipient = {exchangeModal} />
        </Modal>: undefined }
        {offerModal !== undefined ? offerDialog(offerModal, offer(offerModal)!!) : undefined }

      {game.players.map(player=>(
        <span className={cl.player}
          key={player.color} 
          style = {{
            fontSize: (player.active ? 30 : 24),
            verticalAlign: "middle", 
            color: player.color, 
            
          }}>{ game.me?.color === player.color 
            ? <SmileTwoTone twoToneColor={player.color} />
            : offer(player.color) 
              ? <SmileFilled  onClick = {active ? ()=>setOfferModal(player.color) : undefined} style = {{
                  border: (offer(player.color) ? "1px solid red" : "")}} />
              : <SmileFilled  onClick = {active ? ()=>setExchangeModal(player.color) : undefined} />
            }
        </span>))    
      }     
    </>
  )
}
