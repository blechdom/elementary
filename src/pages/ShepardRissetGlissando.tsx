import { useCallback, useEffect, useState } from "react";
import { el } from "@elemaudio/core";
import styled from "styled-components";
import { ElementaryPageProps } from "../App";
import Slider from "../components/Slider";
import Page from "../components/Page";
require("events").EventEmitter.defaultMaxListeners = 0;

const ShepardRissetGlissando: React.FC<ElementaryPageProps> = ({
  audioContext,
  core,
}) => {
  const [playing, setPlaying] = useState(false);
  const [mainVolume, setMainVolume] = useState<number>(4);
  const [numVoices, setNumVoices] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(0.5);
  const [startFreq, setStartFreq] = useState<number>(200);
  const [freqRange, setFreqRange] = useState<number>(1600);
  const [directionUp, setDirectionUp] = useState<boolean>(true);

  const playSynth = useCallback(() => {
    let delayInSamples = Math.floor(
      ((1 / speed) * audioContext.sampleRate) / numVoices
    );

    const modulatorUp = el.phasor(speed, 0);
    const modulatorDown = el.sub(1.0, modulatorUp);
    const modulator = directionUp ? modulatorUp : modulatorDown;
    const ramper = el.mul(
      el.cycle(el.add(el.mul(modulator, freqRange), startFreq)),
      el.cycle(speed / 2)
    );

    const allVoices = [...Array(numVoices)].map((_, i) => {
      const voice = el.delay(
        { size: audioContext.sampleRate * 100 },
        el.const({
          key: `delayInSamples-${delayInSamples * (i + 1)}`,
          value: delayInSamples * (i + 1),
        }),
        0,
        el.mul(ramper, 1 / numVoices)
      );
      return voice;
    });

    const synth = el.add(...allVoices);
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
  }, [
    mainVolume,
    core,
    speed,
    startFreq,
    freqRange,
    numVoices,
    audioContext.sampleRate,
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
        freqRange (hz) = <SliderLabel>{freqRange.toFixed(3)}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={freqRange}
        min={40}
        step={0.01}
        max={20480}
        onChange={(event) => setFreqRange(parseFloat(event.target.value))}
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

export default ShepardRissetGlissando;
