import WebRenderer from "@elemaudio/web-renderer";
import { useCallback, useEffect, useRef, useState } from "react";
import { el } from "@elemaudio/core";
import { LTimeSystem, TLTimePoint } from "../util/fractals";
import styled from "styled-components";
import Slider from "../components/Slider";
import Page from "../components/Page";
import { lSystemPresets, LSystemParams } from "../util/lSystemPresets";
require("events").EventEmitter.defaultMaxListeners = 0;

function exponentialScale(value: number): number {
  const a = 10;
  const b = Math.pow(a, 1 / a);
  return a * Math.pow(b, value);
}

type LSystemProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

const LSystem: React.FC<LSystemProps> = ({ audioContext, core }) => {
  const [currentLSystem, setCurrentLSystem] = useState<LSystemParams>(
    lSystemPresets[0]
  );
  const [playing, setPlaying] = useState(false);
  const [mainVolume, setMainVolume] = useState<number>(0);
  const [fractalPoints, setFractalPoints] = useState<TLTimePoint[]>([]);
  const [dimensions, setDimensions] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [offsets, setOffsets] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [scaleX, setScaleX] = useState<number>(1);
  const [scaleY, setScaleY] = useState<number>(1);
  const [freqs, setFreqs] = useState<number[]>([4, 5, 6]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setPlaying(false);
    const fractal = new LTimeSystem(currentLSystem);
    fractal.run();
    //console.log("fractal ", fractal.points);
    setFractalPoints(fractal.points);

    setOffsets({ x: -fractal.bounds[2], y: -fractal.bounds[3] });
    setDimensions({
      x: fractal.bounds[0] + Math.abs(fractal.bounds[2]),
      y: fractal.bounds[1] + Math.abs(fractal.bounds[3]),
    });
  }, [currentLSystem]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = dimensions.y * scaleX;
      canvas.height = dimensions.x * scaleY;
      const context = canvas.getContext("2d");
      if (context) {
        context.save();

        for (let i = 1; i < fractalPoints.length; i++) {
          const [x, y, depth, { paintable }] = fractalPoints[i];
          const color = ((depth + 1) * 75) % 255;
          if (!paintable) {
            continue;
          }
          context.beginPath();
          const [startX, startY] = fractalPoints[i - 1];
          context.strokeStyle = `hsl(${color}, 100%, 50%)`;
          context.moveTo(startY * scaleX * -1, (startX + offsets.x) * scaleY);
          context.lineTo(y * scaleX * -1, (x + offsets.x) * scaleY);
          context.stroke();
          context.closePath();
          // console.log("start ", startY, startX, " end ", y, x);
        }
        context.restore();
      }
    }
  }, [offsets, dimensions, fractalPoints, scaleX, scaleY]);

  const playSynth = useCallback(() => {
    console.log("play synth");

    const seqFreq = el.seq2({ seq: freqs }, el.train(100 / scaleY), 0);
    const scaledSeqFreq = el.add(el.mul(seqFreq, scaleX), 800);
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

  let handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLSystem(lSystemPresets[parseInt(event.target.value)]);
  };

  useEffect(() => {
    playSynth();
  }, [playSynth]);

  return (
    <Page>
      <h1>L-System</h1>
      <PlayButton onClick={togglePlay}>
        <h2> {playing ? " Pause " : " Play "} </h2>
      </PlayButton>
      <select onChange={handlePresetChange}>
        {lSystemPresets.map((system, index) => (
          <option key={`lSystemPreset-${index}`} value={index}>
            {system.name}
          </option>
        ))}
      </select>
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
        min={0.1}
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
        min={0.1}
        step={0.1}
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

export default LSystem;
