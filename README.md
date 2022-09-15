# Experiments in Elementary Audio

[Live Demo](https://blechdom.github.io/elementary)

## To run Locally

1. clone the directory: `git clone git@github.com:blechdom/elementary.git`
1. in the project directory, install dependencies: `npm install`
1. in the same directory, start the app: `npm start`
1. Check out `http://localhost:3000` in your browser

## What's included, so far...

### Recursive FM

FM synthesis where the the signal frequency is modulated by itself.

#### Parameters

- Presets: some I saved and a button to add more
- Main Volume: Turn this up if you want to hear anything
- Number of Recursions: How many times should the modulated signal feedback into itself
- Modulation Amplitude: Height of modulator, roughly equates to frequency
- Modulator Offset: Keep the LFO from having negative frequencies, if you want to
- Starting Frequency: The frequency of the first oscillator that starts the process
- Modulation Amplitude Divisor: Scaling function, amplitude is divided by this number in each recursion

### Pythagorean Spiral

Playing with the Pythagorean Comma: Multiply a frequency by a value (1.5 = Perfect 5th). If the frequency goes above a threshold, divide it by 2 (an octave), to keep the frequencies in audible range. Hear the sequences spiral around the comma.

#### Parameters

- Presets: some I saved and a button to add more
- Main Volume: Turn this up if you want to hear anything
- Starting Frequency: Give it a place to start, a seed
- Speed (ms): how fast do you want to hear it go?
- Upper Limit: Threshold to start dividing by a value (octave = 2.0)
- Lower Limit: If you want the pattern to cover a larger range, lower this value
- Interval Divisor: maybe you want to divide by a number other than 2? The value exists, so might as well tweak it.
