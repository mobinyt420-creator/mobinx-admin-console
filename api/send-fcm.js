import crypto from 'crypto';
import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') { 
    return res.status(200).end(); 
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};
  const notif = payload.notification;
  const serviceAccount = payload.serviceAccount;

  if (!notif) {
    return res.status(400).json({ error: 'Missing notification payload' });
  }

  const topics = ['all', 'all_users', 'mobinx_broadcast', 'obin_broadcast'];

  try {
    if (serviceAccount && serviceAccount.client_email && serviceAccount.private_key) {
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

      return res.status(200).json({ success: true, protocol: 'fcm_v1', results });
    }
    
    return res.status(200).json({ success: false, protocol: 'none', message: 'No Service Account provided.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
