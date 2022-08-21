import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import WebRenderer from "@elemaudio/web-renderer";

const audioContext: AudioContext = new AudioContext({
  latencyHint: "interactive",
  sampleRate: 44100,
});

const core: WebRenderer = new WebRenderer();

const root = createRoot(document.getElementById("root") as HTMLElement);

core.on("load", () => {
  core.on("error", (e: unknown) => {
    console.error("conre error: ", e);
  });

  root.render(
    <React.StrictMode>
      <App audioContext={audioContext} core={core} />
    </React.StrictMode>
  );
});

async function main() {
  let node = await core.initialize(audioContext, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });
  node.connect(audioContext.destination);
}

main();

reportWebVitals();
