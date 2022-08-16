import "./App.css";
import { useState, useCallback, useEffect } from "react";
import { el } from "@elemaudio/core";
import type { NodeRepr_t } from "@elemaudio/core";
import WebRenderer from "@elemaudio/web-renderer";

const audioContext = new AudioContext({
  latencyHint: "interactive",
  sampleRate: 44100,
});

const core = new WebRenderer();

(async function main() {
  let node = await core.initialize(audioContext, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });

  node.connect(audioContext.destination);
})();

function App() {
  const [playing, setPlaying] = useState(false);
  const [steps, setSteps] = useState<number>(4);
  const [modAmp, setModAmp] = useState<number>(10000);
  const [startAmp, setStartAmp] = useState<number>(20000);
  const [startFreq, setStartFreq] = useState<number>(0.01);
  const [modAmpMult, setModAmpMult] = useState<number>(2);
  const [ampLimit, setAmpLimit] = useState<number>(1);
  const [masterVolume, setMasterVolume] = useState<number>(0);

  const playSynth = useCallback(() => {
    const recursiveFM = (
      t: NodeRepr_t,
      amp: number,
      counter: number
    ): NodeRepr_t => {
      return counter > 0 && amp > ampLimit
        ? recursiveFM(el.cycle(el.mul(t, amp)), amp / modAmpMult, counter - 1)
        : t;
    };

    const synth = recursiveFM(
      el.cycle(el.mul(el.cycle(startFreq), startAmp)),
      modAmp,
      steps
    );

    core.render(
      el.mul(synth, masterVolume / 100),
      el.mul(synth, masterVolume / 100)
    );
  }, [modAmp, steps, startAmp, startFreq, ampLimit, modAmpMult, masterVolume]);

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
  }, [modAmp, steps, startAmp, startFreq, playSynth]);

  return (
    <div className="App">
      <h1>Recursive FM Synthesis</h1>
      <button onClick={togglePlay}>
        <span>{playing ? "Pause" : "Play"}</span>
      </button>
      <h2>steps</h2>
      <input
        width="1000px"
        type={"range"}
        value={steps}
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
        max={12}
        onChange={(event) => setStartFreq(parseFloat(event.target.value))}
      />{" "}
      {startFreq}
      <h2>modulation amplitude multiplier</h2>
      <input
        type={"range"}
        value={modAmpMult}
        min={0.01}
        step={0.01}
        max={12}
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
    </div>
  );
}

export default App;
