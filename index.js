const watchFolder = require('./watchFolder')
const serverStream = require('./serverStream')
const m3uGenerate = require('./m3uGenerate')

const [, , ...args] = process.argv
if (args.length != 6) {
  console.error('Missing args. Requireds: --baseFolder --baseUrl --basePort')
  process.exit(1)
}

let argIndex = -1
let baseFolder = null
argIndex = args.indexOf('--baseFolder')
if (argIndex === -1) {
  console.error('Missing args: --baseFolder')
  process.exit(1)
} else {
  baseFolder = args[argIndex + 1]
}

let baseUrl = null
argIndex = args.indexOf('--baseUrl')
if (argIndex === -1) {
  console.error('Missing args: --baseUrl')
  process.exit(1)
} else {
  baseUrl = args[argIndex + 1]
}

let basePort = null
argIndex = args.indexOf('--basePort')
if (argIndex === -1) {
  console.error('Missing args: --basePort')
  process.exit(1)
} else {
  basePort = args[argIndex + 1]
}

const callbackWatch = () => {
  // put your code here
}

const watcher = watchFolder(baseFolder, callbackWatch)

serverStream(baseFolder, baseUrl, basePort)

console.log(`Watch Folder: ${baseFolder}`)
console.log(`Server Stream running in: ${baseUrl}:${basePort}`)
