## Coverage

### Dependencies

Generating a code coverage report requires the `lcov` and `genhtml` command line tools. See the installation methods below.

#### Ubuntu

**apt-get**

Install `lcov` via `apt-get`.

```bash
$ sudo apt-get -y install lcov
```

#### macOS

**Homebrew**

Install `lcov` via Homebrew. (The `lcov` installation includes the `genhtml` tool).

```bash
$ brew install lcov
```

### Running coverage

To generate a code coverage report, run `yarn coverage`. This will run forge in coverage mode, save an `lcov.info` coverage file, and generate an html report in the `coverage/` directory. Note that you must set the `FORKING_RPC_URL` environment variable to include fork tests in coverage.

### Viewing the coverage report

Open `coverage/index.html` in a web browser to view the interactive coverage report.
