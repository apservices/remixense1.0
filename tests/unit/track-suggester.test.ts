import { describe, it, expect } from "vitest";
import { suggestTrackSequence } from "../../src/modules/ia/track-suggester";

describe("suggestTrackSequence", () => {
  it("should return tracks compatible with the base track", () => {
    const baseTrack = { bpm: 128, key: "C#m" };
    const tracks = [
      { bpm: 126, key: "C#m" },
      { bpm: 135, key: "F#m" },
      { bpm: 129, key: "C#m" },
      { bpm: 122, key: "Dm" }
    ];

    const result = suggestTrackSequence(baseTrack, tracks);
    expect(result.length).toBe(2);
    expect(result[0].bpm).toBe(129);
    expect(result[1].bpm).toBe(126);
  });
});
