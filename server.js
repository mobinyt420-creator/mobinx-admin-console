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

  // Handle FCM Push Broadcast Proxy (FCM HTTP v1 + Legacy fallback)
  if (reqPath === '/api/send-fcm' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const notif = payload.notification || payload;
        let serviceAccount = payload.serviceAccount;

        if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
              ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
              : process.env.FIREBASE_SERVICE_ACCOUNT;
          } catch (_) {}
        }
        if (typeof serviceAccount === 'string') {
          try { serviceAccount = JSON.parse(serviceAccount); } catch (_) {}
        }

        const topics = ['all', 'all_users', 'mobinx_broadcast', 'obin_broadcast'];

        // 1. Modern FCM HTTP v1 using Service Account JWT
        if (serviceAccount && serviceAccount.client_email && serviceAccount.private_key) {
          const crypto = await import('crypto');
          const projectId = serviceAccount.project_id || 'obin-shop';
          
          const now = Math.floor(Date.now() / 1000);
          const header = { alg: 'RS256', typ: 'JWT' };
          const jwtPayload = {
            iss: serviceAccount.client_email,
            scope: 'https://www.googleapis.com/auth/firebase.messaging',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3600,
            iat: now
          };
          const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
          const unsigned = `${b64(header)}.${b64(jwtPayload)}`;
          const sign = crypto.createSign('RSA-SHA256');
          sign.update(unsigned);
          sign.end();
          const sig = sign.sign(serviceAccount.private_key, 'base64url');
          const jwt = `${unsigned}.${sig}`;

          const tokenData = await new Promise((resolve, reject) => {
            const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;
            const reqOauth = https.request('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
              }
            }, (resOauth) => {
              let d = '';
              resOauth.on('data', c => { d += c; });
              resOauth.on('end', () => {
                try {
                  const p = JSON.parse(d);
                  if (resOauth.statusCode === 200 && p.access_token) resolve(p);
                  else reject(new Error(p.error_description || p.error || d));
                } catch(e) { reject(e); }
              });
            });
            reqOauth.on('error', reject);
            reqOauth.write(postData);
            reqOauth.end();
          });

          const accessToken = tokenData.access_token;
          const results = await Promise.all(topics.map(topic => {
            const fcmMsg = {
              message: {
                topic: topic,
                notification: {
                  title: notif.title || 'OBIN Official Alert',
                  body: notif.message || notif.desc || ''
                },
                data: {
                  title: String(notif.title || 'OBIN Official Alert'),
                  body: String(notif.message || notif.desc || ''),
                  message: String(notif.message || notif.desc || ''),
                  type: String(notif.type || 'general'),
                  targetUrl: String(notif.targetUrl || notif.actionUrl || 'home'),
                  actionUrl: String(notif.actionUrl || notif.targetUrl || 'home'),
                  id: String(notif.id || `notif_${Date.now()}`),
                  broadcastId: String(notif.broadcastId || `bc_${Date.now()}`),
                  timestamp: String(notif.timestamp || Date.now())
                },
                android: {
                  priority: 'HIGH',
                  notification: {
                    channel_id: 'mobinx_high_importance_channel',
                    notification_priority: 'PRIORITY_MAX',
                    default_sound: true,
                    default_vibrate_timings: true,
                    icon: 'ic_launcher',
                    color: '#0284C7',
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    visibility: 'PUBLIC'
                  }
                }
              }
            };
            const postStr = JSON.stringify(fcmMsg);
            return new Promise(resolve => {
              const reqMsg = https.request(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Length': Buffer.byteLength(postStr)
                }
              }, (resMsg) => {
                let rd = '';
                resMsg.on('data', c => { rd += c; });
                resMsg.on('end', () => { resolve({ topic, status: resMsg.statusCode, body: rd }); });
              });
              reqMsg.on('error', err => resolve({ topic, error: err.message }));
              reqMsg.write(postStr);
              reqMsg.end();
            });
          }));

          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: true, protocol: 'fcm_v1', results }));
          return;
        }

        // 2. Legacy Server Key fallback
        const serverKey = payload.serverKey || process.env.FCM_SERVER_KEY;
        if (serverKey) {
          const legacyPayload = {
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
              id: notif.id || `notif_${Date.now()}`,
              broadcastId: notif.broadcastId || `bc_${Date.now()}`
            }
          };

          const results = await Promise.all(topics.map(topic => {
            return new Promise(resolve => {
              const dataStr = JSON.stringify({ ...legacyPayload, to: `/topics/${topic}` });
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
              fcmReq.on('error', (err) => resolve({ topic, error: err.message }));
              fcmReq.write(dataStr);
              fcmReq.end();
            });
          }));

          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: true, protocol: 'legacy_fcm', results }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, protocol: 'none', message: 'No Service Account provided. Real-time Firestore sync active.' }));
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
