import { ECountry } from "./models/types";

export interface IStateArgs {
  players: IPlayer[];
}

export interface IPlayer {
  co: string;
  country: ECountry;
}

export class State {
  players: IPlayer[];
  playerIdxTurn = 0;
  day = 1;
  constructor({ players }: IStateArgs) {
    this.players = players;
  }
}

let state: State;
export function getState(args?: IStateArgs) {
  if (!state && !args) {
    throw new Error("State not initialized yet.");
  } else if (args) {
    state = new State(args);
  }
  return state;
}
