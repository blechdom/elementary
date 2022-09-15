# Experiments in Elementary Audio

## [Live Demo]("https://blechdom.github.io/elementary")

## To run Locally

1. clone the directory: `git clone git@github.com:blechdom/elementary.git`
1. in the project directory, install dependencies: `npm install`
1. in the same directory, start the app: `npm start`
1. Check out `http://localhost:3000` in your browser

## What's included

### Recursive FM

    FM synthesis where the the signal frequency is modulated by itself.

#### Parameters

- Presets: some I saved and a button to add more
- Main Volume: Turn this up if you want to hear anything
- Number of Recursions: How many times should the modulated signal feedback into itself
- Starting Amplitude: The roughly equates to the highest frequency you will hear in hz
- Modulation Amplitude: I can't remember what this does, but it's really important
- Starting Frequency: The frequency of the first oscillator that starts the process
- Modulation Amplitude Multiplier: Scaling function, multiplied each recursive modulator
