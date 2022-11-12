import { Route, Routes, Link } from "react-router-dom";
import styled from "styled-components";
import WebRenderer from "@elemaudio/web-renderer";
import About from "./pages/About";
import RecursiveFM from "./pages/RecursiveFM";
import Spirals from "./pages/Spirals";
import ShepardRissetGlissando from "./pages/ShepardRissetGlissando";

type AppProps = {
  audioContext: AudioContext;
  core: WebRenderer;
};

const App: React.FC<AppProps> = ({ audioContext, core }) => {
  return (
    <div>
      <Nav>
        <ul id="navigation">
          <li>
            <Title>Experiments in Elementary Audio</Title>
          </li>
          <li>
            <Link to="/">Recursive FM</Link>
          </li>
          <li>
            <Link to="/spirals">Pythagorean Spirals</Link>
          </li>
          <li>
            <Link to="/shepard-risset">Shepard-Risset Glissando</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </Nav>
    <br/><br/>
      <Routes>
        <Route
          path="/"
          element={<RecursiveFM audioContext={audioContext} core={core} />}
        />
        <Route
          path="/spirals"
          element={<Spirals audioContext={audioContext} core={core} />}
        />
        <Route
          path="/shepard-risset"
          element={<ShepardRissetGlissando audioContext={audioContext} core={core} />}
        />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
};

const Nav = styled.div`
  width: 100%;
  ul {
    list-style: none;
  }
  li {
    display: block;
    float: left;
    margin: 0 10px 0 10px;
    border: none;
  }
  a {
    display: block;
    padding: 5px;
    text-decoration: none;
    background-color: #fff;
    color: #b664fe;
  }
  a:hover {
    background-color: #b664fe;
    color: #fff;
  }
`;

const Title = styled.div`
  font-weight: 600;
  margin-right: 15px;
  padding: 5px;
  text-decoration: none;
  background-color: #fff;
  color: #b664fe;
`;

export default App;
