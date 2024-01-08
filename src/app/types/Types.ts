type SnakeBlock = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';
type GamePhase = 'play' | 'pause' | 'lost'|'start';
type FruitBlock = SnakeBlock & {points:number};
type SnakeStatus = {
  status: GamePhase;
  directionQueue: Direction[];
  currentDirection: Direction;
  id: string;
  blocks: SnakeBlock[];
  keys: Record<string, Direction>;
  color: string;
  points:number;
};
type GameStatus = {
  maxSize: number;
  minSize: number;
  size: number;
  refreshTime: number;
  speed: number;
  maxSpeed: number;
  snakes: SnakeStatus[];
  fruits: FruitBlock[];
  maxFruits: number;
  checkSelfCollisions:boolean;
};

export { Direction, GameStatus, SnakeBlock, SnakeStatus,GamePhase,FruitBlock };
