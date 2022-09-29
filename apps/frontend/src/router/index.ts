
import React from "react";
import Games from "../pages/games";
import GamePage from "../pages/singleGame";
import CatanGamePage from "../pages/catan/game";

export interface IRoute {
    path: string;
    component: React.ComponentType;
    exact?: boolean;
}

export enum RouteNames {
   // GAME = '/games/:id',
    CATAN = '/games/:id',
    GAMES = '/games/',
}

export const publicRoutes = []

export const privateRoutes = [
    {path: RouteNames.CATAN, exact: true, component: CatanGamePage},
  //  {path: RouteNames.GAME, exact: true, component: GamePage},
    {path: RouteNames.GAMES, exact: true, component: Games},  
]
