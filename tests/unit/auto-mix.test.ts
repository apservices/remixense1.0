import { describe, it, expect } from "vitest";
import { suggestNextTrack } from "../../src/modules/ia/auto-mix";
import { isHarmonicallyCompatible } from "../../src/modules/ia/auto-mix";

describe("suggestNextTrack", () => {
  const currentTrack: Track = { bpm: 128, key: "C#m" };
  const compatibleTrack: Track = { bpm: 126, key: "C#m" };
  const incompatibleTrack: Track = { bpm: 140, key: "F" };

  it("should return the first compatible track", () => {
    const result = suggestNextTrack(currentTrack, [compatibleTrack, incompatibleTrack]);
    expect(result).toEqual(compatibleTrack);
  });

  it("should return null if no compatible tracks are found", () => {
    const result = suggestNextTrack(currentTrack, [incompatibleTrack]);
    expect(result).toBeNull();
  });
});
