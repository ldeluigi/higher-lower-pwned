export interface PlayerJoin extends PlayerIdName {
  players: number;
  max: number;
}

export interface PlayerIdName {
  id: string;
  name: string;
}
