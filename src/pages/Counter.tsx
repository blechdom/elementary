import { useCallback, useState } from "react";
import { el, NodeRepr_t } from "@elemaudio/core";
import styled from "styled-components";
import { ElementaryPageProps } from "../App";
import Slider from "../components/Slider";
import Page from "../components/Page";
require("events").EventEmitter.defaultMaxListeners = 0;

type Voice = {
  name: string;
  gate: number;
  startFreq: number;
  endFreq: number;
  startTime: number;
  endTime: number;
};

const Counter: React.FC<ElementaryPageProps> = ({ audioContext, core }) => {
  const [playing, setPlaying] = useState(false);
  const [mainVolume, setMainVolume] = useState<number>(0);
  const [voices, setVoices] = useState<Voice[]>([
    {
      name: "voice1",
      gate: 1,
      startFreq: 300,
      endFreq: 600,
      startTime: 1000,
      endTime: 1000,
    },
    {
      name: "voice2",
      gate: 1,
      startFreq: 600,
      endFreq: 150,
      startTime: 1000,
      endTime: 1000,
    },
  ]);

  const [nextVoice, setNextVoice] = useState<number>(0);

  function updateVoiceState(v: Voice) {
    // if v.name does not exist in voices, add it and increment nextVoice
  }

  const synthVoice = useCallback((voice: Voice): NodeRepr_t => {
    console.log("voice", voice);
    return el.mul(
      el.const({ key: `amp: ${voice.startFreq}`, value: 0.2 * voice.gate }),
      el.cycle(
        el.const({ key: `freq: ${voice.startFreq}`, value: voice.startFreq })
      )
    ) as NodeRepr_t;
  }, []);

  const playSynth = useCallback(() => {
    let tone = el.add(...voices.map(synthVoice));
    core.render(
      el.mul(tone, el.const({ key: `main-amp-left`, value: mainVolume / 100 })),
      el.mul(tone, el.const({ key: `main-amp-right`, value: mainVolume / 100 }))
    );
  }, [mainVolume, core, voices, synthVoice]);

  const togglePlay = () => {
    if (playing) {
      audioContext.suspend();
    } else {
      audioContext.resume();
      playSynth();
    }
    setPlaying((play) => !play);
  };

  return (
    <Page>
      <h1>L-System</h1>
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

export default Counter;
