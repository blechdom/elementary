import React from "react";
import Page from "../components/Page";

const About: React.FC = () => {
  return (
    <Page>
      <h1>Elementary Audio Experiments</h1>
      <main>
        <h5>
          Code: <a href="https://github.com/blechdom/elementary">Github</a>
        </h5>
        <p>Welcome to my site. Here's what's working, so far...</p>
        <ul>
          <li>
            <h3>
              <a href="./">Recursive FM</a>
            </h3>
            <p>
              FM synthesis where the the signal frequency is modulated by a
              scaled version of itself.
            </p>
            Parameters:
            <br />
            &nbsp;&nbsp;&nbsp;<b>* Presets:</b> Some I saved and a button to add
            more
            <br />
            &nbsp;&nbsp;&nbsp;<b>* Main Volume:</b> Turn this up if you want to
            hear anything <br />
            &nbsp;&nbsp;&nbsp;<b>* Number of Recursions:</b> How many times
            should the modulated signal feedback into itself <br />
            &nbsp;&nbsp;&nbsp;<b>* Modulation Amplitude:</b> Height of
            modulator, roughly equates to frequency
            <br />
            &nbsp;&nbsp;&nbsp;<b>* Modulator Offset:</b> Keep the LFO from
            having negative frequencies, if you want to <br />
            &nbsp;&nbsp;&nbsp;<b>* Starting Frequency:</b> The frequency of the
            first oscillator that starts the process <br />
            &nbsp;&nbsp;&nbsp;<b>* Modulation Amplitude Divisor:</b>
            Scaling function, amplitude is divided by this number in each
            recursion
            <br />
            <br />
          </li>
          <li>
            <h3>
              <a href="./spirals">Pythagorean Spirals</a>
            </h3>
            <p>
              Playing with the Pythagorean Comma: Multiply a frequency by a
              value (1.5 = Perfect 5th). If the frequency goes above a
              threshold, divide it by 2 (an octave), to keep the frequencies in
              audible range. Hear the sequences spiral around the comma.
            </p>
            Parameters:
            <br />
            &nbsp;&nbsp;&nbsp;<b>* Presets:</b> Some I saved and a button to add
            more
            <br />
            &nbsp;&nbsp;&nbsp;<b>* Main Volume:</b> Turn this up if you want to
            hear anything
            <br />
            &nbsp;&nbsp;&nbsp;<b>* Starting Frequency:</b> Give it a place to
            start, a seed
            <br />
            &nbsp;&nbsp;&nbsp;<b>* Speed (ms):</b> how fast do you want to hear
            it go?
            <br />
            &nbsp;&nbsp;&nbsp;<b>* Upper Limit:</b> Threshold to start dividing
            by a value (octave = 2.0)
            <br />
            &nbsp;&nbsp;&nbsp;<b>* Lower Limit:</b> If you want the pattern to
            cover a larger range, lower this value
            <br />
            &nbsp;&nbsp;&nbsp;<b>* Interval Divisor:</b> maybe you want to
            divide by a number other than 2? The value exists, so might as well
            tweak it.
          </li>
        </ul>
      </main>
    </Page>
  );
};

export default About;
