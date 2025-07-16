#!/usr/bin/env node

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { readSync as readToVfileSync } from 'to-vfile'
import { remark } from 'remark'
import remarkToc from 'remark-toc'
import chalk from 'chalk'
import yargs from 'yargs'
// @ts-ignore
import { hideBin } from 'yargs/helpers'
import { performance } from 'node:perf_hooks'

const msg = chalk.grey
const debug = chalk.bold.yellow
const italic = chalk.italic.dim.grey
const cwd = process.cwd()
const __dirname = dirname(fileURLToPath(import.meta.url))
const cliName = 'md-toc'
const { version: cliVersion } = JSON.parse(
  readFileSync(resolve(__dirname, './package.json'), { encoding: 'utf8' })
)

/**
 * @type {boolean}
 * enabled by --debug flag
 */
let enableDebug = false

/**
 *
 * @param {any[]} args
 */
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
cli
  .scriptName(cliName)
  .options({
    debug: {
      alias: 'd',
      type: 'boolean',
      default: false,
      describe: 'Print debug logs to stderr',
    },
  })
  .middleware([
    (argv) => {
      const { debug } = argv
      if (debug) {
        enableDebug = true
      }
    },
  ])
  .command(
    '$0',
    'Usage: $0 [options] <file or stdin>',
    (yargs) => {
      return yargs.options({
        write: {
          alias: 'w',
          type: 'boolean',
          default: false,
          globa: false,
          describe: 'Write changes to the input file',
        },
        insertUnder: {
          alias: 'a',
          type: 'string',
          default: '',
          global: false,
          describe:
            'Heading to insert the table of contents under. Defaults to table of contents|toc|table-of-contents',
        },
      })
    },
    async (argv) => {
      const { insertUnder, write } = argv
      d(`${cliName} version`, `v${cliVersion}`)
      d(
        'Input options',
        JSON.stringify(
          {
            ...argv,
          },
          null,
          4
        )
      )
      d('-'.repeat(80))

      if (!argv._.length) {
        d(
          `No file specified. Reading from stdin as utf-8${
            write ? ' and disregarding --write' : ''
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
        const result = processFile(input, insertUnder)
        d('Dumping output to stdout')
        console.log(result)
        process.exit(0)
      }

      argv._.forEach((file) => {
        file = typeof file !== 'string' ? file.toString() : file
        const filePath = resolve(cwd, file)
        d(`Reading file ${filePath}`)
        const fileContents = readToVfileSync(filePath)
        // process file
        const result = processFile(fileContents, insertUnder)
        // call fn
        if (write) {
          const start = performance.now()
          writeFileSync(filePath, result)
          const end = performance.now()
          d(`Wrote ${filePath}`, italic(`${((end - start) / 1000).toFixed(6)}ms`))
        } else {
          d('Writing to stdout')
          console.log(result)
        }
      })
    }
  )
  .example([
    [
      '$0 --write Readme.md',
      'Generate a table of contents from headings in Readme.md, insert them under a heading name "Table of Contents", "toc" or "table-of-contents" (all case insensitive) in Readme.md and write the file to disk.',
    ],
    [
      '$0 Readme.md',
      'Same as the --write option but the output is written to stdout and Readme.md is left as is.',
    ],
    [
      '$0 -a "Contents" -w Readme.md',
      'Same as --write but the table of contents is inserted under the first heading named "Contents".',
    ],
  ])
  .wrap(90)
  .version('v', 'Show cli version', `v${cliVersion}`)
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help').argv

/**
 *
 * @param {string | ReturnType<typeof readToVfileSync>} fileContents
 * @param {string} heading
 * @returns {string}
 */
function processFile(fileContents, heading) {
  d(`Processing contents${heading ? ' and generating TOC under ' + heading : ''}`)
  const options = heading ? { heading, tight: true } : { tight: true }
  return remark().use(remarkToc, options).processSync(fileContents).toString()
}
