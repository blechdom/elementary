import React, { useCallback, useEffect, useState } from "react";
import {el, NodeRepr_t} from "@elemaudio/core";
import styled from "styled-components";
import { Modal } from "../components/Modal";
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
  const [showEditPresets, setShowEditPresets] = useState<boolean>(false);

  const [presets, setPresets] = useState([
    [8, 0.05, 100, 2, true],
    [8, 0.05, 200, 1.5, false],
    [2, 5.0, 135, 3.7, true],
    [8, 0.06, 660, 0.12, false],
    [6, 0.75, 212, 4, true]
  ]);

  useEffect(() => {
      const storedPresets = localStorage.getItem('shepard-risset-glissando');
      storedPresets && setPresets(JSON.parse(storedPresets));
  }, []);

  function loadPreset(i: number): void {
    setNumVoices(presets[i][0] as number);
    setSpeed(presets[i][1] as number);
    setStartFreq(presets[i][2] as number);
    setIntervalRatio(presets[i][3] as number);
    setDirectionUp(presets[i][4] as boolean);
  }

  function addNewPreset() {
    const updatedPresets = [...presets, [numVoices, speed, startFreq, intervalRatio, directionUp]];
    saveLocalStoragePresets(JSON.stringify(updatedPresets));
    setPresets(updatedPresets);
  }

  function saveLocalStoragePresets(presetList: string) {
      localStorage.setItem('shepard-risset-glissando', presetList);
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

  const playSynth = useCallback(() => {
    function phasedPhasor(key: string, speed: number, phaseOffset: number) {
      const smoothSpeed = el.sm(el.const({ key: `phased-phasor-speed`, value: speed }));
      let t = el.add(el.phasor(smoothSpeed, 0), el.sm(el.const({ key: `${key}:phased-phasor-offset`, value: phaseOffset})));
      return el.sub(t, el.floor(t));
    }

   function phasedCycle(key: string, speed: number, phaseOffset: number) {
    let p = phasedPhasor(key, speed, phaseOffset);
    let offset = el.sub(el.mul(2 * Math.PI, p), el.const({ key: `phased-cycle-offset`, value: 1.5 }));
    return el.mul(el.add(el.sin(offset), 1), 0.5);
  }
    const freqRange = el.sm(el.const({ key: `freq-range`, value: startFreq * intervalRatio * numVoices }));
    const smoothStartFreq = el.sm(el.const({ key: `start-freq`, value: startFreq }));

    function rampingSine(key: string, phaseOffset: number) {
      const modulatorUp = phasedPhasor(key, speed, phaseOffset);
      const modulatorDown = el.sub(1.0, modulatorUp);
      const modulator = directionUp ? modulatorUp : modulatorDown;
      return el.mul(
        el.cycle(el.add(el.mul(el.pow(modulator, 2), freqRange), smoothStartFreq)),
        phasedCycle(key, speed, phaseOffset)
      );
    }

    const allVoices = [...Array(numVoices)].map((_, i) => {
      const key = `voice-${i}`;
      const phaseOffset = (1 / numVoices) * i;
      const voice = rampingSine(key, phaseOffset);
      return el.mul(voice, el.sm(el.const({ key: `scale-amp-by-numVoices`, value: (1 / numVoices)})));
    });

    function addMany(ins: NodeRepr_t[]): NodeRepr_t{
      if (ins.length < 9) {
        return el.add(...ins) as NodeRepr_t;
      }
      return el.add(...ins.slice(0, 7), addMany(ins.slice(8))) as NodeRepr_t
    }
    const synth = el.mul(addMany(allVoices as NodeRepr_t[]), el.sm(el.const({ key: `main-amp`, value: mainVolume / 100 })));
    core.render(synth, synth);
  }, [numVoices, mainVolume, core, speed, directionUp, startFreq, intervalRatio]);

  const togglePlay = async() => {
    if (playing) {
      await audioContext.suspend();
    } else {
      await audioContext.resume();
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
        max={64}
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
        min={10}
        step={0.01}
        max={3000}
        onChange={(event) => setStartFreq(parseFloat(event.target.value))}
      />
      <h2>
        interval ratio (octave is 2) ={" "}
        <SliderLabel>{intervalRatio.toFixed(3)}</SliderLabel>
      </h2>
      <Slider
        type={"range"}
        value={intervalRatio}
        min={0.01}
        step={0.01}
        max={4.0}
        onChange={(event) => setIntervalRatio(parseFloat(event.target.value))}
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

export default ShepardRissetGlissando;
