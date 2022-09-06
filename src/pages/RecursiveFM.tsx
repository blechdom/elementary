import WebRenderer from "@elemaudio/web-renderer";
import { useState, useCallback, useEffect } from "react";
import { el } from "@elemaudio/core";
import type { NodeRepr_t } from "@elemaudio/core";
import styled from "styled-components";
import Slider from "../components/Slider";
import Page from "../components/Page";
require("events").EventEmitter.defaultMaxListeners = 0;

type RecursiveFMProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

const RecursiveFM: React.FC<RecursiveFMProps> = ({ audioContext, core }) => {
  const [playing, setPlaying] = useState(false);
  const [steps, setSteps] = useState<number>(3);
  const [modAmp, setModAmp] = useState<number>(7307);
  const [startAmp, setStartAmp] = useState<number>(19280);
  const [startFreq, setStartFreq] = useState<number>(3.32);
  const [modAmpMult, setModAmpMult] = useState<number>(3.68);
  const [masterVolume, setMasterVolume] = useState<number>(0);

  const [presets, setPresets] = useState([
    [3, 7307, 19280, 3.32, 3.68],
    [2, 1650, 925, 0.06, 0.18],
    [5, 4236, 4164, 0.09, 1.63],
    [3, 7342, 1131, 7, 0.68],
  ]);

  const recursiveFM = useCallback(
    (t: NodeRepr_t, amp: number, counter: number): NodeRepr_t => {
      return counter > 0
        ? recursiveFM(
            el.cycle(
              el.mul(t, el.const({ key: `amp-${counter}`, value: amp }))
            ),
            amp / modAmpMult,
            counter - 1
          )
        : t;
    },
    [modAmpMult]
  );

  const playSynth = useCallback(() => {
    const synth = recursiveFM(
      el.cycle(
        el.mul(
          el.cycle(el.const({ key: `start-freq`, value: startFreq })),
          el.const({ key: `start-amp`, value: startAmp })
        )
      ),
      modAmp,
      steps
    );

    core.render(
      el.mul(synth, el.const({ key: `master-amp`, value: masterVolume / 100 })),
      el.mul(synth, el.const({ key: `master-amp`, value: masterVolume / 100 }))
    );
  }, [modAmp, steps, startAmp, startFreq, recursiveFM, masterVolume, core]);

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
    setStartAmp(presets[i][2]);
    setStartFreq(presets[i][3]);
    setModAmpMult(presets[i][4]);
  }

  function addNewPreset() {
    setPresets((presets) => [
      ...presets,
      [steps, modAmp, startAmp, startFreq, modAmpMult],
    ]);
  }

  return (
    <Page>
      <h1>Recursive FM Synthesis</h1>
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
        master volume = <SliderLabel>{masterVolume}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={masterVolume}
        min={0}
        step={0.1}
        max={100}
        onChange={(event) => setMasterVolume(parseFloat(event.target.value))}
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
        starting amplitude = <SliderLabel>{startAmp}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={startAmp}
        min={0}
        max={20000}
        onChange={(event) => setStartAmp(parseFloat(event.target.value))}
      />
      <h2>
        modulation amplitude = <SliderLabel>{modAmp}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={modAmp}
        min={0}
        max={20000}
        onChange={(event) => setModAmp(parseFloat(event.target.value))}
      />
      <h2>
        starting frequency = <SliderLabel>{startFreq}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={startFreq}
        step={0.01}
        min={0}
        max={40}
        onChange={(event) => setStartFreq(parseFloat(event.target.value))}
      />
      <h2>
        modulation amplitude multiplier ={" "}
        <SliderLabel>{modAmpMult}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={modAmpMult}
        min={0.01}
        step={0.01}
        max={8}
        onChange={(event) => setModAmpMult(parseFloat(event.target.value))}
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

export default RecursiveFM;
