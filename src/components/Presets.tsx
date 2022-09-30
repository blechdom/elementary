import { useState } from "react";
import styled from "styled-components";

const Presets: React.FC = () => {
  const [presets, setPresets] = useState([]);

  function loadPreset(i: number): void {
    //   setStartingFrequency(presets[i][0]);
    //  setSpeedInMs(presets[i][1]);
    //  setUpperLimit(presets[i][2]);
    //  setLowerLimit(presets[i][3]);
    //  setIntervalMultiplier(presets[i][4]);
  }

  function addNewPreset() {
    setPresets((presets) => [
      ...presets,
      /* [
        startingFrequency,
        speedInMs,
        upperLimit,
        lowerLimit,
        intervalMultiplier,
      ],*/
    ]);
  }

  return (
    <>
      <PresetsContainer>
        {presets.map((preset, i) => (
          <Button key={`preset-${i}`} onClick={() => loadPreset(i)}>
            Preset {i + 1}
          </Button>
        ))}
      </PresetsContainer>
      <div>
        <Button key={`plus`} onClick={addNewPreset}>
          + Add Preset
        </Button>
      </div>
    </>
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

const PresetsContainer = styled.div`
  margin-right: 25px;
`;

export default Presets;
