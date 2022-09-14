import WebRenderer from "@elemaudio/web-renderer";
import { useCallback, useEffect, useState } from "react";
import { el } from "@elemaudio/core";
import styled from "styled-components";
import Slider from "../components/Slider";
import Page from "../components/Page";
require("events").EventEmitter.defaultMaxListeners = 0;

type SpiralsProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

const Spirals: React.FC<SpiralsProps> = ({ audioContext, core }) => {
  const [playing, setPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState<number>(0);
  const [startingFrequency, setStartingFrequency] = useState<number>(15);
  const [scaledStartingFrequency, setScaledStartingFrequency] =
    useState<number>(0);
  const [frequency, setFrequency] = useState<number>(0);
  const [speedInMs, setSpeedInMs] = useState<number>(1000);
  const [upperLimit, setUpperLimit] = useState<number>(6000);
  const [intervalMultiplier, setIntervalMultiplier] = useState<number>(1.5);
  const [intervalDivisor, setIntervalDivisor] = useState<number>(2);

  core.on("metro", function (e) {
    let nextFreq = frequency * intervalMultiplier;
    if (nextFreq > upperLimit) {
      do {
        nextFreq = nextFreq / 2;
      } while (nextFreq > upperLimit);
    }
    setFrequency(nextFreq);
  });

  useEffect(() => {
    const a = 10;
    const b = Math.pow(a, 1 / a);
    const scaledFreq = Math.floor(a * Math.pow(b, startingFrequency));
    setScaledStartingFrequency(scaledFreq);
    setFrequency(scaledFreq);
  }, [startingFrequency, scaledStartingFrequency]);

  const playSynth = useCallback(() => {
    core.render(el.mul(0, el.metro({ interval: speedInMs })));
    const synth = el.cycle(el.const({ key: `master-freq`, value: frequency }));
    core.render(
      el.mul(
        synth,
        el.const({ key: `master-amp-left`, value: masterVolume / 100 })
      ),
      el.mul(
        synth,
        el.const({ key: `master-amp-right`, value: masterVolume / 100 })
      )
    );
  }, [masterVolume, core, frequency, speedInMs]);

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
        starting frequency ={" "}
        <SliderLabel>{scaledStartingFrequency}</SliderLabel>
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
        speed (ms) = <SliderLabel>{speedInMs}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={speedInMs}
        min={0}
        step={0.01}
        max={1000}
        onChange={(event) => setSpeedInMs(parseFloat(event.target.value))}
      />
      <h2>
        upper limit (hz) = <SliderLabel>{upperLimit}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={upperLimit}
        min={0}
        step={0.01}
        max={10000}
        onChange={(event) => setUpperLimit(parseFloat(event.target.value))}
      />
      <h2>
        interval multiplier = <SliderLabel>{intervalMultiplier}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={intervalMultiplier}
        min={0}
        step={0.01}
        max={100}
        onChange={(event) =>
          setIntervalMultiplier(parseFloat(event.target.value))
        }
      />
      <h2>
        interval divisor = <SliderLabel>{intervalDivisor}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={intervalDivisor}
        min={0}
        step={0.01}
        max={16}
        onChange={(event) => setIntervalDivisor(parseFloat(event.target.value))}
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

export default Spirals;
