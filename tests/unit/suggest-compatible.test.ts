import { describe, it, expect } from "vitest";
import { suggestCompatibleTracks, Track } from "../../src/modules/ia/suggest-compatible";

describe("suggestCompatibleTracks", () => {
  it("should return compatible tracks", () => {
    const tracks: Track[] = [
      { bpm: 120, key: "C#m", title: "Base" },
      { bpm: 122, key: "C#m", title: "Close Match" },
      { bpm: 128, key: "Am", title: "Far BPM" }
    ];
    const result = suggestCompatibleTracks(tracks);
    expect(result.length).toBe(1);
    expect(result[0].title).toBe("Close Match");
  });
});
