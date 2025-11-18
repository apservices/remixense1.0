import { describe, it, expect } from "vitest";
import { analyzeTrack } from "@/modules/ia/analyze-cli";

describe("analyze-cli.ts", () => {
  it("should analyze the demo loop and return BPM and Key", async () => {
    const result = await analyzeTrack("assets/loop.wav");
    expect(result.bpm).toBeGreaterThan(0);
    expect(typeof result.key).toBe("string");
    expect(result.key.length).toBeGreaterThan(0);
  });
});
