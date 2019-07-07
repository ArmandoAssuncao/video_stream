const fs = require('fs')
const path = require('path')

const videoValid = (path) => /\.(avi|mkv|mp4|webm|wmv|mpeg)$/.test(path)

// accepts video files or directory
const pathValid = async (path) => {
  if (videoValid(path)) return true

  try {
    const fileInfo = await fs.promises.stat(path)
    if (fileInfo.isDirectory()) return true
  } catch (err) {
    // console.error('watch filter error:', err)
  }

  return false
}

const sleep = m => new Promise(r => setTimeout(r, m))

let timeoutId = null
const debounceTime = (callback, time) => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    callback()
  }, time)
}

const filterAsync = async (array, f) => {
    const booleans = await Promise.all(array.map(f))
    return array.filter((x, i) => booleans[i])
}

const findAsync = async (array, f) => {
    const booleans = await Promise.all(array.map(f))
    return array.find((x, i) => booleans[i])
}

const mapAsync = async (array, f) => await Promise.all(array.map(f))

const readdirRecursive = async (folder) => {
  let files = []
  try {
    files = await fs.promises.readdir(folder)
  } catch (err) {
    console.error('readdirRecursive read folder error:', err)
    return
  }

  const allFiles = await mapAsync(files, async (f) => {
    const filePath = path.join(folder, f)
    try {
      const fileInfo = await fs.promises.stat(filePath)
      if (fileInfo.isDirectory()) {
        return (await readdirRecursive(filePath)).map((f2) => path.join(f, f2))
      }
    } catch (err) {
      console.error('readdirRecursive error:', err)
      return
    }

    return f
  })

  return allFiles.flat(99)
}

module.exports = {
  debounceTime,
  filterAsync,
  findAsync,
  pathValid,
  readdirRecursive,
  sleep,
  videoValid,
}
