import { Route, Routes, Link } from "react-router-dom";
import styled from "styled-components";
import WebRenderer from "@elemaudio/web-renderer";
import About from "./pages/About";
import IFSystem from "./pages/IFSystem";
import LSystem from "./pages/LSystem";
import RecursiveFM from "./pages/RecursiveFM";
import RecursiveAM from "./pages/RecursiveAM";
import Spirals from "./pages/Spirals";

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
            <Link to="/">[Recursive FM]</Link>
          </li>
          <li>
            <Link to="/spirals">[Pythagorean Spirals]</Link>
          </li>
          <li>
            <Link to="/recursiveam">[Recursive AM]</Link>
          </li>
          <li>
            <Link to="/ifsystem">[Iterated Function System]</Link>
          </li>
          <li>
            <Link to="/lsystem">[L-System]</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </Nav>
      <br />
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
          path="/ifsystem"
          element={<IFSystem audioContext={audioContext} core={core} />}
        />
        <Route
          path="/lsystem"
          element={<LSystem audioContext={audioContext} core={core} />}
        />
        <Route
          path="/recursiveam"
          element={<RecursiveAM audioContext={audioContext} core={core} />}
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
