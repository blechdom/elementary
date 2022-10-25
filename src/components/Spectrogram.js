import React, { Component } from "react";

let toLog = function (value, min, max) {
  const exp = (value - min) / (max - min);
  return min * Math.pow(max / min, exp);
};

class Spectrogram extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }

  componentDidUpdate() {
    this.draw();
  }

  draw() {
    const { audioVizData, color } = this.props;
    if (audioVizData?.length > 0) {
      const canvas = this.canvas.current;
      const height = canvas.height;
      const width = canvas.width;
      const context = canvas.getContext("2d");

      context.lineWidth = 1;
      context.strokeStyle = color;
      context.clearRect(0, 0, width, height);

      audioVizData.forEach((val, index) => {
        const logindex = toLog(
          audioVizData.length - index,
          1,
          audioVizData.length + 1
        );
        let x = Math.floor(audioVizData.length - logindex);
        context.beginPath();
        context.moveTo(x, height);
        context.lineTo(x, height - Math.abs(val) * 2.5);
        context.stroke();
      });
    }
  }

  render() {
    return <canvas width="512" height="100" ref={this.canvas} />;
  }
}

export default Spectrogram;
