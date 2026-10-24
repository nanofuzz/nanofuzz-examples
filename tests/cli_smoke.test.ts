import { spawnSync } from "child_process";

const TS_TARGETS = [
  "examples/typescript/circularbuffer.ts::testCircularBuffer",
  "examples/typescript/dinners.ts::totalDinnerExpenses",
  "examples/typescript/expressionparser.ts::evaluateExpression",
  "examples/typescript/getoffset.ts::getOffsetOrDefault",
  "examples/typescript/getzero.ts::getZero",
  "examples/typescript/gramschmidt.ts::gramSchmidt",
  "examples/typescript/identitymatrix.ts::identity",
  "examples/typescript/lcm.ts::lcm",
  "examples/typescript/levenshtein.ts::levenshtein",
  "examples/typescript/lrucache.ts::testLRUCache",
  "examples/typescript/maxofarray.ts::maxOfArray",
  "examples/typescript/minstack.ts::testMinStack",
  "examples/typescript/minsalary.ts::minSalary",
  "examples/typescript/modinv.ts::modInv",
  "examples/typescript/normd.ts::normalDistributionPDF",
  "examples/typescript/primefactorize.ts::primeFactorize",
  "examples/typescript/random.ts::getRandomNumber",
  "examples/typescript/roman.ts::decodeRoman",
  "examples/typescript/roman.ts::toRoman",
  "examples/typescript/steadysquare.ts::isSteady",
  "examples/typescript/winloss.ts::sortByWinLoss",
];

const PY_TARGETS = [
  "examples/python/circular_buffer.py::test_circular_buffer",
  "examples/python/expression_parser.py::evaluate_expression",
  "examples/python/lcm.py::lcm",
  "examples/python/lru_cache.py::test_lru_cache",
  "examples/python/maxofarray.py::max_of_array",
  "examples/python/min_stack.py::test_min_stack",
  "examples/python/primefactorize.py::prime_factorize",
];

const RS_TARGETS = [
  "examples/rust/circular_buffer.rs::test_circular_buffer",
  "examples/rust/expression_parser.rs::evaluate_expression",
  "examples/rust/lru_cache.rs::test_lru_cache",
  "examples/rust/min_stack.rs::test_min_stack",
];

const TUTORIAL_TARGETS = ["tutorial/tutorial.ts::findMedianSortedArrays"];

describe("NaNofuzz CLI smoke tests", () => {
  jest.setTimeout(60000);

  describe("TypeScript examples", () => {
    it.each(TS_TARGETS)("tests %s", (target) => {
      runAndAssertTarget(target);
    });
  });

  describe("Python examples", () => {
    it.each(PY_TARGETS)("tests %s", (target) => {
      runAndAssertTarget(target);
    });
  });

  describe("Rust examples", () => {
    it.each(RS_TARGETS)("tests %s", (target) => {
      runAndAssertTarget(target);
    });
  });

  describe("Tutorial examples", () => {
    it.each(TUTORIAL_TARGETS)("tests %s", (target) => {
      runAndAssertTarget(target);
    });
  });
});

// -------------------------------------------------------------------------- //
// Private Helper Functions
// -------------------------------------------------------------------------- //

function runAndAssertTarget(target: string): void {
  const cmd = `npx @nanofuzz/cli ${target} --no-progress-bar --max-tests 5`;

  const res = spawnSync(cmd, {
    shell: true,
    encoding: "utf8",
    timeout: 60000,
  });

  const output = `${res.stdout ?? ""}\n${res.stderr ?? ""}`;

  if (![0, 1].includes(res.status ?? -1)) {
    throw new Error(
      `CLI run failed for ${target} with exit code ${res.status}.\nOutput:\n${output}`,
    );
  }

  // Exit code 0: all generated tests passed
  // Exit code 1: tests ran and bug(s) detected (expected for buggy examples)
  expect([0, 1]).toContain(res.status);

  // Verify target was recognized
  const [filePath, fnName] = target.split("::");
  expect(output).toContain(filePath);
  expect(output).toContain(fnName);

  // Verify tests actually executed
  expect(output).toMatch(/Executed \d+.*tests/);
} // fn: runAndAssertTarget
