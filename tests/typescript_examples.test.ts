import { maxOfArray } from "../examples/maxofarray";

describe("TypeScript examples", () => {
  it("runs an example with the workspace TypeScript version", () => {
    expect(maxOfArray([1, 7.5, -3])).toBe(7.5);
  });
});
