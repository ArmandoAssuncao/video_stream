const watch = require('node-watch')
const fs = require('fs')
const path = require('path')
const { pathValid, videoValid, debounceTime, findAsync, sleep } = require('./helpers')

const DEBOUNCE_TIME = 20000

const action = async (callback) => {
  debounceTime(() => {
    // TODO: rodar uma função vinda do index??
    callback()
  }, DEBOUNCE_TIME)
}

const checkFile = async (path, previousSize) => {
  let fileInfo = null

  try {
    while (true) {
      fileInfo = await fs.promises.stat(path)

      if (fileInfo.size === previousSize && fileInfo.size > 0) {
        return true
      } else {
        previousSize = fileInfo.size
        await sleep(2000)
      }
    }
  } catch (err) {
    // console.error(`File not found: ${err}`)
  }
}

const watchOptions = {
  delay: 1000,
  recursive: true,
  // filter: , // not work with directory and async func
}

module.exports = async (folder, callback) => {
  const filesProcessing = new Set()

  return watch(folder, watchOptions, async (evt, name) => {
    if (!await pathValid(name)) return

    // checks if file/folder is processing
    if (filesProcessing.has(name)) {
      return
    }

    if (evt === 'remove') {
      if (videoValid(name)) await action(callback)
      return
    }

    let fileInfo = null
    try {
      fileInfo = await fs.promises.stat(name)
    } catch (err) {
      // console.error('file:', err)
      return
    }

    // exec when some folder is renamed
    if (fileInfo.isDirectory()) {
      const files = (await fs.promises.readdir(name)).map((f) => path.join(name, f))
      if (await findAsync(files, pathValid)) await action(callback)
      return
    }

    filesProcessing.add(name)

    try {
      const fileChecked = await checkFile(name, 0)
      if (fileChecked) await action(callback)
    } catch (err) {
      // console.error('error:', err)
    }

    filesProcessing.delete(name)
  })
}
