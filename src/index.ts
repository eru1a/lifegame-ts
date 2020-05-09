class LifeGame {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  board: boolean[][];
  col: number;
  row: number;
  cellSize: number;
  /** 左クリックされているか */
  leftClick: boolean;
  /** 左クリックされているか */
  rightClick: boolean;
  /** run中にstepする間隔 */
  intervalTime: number;
  /** 実行中か */
  running: boolean;

  constructor(canvas: HTMLCanvasElement, col: number, row: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.col = col;
    this.row = row;
    this.board = new Array<boolean[]>(row);
    for (let i = 0; i < row; i++) {
      this.board[i] = new Array<boolean>(col);
    }
    this.cellSize = 20;
    this.leftClick = false;
    this.rightClick = false;
    this.intervalTime = 100;
    this.running = false;

    // 右クリックで出てくるメニューを無効
    this.canvas.oncontextmenu = () => false;
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.leftClick = true;
      if (e.button === 2) this.rightClick = true;
    });
    this.canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.leftClick = false;
      if (e.button === 2) this.rightClick = false;
    });
    this.canvas.addEventListener("mouseout", (_) => (this.leftClick = false));
    this.canvas.addEventListener("mousedown", (e) => this.mousedownHandler(e));
    this.canvas.addEventListener("mousemove", (e) => this.mousemoveHandler(e));
  }

  /** キャンバス上の座標(posX, posY)のセルを生きている/死んでいる状態にする */
  put(posX: number, posY: number, alive = true) {
    let x = Math.floor(posX / this.cellSize);
    let y = Math.floor(posY / this.cellSize);
    this.board[y][x] = alive;
    this.draw();
  }

  mousedownHandler(e: MouseEvent) {
    if (e.button === 0) {
      this.put(e.offsetX, e.offsetY);
    } else if (e.button === 2) {
      this.put(e.offsetX, e.offsetY, false);
    }
  }

  mousemoveHandler(e: MouseEvent) {
    if (this.leftClick) {
      this.put(e.offsetX, e.offsetY);
    } else if (this.rightClick) {
      this.put(e.offsetX, e.offsetY, false);
    }
  }

  /** 描画 */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "lightgreen";
    this.ctx.beginPath();
    for (let y = 0; y < this.row; y++) {
      for (let x = 0; x < this.col; x++) {
        if (this.board[y][x]) {
          this.ctx.rect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
      }
    }
    this.ctx.fill();

    this.ctx.strokeStyle = "black";
    this.ctx.beginPath();
    for (let y = 0; y <= this.row; y++) {
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(this.col * this.cellSize, y * this.cellSize);
    }
    for (let x = 0; x <= this.col; x++) {
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, this.row * this.cellSize);
    }
    this.ctx.stroke();
  }

  /** 1世代進める */
  step() {
    const newBoard = new Array<boolean[]>(this.row);
    for (let i = 0; i < this.row; i++) {
      newBoard[i] = new Array<boolean>(this.col);
    }

    for (let y = 0; y < this.row; y++) {
      for (let x = 0; x < this.col; x++) {
        switch (this.around(x, y)) {
          case 2:
            newBoard[y][x] = this.board[y][x];
            break;
          case 3:
            newBoard[y][x] = true;
            break;
          default:
            break;
        }
      }
    }

    this.board = newBoard;

    this.draw();
  }

  run() {
    setTimeout(() => {
      if (this.running) {
        this.step();
        this.run();
      }
    }, this.intervalTime);
  }

  clear() {
    for (let y = 0; y < this.row; y++) {
      for (let x = 0; x < this.col; x++) {
        this.board[y][x] = false;
      }
    }
    this.draw();
  }

  /**
     (x, y)座標の周りにある8マスの生きているセルの数を返す。
      範囲外の座標は死んでいるセルとして扱う。
   */
  around(x: number, y: number): number {
    let cnt = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) {
          continue;
        }
        let nx = x + dx;
        let ny = y + dy;
        if (0 <= nx && nx < this.col && 0 <= ny && ny < this.row) {
          if (this.board[ny][nx]) {
            cnt++;
          }
        }
      }
    }
    return cnt;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = <HTMLCanvasElement>document.getElementById("canvas");
  const game = new LifeGame(canvas, 25, 25);
  game.draw();

  const stepButton = <HTMLButtonElement>document.getElementById("stepButton");
  stepButton.addEventListener("click", (_) => {
    game.step();
  });

  const runOrStopButton = <HTMLButtonElement>(
    document.getElementById("runOrStopButton")
  );
  runOrStopButton.addEventListener("click", (_) => {
    if (game.running) {
      game.running = false;
    } else {
      game.running = true;
      game.run();
    }
    runOrStopButton.innerText = game.running ? "stop" : "run";
  });

  const clearButton = <HTMLButtonElement>document.getElementById("clearButton");
  clearButton.addEventListener("click", (_) => {
    game.clear();
  });
});
