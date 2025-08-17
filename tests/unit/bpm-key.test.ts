import { describe, it, expect } from "vitest";
import { analyzeBpmAndKey } from "../../src/modules/ia/bpm-key";

describe("analyzeBpmAndKey", () => {
  it("should return valid BPM and key from mock audio buffer", () => {
    const result = analyzeBpmAndKey({});
    expect(result.bpm).toBe(124);
    expect(result.key).toBe("A#m");
  });
});
