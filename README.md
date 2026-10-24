# nanofuzz-examples

A set of buggy example programs for playing with [NaNofuzz](https://github.com/nanofuzz/nanofuzz/) plus a tutorial that can typically be completed in under eleven minutes. If reading this on GitHub, click Code->Codespaces->Create to immediately get started!

```
./
  tutorial/            NaNofuzz tutorial
  examples/
    ts/                TypeScript NaNofuzz examples
    py/                Python NaNofuzz examples
    rs/                Rust NaNofuzz examples
```

Several of the example programs have bugs that may be detected using NaNofuzz' heuristic validator.
Other examples (e.g., roman, lcm, identitymatrix, modinv, normd) require human or property validators to identify some of the bugs.
Input transformers with `assume()` and custom input generators are demonstrated in the expression parser examples (`examples/ts/expressionparser.ts`, `examples/py/expression_parser.py`, and `examples/rs/expression_parser.rs`).

## Setup

The Codespace installs the Node.js, Python, and Rust dependencies automatically. For a
local checkout, install the TypeScript dependencies, create the Python
virtual environment, and build the Rust crate:

```sh
yarn install
python -m venv .venv
cargo build
```

On Linux or macOS:

```sh
.venv/bin/python -m pip install -r requirements.txt
```

On Windows:

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Running Smoke Tests

- **TypeScript**: `yarn test`
- **Python**: `PYTHONPATH=. .venv/bin/pytest` on Linux or macOS, or `.venv\Scripts\pytest.exe` on Windows.
- **Rust**: `cargo test`
