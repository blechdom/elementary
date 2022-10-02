import React, { Component } from "react";

class Oscilloscope extends Component {
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
      let x = 0;
      const sliceWidth = width / audioVizData.length;
      context.lineWidth = 2;
      context.strokeStyle = color;
      context.clearRect(0, 0, width, height);

      context.beginPath();
      context.moveTo(0, height / 2);

      for (const val of audioVizData) {
        const y = height / 2 + val * height;
        context.lineTo(x, y);
        x += sliceWidth;
      }

      context.lineTo(x, height / 2);
      context.stroke();
    }
  }

  render() {
    return <canvas width="512" height="100" ref={this.canvas} />;
  }
}

export default Oscilloscope;
