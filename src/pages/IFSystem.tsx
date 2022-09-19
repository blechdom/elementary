import WebRenderer from "@elemaudio/web-renderer";
import { useCallback, useEffect, useRef, useState } from "react";
import { el } from "@elemaudio/core";
import { IFS, TIFSPoint } from "fractals";
import styled from "styled-components";
import Slider from "../components/Slider";
import Page from "../components/Page";
require("events").EventEmitter.defaultMaxListeners = 0;

function exponentialScale(value: number): number {
  const a = 10;
  const b = Math.pow(a, 1 / a);
  return a * Math.pow(b, value);
}

type IFSProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

const fern = {
  matrices: [
    { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, p: 0.01 },
    { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6, p: 0.85 },
    { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, p: 0.07 },
    { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, p: 0.07 },
  ],
};

const IFSystem: React.FC<IFSProps> = ({ audioContext, core }) => {
  const [playing, setPlaying] = useState(false);
  const [mainVolume, setMainVolume] = useState<number>(0);
  const [fractalPoints, setFractalPoints] = useState<
    [number, number, { matrixNum: number }][]
  >([]);
  const [dimensions, setDimensions] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [offsets, setOffsets] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [scaleX, setScaleX] = useState<number>(100);
  const [scaleY, setScaleY] = useState<number>(100);
  const [freqs, setFreqs] = useState<number[]>([4, 5, 6]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setPlaying(false);
    const fractal = new IFS(fern);
    fractal.run();
    setFractalPoints(fractal.points);
    /*const xyPoints: [number, number, { matrixNum: number }][] =
      fractal.points.sort(function (a, b) {
        return a[1] - b[1];
      });
      */
    const freqsOnly: number[] = fractal.points.map((x) => x[0]);
    //const freqsOnly: number[] = xyPoints.map((x) => x[0]);
    console.log(freqsOnly);
    console.log("length of freqsOnly: " + freqsOnly.length);
    setFreqs(freqsOnly);

    const firstDimensionSize = fractal.bounds[1] + Math.abs(fractal.bounds[3]);
    const secondDimensionSize = fractal.bounds[0] + Math.abs(fractal.bounds[2]);
    setDimensions({ x: firstDimensionSize, y: secondDimensionSize });

    const offsetX = fractal.bounds[2];
    const offsetY = fractal.bounds[3];
    setOffsets({ x: offsetX, y: offsetY });

    console.log(
      "firstDimensionSize",
      firstDimensionSize,
      " secondDimensionSize",
      secondDimensionSize,
      " offsetX",
      offsetX,
      " offsetY",
      offsetY
    );
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvasRef.current.width = 1000;
        canvasRef.current.height = 1000;

        context.save();

        for (let i = 0; i < fractalPoints.length; i++) {
          const [x, y] = fractalPoints[i];
          context.fillStyle = `#FF0000`;
          context.fillRect(
            ((y - offsets.y) * scaleY) / 100,
            ((x - offsets.x) * scaleX) / 100,
            1,
            1
          );
        }
        context.restore();
      }
    }
  }, [offsets, fractalPoints, scaleX, scaleY]);

  const playSynth = useCallback(() => {
    console.log("play synth");

    const seqFreq = el.seq2({ seq: freqs }, el.train(100 / scaleY), 0);
    const scaledSeqFreq = el.add(el.mul(seqFreq, scaleX), 800);
    //let env = el.adsr(0.05, 0.05, 0, 0.05, el.train(100 / scaleY));
    //const synth = el.mul(el.cycle(scaledSeqFreq), env);
    const synth = el.cycle(scaledSeqFreq);
    core.render(
      el.mul(
        synth,
        el.const({ key: `main-amp-left`, value: mainVolume / 100 })
      ),
      el.mul(
        synth,
        el.const({ key: `main-amp-right`, value: mainVolume / 100 })
      )
    );
  }, [mainVolume, core, scaleX, scaleY, freqs, offsets.x]);

  const togglePlay = () => {
    if (playing) {
      audioContext.suspend();
    } else {
      audioContext.resume();
      playSynth();
    }
    setPlaying((play) => !play);
  };

  useEffect(() => {
    playSynth();
  }, [playSynth]);

  return (
    <Page>
      <h1>Iterated Function System</h1>
      <PlayButton onClick={togglePlay}>
        <h2> {playing ? " Pause " : " Play "} </h2>
      </PlayButton>
      <h2>
        main volume = <SliderLabel>{mainVolume}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={mainVolume}
        min={0}
        step={0.1}
        max={100}
        onChange={(event) => setMainVolume(parseFloat(event.target.value))}
      />
      <h2>
        scale time = <SliderLabel>{scaleY}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={scaleY}
        min={1}
        step={0.1}
        max={100}
        onChange={(event) => setScaleY(parseFloat(event.target.value))}
      />
      <h2>
        scale frequency = <SliderLabel>{scaleX}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={scaleX}
        min={0}
        step={1}
        max={100}
        onChange={(event) => setScaleX(parseFloat(event.target.value))}
      />
      <br />
      <br />
      <canvas ref={canvasRef} />
    </Page>
  );
};

const PlayButton = styled.button`
  background-color: #09ab45;
  color: #ffffff;
  border: none;
  width: 160px;
  margin: 0 2em 2em 0;
  :hover {
    background-color: #ff55ff;
    color: #000000;
  }
`;

const SliderLabel = styled.span`
  display: inline-block;
  width: 150px;
  text-align: left;
`;

export default IFSystem;
