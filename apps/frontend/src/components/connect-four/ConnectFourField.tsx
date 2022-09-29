import { ConnectFour, Position } from "../../types/game";
import cl from "./ConnectFourField.module.scss";
import { useActions } from "../../hooks/useActions";
import { useState } from "react";

import { useSubscription } from "react-stomp-hooks";
import { useTypedSelector } from "../../hooks/useTypedSelector";

export default function ConnectFourField({
  game,
  id,
}: {
  game: ConnectFour;
  id: string;
}) {
  enum FieldContent {
    red = "red",
    yellow = "yellow",
    grey = "grey",
  }

  const ROWS = 6;
  const COLUMNS = 7;

  const [g, setG] = useState(game);

  useSubscription(`/topic/games/${id}`, (message: any) =>
    setG(JSON.parse(message.body))
  );

  const convert = (positions: number[]): FieldContent[][] => {
    const fields: FieldContent[][] = [[]];

    for (let i = 0; i < ROWS; i++) {
      fields[i] = [];
      for (let j = 0; j < COLUMNS; j++) {
        fields[i][j] = FieldContent.grey;
      }
    }

    const row = (p: number): number => {
      for (let i = ROWS - 1; i >= 0; i--) {
        if (fields[i][p] === FieldContent.grey) {
          return i;
        }
      }
      throw new Error("too much!");
    };
    positions.forEach(
      (p, j) =>
        (fields[row(p)][p] =
          j % 2 === 0 ? FieldContent.red : FieldContent.yellow)
    );

    return fields;
  };

  const { move } = useActions();
  const { username } = useTypedSelector((state) => state.authReducer);

  const isMyTurn = () =>
    (username === g.owner && g.moves.length % 2 === 0) ||
    (username === g.guest && g.moves.length % 2 === 1);

  const action = (column: number) => {
    if (g.status === "STARTED" && isMyTurn()) {
      g.moves.filter((m) => m === column).length < ROWS
        ? move(g.id, column as Position)
        : console.log(`enough for ${column}`);
    }
  };

  return g ? (
    <div>
      <div className={cl.field}>
        {convert(g.moves).map((row, i) =>
          row.map((field, j) => (
            <div
              key={`${i}-${j}`}
              style={{
                backgroundColor: field,
                cursor: isMyTurn() ? "grab" : "not-allowed",
              }}
              onClick={() => action(j)}
            ></div>
          ))
        )}
      </div>
    </div>
  ) : (
    <div>"undefined"</div>
  );
}
