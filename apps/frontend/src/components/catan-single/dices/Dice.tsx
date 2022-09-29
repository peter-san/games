import React from "react";
import { useState } from "react";

export default function Dice(
  props
: {
  setDice: (value: number) => void;
}| any) {
  const [first, setFirst] = useState(0);
  const [second, setSecond] = useState(0);

  const random = (): number => {
    return Math.floor(Math.random() * 6) + 1;
  };

  const redice = () => {
    const f = random();
    const s = random();
    props.setDice(f + s);
    setFirst(f);
    setSecond(s);
  };

  return (
    <div className={props.className}>
      <button onClick={redice}>dice</button>
      <span>{` ${first} ${second} : ${first + second}`}</span>
    </div>
  );
}
