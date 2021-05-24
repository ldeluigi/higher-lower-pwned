interface PlayerJoin extends GameInfo, PlayerIdName { }

interface PlayerIdName {
  id: string;
  name: string;
}

interface PlayerList {
  list: PlayerIdName[];
}

interface GameInfo {
  players: number;
  max: number;
}

interface PlayerLeave {
  id: string;
}

export {
  PlayerList,
  GameInfo,
  PlayerIdName,
  PlayerJoin,
  PlayerLeave
};
