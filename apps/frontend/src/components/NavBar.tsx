import { Col, Menu, Row } from "antd";
import React, { useState } from "react";
import { useTypedSelector } from "../hooks/useTypedSelector";
import { useActions } from '../hooks/useActions';
import { PlayCircleOutlined, PlusCircleOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import GamePanel from "./catan/gamePanel/GamePanel";
import { CreateGameDialog, CreateGameRequest, JoinGameRequest } from './catan/modal/CreateGameDialog';
import { Catan } from "../types/game";

export default function NavBar({game}: {game?: Catan}) {

  const {username} = useTypedSelector((state) => state.authReducer)

  const {logout, createGame, joinGame, closeMove} = useActions()
  const [creationModal, setCreationModal] = useState(false)
  const [joinModal, setJoinModal] = useState(false)

  const onGameCreation = (value : CreateGameRequest) => {
      createGame(value.standard, value.color)
      setCreationModal(false)
  }

  const onGameJoin = (value : JoinGameRequest) => {
    joinGame(game!.id, value.color)
    setJoinModal(false)
  }

  const style={ fontSize: '20px', color: '#08c', verticalAlign: "text-top"}

  const menuItems = () => {
    const items = []
    if(username){
      
      if(!game){
        items.push({ label: 'New Game', key: 'create', onClick: () => setCreationModal(true), icon: (<PlusCircleOutlined style={style}/>)})
      }

      if(game &&  game.state === 'creation'){
        if(!game.me) {
          items.push({ label: 'Join Game', key: 'join', onClick: () => setJoinModal(true), icon: (<UserAddOutlined style={style}/>)})
        }else{
          items.push({ label: 'Start Game', key: 'start', onClick: () => closeMove(game.id), icon: (<PlayCircleOutlined style={style}/>)})
        }
      }

      items.push({ label: 'Logout', key: 'logout', onClick: logout})
    }
    

    return items
  }


  return (
    
  <Row >

    <Col flex="auto">
      <div style={{display: 'flex', justifyContent: 'center', gap: 12}}>
        
        {game ? <GamePanel game={game}/> : undefined }
      </div>
    </Col>

    <Col flex = "none">
    </Col>
    <Col flex="none" span={3}>
       <UserOutlined style={style}/> {username}
    </Col>
    <Col flex="none" span={2}>
      <Menu mode="horizontal" selectable={false} items={menuItems()}></Menu>
    </Col>
    <CreateGameDialog visible={creationModal} onCreate ={onGameCreation} onCancel = {() => setCreationModal(false)} usedColors={[]}></CreateGameDialog>
    <CreateGameDialog visible={joinModal} onCreate ={onGameJoin} onCancel = {() => setJoinModal(false)} usedColors={game ? game.players.map(p=>p.color): []}></CreateGameDialog>

  </Row>
    
  );
};
