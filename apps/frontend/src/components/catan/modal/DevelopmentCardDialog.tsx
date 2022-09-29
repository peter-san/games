import { join } from "../../../Util";
import { Resource } from "../../catan-single/model/Resource";
import cl from "./DevelopmentCardDialog.module.scss";
import { useState, useEffect } from "react";

export default function DevelopmentCardDialog({
  message,
  callback,
  amount,
}: {
  message: string;
  callback: (resources: Resource[]) => void;
  amount: number;
}) {
  const [selected, setSelected] = useState<Resource[]>([]);

  useEffect(() => {
    return () => {
      setSelected([]);
    };
  }, []);

  return (
    <div className={cl.dialog}>
      <div className={cl.message}>
        <span>{message}</span>
      </div>
      <div className={cl.resources}>
        {Resource.values().map((type, index) => (
          <div
            className={join("card", type)}
            key={index}
            onClick={() => {
              if (selected.length < amount) setSelected(selected.concat(type));
              console.log(selected);
            }}
          ></div>
        ))}
      </div>
      <div className={cl.selected}>
        {selected.map((type, index) => (
          <div
            key={index}
            className={join("card", type)}
            onClick={() => {
              let arr = [...selected];
              arr.splice(index, 1);
              setSelected(arr);
            }}
          ></div>
        ))}
      </div>
      <button
        className={join(cl.buttons, selected.length < amount ? "disabled" : "")}
        onClick={() => callback(selected)}
      >
        Play!
      </button>
    </div>
  );
}
