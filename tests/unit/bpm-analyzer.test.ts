import { describe, it, expect } from "vitest";
import { analyzeBpmFromWav } from "../../src/modules/ia/bpm-analyzer";

describe("analyzeBpmFromWav", () => {
  it("should detect BPM from WAV file", async () => {
    const bpm = await analyzeBpmFromWav("assets/loop.wav");
    console.log("Detected BPM:", bpm);
    expect(typeof bpm).toBe("number");
    expect(bpm).toBeGreaterThan(60);
  });
});
