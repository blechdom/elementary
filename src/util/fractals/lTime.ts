import { IFractal, TBounds, TPointCb } from "./types";

const RAD_FACTOR = Math.PI / 180;

// supported: FB+-[]<>

export interface ILTimeParams {
  axiom: string;
  rules: Record<string, string>;
  iterations: number;
  distance: number;
  angle: number;
  lengthScale?: number;
}

interface ILState {
  x: number;
  y: number;
  depth: number;
  angle: number;
}

export type TLTimePoint = [
  x: number,
  y: number,
  depth: number,
  meta: { paintable: boolean }
];

const noop = (): void => undefined;

export class LTimeSystem implements IFractal {
  private state: ILState = {
    x: 0,
    y: 0,
    depth: 0,
    angle: 0,
  };

  private stack: ILState[] = [];

  private instructions: string;

  private distance: number;

  private readonly angle: number;

  private readonly lengthScale: number;

  readonly points: TLTimePoint[] = [[0, 0, 0, { paintable: false }]];

  bounds: TBounds = [0, 0, 0, 0];

  constructor(params: ILTimeParams) {
    this.instructions = "";
    this.distance = params.distance;
    this.angle = params.angle;
    this.lengthScale = params.lengthScale ?? 1;
    this.processLSystem(params.iterations, params.axiom, params.rules);
  }

  processLSystem(
    times: number,
    axiom: string,
    rules: Record<string, string>
  ): void {
    let resultString = axiom;
    if (times === 0) {
      this.instructions = axiom;
      return;
    }

    for (let iter = 0; iter < times; iter++) {
      const pass = [];
      for (const char of resultString) {
        if (char in rules) {
          pass.push(rules[char]);
        } else {
          pass.push(char);
        }
      }
      resultString = pass.join("");
    }

    this.instructions = resultString;
  }

  run(fn?: TPointCb): void {
    const cb = typeof fn === "function" ? fn : noop;
    let i = -1;
    for (const cmd of this.instructions) {
      i++;

      if (cmd === "F") {
        //console.log("F = Move forward");
        this.forward(i, cb);
      } else if (cmd === "B") {
        //console.log("B = Move backward");
        this.backward(i, cb);
      } else if (cmd === "+") {
        //console.log("+ = turn right");
        this.right();
      } else if (cmd === "-") {
        //console.log("- = turn left");
        this.left();
      } else if (cmd === "[") {
        //console.log("[ = Push state");
        this.state.depth++;
        this.stack.push({ ...this.state });
      } else if (cmd === "]") {
        //console.log("] = Pop state");
        this.state = this.stack.pop() as ILState;
        this.points.push([
          this.state.x,
          this.state.y,
          this.state.depth,
          { paintable: false },
        ]);
        cb(
          [this.state.x, this.state.y, this.state.depth, { paintable: false }],
          i
        );
      } else if (cmd === ">") {
        //console.log(
        //  "> = Multiply the line length by the line length scale factor"
        //);
        this.distance *= this.lengthScale;
      } else if (cmd === "<") {
        //console.log(
        //  "< = Divide the line length by the line length scale factor"
        //);
        this.distance /= this.lengthScale;
      }
    }
  }

  private move(step: number, fn: TPointCb, back = false) {
    const { x, y, angle } = this.state;
    const distance = back ? this.distance : -this.distance;
    const newX = x + Math.sin(angle * RAD_FACTOR) * distance;
    const newY = y + Math.cos(angle * RAD_FACTOR) * distance;
    this.state.x = Math.round(newX * 1000) / 1000;
    this.state.y = Math.round(newY * 1000) / 1000;
    this.bounds = [
      Math.max(this.bounds[0], this.state.x),
      Math.max(this.bounds[1], this.state.y),
      Math.min(this.bounds[2], this.state.x),
      Math.min(this.bounds[3], this.state.y),
    ];
    this.points.push([
      this.state.x,
      this.state.y,
      this.state.depth,
      { paintable: true },
    ]);

    fn(
      [this.state.x, this.state.y, this.state.depth, { paintable: true }],
      step
    );
  }

  forward(step: number, fn: TPointCb): void {
    this.move(step, fn);
  }

  backward(step: number, fn: TPointCb): void {
    this.move(step, fn, true);
  }

  right(): void {
    this.state.angle = (this.state.angle - this.angle) % 90;
  }

  left(): void {
    this.state.angle = (this.state.angle + this.angle) % 90;
  }
}
