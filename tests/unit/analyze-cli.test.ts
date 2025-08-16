import { describe, it, expect } from "vitest";
import { execSync } from "child_process";

describe("analyze-cli.ts", () => {
  it("should run CLI and print BPM and Key", () => {
    const output = execSync("npx tsx src/modules/ia/analyze-cli.ts assets/loop.wav").toString();
    expect(output).toMatch(/BPM:/);
    expect(output).toMatch(/Key:/);
  });
});
