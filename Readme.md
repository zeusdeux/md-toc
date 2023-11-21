# md-toc

Generate a GitHub compatible table of contents from headings in a markdown file.

## Table of contents

- [Motivation](#motivation)
- [Installation](#installation)
- [Usage](#usage)
  - [Usage with `lint-staged`](#usage-with-lint-staged)
  - [Usage as a CLI](#usage-as-a-cli)
- [Debugging](#debugging)
- [Contributing](#contributing)

## Motivation

I wanted something for myself that does exactly what I need it to do and exposes all the levers that
I need. Also, I specifically wanted a CLI that can run in a pre-commit hook (via `husky` +
`lint-staged`) before `prettier --write` for markdown files so that I never have another piece of
documentation without a table of contents!

## Installation

```sh
npm install -D @zeusdeux/md-toc
```

## Usage

### Usage with `lint-staged`

Add the following line to the `"lint-staged"` config

```json
"lint-staged": {
  "*.md": "md-toc --write",
}
```

It is recommended that you run `prettier` _after_ `md-toc`. For example —

```json
"lint-staged": {
  "*.md": ["md-toc --write", "prettier --write"],
}
```

### Usage as a CLI

    md-toc

    Usage: $0 [options] <file or stdin>

    Options:
      -d, --debug        Print debug logs to stderr                 [boolean] [default: false]
      -v, --version      Show cli version                                            [boolean]
      -h, --help         Show help                                                   [boolean]
      -w, --write        Write changes to the input file            [boolean] [default: false]
      -a, --insertUnder  Heading to insert the table of contents under. Defaults to table of c
                         ontents|toc|table-of-contents                  [string] [default: ""]

    Examples:
      md-toc --write Readme.md           Generate a table of contents from headings in Readme.
                                         md, insert them under a heading name "Table of Conten
                                         ts", "toc" or "table-of-contents" (all case insensiti
                                         ve) in Readme.md and write the file to disk.
      md-toc Readme.md                   Same as the --write option but the output is written
                                         to stdout and Readme.md is left as is.
      md-toc -a "Contents" -w Readme.md  Same as --write but the table of contents is inserted
                                          under the first heading named "Contents".

## Debugging

If you run into problems and want to open an issue here, please run the cli with `--debug` and put
the output in the issue. Do redact [PII](https://en.wikipedia.org/wiki/Personal_data) from the debug
info before pasting into the issue.

## Contributing

The package manager used is `pnpm` so please use that and don't commit a `package-lock.json`. Also,
before starting development, run `nvm use` in the folder where you clone this repository.

Other than that, it is a fairly tiny codebase. Feel free to clone, edit and open a PR.

To test your changes locally, run `pnpm link --global` and assuming you are using `nvm`, this should
make `md-toc` available as a command in your shell.
