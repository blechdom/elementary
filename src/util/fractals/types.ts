export type TPoint = [x: number, y: number, meta: Record<string, unknown>];
export type TBounds = [maxX: number, maxY: number, minX: number, minY: number];
export type TPointCb = (p: TPoint, i: number) => unknown;

export interface IFractal {
  readonly points: TPoint[];
  bounds: TBounds;
  run(fn?: TPointCb): void;
}
