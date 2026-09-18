// Web Audio API sound effects — no external library needed
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function beep(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.3) {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.frequency.setValueAtTime(freq, c.currentTime)
    osc.type = type
    gain.gain.setValueAtTime(vol, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch(e) {}
}

export const sounds = {
  colonize: () => {
    beep(440, 0.1, 'sine', 0.2)
    setTimeout(() => beep(660, 0.15, 'sine', 0.2), 100)
    setTimeout(() => beep(880, 0.2, 'sine', 0.2), 220)
  },
  claim: () => {
    beep(523, 0.08, 'square', 0.15)
    setTimeout(() => beep(659, 0.08, 'square', 0.15), 80)
    setTimeout(() => beep(784, 0.12, 'square', 0.15), 160)
  },
  victory: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.15, 'sine', 0.25), i * 100))
  },
  defeat: () => {
    beep(200, 0.3, 'sawtooth', 0.2)
    setTimeout(() => beep(150, 0.5, 'sawtooth', 0.15), 300)
  },
  alert: () => {
    beep(880, 0.1, 'square', 0.2)
    setTimeout(() => beep(880, 0.1, 'square', 0.2), 200)
    setTimeout(() => beep(880, 0.1, 'square', 0.2), 400)
  },
  attack: () => {
    beep(110, 0.4, 'sawtooth', 0.3)
    setTimeout(() => beep(90, 0.5, 'sawtooth', 0.25), 200)
  },
  mint: () => {
    beep(440, 0.05, 'sine', 0.15)
    setTimeout(() => beep(880, 0.05, 'sine', 0.15), 60)
    setTimeout(() => beep(1320, 0.1, 'sine', 0.2), 120)
    setTimeout(() => beep(1760, 0.15, 'sine', 0.2), 200)
  },
}