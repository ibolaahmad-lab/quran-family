const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 8081;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept, *');
  res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Range, Content-Length');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqUrl = decodeURI(req.url || '/');
  const [cleanPath, queryStr] = reqUrl.split('?');

  if (cleanPath.startsWith('/quran-api/')) {
    const subPath = cleanPath.slice('/quran-api/'.length);
    const targetUrl = `https://api.alquran.cloud/v1/${subPath}${queryStr ? '?' + queryStr : ''}`;
    
    https.get(targetUrl, (apiRes) => {
      res.writeHead(apiRes.statusCode || 200, {
        'Content-Type': apiRes.headers['content-type'] || 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      apiRes.pipe(res);
    }).on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  let filePath = cleanPath === '/' ? '/index.html' : cleanPath;
  let fullPath = path.join(ROOT, filePath.replace(/\//g, path.sep));

  if (!fullPath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const totalSize = stats.size;

    // For PDF files, always return full 200 OK stream with Accept-Ranges: none, completely preventing range 206 conflicts
    if (ext === '.pdf') {
      res.writeHead(200, {
        'Content-Length': totalSize,
        'Content-Type': 'application/pdf',
        'Accept-Ranges': 'none',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      fs.createReadStream(fullPath).pipe(res);
      return;
    }

    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${totalSize}` });
        return res.end();
      }

      const chunkLength = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkLength,
        'Content-Type': contentType
      });

      fs.createReadStream(fullPath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': totalSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache'
      });

      fs.createReadStream(fullPath).pipe(res);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Quran Desktop Server running on http://127.0.0.1:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    process.exit(0);
  } else {
    process.exit(1);
  }
});
