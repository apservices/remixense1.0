import { describe, it, expect } from "vitest";
import { analyzeBpmFromWav } from "../../src/modules/ia/bpm-detect-real";

describe("analyzeBpmFromWav", () => {
  it("should return a BPM number", async () => {
    const bpm = await analyzeBpmFromWav("assets/loop.wav");
    expect(typeof bpm).toBe("number");
    expect(bpm).toBeGreaterThan(60);
  });
});
