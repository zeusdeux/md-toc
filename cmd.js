import { resolve, dirname } from 'path'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { readSync } from 'to-vfile'
import { remark } from 'remark'
import remarkToc from 'remark-toc'
import chalk from 'chalk'

const [arg1, arg2] = process.argv.slice(2)
// since we don't have __dirname in modules
const __dirname = dirname(fileURLToPath(import.meta.url))
const comment = chalk.dim.grey
const { version } = JSON.parse(readSync('./package.json'))

if (arg1 === '-v' || arg1 === '--version') {
  console.log(`md-toc v${version}`)
  printDebug(version, __dirname, arg1, arg2)
  process.exit(0)
}

// TODO: Add support for other options from https://github.com/syntax-tree/mdast-util-toc#options
if (arg1 === '-h' || arg1 === '--help' || (!arg1 && !arg2)) {
  const md = chalk.grey
  const cmd = chalk.bold.green
  const args = chalk.yellow

  console.log()
  console.log(
    cmd('md-toc'),
    ' - ',
    'Generate a GitHub compatible table of contents from headings in a markdown file'
  )
  console.log()
  console.log('\tIt looks for the first heading containing "Table of Contents", "toc" or')
  console.log('\t"table-of-contents" (case insensitive), removes what it contains until the')
  console.log('\tnext higher or same level heading is found and adds the generated')
  console.log('\ttable of contents below it.')
  console.log()
  console.log('USAGE')
  console.log()
  console.log(
    cmd('\tmd-toc'),
    args(' <input file path>'),
    ' - ',
    'output generated markdown to stdout'
  )
  console.log(
    cmd('\tmd-toc'),
    args(' <input file path> <output file path>'),
    ' - ',
    'write generated markdown to output file path'
  )
  console.log(cmd('\tmd-toc'), args(' --help'), ' - ', 'show this help message')
  console.log()
  console.log('EXAMPLE')
  console.log()
  console.log('\tCOMMAND')
  console.log(cmd('\t\tmd-toc ../some-folder/Readme.md'))
  console.log()
  console.log('\tINPUT')
  console.log(comment('\t\t// ../some-folder/Readme.md'))
  console.log(md('\t\t# Alpha\n'))
  console.log(md('\t\t## Table of Contents\n'))
  console.log(md('\t\t## Bravo\n'))
  console.log(md('\t\t### Charlie\n'))
  console.log(md('\t\t## Delta'))
  console.log()
  console.log('\tOUTPUT')
  console.log(comment('\t\t// output to stdout'))
  console.log(md('\t\t# Alpha\n'))
  console.log(md('\t\t## Table of Contents\n'))
  console.log(md('\t\t-   [Bravo](#bravo)\n'))
  console.log(md('\t\t\t-   [Charlie](#charlie)\n'))
  console.log(md('\t\t-   [Delta](#delta)\n'))
  console.log(md('\t\t## Bravo\n'))
  console.log(md('\t\t### Charlie\n'))
  console.log(md('\t\t## Delta\n'))

  printDebug(version, __dirname, arg1, arg2)
  process.exit(0)
}

const inputFileAbs = resolve(__dirname, arg1)
const outputFileAbs = arg2 ? resolve(__dirname, arg2) : null
const file = readSync(inputFileAbs)

remark()
  .use(remarkToc)
  .process(file)
  .then((file) => {
    const fileAsString = String(file)
    if (!outputFileAbs) {
      console.log(fileAsString)
    } else {
      writeFileSync(outputFileAbs, fileAsString)
    }
  })
  .finally(() => printDebug(__dirname, arg1, arg2, inputFileAbs, outputFileAbs))

function printDebug(version, __dirname, arg1, arg2, resolvedInputFilePath, resolvedOutputFilePath) {
  if (process.env.DEBUG) {
    const noOfDashes = __dirname.toString().length + 20
    console.log()
    console.log(comment('-'.repeat(noOfDashes)))
    console.log(chalk.bold.red('DEBUG'), comment(`md-toc v${version} | node ${process.version}`))
    console.log('\t__dirname', __dirname)
    console.log('\targ 1', arg1)
    console.log('\targ 2', arg2)
    console.log('\tinput file', resolvedInputFilePath ?? undefined)
    console.log('\toutput file', resolvedOutputFilePath ?? undefined)
    console.log(comment('-'.repeat(noOfDashes)))
  }
}
