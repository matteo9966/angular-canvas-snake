type SnakeBlock = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';
type SnakeStatus = {
  status: 'play' | 'pause' | 'lost';
  directionQueue: Direction[];
  currentDirection: Direction;
  id: 'blue' | 'red' | 'green' | 'violet';
  blocks: SnakeBlock[];
  keys: Record<string, Direction>;
};
type GameStatus = {
  refreshTime: number;
  speed:number;
  maxSpeed:number;
  snakes: SnakeStatus[];
  fruits: { x: number; y: number }[];
  maxFruits: number;
};

export { Direction, GameStatus, SnakeBlock, SnakeStatus };
