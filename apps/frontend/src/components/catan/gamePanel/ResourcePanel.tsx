import React from "react";
import { join } from "../../../Util";
import { Resource, Resources } from "../../catan-single/model/Resource";
import cl from "./ResourcePanel.module.scss";

export default function ResourcePanel({resources}: {resources: Resources}) {

  
    const resource = (res: Resource, amount: number) => 
        (<span className={cl.resource} key={res}><span className={join(cl.icon, cl[res])}></span><span className="amount">{`${amount}`}</span></span>)
    

  return <span className={cl.resources}>
        {Array.from(resources).filter(e=>e[1]!==0).map(([res, amount]) => resource(res, amount))}
  </span>;
}
