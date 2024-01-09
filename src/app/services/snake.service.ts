import {
  Injectable,
  signal,
  NgZone,
  inject,
  computed,
  effect,
  ChangeDetectorRef,
} from '@angular/core';
import {
  GameStatus,
  Direction,
  SnakeBlock,
  SnakeStatus,
  GamePhase,
  FruitBlock,
} from '../types/Types';
import { CanvasService } from './canvas.service';

const snakeInitialStatus1: SnakeStatus = {
  blocks: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ],
  currentDirection: 'up',
  directionQueue: [],
  id: 'Player1',
  status: 'start',
  keys: { a: 'left', w: 'up', s: 'down', d: 'right' },
  color: '#ca51c5',
  points: 0,
};

const snakeInitailStatus2: SnakeStatus = {
  blocks: [
    { x: 8, y: 6 },
    { x: 9, y: 6 },
  ],
  currentDirection: 'right',
  directionQueue: [],
  id: 'Player2',
  status: 'start',
  keys: {
    arrowup: 'up',
    arrowdown: 'down',
    arrowleft: 'left',
    arrowright: 'right',
  },
  color: '#3f51b5',
  points: 0,
};

const initialStatus: GameStatus = {
  refreshTime: 30,
  speed: 17,
  size: 20,
  maxSpeed: 40,
  maxSize: 100,
  minSize: 10,
  maxFruits: 5,
  snakes: [],
  fruits: [],
  checkSelfCollisions: true,
};

function getClonedInitalStatus() {
  return JSON.parse(JSON.stringify(initialStatus)) as GameStatus;
}

function cloneSnakeStatus(snake: SnakeStatus) {
  return JSON.parse(JSON.stringify(snake)) as SnakeStatus;
}
@Injectable({
  providedIn: 'root',
})
export class SnakeService {
  gameComponentDetectionRef!: ChangeDetectorRef;
  animationFrameId: number | null = null;
  zone = inject(NgZone);
  private canvasService = inject(CanvasService);
  lastUpdate = 0;
  canvasSettings = this.canvasService.canvasSettings;
  private gameStatus = signal<GameStatus>(getClonedInitalStatus());
  gamePhase = computed<'play' | 'pause' | 'lost' | 'start'>(() => {
    const statuses = this.gameStatus().snakes.map((s) => s.status);

    if (statuses.includes('play')) return 'play';
    if (statuses.includes('pause')) return 'pause';
    if (statuses.includes('start')) return 'start';
    if (statuses.every((s) => s === 'lost')) return 'lost';
    return 'play';
  });

  //speed up snakeId Search based on the snake input keys
  keysHash = computed<Record<string, string>>(() => {
    let hash = {};
    const snakes = this.gameStatus().snakes;
    hash = snakes.reduce<Record<string, string>>((hash, snake) => {
      const snakeId = snake.id;
      Object.keys(snake.keys).forEach((k) => {
        hash[k] = snakeId;
      });
      return hash;
    }, {});
    return hash;
  });

  /**
   * @description uses the computed {key:snakeId} map to get the snakeId
   * @param key
   * @returns
   */
  getSnakeIdBasedKeyOnInput(key: string) {
    const snakeId = this.keysHash()[key];
    if (!snakeId) return null;
    return snakeId;
  }

  maxSpeed = this.gameStatus().maxSpeed;

  initCanvas(canvas: HTMLCanvasElement) {
    this.canvasService.initCanvas(canvas);
  }

  constructor() {
    // effect(()=>{
    //   // console.log(this.gameStatus());
    // })
  }

  resetGame() {
    this.resetStatus();
    this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
    this.gameStatus.update((status) => {
      const snakes = [...status.snakes];
      snakes.forEach((s) => {
        s.status = 'play';
      });
      status.snakes = snakes;
      return status;
    });
    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  }

  resetInitialSettings() {
    this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
    const newStatus = { ...initialStatus };
    newStatus.snakes = this.createSnakesList(this.gameStatus().snakes.length);
    this.canvasService.updateSettings(newStatus.size);
    this.gameStatus.set(newStatus);
    return newStatus
  }

  playGame() {
    this.gameStatus.update((status) => {
      const snakes = [...status.snakes];
      snakes.forEach((s) => {
        if (s.status === 'pause' || s.status === 'start') {
          s.status = 'play';
        }
      });
      status.snakes = snakes;
      return status;
    });
    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  }

  initBackground() {
    this.canvasService.drawBackground(this.gameStatus());
  }

  pauseGame() {
    // console.log({status})
    this.gameStatus.update((s) => {
      const status = { ...s };
      const snakes = [...status.snakes];
      snakes.forEach((s) => {
        if (s.status === 'play') {
          s.status = 'pause';
        }
      });
      status.snakes = snakes;
      return status;
    });
    this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
  }

  /**
   * @description initialize the snake
   * @param players
   */
  selectPlayers(players: 1 | 2) {
    switch (players) {
      case 1:
        {
          this.gameStatus.update((status) => {
            const s = { ...status };
            s.snakes = [cloneSnakeStatus(snakeInitialStatus1)];

            return s;
          });
        }
        break;
      case 2:
        {
          this.gameStatus.update((status) => {
            const s = { ...status };
            s.snakes = [
              cloneSnakeStatus(snakeInitialStatus1),
              cloneSnakeStatus(snakeInitailStatus2),
            ];
            return s;
          });
        }
        break;

      default:
        break;
    }
  }

  createSnakesList(players: number) {
    const snakeArray = [];
    switch (players) {
      case 1:
        snakeArray.push(cloneSnakeStatus(snakeInitialStatus1));
        break;
      case 2:
        {
          snakeArray.push(
            cloneSnakeStatus(snakeInitialStatus1),
            cloneSnakeStatus(snakeInitailStatus2)
          );
        }
        break;

      default:
        break;
    }
    return snakeArray;
  }

  resetStatus() {
    const newStatus = { ...initialStatus };
    newStatus.maxFruits = this.gameStatus().maxFruits;
    newStatus.maxSize = this.gameStatus().size;
    newStatus.refreshTime = this.gameStatus().refreshTime;
    newStatus.snakes = this.createSnakesList(this.gameStatus().snakes.length);
    newStatus.speed = this.gameStatus().speed;
    newStatus.snakes.forEach(
      //mantain color
      (s, i) => (s.color = this.gameStatus().snakes[i].color)
    );
    newStatus.checkSelfCollisions = this.gameStatus().checkSelfCollisions;
    this.gameStatus.set(newStatus);
  }

  playersSelected = computed(() => this.gameStatus().snakes.length > 0);

  animate(timestamp: number) {
    if (
      timestamp - this.lastUpdate >
      this.gameStatus().refreshTime *
        Math.max(1, this.gameStatus().maxSpeed - this.gameStatus().speed)
    ) {
      this.zone.run(() => {
        this.lastUpdate = timestamp;
        this.canvasService.draw(this.gameStatus());
        this.updateSnakesStatusPositions();
        this.updateFruitsGameStatus();
      });
    }

    this.zone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
    });
  }
  /**
   * @description updates the snake and checks if it eats the fruit
   */
  updateSnakesStatusPositions() {
    this.gameStatus.update((currentStatus) => {
      const newStatus = { ...currentStatus, snakes: [...currentStatus.snakes] };
      let fruits = [...currentStatus.fruits];
      newStatus.snakes = newStatus.snakes.map((snake) => {
        if (snake.status !== 'play') return snake;
        const updatedSnake = this.updateSnakeCurrentDirection({ ...snake });
        const selfCollided =
          newStatus.checkSelfCollisions &&
          this.checkIfSnakeSelfCollided(updatedSnake.blocks);
        if (selfCollided) {
          updatedSnake.status = 'lost';
        }
        const fruitEaten = this.checkIfSnakeAteFruit(
          updatedSnake.blocks,
          currentStatus.fruits
        );
        if (fruitEaten) {
          updatedSnake.points += fruitEaten.points;
          fruits = this.removeFruit(fruitEaten, fruits);
        } else {
          updatedSnake.blocks.shift();
        }

        return {
          ...updatedSnake,
          blocks: this.moveSnake(
            updatedSnake.blocks,
            updatedSnake.currentDirection,
            updatedSnake.status
          ),
        };
      });
      newStatus.fruits = fruits;
      return newStatus;
    });
  }

  enqueueSnakeDirection(direction: Direction, snakeID: string) {
    this.gameStatus.update((status) => {
      const newStatus = { ...status };
      const index = newStatus.snakes.findIndex((s) => s.id === snakeID);
      if (index < 0) {
        return status;
      }
      newStatus.snakes = [...newStatus.snakes];
      newStatus.snakes[index].directionQueue.unshift(direction);
      return newStatus;
    });
  }

  isInvalidDirection(
    nextDirection: Direction,
    currentDirection: Direction
  ): boolean {
    if (
      nextDirection === currentDirection ||
      (nextDirection === 'down' && currentDirection === 'up') ||
      (nextDirection === 'up' && currentDirection === 'down') ||
      (nextDirection === 'left' && currentDirection === 'right') ||
      (nextDirection === 'right' && currentDirection === 'left')
    ) {
      return true;
    }
    return false;
  }

  handleDirectionInput(key: string) {
    const snakeId = this.getSnakeIdBasedKeyOnInput(key.toLowerCase());
    if (!snakeId) return;

    const snakeIndex = this.gameStatus().snakes.findIndex((s) => {
      return s.id === snakeId;
    });

    if (snakeIndex < 0) {
      return;
    }

    const snakeKeys = this.gameStatus().snakes[snakeIndex].keys;
    const nextDirection = snakeKeys[key.toLowerCase()];

    // if (
    //   this.isInvalidDirection(
    //     nextDirection,
    //     this.gameStatus().snakes[snakeIndex].currentDirection
    //   )
    // ) {
    //   return;
    // }

    this.enqueueSnakeDirection(nextDirection, snakeId);
  }

  /**
   * @description get a direction from a queue and add it to the current direction
   * @param snake
   * @returns
   */
  updateSnakeCurrentDirection(snake: SnakeStatus): SnakeStatus {
    if (snake.directionQueue.length <= 0) {
      return snake;
    }
    const snakeCurrentD = snake.currentDirection;
    let nextMove: Direction | null = null,
      nextPossibleMove: Direction | null = null;

    while (snake.directionQueue.length > 0 && !nextMove) {
      nextPossibleMove = snake.directionQueue.pop()!;
      if (
        !this.isInvalidDirection(snakeCurrentD, <Direction>nextPossibleMove)
      ) {
        nextMove = nextPossibleMove;
      }
    }
    const updatedSnake = { ...snake };
    if (!nextMove) return updatedSnake;

    updatedSnake.currentDirection = nextMove;
    return updatedSnake;
  }

  moveSnake(
    snake: SnakeBlock[],
    direction: Direction,
    status: GamePhase
  ): SnakeBlock[] {
    if (status !== 'play') {
      return snake;
    }
    const [...updatedSnake] = snake;
    switch (direction) {
      case 'up': {
        const nextY =
          snake[snake.length - 1].y === 0
            ? this.canvasSettings.height - 1
            : snake[snake.length - 1].y - 1;
        updatedSnake.push({ x: snake[snake.length - 1].x, y: nextY });

        return updatedSnake;
      }
      case 'down': {
        const nextY =
          snake[snake.length - 1].y === this.canvasSettings.height - 1
            ? 0
            : snake[snake.length - 1].y + 1;
        updatedSnake.push({
          x: updatedSnake[updatedSnake.length - 1].x,
          y: nextY,
        });
        return updatedSnake;
      }
      case 'left': {
        const nextX =
          snake[snake.length - 1].x === 0
            ? this.canvasSettings.width - 1
            : snake[snake.length - 1].x - 1;
        updatedSnake.push({ x: nextX, y: snake[snake.length - 1].y });

        return updatedSnake;
      }
      case 'right': {
        const nextX =
          snake[snake.length - 1].x === this.canvasSettings.width - 1
            ? 0
            : snake[snake.length - 1].x + 1;
        updatedSnake.push({ x: nextX, y: snake[snake.length - 1].y });
        return updatedSnake;
      }

      default:
        return snake;
    }
  }

  checkCollision(x1: number, y1: number, x2: number, y2: number) {
    if (x1 == x2 && y1 === y2) {
      return true;
    }
    return false;
  }

  getRandomBlock() {
    return {
      x: randomInteger(0, this.canvasSettings.width),
      y: randomInteger(0, this.canvasSettings.height),
    };
  }

  createFruit(): FruitBlock | null {
    const MAX_ATTEMPTS = 200;
    let attempt = 0,
      x = -1,
      y = -1;
    if (
      this.canvasSettings.height * this.canvasSettings.width <=
      this.gameStatus().snakes.reduce((prev, s) => s.blocks.length + prev, 0)
    ) {
      //no more space
      return null;
    }
    while (attempt < MAX_ATTEMPTS && x < 0 && y < 0) {
      const block = this.getRandomBlock();
      let foundCollision = false;
      for (let snake of this.gameStatus().snakes) {
        if (this.collisionWithSnake(block, snake.blocks)) {
          foundCollision = true;
          break;
        }
      }
      if (!foundCollision) {
        x = block.x;
        y = block.y;
      }
      attempt++;
    }
    return { x, y, points: 1 }; //TODO: add different point values
  }

  collisionWithSnake(block: SnakeBlock, snakeBlocks: SnakeBlock[]) {
    return snakeBlocks.findIndex((b) => b.x == block.x && b.y == block.y) >= 0;
  }

  updateFruitsGameStatus() {
    if (this.gameStatus().fruits.length >= this.gameStatus().maxFruits) {
      return;
    }
    const fruit = this.createFruit();
    if (!fruit) return;
    this.gameStatus.update((status) => {
      status.fruits = [...status.fruits, fruit];
      return status;
    });
  }

  checkIfSnakeAteFruit(
    snake: SnakeBlock[],
    fruits: FruitBlock[]
  ): FruitBlock | null {
    for (let fruit of fruits) {
      if (this.collisionWithSnake(fruit, snake)) {
        return fruit;
      }
    }
    return null;
  }

  checkIfSnakeSelfCollided(snake: SnakeBlock[]) {
    const set = new Set();
    for (let block of snake) {
      if (set.has(`${block.x}${block.y}`)) {
        return true;
      }
      set.add(`${block.x}${block.y}`);
    }
    return false;
  }

  removeFruit(
    fruitToRemove: FruitBlock,
    currentFruits: FruitBlock[]
  ): FruitBlock[] {
    const fruitIndex = currentFruits.findIndex(
      (fruit) => fruit.x === fruitToRemove.x && fruit.y === fruitToRemove.y
    );
    if (fruitIndex < 0) {
      return currentFruits;
    }
    const fruits = [...currentFruits];
    fruits.splice(fruitIndex, 1);

    return fruits;
  }

  updateGameSpeed(speed: number) {
    this.gameStatus.update((status) => {
      const newStatus = { ...status };
      if (speed <= status.maxSpeed && speed > 0) {
        newStatus.speed = speed;
      }

      return newStatus;
    });
  }

  updateGameSize(size: number) {
    if (size < this.gameStatus().minSize || size > this.gameStatus().maxSize) {
      return;
    }

    this.gameStatus.update((status) => {
      const updated = { ...status };
      updated.size = size;
      return updated;
    });
    this.canvasService.updateSettings(this.gameStatus().size);
    this.canvasService.draw(this.gameStatus());
  }

  /**
   *
   * @param colors a map of key value where key is the id of the snake and value is the color selected
   */
  updateSnakeColors(colors: Record<string, string>) {
    this.gameStatus.update((status) => {
      const snakes = [...status.snakes];
      snakes.forEach((s) => {
        if (colors[s.id]) {
          s.color = colors[s.id];
        }
      });
      status.snakes = snakes;
      return status;
    });
    this.canvasService.draw(this.gameStatus());
  }

  updateMaxfruits(num: number) {
    if (num < 1 || num > 10) {
      return;
    }
    this.gameStatus.update((status) => {
      status.maxFruits = num;
      return status;
    });
  }

  updateSelfCollisions(check: boolean) {
    this.gameStatus.update((s) => {
      const updated = { ...s };
      updated.checkSelfCollisions = check;
      return updated;
    });
  }

  snakes = computed(() => {
    return this.gameStatus().snakes;
  });
  private _gameSize = computed(() => this.gameStatus().size);
  private _maxFruits = computed(() => this.gameStatus().maxFruits);
  private _speed = computed(() => this.gameStatus().speed);

  private _gameMinMaxSize = computed(() => [
    this.gameStatus().size, // to avoid errors
    this.gameStatus().maxSize,
  ]);

  get maxFruits() {
    return this._maxFruits();
  }

  get gameSize() {
    return this._gameSize();
  }
  get gameMinMaxSize() {
    return this._gameMinMaxSize();
  }
  get speed() {
    return this._speed();
  }

  get checkSelfCollisions() {
    return this.gameStatus().checkSelfCollisions;
  }
}

function randomInteger(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum)) + minimum;
}
