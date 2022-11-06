import React, { useCallback, useEffect, useState } from "react";
import { el } from "@elemaudio/core";
import styled from "styled-components";
import Slider from "../components/Slider";
import Page from "../components/Page";
import WebRenderer from "@elemaudio/web-renderer";
require("events").EventEmitter.defaultMaxListeners = 0;
type ShepardRissetGlissandoProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};
const ShepardRissetGlissando: React.FC<ShepardRissetGlissandoProps> = ({
  audioContext,
  core,
}) => {
  const [playing, setPlaying] = useState(false);
  const [mainVolume, setMainVolume] = useState<number>(0);
  const [numVoices, setNumVoices] = useState<number>(8);
  const [speed, setSpeed] = useState<number>(0.05);
  const [startFreq, setStartFreq] = useState<number>(100);
  const [intervalRatio, setIntervalRatio] = useState<number>(2);
  const [directionUp, setDirectionUp] = useState<boolean>(true);

  function phasedPhasor(speed: number, phaseOffset: number) {
    let t = el.add(el.phasor(speed, 0), phaseOffset);
    return el.sub(t, el.floor(t));
  }

  function phasedCycle(speed: number, phaseOffset: number) {
    return el.sin(el.mul(2 * Math.PI, phasedPhasor(speed, phaseOffset)));
  }

  function rampingSine(
    speed: number,
    phaseOffset: number,
    directionUp: boolean,
    startFreq: number,
    intervalRatio: number,
    numVoices: number
  ) {
    const modulatorUp = phasedPhasor(speed, phaseOffset);
    const modulatorDown = el.sub(1.0, modulatorUp);
    const modulator = directionUp ? modulatorUp : modulatorDown;
    let freqRange = startFreq * intervalRatio * numVoices;
    return el.mul(
      el.cycle(el.add(el.mul(el.pow(modulator, 2), freqRange), startFreq)),
      phasedCycle(speed / 2, phaseOffset / 2)
    );
  }

  const playSynth = useCallback(() => {
    const allVoices = [...Array(numVoices)].map((_, i) => {
        let phaseOffset = (1 / numVoices) * i;
        const voice = rampingSine(
          speed,
          phaseOffset,
          directionUp,
          startFreq,
          intervalRatio,
          numVoices
        );
        return el.mul(voice, 1 / numVoices);
      });

      const synth = el.mul(el.add(...allVoices), el.sm(el.const({ key: `main-amp`, value: mainVolume / 100 })));
      core.render(synth, synth);
  }, [
    mainVolume,
    speed,
    startFreq,
    intervalRatio,
    numVoices,
    directionUp,
  ]);

  const togglePlay = () => {
    if (playing) {
      audioContext.suspend();
    } else {
      audioContext.resume();
    }
    setPlaying((play) => !play);
  };

  useEffect(() => {
    if (playing) {
      playSynth();
    }
  }, [playing, playSynth]);

  return (
    <Page>
      <h1>Shepard-Risset Glissando</h1>
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
        direction up?{"   "}
        <input
          type={"checkbox"}
          checked={directionUp}
          onChange={(event) => setDirectionUp(event.target.checked)}
        />
      </h2>
      <h2>
        number of voices = <SliderLabel>{numVoices}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={numVoices}
        min={1}
        step={1}
        max={8}
        onChange={(event) => setNumVoices(parseFloat(event.target.value))}
      />
      <h2>
        speed (hz) = <SliderLabel>{speed.toFixed(3)}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={speed}
        min={0.01}
        step={0.01}
        max={5}
        onChange={(event) => setSpeed(parseFloat(event.target.value))}
      />
      <h2>
        starting frequency (hz) ={" "}
        <SliderLabel>{startFreq.toFixed(3)}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={startFreq}
        min={20}
        step={0.01}
        max={2000}
        onChange={(event) => setStartFreq(parseFloat(event.target.value))}
      />
      <h2>
        interval ratio (octave is 2) ={" "}
        <SliderLabel>{intervalRatio.toFixed(3)}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={intervalRatio}
        min={0}
        step={0.01}
        max={4.0}
        onChange={(event) => setIntervalRatio(parseFloat(event.target.value))}
      />
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

const Oscilloscope = styled.div`
  width: 512px;
  height: 100px;
`;

export default ShepardRissetGlissando;
