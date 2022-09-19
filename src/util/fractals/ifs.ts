import { IFractal, TBounds, TPointCb } from './types';

export interface IIFSMatrix {
  p: number;
  [$key: string]: number;
}
type TEPoint = { x: number; y: number };
export type TEquation = (x: number, y: number, m: IIFSMatrix) => TEPoint;

export type TIFSPoint = [x: number, y: number, meta: { matrixNum: number }];
export interface IIFSParams {
  matrices: IIFSMatrix[];
  density?: number;
  iterations?: number;
  equation?: TEquation;
}

export function affine(x: number, y: number, m: IIFSMatrix): TEPoint {
  const { a, b, c, d, e, f } = m;
  const newX = x * a + y * b + e;
  const newY = x * c + y * d + f;

  return { x: newX, y: newY };
}

export function radial(x: number, y: number, m: IIFSMatrix): TEPoint {
  const { a, b, t, e, f } = m;
  const newX = x * a * Math.cos(t) - y * b * Math.sin(t) + e;
  const newY = x * a * Math.sin(t) + y * b * Math.cos(t) + f;

  return { x: newX, y: newY };
}

export class IFS implements IFractal {
  readonly matrices: IIFSMatrix[];

  private readonly density: number;

  private readonly iterations: number;

  private readonly equation: TEquation;

  readonly points: TIFSPoint[] = [];

  bounds: TBounds = [0, 0, 0, 0];

  constructor(params: IIFSParams) {
    this.matrices = params.matrices;
    this.density = params.density ?? 50;
    this.iterations = params.iterations ?? 100000;
    this.equation = params.equation || affine;
  }

  getMatrix(): IIFSMatrix {
    const mLength = this.matrices.length;
    let total = 0;
    for (let i = 0; i < mLength; i++) {
      total += this.matrices[i].p;
    }

    let rand = Math.random() * total;

    for (let i = 0; i < mLength; i++) {
      const m = this.matrices[i];
      if (rand < m.p) {
        return { ...m, index: i };
      }

      rand -= m.p;
    }

    return { ...this.matrices[0], index: 0 };
  }

  run(fn?: TPointCb): void {
    let x = 0;
    let y = 0;
    for (let i = 0; i < this.iterations; i++) {
      const matrix = this.getMatrix();

      ({ x, y } = this.equation(x, y, matrix));

      const sx = x * this.density;
      const sy = y * this.density;

      this.bounds = [
        Math.max(this.bounds[0], sx),
        Math.max(this.bounds[1], sy),
        Math.min(this.bounds[2], sx),
        Math.min(this.bounds[3], sy),
      ];

      this.points.push([sx, sy, { matrixNum: matrix.index }]);

      if (typeof fn === 'function') {
        fn([sx, sy, { matrixNum: matrix.index }], i);
      }
    }
  }
}
