# 🎹 Piano App

An interactive browser-based piano built with Vite + React and the Web Audio API. No audio files, no external UI libraries — just pure JavaScript, CSS, and oscillators.

---

## Features

- Full octave keyboard (C4 to C5) with correct black key layout
- Real piano frequencies generated via Web Audio API
- Attack/release envelope for natural, click-free sound
- Polyphony — play multiple notes simultaneously
- Mouse, keyboard, and touch (mobile) support
- Sustain pedal via spacebar
- Visual key depression animation on press
- Responsive layout for tablet and mobile

---

## Tech Stack

- [Vite](https://vitejs.dev/) — build tool and dev server
- [React 18](https://react.dev/) — functional components + hooks
- Web Audio API — sound generation (built into the browser, no install needed)
- Plain CSS — no UI libraries

---

## Project Structure

```
piano-app/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── data/
    │   └── notes.js          # Note names, frequencies, keyboard mappings
    ├── hooks/
    │   └── useAudio.js       # All Web Audio API logic
    ├── components/
    │   ├── Piano.jsx          # Layout, keyboard events, touch events
    │   └── PianoKey.jsx       # Individual key component
    └── styles/
        ├── Piano.css
        └── PianoKey.css
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node)

### Installation

```bash
# Clone or download the project
cd piano-app

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Preview the production build with:

```bash
npm run preview
```

---

## Controls

### Keyboard

| Piano Note | Key |
|------------|-----|
| C4         | A   |
| D4         | S   |
| E4         | D   |
| F4         | F   |
| G4         | G   |
| A4         | H   |
| B4         | J   |
| C5         | K   |

**Black keys (sharps):**

| Piano Note | Key |
|------------|-----|
| C#4        | W   |
| D#4        | E   |
| F#4        | T   |
| G#4        | Y   |
| A#4        | U   |

**Sustain pedal:** `SPACE` — hold to sustain notes after releasing keys

### Mouse

- **Click and hold** a key to play it
- **Release** to stop the note
- **Drag** across keys to glide between notes

### Touch (Mobile)

- Tap keys to play
- Multi-touch supported — hold multiple keys at once
- Slide your finger across keys to glide

---

## How Sound Works

Every note uses this signal chain:

```
OscillatorNode -> GainNode -> AudioContext.destination (speakers)
```

**Oscillator type:** `triangle` — warmer than a sine wave, less harsh than sawtooth. Gives a piano-like tone without needing audio samples.

**Envelope (why it doesn't click):**
- *Attack (10ms):* Gain ramps from 0 to 0.4 when a key is pressed. This eliminates the pop caused by an abrupt waveform onset.
- *Release (150ms):* Gain ramps back to 0 when the key is released. This gives a natural fade and prevents a click on cutoff.

**Polyphony:** Each note gets its own independent `OscillatorNode` + `GainNode` pair stored in a ref map. Notes do not share nodes, so any number can play simultaneously.

**Sustain pedal:** When spacebar is held, `stopNote` defers the release instead of cutting the audio. All deferred notes are released together when spacebar is lifted.

---

## Browser Compatibility

Works in all modern browsers that support the Web Audio API:

| Browser | Supported |
|---------|-----------|
| Chrome  | ✅        |
| Firefox | ✅        |
| Safari  | ✅        |
| Edge    | ✅        |

> **Note:** Safari requires a user gesture (click or keypress) before audio can play. The app handles this automatically — audio starts on first interaction.

---

## Possible Extensions

- Add more octaves
- Waveform selector (sine / triangle / sawtooth / square)
- Volume knob
- Note labels toggle
- Record and playback
- MIDI input support via the Web MIDI API