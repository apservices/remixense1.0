import { describe, it, expect } from "vitest";
import { extractKeyFromWav } from "../../src/modules/ia/key-detect-real";

describe("extractKeyFromWav", () => {
  it("should return a key string", () => {
    const key = extractKeyFromWav("assets/loop.wav");
    expect(typeof key).toBe("string");
  });
});
