import WebRenderer from "@elemaudio/web-renderer";
import "./App.css";
import { useState, useCallback, useEffect } from "react";
import { el } from "@elemaudio/core";
import type { NodeRepr_t } from "@elemaudio/core";
require("events").EventEmitter.defaultMaxListeners = 0;

type AppProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

const App: React.FC<AppProps> = ({ audioContext, core }) => {
  const [playing, setPlaying] = useState(false);
  const [steps, setSteps] = useState<number>(4);
  const [modAmp, setModAmp] = useState<number>(10000);
  const [startAmp, setStartAmp] = useState<number>(20000);
  const [startFreq, setStartFreq] = useState<number>(0.01);
  const [modAmpMult, setModAmpMult] = useState<number>(2);
  const [ampLimit, setAmpLimit] = useState<number>(1);
  const [masterVolume, setMasterVolume] = useState<number>(0);

  const recursiveFM = useCallback(
    (t: NodeRepr_t, amp: number, counter: number): NodeRepr_t => {
      return counter > 0 && amp > ampLimit
        ? recursiveFM(
            el.cycle(
              el.mul(t, el.const({ key: `amp-${counter}`, value: amp }))
            ),
            amp / modAmpMult,
            counter - 1
          )
        : t;
    },
    [ampLimit, modAmpMult]
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

  return (
    <div className="App">
      <h1>Recursive FM Synthesis</h1>
      <button onClick={togglePlay}>
        <span>{playing ? "Pause" : "Play"}</span>
      </button>
      <h2>master volume</h2>
      <input
        type={"range"}
        value={masterVolume}
        min={0}
        step={0.1}
        max={100}
        onChange={(event) => setMasterVolume(parseFloat(event.target.value))}
      />{" "}
      {masterVolume}
      <h2>number of recursions</h2>
      <input
        width="1000px"
        type={"range"}
        value={steps}
        min={0}
        max={10}
        onChange={(event) => setSteps(parseFloat(event.target.value))}
      />{" "}
      {steps}
      <h2>starting amplitude</h2>
      <input
        type={"range"}
        value={startAmp}
        min={0}
        max={20000}
        onChange={(event) => setStartAmp(parseFloat(event.target.value))}
      />{" "}
      {startAmp}
      <h2>modulation amplitude</h2>
      <input
        type={"range"}
        value={modAmp}
        min={0}
        max={20000}
        onChange={(event) => setModAmp(parseFloat(event.target.value))}
      />{" "}
      {modAmp}
      <h2>starting frequency</h2>
      <input
        type={"range"}
        value={startFreq}
        step={0.01}
        min={0}
        max={40}
        onChange={(event) => setStartFreq(parseFloat(event.target.value))}
      />{" "}
      {startFreq}
      <h2>modulation amplitude multiplier</h2>
      <input
        type={"range"}
        value={modAmpMult}
        min={0.01}
        step={0.01}
        max={8}
        onChange={(event) => setModAmpMult(parseFloat(event.target.value))}
      />{" "}
      {modAmpMult}
      <h2>amplitude limit value</h2>
      <input
        type={"range"}
        value={ampLimit}
        min={0}
        step={0.01}
        max={12}
        onChange={(event) => setAmpLimit(parseFloat(event.target.value))}
      />{" "}
      {ampLimit}
    </div>
  );
};

export default App;
