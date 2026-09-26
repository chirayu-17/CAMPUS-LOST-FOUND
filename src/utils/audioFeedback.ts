/**
 * Web Audio API tactile sound synthesizer.
 * Generates crisp, lightweight micro-interaction feedback without any external audio asset dependencies.
 */

let audioCtx: AudioContext | null = null;
let lastPlayTime = 0;

/**
 * Plays a subtle, light 'click-clack' tactile audio feedback on hover.
 * - Part 1 ('Click'): Crisp high-frequency transient tap (~1600Hz -> 500Hz)
 * - Part 2 ('Clack'): Tactile acoustic rebound (~780Hz -> 280Hz) ~32ms later
 */
export function playClickClackFeedback(): void {
  const nowMs = Date.now();
  // Debounce to prevent fluttering if hovering over inner icons or borders
  if (nowMs - lastPlayTime < 90) {
    return;
  }
  lastPlayTime = nowMs;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const ctx = audioCtx;
    const t0 = ctx.currentTime;

    // Master subtle gain to keep audio feedback pleasant and non-jarring
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.065, t0);
    masterGain.connect(ctx.destination);

    // 1. Initial crisp 'Click' transient
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1600, t0);
    osc1.frequency.exponentialRampToValueAtTime(500, t0 + 0.022);

    gain1.gain.setValueAtTime(0.85, t0);
    gain1.gain.exponentialRampToValueAtTime(0.001, t0 + 0.022);

    osc1.connect(gain1);
    gain1.connect(masterGain);

    osc1.start(t0);
    osc1.stop(t0 + 0.025);

    // 2. Follow-up 'Clack' tactile rebound
    const clackDelay = 0.032;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(780, t0 + clackDelay);
    osc2.frequency.exponentialRampToValueAtTime(280, t0 + clackDelay + 0.028);

    gain2.gain.setValueAtTime(0, t0);
    gain2.gain.setValueAtTime(0.65, t0 + clackDelay);
    gain2.gain.exponentialRampToValueAtTime(0.001, t0 + clackDelay + 0.028);

    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc2.start(t0 + clackDelay);
    osc2.stop(t0 + clackDelay + 0.035);

    // Clean up master node connection after playback completes
    setTimeout(() => {
      try {
        masterGain.disconnect();
      } catch {
        // no-op
      }
    }, 150);
  } catch (err) {
    // Silently handle environments where Web Audio is unavailable or restricted
    console.debug('Tactile audio feedback skipped:', err);
  }
}
