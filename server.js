import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5174;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

export default function handler(req, res) {
  let reqPath = decodeURI(req.url.split('?')[0]);
  
  // Clean URL Routing
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  } else if (reqPath === '/privacy-policy' || reqPath === '/privacy' || reqPath === '/privacy-policy.html') {
    reqPath = '/privacy-policy.html';
  } else if (reqPath === '/delete-account' || reqPath === '/delete' || reqPath === '/delete-account.html') {
    reqPath = '/delete-account.html';
  }

  // Resolve file from multiple possible Vercel serverless directories
  const candidatePaths = [
    path.join(__dirname, reqPath),
    path.resolve(process.cwd(), '.' + reqPath),
    path.resolve(process.cwd(), 'admin-website' + reqPath),
    path.resolve(process.cwd(), 'admin' + reqPath)
  ];

  let resolvedPath = candidatePaths.find(p => fs.existsSync(p));

  // Check with .html if not found
  if (!resolvedPath && !path.extname(reqPath)) {
    const htmlCandidates = [
      path.join(__dirname, reqPath + '.html'),
      path.resolve(process.cwd(), '.' + reqPath + '.html')
    ];
    resolvedPath = htmlCandidates.find(p => fs.existsSync(p));
  }

  if (!resolvedPath) {
    resolvedPath = path.join(__dirname, 'index.html');
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(resolvedPath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
}

// Standalone local execution
const server = http.createServer(handler);

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mobin X Admin Console server running at: http://localhost:${PORT}/`);
  });
}
