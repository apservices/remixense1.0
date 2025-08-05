import { describe, it, expect } from "vitest";
import fs from "fs";
import { exportTrackAnalysis } from "../../src/modules/ia/export-track";

describe("exportTrackAnalysis", () => {
  it("should create a JSON file with bpm and key", () => {
    const file = exportTrackAnalysis("assets/loop.wav", 124, "C#m");
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    expect(data.bpm).toBe(124);
    expect(data.key).toBe("C#m");
    fs.unlinkSync(file); // Cleanup
  });
});
