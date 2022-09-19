import { useCallback, useEffect, useState } from "react";
import WebRenderer from "@elemaudio/web-renderer";
import { el } from "@elemaudio/core";
import Page from "../components/Page";

type CounterProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

const Counter: React.FC<CounterProps> = ({ audioContext, core }) => {
  const [playing, setPlaying] = useState(false);

  let count = 0;

  useEffect(() => {
    setPlaying(false);
  }, []);

  /*core.on("metro", function (e) {
    console.log("metro", count);
    count++;
  });*/

  const playSynth = useCallback(() => {
    //core.on("tick", function () {
    //console.log("tick", count);
    //count++;
    const train = el.train(1.0);
    core.render(el.mul(1, train));
    //});

    //let metro = el.metro({ key: `metro`, interval: 1000 });
    //core.render(el.mul(0, metro));
  }, [core]);

  const togglePlay = () => {
    if (playing) {
      audioContext.suspend();
    } else {
      audioContext.resume();
      count = 0;
      playSynth();
    }
    setPlaying((play) => !play);
  };

  /*useEffect(() => {
    playSynth();
  }, [playSynth]);*/

  return (
    <Page>
      <h1>Counter Test</h1>
      <button onClick={togglePlay}>
        <h2> {playing ? " Pause " : " Play "} </h2>
      </button>
    </Page>
  );
};

export default Counter;
