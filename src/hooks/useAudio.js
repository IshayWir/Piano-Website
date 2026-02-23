// src/hooks/useAudio.js
import { useRef, useCallback } from 'react'

export function useAudio() {
  // One shared AudioContext for the whole app
  const audioCtxRef = useRef(null)

  // Map of note -> { oscillator, gainNode }
  // This is what gives us polyphony — each active note has its own nodes
  const activeNodesRef = useRef({})

  // Sustain state
  const sustainRef = useRef(false)

  // Notes held by sustain that have been "released" by the user but not stopped
  const sustainedNotesRef = useRef(new Set())

  // Lazily create the AudioContext on first interaction
  // (browsers block AudioContext creation before a user gesture)
  function getContext() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    // Resume if suspended (some browsers suspend on inactivity)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  const startNote = useCallback((note, freq) => {
    // Prevent double-triggering if the note is already playing
    if (activeNodesRef.current[note]) return

    const ctx = getContext()
    const now = ctx.currentTime

    // --- Oscillator ---
    const oscillator = ctx.createOscillator()
    oscillator.type = 'triangle' // triangle is warmer than sine, less harsh than sawtooth
    oscillator.frequency.setValueAtTime(freq, now)

    // --- Gain (volume envelope) ---
    const gainNode = ctx.createGain()

    // Attack: ramp up from 0 to 0.4 over 10ms — eliminates the click on note start
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01)

    // Wire up: oscillator -> gain -> output
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(now)

    // Store so we can stop it later
    activeNodesRef.current[note] = { oscillator, gainNode }
  }, [])

  const stopNote = useCallback((note) => {
    // If sustain is active, don't stop — just flag it as sustained
    if (sustainRef.current) {
      sustainedNotesRef.current.add(note)
      return
    }

    _releaseNote(note)
  }, [])

  // Internal: actually release and clean up a note's audio nodes
  function _releaseNote(note) {
    const nodes = activeNodesRef.current[note]
    if (!nodes) return

    const ctx = audioCtxRef.current
    const { oscillator, gainNode } = nodes
    const now = ctx.currentTime

    // Release: ramp gain to 0 over 150ms — smooth tail, no click on release
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(gainNode.gain.value, now)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15)

    // Stop the oscillator after the release tail finishes
    oscillator.stop(now + 0.15)

    // Clean up after release
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect()
      gainNode.disconnect()
    })

    delete activeNodesRef.current[note]
    sustainedNotesRef.current.delete(note)
  }

  const setSustain = useCallback((active) => {
    sustainRef.current = active

    // When sustain is lifted, release all notes that were being held by it
    if (!active) {
      sustainedNotesRef.current.forEach((note) => {
        _releaseNote(note)
      })
      sustainedNotesRef.current.clear()
    }
  }, [])

  return { startNote, stopNote, setSustain }
}