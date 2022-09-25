import WebRenderer from "@elemaudio/web-renderer";
import { useCallback, useEffect, useRef, useState } from "react";
import { el, NodeRepr_t } from "@elemaudio/core";
import { LTimeSystem, TLTimePoint } from "../util/fractals";
import styled from "styled-components";
import Slider from "../components/Slider";
import Page from "../components/Page";
import { lSystemPresets, LSystemParams } from "../util/lSystemPresets";
require("events").EventEmitter.defaultMaxListeners = 0;

type LSystemProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

type Note = {
  key: string;
  gate: number;
  duration: number;
  startTime: number;
  endTime: number;
  startFreq: number;
  endFreq: number;
};

function makeNoteName(note: [number, number, number, number]) {
  return `note_${note[0]}_${note[1]}_${note[2]}_${note[3]}`;
}

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
  const [soundList, setSoundList] = useState<Note[]>([]);

  const soundListRef = useRef(soundList);
  soundListRef.current = soundList;

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
      if (context) {
        context.save();
        let audibleSoundPaths: Note[] = [];

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

          const soundName: string = makeNoteName([
            -startY,
            -y,
            startX + offsets.x,
            x + offsets.x,
          ]);
          const newNote = {
            key: soundName,
            gate: 0,
            startTime: -startY,
            endTime: -y,
            duration: -startY - -y,
            startFreq: startX + offsets.x,
            endFreq: x + offsets.x,
          };
          // startTime, endTime, startFreq, endFreq
          audibleSoundPaths.push(newNote);
        }
        const audibleSortedSoundPaths = audibleSoundPaths.sort(
          (a, b) => a.startTime - b.startTime
        );
        console.log("audibleSortedSoundPaths", audibleSortedSoundPaths);
        setSoundList(audibleSortedSoundPaths);
        context.restore();
      }
    }
  }, [offsets, dimensions, fractalPoints, scaleX, scaleY]);

  const synthNote = useCallback((note: Note): NodeRepr_t => {
    console.log("note: ", note.key, " gate: ", note.gate);
    return el.mul(
      el.const({ key: `amp-${note.key}`, value: 0.2 * note.gate }),
      el.cycle(
        el.const({ key: `freq-${note.key}`, value: note.startFreq + 300 })
      )
    ) as NodeRepr_t;
  }, []);

  const playSynth = useCallback(() => {
    console.log("currentNotes", soundList);
    //let tone = el.cycle(440);
    /*
    for (const value of map1.values()) {eee
  console.log(value); // 👉️ Tom, Germany, 30
}
*/
    if (soundList !== undefined && soundList.length > 0) {
      let tone = el.add(...soundList.map(synthNote));
      core.render(tone, tone);
    }
  }, [core, soundList, synthNote]);

  const updateSoundList = useCallback(() => {
    if (
      soundListRef.current !== undefined &&
      soundListRef.current?.length > 1
    ) {
      soundListRef.current.forEach((note, index) => {
        setTimeout(function () {
          console.log("turn on gate for: ", note.key);
          const updatedNotes = soundListRef.current.map((updateNote) => {
            if (note.key === updateNote.key) {
              console.log("found note to turn on gate for: ", note.key);
              return { ...updateNote, gate: 1.0 };
            }
            return updateNote;
          });
          console.log("updatedNotes on ", updatedNotes);
          setSoundList(updatedNotes);
          setTimeout(function () {
            console.log("turn off gate for: ", note.key);
            const updatedNotes = soundListRef.current.map((updateNote) => {
              if (note.key === updateNote.key) {
                console.log("found note to turn off gate for: ", note.key);
                return { ...updateNote, gate: 0.0 };
              }
              return updateNote;
            });
            console.log("updatedNotes off ", updatedNotes);
            setSoundList(updatedNotes);
          }, (note.startTime - note.endTime) * 10);
        }, note.startTime * 10);
      });
    }
  }, [soundListRef]);

  useEffect(() => {
    playSynth();
  }, [soundListRef, playSynth]);

  const togglePlay = () => {
    if (playing) {
      audioContext.suspend();
    } else {
      audioContext.resume();
      updateSoundList();
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
