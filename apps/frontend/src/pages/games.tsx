import { DeleteOutlined, UserAddOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { List, Skeleton, Row, Col, Layout } from 'antd';
import { FC, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useSubscription } from "react-stomp-hooks";
import Players from "../components/catan/gamePanel/Players";

import { useActions } from "../hooks/useActions";
import { useTypedSelector } from "../hooks/useTypedSelector";
import { Catan } from "../types/game";
import { CatanConstructor } from '../services/CatanConstructor';
import { ActionType } from '../components/catan-single/model/Player';
import { CreateGameDialog, JoinGameRequest } from '../components/catan/modal/CreateGameDialog';
import NavBar from '../components/NavBar';

const Games: FC = () => {
  const { games, loading, error } = useTypedSelector(
    (state) => state.gameListReducer
  );
  const { fetchGames, updateSingleGame, deleteGame, joinGame, startGame } = useActions();
  const [selectedGame, setSelectedGame] = useState<Catan|undefined>(undefined)


  useEffect(() => {
    fetchGames();
  }, []);

  const history = useHistory()

  useSubscription(`/topic/games/catan/*`, (message: any) => {
    const update = JSON.parse(message.body);
    new CatanConstructor(update.content).toGame()

    console.log("update single " + message);
    updateSingleGame({type:update.type, content: new CatanConstructor(update.content).toGame()})

    console.log("game update: " + message);
  });

  // if (loading) {
  //   return <div>lade</div>;
  // }

  if (error) {
    return <div>error: ${error}</div>;
  }

  const actions = (game:Catan) => {
    const arr = []
    const style={ fontSize: '18px', color: '#08c', verticalAlign: "text-top"}

    if(game.state==="creation"){
      if(game.me && game.me.allowedActions.includes(ActionType.CLOSE)) {
        arr.push(<PlayCircleOutlined onClick={()=>startGame(game.id,history)} style={style}/>)
      }else if(game.players.length < 4 && !game.me){
        arr.push(<UserAddOutlined onClick={()=>setSelectedGame(game)} style={style}/>)
      }
    }

    if(game.me){// && game.me.alloweds.includes(ActionType.)){
      arr.push(<DeleteOutlined onClick={()=>deleteGame(game.id)} style={{...style, color: "red"}}/>)
    }
    return arr
  }

  const onGameJoin = (value : JoinGameRequest) => {


    joinGame(selectedGame!.id, value.color)
    setSelectedGame(undefined)
  }

    return (<Layout > 
      <Layout.Header className="site-layout-background" style={{padding: 0}}><NavBar /></Layout.Header>
      <Layout.Content style={{padding: 20}}>
        <Row>
          <Col span={22} offset={1}>
            <List
              className="demo-loadmore-list"
              loading={loading}
              itemLayout="horizontal"
              //loadMore={loadMore}
              dataSource={games}
              renderItem={(item: Catan) => (
                <List.Item style={{paddingLeft: 20, backgroundColor: "white"}}
                  actions={actions(item)}
                >
                  <Skeleton avatar title={false} loading={loading} active>
                    <List.Item.Meta 
                      //avatar={<Avatar src={item.picture.large} />}
                      title={<Link to={"" + item.id}>{item.id} settler </Link>}
                      description={`state: ${item.state}`}
                      
                    />
                    <Players game = {item} />
                  </Skeleton>
                </List.Item>
              )}
            />
          </Col>
        </Row>
        {selectedGame ? <CreateGameDialog 
          visible={true}
          onCreate ={onGameJoin} 
          onCancel = {() => setSelectedGame(undefined)} 
          usedColors={selectedGame!.players.map(p=>p.color)}/> : undefined }
      </Layout.Content>
      
    </Layout>)
};

export default Games;
