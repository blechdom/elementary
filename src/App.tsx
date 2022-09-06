import WebRenderer from "@elemaudio/web-renderer";
import RecursiveFM from "./pages/RecursiveFM";

type AppProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

const App: React.FC<AppProps> = ({ audioContext, core }) => {
  return <RecursiveFM audioContext={audioContext} core={core} />;
};

export default App;
