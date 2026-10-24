import { maxOfArray } from "../examples/ts/maxofarray";
import {
  evaluateExpression,
  evaluateExpressionTransformer,
} from "../examples/ts/expressionparser";
import { CircularBuffer } from "../examples/ts/circularbuffer";
import { MinStack } from "../examples/ts/minstack";
import { LRUCache } from "../examples/ts/lrucache";
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

  it("tests CircularBuffer operations and invariants", () => {
    expect(() => new CircularBuffer(0)).toThrow();
    const cb = new CircularBuffer<number>(3);
    expect(cb.isEmpty()).toBe(true);
    expect(cb.push(10)).toBe(true);
    expect(cb.push(20)).toBe(true);
    expect(cb.push(30)).toBe(true);
    expect(cb.push(40)).toBe(false); // full
    expect(cb.isFull()).toBe(true);
    expect(cb.size()).toBe(3);
    expect(cb.peek()).toBe(10);
    expect(cb.pop()).toBe(10);
    expect(cb.push(40)).toBe(true); // wrap-around push
    expect(cb.toArray()).toEqual([20, 30, 40]);
    expect(cb.pop()).toBe(20);
    expect(cb.pop()).toBe(30);
    expect(cb.pop()).toBe(40);
    expect(cb.pop()).toBeUndefined();
    expect(cb.isEmpty()).toBe(true);
  });

  it("tests MinStack operations and invariants", () => {
    const ms = new MinStack<number>();
    expect(ms.isEmpty()).toBe(true);
    expect(ms.getMin()).toBeUndefined();
    expect(ms.pop()).toBeUndefined();

    ms.push(5);
    expect(ms.getMin()).toBe(5);
    ms.push(3);
    expect(ms.getMin()).toBe(3);
    ms.push(7);
    expect(ms.getMin()).toBe(3);
    ms.push(3);
    expect(ms.getMin()).toBe(3);

    expect(ms.top()).toBe(3);
    expect(ms.pop()).toBe(3);
    expect(ms.getMin()).toBe(3); // still 3 due to duplicate
    expect(ms.pop()).toBe(7);
    expect(ms.getMin()).toBe(3);
    expect(ms.pop()).toBe(3);
    expect(ms.getMin()).toBe(5);
    expect(ms.size()).toBe(1);
    expect(ms.pop()).toBe(5);
    expect(ms.isEmpty()).toBe(true);
  });

  it("tests LRUCache operations and invariants", () => {
    expect(() => new LRUCache(0)).toThrow();
    const lru = new LRUCache<string, number>(2);
    lru.put("a", 1);
    lru.put("b", 2);
    expect(lru.get("a")).toBe(1); // "a" is now MRU, "b" is LRU
    lru.put("c", 3); // evicts "b"
    expect(lru.has("b")).toBe(false);
    expect(lru.get("b")).toBeUndefined();
    expect(lru.get("c")).toBe(3);
    expect(lru.get("a")).toBe(1);
    expect(lru.keys()).toEqual(["c", "a"]);
    expect(lru.remove("c")).toBe(true);
    expect(lru.size()).toBe(1);
  });
});
