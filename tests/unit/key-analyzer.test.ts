import { describe, it, expect } from "vitest";
import { extractKeyFromWav } from "../../src/modules/ia/extract-key";

describe("extractKeyFromWav", () => {
  it("should return a key string from a WAV file", () => {
    const key = extractKeyFromWav("assets/loop.wav");
    console.log("Detected Key:", key);
    expect(typeof key).toBe("string");
  });
});
