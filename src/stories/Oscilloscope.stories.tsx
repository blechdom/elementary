import { el } from "@elemaudio/core";
import WebRenderer from "@elemaudio/web-renderer";
import { Meta, Story } from "@storybook/react";
import { useState } from "react";

import Oscilloscope from "../components/Oscilloscope";

const audioContext: AudioContext = new AudioContext();

const core: WebRenderer = new WebRenderer();

async function main() {
  console.log("initializing core");
  let node = await core.initialize(audioContext, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });
  node.connect(audioContext.destination);
}

main();

core.on("load", () => {
  console.log("core loaded");
});

type DemoProps = {
  color: string;
  height: number;
  width: number;
};

const Demo = (args: DemoProps) => {
  const [playing, setPlaying] = useState(false);
  const [audioVizData, setAudioVizData] = useState<Array<number>>([]);

  const togglePlay = () => {
    if (playing) {
      audioContext.suspend();
    } else {
      audioContext.resume();
      playSynth();
    }
    setPlaying((play) => !play);
  };

  function handleScopeData(data: Array<Array<number>>) {
    if (data.length) {
      setAudioVizData(data[0]);
    }
  }

  const playSynth = () => {
    console.log("playing synth");

    console.log("in load");
    const synth = el.scope({ name: "scope" }, el.mul(el.cycle(200), 0.25));
    core.render(synth, synth);
  };

  core.on("scope", function (e) {
    if (e.source === "scope") {
      handleScopeData(e.data);
    }
  });

  return (
    <>
      <button onClick={togglePlay}>
        <h2> {playing ? " Pause " : " Play "} </h2>
      </button>
      <br />
      <Oscilloscope audioVizData={audioVizData} {...args} />
    </>
  );
};

const meta: Meta = {
  title: "analyzer/oscilloscope",
  component: Demo,
};

export default meta;

const Template: Story<DemoProps> = (args) => <Demo {...args} />;

export const Default = Template.bind({});

Default.args = {
  color: "#FF0000",
  width: 500,
  height: 250,
};
