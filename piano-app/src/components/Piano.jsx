// src/components/Piano.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import PianoKey from './PianoKey'
import { useAudio } from '../hooks/useAudio'
import { NOTES } from '../data/notes'
import '../styles/Piano.css'

const BLACK_KEY_PARENT = {
  'C#4': 'C4',
  'D#4': 'D4',
  'F#4': 'F4',
  'G#4': 'G4',
  'A#4': 'A4',
}

const whiteNotes = NOTES.filter(n => !n.isBlack)
const blackNotes = NOTES.filter(n => n.isBlack)

// Build keyboard key -> note lookup once at module level
const KEY_MAP = NOTES.reduce((map, noteData) => {
  map[noteData.keyboardKey] = noteData
  return map
}, {})

export default function Piano() {
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const [sustainActive, setSustainActive] = useState(false)

  const { startNote, stopNote, setSustain } = useAudio()
  const heldKeyboardKeys = useRef(new Set())

  // Ref to the piano DOM element for touch hit-testing
  const pianoRef = useRef(null)

  // ── Note helpers ───────────────────────────────────────────

  const pressNote = useCallback((note, freq) => {
    startNote(note, freq)
    setPressedKeys(prev => new Set(prev).add(note))
  }, [startNote])

  const releaseNote = useCallback((note) => {
    stopNote(note)
    setPressedKeys(prev => {
      const next = new Set(prev)
      next.delete(note)
      return next
    })
  }, [stopNote])

  // ── Keyboard events ────────────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e) {
      // Ignore if focus is in an input
      if (e.target.tagName === 'INPUT') return

      const key = e.key.toLowerCase()

      if (key === ' ') {
        e.preventDefault()
        setSustainActive(true)
        setSustain(true)
        return
      }

      if (heldKeyboardKeys.current.has(key)) return
      const noteData = KEY_MAP[key]
      if (!noteData) return

      heldKeyboardKeys.current.add(key)
      pressNote(noteData.note, noteData.freq)
    }

    function handleKeyUp(e) {
      const key = e.key.toLowerCase()

      if (key === ' ') {
        setSustainActive(false)
        setSustain(false)
        return
      }

      heldKeyboardKeys.current.delete(key)
      const noteData = KEY_MAP[key]
      if (!noteData) return

      releaseNote(noteData.note)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [pressNote, releaseNote, setSustain])

  // ── Touch events (piano-level, supports slide & multi-touch) ──

  useEffect(() => {
    const piano = pianoRef.current
    if (!piano) return

    // Given a touch point, find which piano key element is underneath it
    function getNoteFromTouch(touch) {
      const el = document.elementFromPoint(touch.clientX, touch.clientY)
      if (!el) return null
      const keyEl = el.closest('[data-note]')
      if (!keyEl) return null
      const note = keyEl.dataset.note
      return NOTES.find(n => n.note === note) || null
    }

    // Track which notes are active per touch identifier
    const touchNoteMap = {}

    function handleTouchStart(e) {
      e.preventDefault()
      Array.from(e.changedTouches).forEach(touch => {
        const noteData = getNoteFromTouch(touch)
        if (!noteData) return
        touchNoteMap[touch.identifier] = noteData.note
        pressNote(noteData.note, noteData.freq)
      })
    }

    function handleTouchMove(e) {
      e.preventDefault()
      Array.from(e.changedTouches).forEach(touch => {
        const noteData = getNoteFromTouch(touch)
        const prevNote = touchNoteMap[touch.identifier]

        if (noteData && noteData.note !== prevNote) {
          // Finger slid to a new key
          if (prevNote) releaseNote(prevNote)
          touchNoteMap[touch.identifier] = noteData.note
          pressNote(noteData.note, noteData.freq)
        } else if (!noteData && prevNote) {
          // Finger slid off the keyboard entirely
          releaseNote(prevNote)
          delete touchNoteMap[touch.identifier]
        }
      })
    }

    function handleTouchEnd(e) {
      e.preventDefault()
      Array.from(e.changedTouches).forEach(touch => {
        const prevNote = touchNoteMap[touch.identifier]
        if (prevNote) releaseNote(prevNote)
        delete touchNoteMap[touch.identifier]
      })
    }

    piano.addEventListener('touchstart', handleTouchStart, { passive: false })
    piano.addEventListener('touchmove', handleTouchMove, { passive: false })
    piano.addEventListener('touchend', handleTouchEnd, { passive: false })
    piano.addEventListener('touchcancel', handleTouchEnd, { passive: false })

    return () => {
      piano.removeEventListener('touchstart', handleTouchStart)
      piano.removeEventListener('touchmove', handleTouchMove)
      piano.removeEventListener('touchend', handleTouchEnd)
      piano.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [pressNote, releaseNote])

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="piano-wrapper">
      <div className={`sustain-indicator ${sustainActive ? 'active' : ''}`}>
        {sustainActive ? '🎹 Sustain ON' : 'Sustain: SPACE'}
      </div>

      <div className="piano" ref={pianoRef}>
        {whiteNotes.map((whiteNote) => {
          const blackNote = blackNotes.find(
            bn => BLACK_KEY_PARENT[bn.note] === whiteNote.note
          )

          return (
            <div className="white-key-slot" key={whiteNote.note}>
              <PianoKey
                {...whiteNote}
                isPressed={pressedKeys.has(whiteNote.note)}
                onStart={pressNote}
                onStop={releaseNote}
              />
              {blackNote && (
                <PianoKey
                  {...blackNote}
                  isPressed={pressedKeys.has(blackNote.note)}
                  onStart={pressNote}
                  onStop={releaseNote}
                />
              )}
            </div>
          )
        })}
      </div>

      <p className="piano-hint">
        Keys: A S D F G H J K &nbsp;|&nbsp; Sharps: W E T Y U &nbsp;|&nbsp; Sustain: SPACE
      </p>
    </div>
  )
}