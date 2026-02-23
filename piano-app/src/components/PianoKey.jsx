// src/components/PianoKey.jsx
import '../styles/PianoKey.css'

export default function PianoKey({ note, isBlack, keyboardKey, isPressed, onStart, onStop, freq }) {
  function handleMouseDown(e) {
    e.preventDefault()
    onStart(note, freq)
  }

  function handleMouseUp() {
    onStop(note)
  }

  function handleMouseLeave() {
    onStop(note)
  }

  const classes = [
    'piano-key',
    isBlack ? 'black' : 'white',
    isPressed ? 'pressed' : ''
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      role="button"
      aria-label={`${note} — keyboard: ${keyboardKey.toUpperCase()}`}
      aria-pressed={isPressed}
      data-note={note}
    >
      <span className="key-label">
        {isBlack
          ? note.replace(/[45]/, '')
          : keyboardKey.toUpperCase()}
      </span>
    </div>
  )
}