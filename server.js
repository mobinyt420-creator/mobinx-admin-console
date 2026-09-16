import http from 'http';
import https from 'https';
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

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Handle FCM Push Broadcast Proxy
  if (reqPath === '/api/send-fcm' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const serverKey = payload.serverKey || process.env.FCM_SERVER_KEY;
        const notif = payload.notification || payload;

        if (!serverKey) {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, message: 'FCM Server Key not provided. Live Firestore Real-Time Sync was dispatched.' }));
          return;
        }

        const topics = ['all', 'all_users', 'mobinx_broadcast', 'obin_broadcast'];
        const fcmPayload = {
          priority: 'high',
          notification: {
            title: notif.title || 'OBIN Announcement',
            body: notif.message || notif.desc || '',
            sound: 'default',
            android_channel_id: 'mobinx_high_importance_channel',
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          },
          data: {
            title: notif.title || 'OBIN Announcement',
            body: notif.message || notif.desc || '',
            message: notif.message || notif.desc || '',
            type: notif.type || 'general',
            targetUrl: notif.targetUrl || notif.actionUrl || '',
            actionUrl: notif.actionUrl || notif.targetUrl || '',
            id: notif.id || `notif_${Date.now()}`,
            broadcastId: notif.broadcastId || `bc_${Date.now()}`
          }
        };

        const promises = topics.map(topic => {
          return new Promise(resolve => {
            const dataStr = JSON.stringify({ ...fcmPayload, to: `/topics/${topic}` });
            const fcmReq = https.request('https://fcm.googleapis.com/fcm/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${serverKey}`,
                'Content-Length': Buffer.byteLength(dataStr)
              }
            }, (fcmRes) => {
              let fcmBody = '';
              fcmRes.on('data', d => { fcmBody += d; });
              fcmRes.on('end', () => {
                resolve({ topic, status: fcmRes.statusCode, body: fcmBody });
              });
            });
            fcmReq.on('error', (err) => {
              resolve({ topic, error: err.message });
            });
            fcmReq.write(dataStr);
            fcmReq.end();
          });
        });

        Promise.all(promises).then(results => {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: true, results }));
        });
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  
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
