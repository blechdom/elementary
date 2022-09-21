import WebRenderer from "@elemaudio/web-renderer";
import { useCallback, useEffect, useRef, useState } from "react";
import { el, NodeRepr_t } from "@elemaudio/core";
import { LTimeSystem, TLTimePoint } from "../util/fractals";
import styled from "styled-components";
import Slider from "../components/Slider";
import Page from "../components/Page";
import { lSystemPresets, LSystemParams } from "../util/lSystemPresets";
import { NumberLiteralType } from "typescript";
import { NodeRuntime } from "inspector";
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
  const [soundList, setSoundList] =
    useState<[number, number, number, number][]>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setPlaying(false);
    const fractal = new LTimeSystem(currentLSystem);
    fractal.run();
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
      let audibleFractal: [number, number, number, number][] = [];
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
          audibleFractal.push([-startY, startX + offsets.x, -y, x + offsets.x]);
        }
        context.restore();
      }

      const timeSortedAudibleFractal: [number, number, number, number][] =
        audibleFractal.sort(function (a, b) {
          return a[0] - b[0];
        });
      setSoundList(timeSortedAudibleFractal);
    }
  }, [offsets, dimensions, fractalPoints, scaleX, scaleY]);

  function sineTone(t: NodeRepr_t) {
    return el.sin(el.mul(2 * Math.PI, t));
  }

  const makeNote = useCallback(
    (startFreq: number, endFreq: number, duration: number) => {
      let gate = el.sparseq(
        {
          seq: [
            { value: 1, tickTime: 0 },
            { value: 0, tickTime: 100 },
          ],
        },
        el.train(1),
        0
      );

      const scaledStartFreq = startFreq * 3;
      const scaledEndFreq = endFreq * 3;
      console.log(
        "makenote from ",
        scaledStartFreq,
        " to ",
        scaledEndFreq,
        " for ",
        duration
      );
      let durationInMs = duration * 10;

      let env = el.smooth(el.tau2pole(0.2), gate);

      let lilSynthNote = el.mul(
        env,
        sineTone(
          el.phasor(
            el.add(
              scaledStartFreq,
              el.mul(scaledEndFreq, el.phasor(durationInMs / 1000, 0))
            ),
            0
          )
        )
      );
      core.render(
        el.mul(
          lilSynthNote,
          el.const({ key: `main-amp-left`, value: mainVolume / 100 })
        ),
        el.mul(
          lilSynthNote,
          el.const({ key: `main-amp-right`, value: mainVolume / 100 })
        )
      );
    },
    [mainVolume, core]
  );

  useEffect(() => {
    if (soundList !== undefined && soundList?.length > 1) {
      soundList.forEach((note, index) => {
        setTimeout(function () {
          //console.log("waiting this long", note[0]);
          makeNote(note[1], note[3], note[2] - note[0]);
        }, note[0] * 10);
      });
    }
  }, [soundList, makeNote]);

  const togglePlay = () => {
    if (playing) {
      audioContext.suspend();
    } else {
      audioContext.resume();
    }
    setPlaying((play) => !play);
  };

  let handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLSystem(lSystemPresets[parseInt(event.target.value)]);
  };

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
