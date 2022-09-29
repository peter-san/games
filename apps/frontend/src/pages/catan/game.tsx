import { FC, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";

import { useActions } from "../../hooks/useActions";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import SettlerGame from "../../components/catan/SettlerGame";
import { useSubscription } from "react-stomp-hooks";
import { Layout } from "antd";
import NavBar from "../../components/NavBar";

const CatanGamePage: FC = () => {
  const { game, loading, error } = useTypedSelector(
    (state) => state.gameReducer
  );
  const { fetchGame, updateGame, clearGame } = useActions();

  const history = useHistory()
  const { id } = useParams<{id:string}>()

  useSubscription(`/topic/games/catan/${id}`, (message: any) =>
    updateGame(id, message.body, history)
  );

  useEffect(() => {
    fetchGame("catan", id);
  }, [id]);

  useEffect(() => {
    return () => {
          clearGame()
        }
  }, []);

  if (loading) {
    return <div>lade</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (game) {
    return (<Layout style={{height: '100%'}} > 
      <Layout.Header className="site-layout-background" style={{padding: 0}}><NavBar game={game} /></Layout.Header>
      <Layout.Content>
        <SettlerGame game={game}></SettlerGame>
      </Layout.Content>
      
    </Layout>)
  }

  return <div>unknown state!</div>;
};

export default CatanGamePage;
