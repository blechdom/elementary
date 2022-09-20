export type LSystemParams = {
  name: string;
  axiom: string;
  rules: {
    F?: string;
    X?: string;
    Y?: string;
    L?: string;
    R?: string;
  };
  iterations: number;
  distance: number;
  angle: number;
  lengthScale?: number;
};

export const lSystemPresets: LSystemParams[] = [
  {
    name: "Pythagorean Tree",
    axiom: "FX",
    rules: {
      X: ">[-FX]+FX<",
    },
    iterations: 10,
    distance: 100,
    angle: 50,
    lengthScale: 0.7,
  },
  {
    name: "L Tree",
    axiom: "X",
    rules: {
      F: "FF",
      X: "F+[[X]-X]-F[-FX]+X",
    },
    iterations: 6,
    distance: 6,
    angle: 22.5,
  },
  {
    name: "L Tree 2",
    axiom: "F",
    rules: {
      F: ">FF+[+F-F-F]-[-F+F+F]<",
    },
    iterations: 5,
    distance: 20,
    angle: 22.5,
    lengthScale: 0.7,
  },
];
