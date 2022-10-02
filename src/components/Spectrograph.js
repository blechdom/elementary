import React, { Component } from "react";

let toLog = function (value, min, max) {
  var exp = (value - min) / (max - min);
  return min * Math.pow(max / min, exp);
};

/*for (var i = 1; i < 20; i += 1) {
  //I'm starting at 1 because 0 and logarithms dont get along
  var logindex = toLog(i,1,19); //the index we want to sample

  //As the logindex will probably be decimal, we need to interpolate (in this case linear interpolation)
  var low = Math.floor(logindex);
  var high = Math.ceil(logindex);
  var lv = arr[low];
  var hv = arr[high];
  var w = (logindex-low)/(high-low);
  var v = lv + (hv-lv)*w; //the interpolated value of the original array in the logindex index.
    document.write(v + "<br/>");  //In your case you should draw the bar here or save it in an array for later.
}*/

class Spectrograph extends Component {
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
      console.log("audioVizData", audioVizData);
      console.log("audioVizData.length", audioVizData.length);
      const canvas = this.canvas.current;
      const height = canvas.height;
      const width = canvas.width;
      const context = canvas.getContext("2d");

      //const sliceWidth = width / audioVizData.length;
      context.lineWidth = 1;
      context.strokeStyle = color;
      context.clearRect(0, 0, width, height);

      let averager = 0;
      let averagerCount = 1;

      audioVizData.forEach((val, index) => {
        console.log("index", index);
        console.log("val", val);

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

export default Spectrograph;
