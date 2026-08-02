# nanofuzz-examples

A set of buggy example programs for playing with [NaNofuzz](https://github.com/nanofuzz/nanofuzz/) plus a tutorial that can typically be completed in under eleven minutes. If reading this on GitHub, click Code->Codespaces->Create to immediately get started!

```
./
  tutorial/            NaNofuzz tutorial
  examples/            TypeScript and Python NaNofuzz examples
```

Several of the example programs have bugs that may be detected using NaNofuzz' heuristic validator.
Other examples (e.g., roman, lcm, identitymatrix, modinv, normd) require human or property validators to identify some of the bugs.

## Setup

The Codespace installs the Node.js and Python dependencies automatically. For a
local checkout, install the TypeScript dependencies and create the Python
virtual environment:

```sh
yarn install
python -m venv .venv
```

On Linux or macOS:

```sh
.venv/bin/python -m pip install -r requirements.txt
```

On Windows:

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Run the example smoke tests with `.venv/bin/python -m pytest` on Linux or
macOS, or `.venv\Scripts\python.exe -m pytest` on Windows.
