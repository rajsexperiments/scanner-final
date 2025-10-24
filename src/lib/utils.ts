import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Plays a short beep sound using the Web Audio API.
 * This provides immediate audio feedback for user actions like successful scans.
 */
export function playBeep() {
  // Ensure this only runs in a browser environment
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    // Connect the audio graph: Oscillator -> Gain -> Destination (speakers)
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    // Configure the beep sound
    oscillator.type = 'sine'; // A clean, simple tone
    oscillator.frequency.value = 880; // A5 note, a common frequency for beeps
    // Control the volume to avoid harsh clicks
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01); // Quick fade in
    // Play the sound for a short duration
    oscillator.start(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1); // Quick fade out
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error("Could not play beep sound:", error);
  }
}