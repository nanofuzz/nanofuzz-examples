# nanofuzz-examples

A set of buggy example programs for playing with [NaNofuzz](https://github.com/nanofuzz/nanofuzz/) plus a tutorial that can typically be completed in under eleven minutes. If reading this on GitHub, click Code->Codespaces->Create to immediately get started!

```
./
  tutorial/            NaNofuzz tutorial
  examples/
    typescript/        TypeScript NaNofuzz examples
    python/            Python NaNofuzz examples
    rust/              Rust NaNofuzz examples
    java/              Java NaNofuzz examples
    oxcaml/            OCaml / OxCaml NaNofuzz examples
    virgil/            Virgil NaNofuzz examples
```

Several of the example programs have bugs that may be detected using NaNofuzz' heuristic validator.
Other examples (e.g., roman, lcm, identitymatrix, modinv, normd) require human or property validators to identify some of the bugs.
Input transformers with `assume()` and custom input generators are demonstrated in the expression parser examples (`examples/typescript/expressionparser.ts`, `examples/python/expression_parser.py`, `examples/rust/expression_parser.rs`, `examples/java/ExpressionParser.java`, and `examples/oxcaml/expression_parser.ml`).

## Setup

The Codespace installs the Node.js, Python, Rust, Java, and OCaml dependencies automatically. For a
local checkout, install the TypeScript dependencies, create the Python
virtual environment, build the Rust crate, compile Java, and build OCaml:

```sh
yarn install
python -m venv .venv
cargo build
mvn compile
dune build
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
- **Java**: `mvn test`
- **OCaml / OxCaml**: `dune runtest`
