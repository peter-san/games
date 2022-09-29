import { Resources } from "./model/Resource";
import Card from "./Card";

const Cards = ({ cards}: { cards: Resources}) => {

  return (
    <div className = "cards">
      {Array.from(cards).filter(e=>e[1]!==0).map(([resource, amount]) => (
        <Card
          type={resource}
          value={amount}
          key={resource}
        ></Card>
      ))}
    </div>
  );
};

export default Cards;
