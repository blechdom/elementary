import WebRenderer from "@elemaudio/web-renderer";
import { useState, useCallback, useEffect } from "react";
import { el } from "@elemaudio/core";
import type { NodeRepr_t } from "@elemaudio/core";
import styled, { css } from "styled-components";
require("events").EventEmitter.defaultMaxListeners = 0;

const presets = [
  [3, 7307, 19280, 3.32, 3.68],
  [2, 1650, 925, 0.06, 0.18],
  [5, 4236, 4164, 0.09, 1.63],
  [3, 7342, 1131, 7, 0.68],
];

type AppProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

const App: React.FC<AppProps> = ({ audioContext, core }) => {
  const [playing, setPlaying] = useState(false);
  const [steps, setSteps] = useState<number>(3);
  const [modAmp, setModAmp] = useState<number>(7307);
  const [startAmp, setStartAmp] = useState<number>(19280);
  const [startFreq, setStartFreq] = useState<number>(3.32);
  const [modAmpMult, setModAmpMult] = useState<number>(3.68);
  const [masterVolume, setMasterVolume] = useState<number>(0);

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

  return (
    <Page>
      <h1>Recursive FM Synthesis</h1>
      <h5>
        Code: <a href="https://github.com/blechdom/elementary">Github</a>
      </h5>
      <PlayButton onClick={togglePlay}>
        <h2> {playing ? " Pause " : " Play "} </h2>
      </PlayButton>
      <div>
        {presets.map((preset, i) => (
          <Button key={`preset-${i}`} onClick={() => loadPreset(i)}>
            Preset {i + 1}
          </Button>
        ))}
      </div>
      <h2>
        master volume = <SliderLabel>{masterVolume}</SliderLabel>
      </h2>
      <Input
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
      <Input
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
      <Input
        type={"range"}
        value={startAmp}
        min={0}
        max={20000}
        onChange={(event) => setStartAmp(parseFloat(event.target.value))}
      />
      <h2>
        modulation amplitude = <SliderLabel>{modAmp}</SliderLabel>
      </h2>
      <Input
        type={"range"}
        value={modAmp}
        min={0}
        max={20000}
        onChange={(event) => setModAmp(parseFloat(event.target.value))}
      />
      <h2>
        starting frequency = <SliderLabel>{startFreq}</SliderLabel>
      </h2>
      <Input
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
      <Input
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

const trackH = "0.4em";
const thumbD = "1.5em";
const trackC = "#098765";
const filllC = "#ff0000";

const Page = styled.div`
  width: 100%;
  align: center;
  margin: 4em;
`;
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
const track = css`
  box-sizing: border-box;
  border: none;
  height: 4px;
  background: ${trackC};
  border-radius: 8px;
`;

const trackFill = css`
  ${track};
  height: 6px;
  background-color: transparent;
  background-image: linear-gradient(${filllC}, ${filllC}),
    linear-gradient(${trackC}, ${trackC});
  background-size: var(--sx) 6px, calc(100% - var(--sx)) 4px;
  background-position: left center, right center;
  background-repeat: no-repeat;
`;

const fill = css`
  height: ${trackH};
  background: ${filllC};
  border-radius: 4px;
`;

const thumb = css`
  box-sizing: border-box;
  border: none;
  width: ${thumbD};
  height: ${thumbD};
  border-radius: 50%;
  background: white;
  box-shadow: 0px 0px 5px rgba(66, 97, 255, 0.5);
`;

const Input = styled.input`
  &,
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
  }

  &:focus {
    outline: none;
  }

  &:focus::-webkit-slider-thumb {
    outline: -webkit-focus-ring-color auto 5px;
  }

  &:focus::-moz-range-thumb {
    outline: -webkit-focus-ring-color auto 5px;
  }

  &:focus::-ms-thumb {
    outline: -webkit-focus-ring-color auto 5px;
  }

  --range: calc(var(--max) - var(--min));
  --ratio: calc((var(--val) - var(--min)) / var(--range));
  --sx: calc(0.5 * ${thumbD} + var(--ratio) * (100% - ${thumbD}));

  margin: 0;
  padding: 0;
  height: ${thumbD};
  background: transparent;
  font: 1em/1 arial, sans-serif;

  width: 80%;

  &::-webkit-slider-runnable-track {
    ${trackFill};
  }

  &::-moz-range-track {
    ${track};
  }

  &::-ms-track {
    ${track};
  }

  &::-moz-range-progress {
    ${fill};
  }

  &::-ms-fill-lower {
    ${fill};
  }

  &::-webkit-slider-thumb {
    margin-top: calc(0.5 * (${trackH} - ${thumbD}));
    ${thumb};
  }

  &::-moz-range-thumb {
    ${thumb};
  }

  &::-ms-thumb {
    margin-top: 0;
    ${thumb};
  }

  &::-ms-tooltip {
    display: none;
  }

  &::-moz-focus-outer {
    border: 0;
  }
`;

const SliderLabel = styled.span`
  display: inline-block;
  width: 150px;
  text-align: left;
`;

export default App;
