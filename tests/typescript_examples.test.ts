import { maxOfArray } from "../examples/ts/maxofarray";
import {
  evaluateExpression,
  evaluateExpressionTransformer,
} from "../examples/ts/expression_parser";
import { UnsatisfiedAssumption } from "@nanofuzz/runtime";

describe("TypeScript examples", () => {
  it("runs an example with the workspace TypeScript version", () => {
    expect(maxOfArray([1, 7.5, -3])).toBe(7.5);
  });

  it("evaluates expressions and filters invalid syntax via transformer", () => {
    expect(evaluateExpression("2 + 3 * 4")).toBe(14);
    expect(evaluateExpression("(2 + 3) * 4")).toBe(20);

    // Valid syntax passes through transformer
    expect(evaluateExpressionTransformer("2 + 3 * 4")).toEqual(["2 + 3 * 4"]);

    // Invalid syntax throws UnsatisfiedAssumption
    expect(() => evaluateExpressionTransformer("yo dawg")).toThrow(
      UnsatisfiedAssumption,
    );
    expect(() => evaluateExpressionTransformer("1 + ")).toThrow(
      UnsatisfiedAssumption,
    );
    expect(() => evaluateExpressionTransformer("(1 + 2")).toThrow(
      UnsatisfiedAssumption,
    );
  });
});
