import { spawnSync } from "child_process";

const TS_TARGETS = [
  "examples/ts/dinners.ts::totalDinnerExpenses",
  "examples/ts/expression_parser.ts::evaluateExpression",
  "examples/ts/getoffset.ts::getOffsetOrDefault",
  "examples/ts/getzero.ts::getZero",
  "examples/ts/gramschmidt.ts::gramSchmidt",
  "examples/ts/identitymatrix.ts::identity",
  "examples/ts/lcm.ts::lcm",
  "examples/ts/levenshtein.ts::levenshtein",
  "examples/ts/maxofarray.ts::maxOfArray",
  "examples/ts/minsalary.ts::minSalary",
  "examples/ts/modinv.ts::modInv",
  "examples/ts/normd.ts::normalDistributionPDF",
  "examples/ts/primefactorize.ts::primeFactorize",
  "examples/ts/random.ts::getRandomNumber",
  "examples/ts/roman.ts::decodeRoman",
  "examples/ts/roman.ts::toRoman",
  "examples/ts/steadysquare.ts::isSteady",
  "examples/ts/winloss.ts::sortByWinLoss",
];

const PY_TARGETS = [
  "examples/py/expression_parser.py::evaluate_expression",
  "examples/py/lcm.py::lcm",
  "examples/py/maxofarray.py::max_of_array",
  "examples/py/primefactorize.py::prime_factorize",
];

const RS_TARGETS = ["examples/rs/expression_parser.rs::evaluate_expression"];

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
