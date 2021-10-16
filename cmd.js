import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync } from 'fs'
import { createInterface } from 'readline'
import { readSync as readToVfileSync } from 'to-vfile'
import { remark } from 'remark'
import remarkToc from 'remark-toc'
import chalk from 'chalk'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { performance } from 'perf_hooks'

const msg = chalk.grey
const debug = chalk.bold.yellow
const italic = chalk.italic.dim.grey
const cwd = process.cwd()
const __dirname = dirname(fileURLToPath(import.meta.url))
const cliName = 'md-toc'
const { version: cliVersion } = JSON.parse(readFileSync(resolve(__dirname, './package.json')))

// enabled by --debug flag
let enableDebug = false
const d = (...args) => {
  if (enableDebug) {
    // disagnostic info goes to stderr as specific by POSIX
    // https://pubs.opengroup.org/onlinepubs/9699919799/functions/stderr.html
    console.error(debug('Debug:'), msg(...args))
  }
}

const cli = yargs(hideBin(process.argv))
// options: --write --help --debug --insertUnder --version
// commands: completion for bash/zsh completion
const cliOpts = cli
  .scriptName(cliName)
  .command('$0')
  .usage('Usage: $0 [options] <file or stdin>')
  .example([
    [
      '$0 --write Readme.md',
      'Generate a table of contents from headings in Readme.md, insert them under a heading name "Table of Contents", "toc" or "table-of-contents" (all case insensitive) in Readme.md and write the file to disk',
    ],
    [
      '$0 Readme.md',
      'Same as the --write option but the output is written to stdout and Readme.md is left as is',
    ],
    [
      '$0 -a "Contents" -w Readme.md',
      'Same as --write but the table of contents is inserted under the first heading named "Contents"',
    ],
  ])
  .option('w', {
    alias: 'write',
    boolean: true,
    default: false,
    describe: 'Write changes to the input file',
  })
  .option('a', {
    alias: 'insert-under',
    type: 'string',
    default: undefined,
    describe:
      'Heading to insert the table of contents under. Defaults to table of contents|toc|table-of-contents',
  })
  .option('d', {
    alias: 'debug',
    boolean: true,
    default: false,
    describe: 'Print debug logs to stderr',
  })
  .version('v', 'Show cli version', `v${cliVersion}`)
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help').argv

if (cliOpts.debug) {
  enableDebug = true
}

d(`${cliName} version`, `v${cliVersion}`)
d(
  'Input options',
  JSON.stringify(
    {
      ...cliOpts,
    },
    null,
    4
  )
)
d('-'.repeat(80))

if (!cliOpts._.length) {
  d(
    `No file specified. Reading from stdin as utf-8${
      cliOpts.write ? ' and disregarding --write' : ''
    }`
  )
  let input = ''
  const rl = createInterface({
    input: process.stdin,
  })
  for await (const line of rl) {
    input += line
    input += '\n'
  }
  const result = processFile(input, cliOpts.insertUnder)
  d('Dumping output to stdout')
  console.log(result)
  process.exit(0)
}

cliOpts._.forEach((file) => {
  const filePath = resolve(cwd, file)
  d(`Reading file ${filePath}`)
  const fileContents = readToVfileSync(filePath)
  // process file
  const result = processFile(fileContents, cliOpts.insertUnder)
  // call fn
  if (cliOpts.write) {
    const start = performance.now()
    writeFileSync(filePath, result)
    const end = performance.now()
    d(`Wrote ${filePath}`, italic(`${(end - start) / 1000}ms`))
  } else {
    d('Writing to stdout')
    console.log(result)
  }
})

function processFile(fileContents, heading) {
  d(`Processing contents${heading ? ' and generating TOC under ' + heading : ''}`)
  const options = heading ? { heading, tight: true } : { tight: true }
  return remark().use(remarkToc, options).processSync(fileContents).toString()
}
