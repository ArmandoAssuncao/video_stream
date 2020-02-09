const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')
const mime = require('mime-types')

const routes = {
  video: '/video',
}

const render404 = (req, res) => {
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.write('Not Found!!')
  res.end()
}

const renderVideo = (req, res, baseFolder) => {
  const pathName = decodeURIComponent(url.parse(req.url, true).pathname)
  const pathFile = pathName.substring(routes.video.length)
  const filePath = path.join(baseFolder, pathFile)

  if (!fs.existsSync(filePath)) {
    render404(req, res)
    return
  }

  const stat = fs.statSync(filePath)
  const total = stat.size

  // const contentType = mime.lookup(filePath)
  const contentType = 'video/mp4'

  if (req.headers['range']) {
    const range         = req.headers.range
    const parts         = range.replace(/bytes=/, '').split('-')
    const partialstart  = parts[0]
    const partialend    = parts[1]
    let start         = parseInt(partialstart, 10)
    const end           = partialend ? parseInt(partialend, 10) : total - 1
    start = start > end ? end : start
    const chunksize     = (end - start) + 1

    const stream = fs.createReadStream(filePath, { start: start, end: end })
    res.writeHead(206,
      {
        'Content-Range'  : 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges'  : 'bytes',
        'Content-Length' : chunksize,
        'Content-Type'   : contentType,
      }
    )
    stream.pipe(res)

    stream.on('error', function(err) {
      console.error(err)
    })

    // Close at end of stream.
    stream.on('end', function() {
      stream.close()
    })
  } else {
    res.writeHead(
      206,
      {
        'Content-Length' : total,
        'Content-Type' : contentType,
      },
    )

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)

    stream.on('error', function(err) {
      console.error(err)
    })

    // Close at end of stream.
    stream.on('end', function() {
      stream.close()
    })
  }
}

module.exports = (baseFolder, baseUrl, basePort) => {
  return http.createServer(function (req, res) {
    const pathName = decodeURIComponent(url.parse(req.url, true).pathname)
    const firstPart = '/' + pathName.split('/')[1]
    console.log('Current: ', pathName, firstPart, req.url)

    switch (firstPart) {
      case routes.video:
        renderVideo(req, res, baseFolder)
        break
      default:
        render404(req, res)
        break
    }
  }).listen(basePort, baseUrl)
}
