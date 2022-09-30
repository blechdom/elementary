import { useState, useCallback, useEffect } from "react";
import { el } from "@elemaudio/core";
import type { NodeRepr_t } from "@elemaudio/core";
import styled from "styled-components";
import { ElementaryPageProps } from "../App";
import Slider from "../components/Slider";
import Page from "../components/Page";
require("events").EventEmitter.defaultMaxListeners = 0;

const RecursiveAM: React.FC<ElementaryPageProps> = ({ audioContext, core }) => {
  const [playing, setPlaying] = useState(false);
  const [steps, setSteps] = useState<number>(1);
  const [modAmp, setModAmp] = useState<number>(0.5);
  const [modFreq, setModFreq] = useState<number>(1.0);
  const [modOffset, setModOffset] = useState<number>(0.5);
  const [startFreq, setStartFreq] = useState<number>(300);
  const [modFreqDiv, setModFreqDiv] = useState<number>(2);
  const [modAmpDiv, setModAmpDiv] = useState<number>(2);
  const [modOffsetDiv, setModOffsetDiv] = useState<number>(2);
  const [mainVolume, setMainVolume] = useState<number>(0);

  const [presets, setPresets] = useState([
    [3, 7307, 3.32, 3.68, 0],
    [2, 6508, 5.25, 5.56, 5057],
    [2, 1650, 0.06, 0.18, 0],
    [5, 4236, 0.18, 1.53, 4000],
    [3, 2340, 7, 0.75, 2000],
  ]);

  const recursiveAM = useCallback(
    (t: NodeRepr_t, freq: number, counter: number): NodeRepr_t => {
      return counter > 0
        ? recursiveAM(
            el.mul(
              t,
              el.cycle(el.const({ key: `modulator-${counter}`, value: freq }))
            ) as NodeRepr_t,
            freq / modFreqDiv,
            counter - 1
          )
        : t;
    },
    [modAmpDiv]
  );

  const playSynth = useCallback(() => {
    const carrier: NodeRepr_t = el.cycle(
      el.const({ key: "freq", value: startFreq })
    );
    const modulator = el.cycle(el.const({ key: "mod", value: modFreq }));
    const synth = el.mul(
      carrier,
      recursiveAM(modulator as NodeRepr_t, modFreq, steps)
    );
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
  }, [
    modAmp,
    steps,
    startFreq,
    mainVolume,
    core,
    modFreq,
    modOffset,
    recursiveAM,
  ]);

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

  function loadPreset(i: number) {
    setSteps(presets[i][0]);
    setModAmp(presets[i][1]);
    setStartFreq(presets[i][2]);
    setModAmpDiv(presets[i][3]);
  }

  function addNewPreset() {
    setPresets((presets) => [
      ...presets,
      [steps, modAmp, startFreq, modAmpDiv],
    ]);
  }

  return (
    <Page>
      <h1>Recursive AM Synthesis</h1>
      <PlayButton onClick={togglePlay}>
        <h2> {playing ? " Pause " : " Play "} </h2>
      </PlayButton>
      <Presets>
        {presets.map((preset, i) => (
          <Button key={`preset-${i}`} onClick={() => loadPreset(i)}>
            Preset {i + 1}
          </Button>
        ))}
      </Presets>
      <div>
        <Button key={`plus`} onClick={addNewPreset}>
          + Add Preset
        </Button>
      </div>
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
        number of recursions = <SliderLabel>{steps}</SliderLabel>
      </h2>
      <Slider
        width="1000px"
        type={"range"}
        value={steps}
        min={0}
        max={10}
        onChange={(event) => setSteps(parseFloat(event.target.value))}
      />
      <h2>
        modulation frequency = <SliderLabel>{modFreq}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={modFreq}
        min={0}
        step={0.01}
        max={100}
        onChange={(event) => setModFreq(parseFloat(event.target.value))}
      />
      <h2>
        starting frequency = <SliderLabel>{startFreq}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={startFreq}
        step={0.01}
        min={0}
        max={400}
        onChange={(event) => setStartFreq(parseFloat(event.target.value))}
      />
      <h2>
        modulation frequency divisor = <SliderLabel>{modFreqDiv}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={modFreqDiv}
        min={0.01}
        step={0.01}
        max={8}
        onChange={(event) => setModFreqDiv(parseFloat(event.target.value))}
      />
    </Page>
  );
};

const Button = styled.button`
  background-color: #0f9ff5;
  color: #ffffff;
  border: none;
  margin: 0.5em 0.5em 0.5em 0;
  padding: 0.5em;
  :hover {
    background-color: #ffab00;
    color: #000000;
  }
`;

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

const Presets = styled.div`
  margin-right: 25px;
`;

export default RecursiveAM;
