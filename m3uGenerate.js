const fs = require('fs')
const path = require('path')
const { pathValid, filterAsync, readdirRecursive } = require('./helpers')

const m3uTemplate = (tracks) => {
  let m3u = '#EXTM3U\n'
  m3u += tracks.map((track) => {
    return `#EXTINF:-1 group-title="${track.groupTitle}",${track.name}\n${track.url}\n`
  }).join('')

  return m3u
}

module.exports = async (folder, baseHost) => {
  const _files = (await readdirRecursive(folder))
  const files = await filterAsync(_files, (f) => pathValid(path.join(folder, f)))

  const tracks = files.map((f) => {
    const url = `${baseHost}/${f}`
    const filePaths = f.split('/')
    const grouTitle = filePaths.length > 1 ? filePaths[0] : 'Movies'
    const name = path.basename(f).slice(0, -(path.extname(f).length))

    return {
      url: url,
      groupTitle: grouTitle,
      name: name,
    }
  })

  const m3u = m3uTemplate(tracks)

  return m3u
}
