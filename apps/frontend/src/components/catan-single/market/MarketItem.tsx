import React from "react";
import { Resource } from "../model/Resource";
import { join } from "../../../Util";

export default function MarketItem({ type, ...props }: { type: Resource } & any) {
  return <div className={join("card", type, props.className)} {...props}></div>
}

