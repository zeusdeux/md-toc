# md-toc

Generate a GitHub compatible table of contents from headings in a markdown file

## Why another one?

I want something for myself that does exactly what I need it to do and exposes all the levers that I
need.

Very much for my personal use. Bespoke if you will.

## Usage

```sh
npx @zeusdeux/md-toc  <input file path>  -  output generated markdown to stdout
npx @zeusdeux/md-toc  <input file path> <output file path>  -  write generated markdown to output file path
npx @zeusdeux/md-toc  --help  -  show this help message
npx @zeusdeux/md-toc  --version  -  show tool version
```

## Debugging

If you run into problems and want to open an issue here, please run

```sh
DEBUG=1 md-toc --version
```

and put the output in the issue. Do redact [PII](https://en.wikipedia.org/wiki/Personal_data) from
the debug info before pasting into the issue.
