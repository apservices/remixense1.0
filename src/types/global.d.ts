declare global {
  interface Window {
    audioCtx?: AudioContext;
    webkitAudioContext?: typeof AudioContext;
  }
}
export {};
