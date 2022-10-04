import { useCallback, useEffect, useState } from "react";
import { el } from "@elemaudio/core";
import styled from "styled-components";
import { ElementaryPageProps } from "../App";
import Slider from "../components/Slider";
import Page from "../components/Page";
import AudioVisualiser from "../components/AudioVisualiser";
import Spectrograph from "../components/Spectrograph";
require("events").EventEmitter.defaultMaxListeners = 0;

interface ScopeEvent {
  source?: string;
  data: Array<Array<number>>;
}

const ShepardRissetGlissando2: React.FC<ElementaryPageProps> = ({
  audioContext,
  core,
}) => {
  const [playing, setPlaying] = useState(false);
  const [mainVolume, setMainVolume] = useState<number>(45);
  const [numVoices, setNumVoices] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(0.1);
  const [startFreq, setStartFreq] = useState<number>(200);
  const [intervalRatio, setIntervalRatio] = useState<number>(2);
  const [directionUp, setDirectionUp] = useState<boolean>(true);
  const [audioVizData, setAudioVizData] = useState<Array<number>>([]);
  const [fftVizData, setFftVizData] = useState<Array<number>>([]);

  function handleLeftScopeData(data: Array<Array<number>>) {
    if (data.length) {
      setAudioVizData(data[0]);
    }
  }

  function handleLeftFftData(data: any) {
    setFftVizData(data.real);
  }

  function handleRightScopeData(event: ScopeEvent) {
    //console.log("right ", event);
  }

  function cycle(freq: number, phaseOffset: number = 0) {
    let t = el.add(el.phasor(freq, 0), phaseOffset);
    let p = el.sub(t, el.floor(t));

    return el.sin(el.mul(2 * Math.PI - Math.floor(Math.PI + 1 / 2), p));
  }

  /*
  tri = sawtooth(2*pi*T_freq*ft+(pi/2), .5);
  square(t) = sgn(sin(2πt))
sawtooth(t) = t - floor(t + 1/2)
triangle(t) = abs(sawtooth(t))*/

  const playSynth = useCallback(() => {
    /*let delayInSamples = Math.floor(
      ((1 / speed) * audioContext.sampleRate) / numVoices
    );

    const modulatorUp = el.pow(el.phasor(speed, 0), 2);
    const modulatorDown = el.sub(1.0, modulatorUp);
    const modulator = directionUp ? modulatorUp : modulatorDown;
    let freqRange = startFreq * intervalRatio * numVoices;*/
    /* const ramper = el.mul(
      el.cycle(el.add(el.mul(modulator, freqRange), startFreq)),
      el.cycle(speed / 2)
    );*/

    /* const allVoices = [...Array(numVoices)].map((_, i) => {
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

    const synth = el.add(...allVoices);*/
    const synth = cycle(startFreq, 0);
    core.render(
      el.scope(
        { name: "left" },
        el.fft(
          { name: "left-fft" },
          el.mul(
            synth,
            el.sm(el.const({ key: `main-amp-left`, value: mainVolume / 100 }))
          )
        )
      ),
      el.scope(
        { name: "right" },
        el.mul(
          synth,
          el.sm(el.const({ key: `main-amp-right`, value: mainVolume / 100 }))
        )
      )
    );
  }, [
    mainVolume,
    core,
    speed,
    startFreq,
    intervalRatio,
    numVoices,
    audioContext.sampleRate,
    directionUp,
  ]);

  core.on("scope", function (e) {
    if (e.source === "left") {
      handleLeftScopeData(e.data);
    }
    if (e.source === "right") {
      handleRightScopeData(e.data);
    }
  });

  core.on("fft", function (e) {
    if (e.source === "left-fft") {
      handleLeftFftData(e.data);
    }
  });

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
      <Oscilloscope>
        <AudioVisualiser audioVizData={audioVizData} color="#1976d2" />
      </Oscilloscope>
      <Oscilloscope>
        <Spectrograph audioVizData={fftVizData} color="#1976d2" />
      </Oscilloscope>
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

export default ShepardRissetGlissando2;
