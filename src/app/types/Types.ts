type SnakeBlock = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';
type GamePhase = 'play' | 'pause' | 'lost'|'start';
type SnakeStatus = {
  status: GamePhase;
  directionQueue: Direction[];
  currentDirection: Direction;
  id: string;
  blocks: SnakeBlock[];
  keys: Record<string, Direction>;
  color: string;
};
type GameStatus = {
  maxSize: number;
  minSize: number;
  size: number;
  refreshTime: number;
  speed: number;
  maxSpeed: number;
  snakes: SnakeStatus[];
  fruits: { x: number; y: number }[];
  maxFruits: number;
};

export { Direction, GameStatus, SnakeBlock, SnakeStatus,GamePhase };
