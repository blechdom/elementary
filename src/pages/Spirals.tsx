import WebRenderer from "@elemaudio/web-renderer";
import React, { useCallback, useEffect, useState } from "react";
import { el } from "@elemaudio/core";
import styled from "styled-components";
import Slider from "../components/Slider";
import Page from "../components/Page";
import { Modal } from "../components/Modal";
require("events").EventEmitter.defaultMaxListeners = 0;

function exponentialScale(value: number): number {
  const a = 10;
  const b = Math.pow(a, 1 / a);
  return a * Math.pow(b, value);
}
type SpiralsProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

const Spirals: React.FC<SpiralsProps> = ({ audioContext, core }) => {
  const [playing, setPlaying] = useState(false);
  const [mainVolume, setMainVolume] = useState<number>(0);
  const [startingFrequency, setStartingFrequency] = useState<number>(15);
  const [scaledStartingFrequency, setScaledStartingFrequency] =
    useState<number>(0);
  const [frequency, setFrequency] = useState<number>(0);
  const [speedInMs, setSpeedInMs] = useState<number>(12);
  const [scaledSpeedInMs, setScaledSpeedInMs] = useState<number>(100);
  const [upperLimit, setUpperLimit] = useState<number>(20);
  const [scaledUpperLimit, setScaledUpperLimit] = useState<number>(0);
  const [lowerLimit, setLowerLimit] = useState<number>(20);
  const [scaledLowerLimit, setScaledLowerLimit] = useState<number>(0);
  const [intervalDivisor, setIntervalDivisor] = useState<number>(0.25);
  const [scaledIntervalDivisor, setScaledIntervalDivisor] = useState<number>(0);
   const [showEditPresets, setShowEditPresets] = useState<boolean>(false);

  const [presets, setPresets] = useState([
    [16.49, 10, 20, 20, 1.76],
    [14.63, 6.98, 21.11, 18.46, 0.74],
    [15, 11.56, 17.35, 9.08, 5.09],
    [12.75, 8.96, 21.11, 9.08, 5.99],
    [10.8, 3.68, 23.29, 11.63, 1.41],
    [10.72, 11.01, 22.85, 10.45, 3.01],
    [7.76, 10.95, 12.21, 4.09, 6.96],
  ]);

   useEffect(() => {
      const storedPresets = localStorage.getItem('spirals');
      storedPresets && setPresets(JSON.parse(storedPresets));
  }, []);

   function loadPreset(i: number): void {
    setStartingFrequency(presets[i][0]);
    setSpeedInMs(presets[i][1]);
    setUpperLimit(presets[i][2]);
    setLowerLimit(presets[i][3]);
    setIntervalDivisor(presets[i][4]);
  }

  function addNewPreset() {
    const updatedPresets = [...presets, [startingFrequency, speedInMs, upperLimit, lowerLimit, intervalDivisor]];
    saveLocalStoragePresets(JSON.stringify(updatedPresets));
    setPresets(updatedPresets);
  }

   function editPresets() {
    setShowEditPresets(true);
  }

   function deletePreset(index: number): void {
    const updatedPresets = presets.filter((preset, i) => i !== index);
    saveLocalStoragePresets(JSON.stringify(updatedPresets));
    setPresets(updatedPresets);
    setShowEditPresets(false)
  }

  function saveLocalStoragePresets(presetList: string) {
     localStorage.setItem('spirals', presetList);
  }

  useEffect(() => {
    const scaledFreq = exponentialScale(startingFrequency);
    setScaledStartingFrequency(scaledFreq);
    setFrequency(scaledFreq);
  }, [startingFrequency, scaledStartingFrequency]);

  useEffect(() => {
    const scaledFreq = exponentialScale(upperLimit);
    setScaledUpperLimit(scaledFreq);
  }, [upperLimit, scaledUpperLimit]);

  useEffect(() => {
    const scaledFreq = exponentialScale(lowerLimit);
    setScaledLowerLimit(scaledFreq);
  }, [lowerLimit, scaledLowerLimit]);

  useEffect(() => {
    const scaledFreq = exponentialScale(speedInMs);
    setScaledSpeedInMs(scaledFreq);
  }, [speedInMs, scaledSpeedInMs]);

  useEffect(() => {
    const scaledFreq = exponentialScale(intervalDivisor);
    setScaledIntervalDivisor(scaledFreq / 10);
  }, [intervalDivisor, scaledIntervalDivisor]);

  useEffect(() => {
    if (scaledLowerLimit > scaledUpperLimit) {
      setLowerLimit(upperLimit);
    }
  }, [upperLimit, scaledLowerLimit, scaledUpperLimit]);

  core.on("metro", function (e) {
    let nextFreq = frequency * scaledIntervalDivisor;
    if (nextFreq > scaledUpperLimit) {
      do {
        nextFreq = nextFreq / 2;
      } while (nextFreq > scaledLowerLimit);
    }
    setFrequency(nextFreq);
  });

  const playSynth = useCallback(() => {
    let metro = el.metro({ key: `metro`, interval: scaledSpeedInMs });
    let env = el.adsr(0.1, 0.4, 0, 0.2, metro);
    core.render(el.mul(0, metro));
    const synth = el.mul(el.cycle(frequency), env);
    core.render(
      el.mul(
        synth,
        el.sm(el.const({ key: `main-amp-left`, value: mainVolume / 100 }))
      ),
      el.mul(
        synth,
        el.sm(el.const({ key: `main-amp-right`, value: mainVolume / 100 }))
      )
    );
  }, [mainVolume, core, frequency, scaledSpeedInMs]);

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
      <h1>Pythagorean Spirals</h1>
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
         <Button key={`edit`} onClick={editPresets}>
          Edit Presets
        </Button>
      </div>
      <h3>Frequency: {frequency.toFixed(3)}</h3>
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
        starting frequency (hz) ={" "}
        <SliderLabel>{scaledStartingFrequency.toFixed(3)}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={startingFrequency}
        min={5}
        step={0.01}
        max={30}
        onChange={(event) =>
          setStartingFrequency(parseFloat(event.target.value))
        }
      />
      <h2>
        speed (ms) = <SliderLabel>{scaledSpeedInMs.toFixed(3)}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={speedInMs}
        min={0}
        step={0.01}
        max={20}
        onChange={(event) => setSpeedInMs(parseFloat(event.target.value))}
      />
      <h2>
        upper limit (hz) ={" "}
        <SliderLabel>{scaledUpperLimit.toFixed(3)}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={upperLimit}
        min={5}
        step={0.01}
        max={30}
        onChange={(event) => setUpperLimit(parseFloat(event.target.value))}
      />
      <h2>
        lower limit (hz) ={" "}
        <SliderLabel>{(scaledLowerLimit / 2).toFixed(3)}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={lowerLimit}
        min={3}
        step={0.01}
        max={upperLimit}
        onChange={(event) => setLowerLimit(parseFloat(event.target.value))}
      />
      <h2>
        interval divisor (2.0 = octave) ={" "}
        <SliderLabel>{scaledIntervalDivisor.toFixed(3)}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={intervalDivisor}
        min={0}
        step={0.01}
        max={17}
        onChange={(event) => setIntervalDivisor(parseFloat(event.target.value))}
      />
            <Modal
        active={showEditPresets}
        hideModal={() => setShowEditPresets(false)}
        title="Edit Presets"
        footer={
            <Button onClick={() => setShowEditPresets(false)}>Cancel</Button>
        }
      >
         <Presets>
        {presets.map((preset, i) => (
          <Button key={`preset-${i}`} onClick={() => deletePreset(i)}>
            Delete Preset {i + 1}
          </Button>
        ))}
      </Presets>
      </Modal>
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

export default Spirals;
