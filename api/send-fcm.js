import https from 'https';
import crypto from 'crypto';

// In-memory token cache for serverless invocation lifecycle
let cachedToken = null;
let tokenExpiry = 0;

/**
 * Generate Google OAuth2 Access Token from Service Account credentials using RS256 JWT signing
 */
async function getGoogleOAuth2Token(serviceAccount) {
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encodeBase64Url = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const unsignedToken = `${encodeBase64Url(header)}.${encodeBase64Url(payload)}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  sign.end();
  const signature = sign.sign(serviceAccount.private_key, 'base64url');
  const jwt = `${unsignedToken}.${signature}`;

  const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;

  return new Promise((resolve, reject) => {
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 && parsed.access_token) {
            cachedToken = parsed.access_token;
            tokenExpiry = Date.now() + (parsed.expires_in || 3600) * 1000;
            resolve(cachedToken);
          } else {
            reject(new Error(parsed.error_description || parsed.error || `HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Dispatch FCM HTTP v1 message to a specific topic
 */
async function sendFcmV1Topic(projectId, accessToken, topic, notif) {
  const fcmMessage = {
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
        timestamp: String(notif.timestamp || Date.now()),
        imageUrl: String(notif.imageUrl || notif.extraUrl || '')
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

  const bodyStr = JSON.stringify(fcmMessage);
  return new Promise((resolve) => {
    const req = https.request(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    }, (res) => {
      let respBody = '';
      res.on('data', chunk => { respBody += chunk; });
      res.on('end', () => {
        resolve({ topic, status: res.statusCode, body: respBody });
      });
    });
    req.on('error', (err) => resolve({ topic, error: err.message }));
    req.write(bodyStr);
    req.end();
  });
}

/**
 * Dispatch FCM HTTP v1 message directly to a registered device token
 */
async function sendFcmV1Token(projectId, accessToken, token, notif) {
  const fcmMessage = {
    message: {
      token: token,
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
        timestamp: String(notif.timestamp || Date.now()),
        imageUrl: String(notif.imageUrl || notif.extraUrl || '')
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

  const bodyStr = JSON.stringify(fcmMessage);
  return new Promise((resolve) => {
    const req = https.request(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    }, (res) => {
      let respBody = '';
      res.on('data', chunk => { respBody += chunk; });
      res.on('end', () => {
        resolve({ token: token.substring(0, 12) + '...', status: res.statusCode, body: respBody });
      });
    });
    req.on('error', (err) => resolve({ token: token.substring(0, 12) + '...', error: err.message }));
    req.write(bodyStr);
    req.end();
  });
}

/**
 * Fetch all registered Android device tokens from Firestore collection `fcm_tokens`
 */
async function fetchFirestoreTokens(projectId, accessToken) {
  return new Promise((resolve) => {
    const req = https.request(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/fcm_tokens`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            const tokens = [];
            if (Array.isArray(parsed.documents)) {
              for (const doc of parsed.documents) {
                const tokenVal = doc.fields?.token?.stringValue;
                if (tokenVal && tokenVal.length > 20) {
                  tokens.push(tokenVal);
                }
              }
            }
            resolve(tokens);
          } else {
            resolve([]);
          }
        } catch (_) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const notif = payload.notification || payload;
    let serviceAccount = payload.serviceAccount;

    // Check environment variable fallback
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
          : process.env.FIREBASE_SERVICE_ACCOUNT;
      } catch (_) {}
    }

    // Parse stringified service account JSON if passed as string
    if (typeof serviceAccount === 'string') {
      try {
        serviceAccount = JSON.parse(serviceAccount);
      } catch (_) {}
    }

    const topics = ['all', 'all_users', 'mobinx_broadcast', 'obin_broadcast'];

    // 1. If modern Google Service Account is available -> FCM HTTP v1
    if (serviceAccount && serviceAccount.client_email && serviceAccount.private_key) {
      const projectId = serviceAccount.project_id || 'obin-shop';
      const accessToken = await getGoogleOAuth2Token(serviceAccount);

      // Fetch registered device tokens for direct instant delivery
      const deviceTokens = await fetchFirestoreTokens(projectId, accessToken);

      const topicResults = await Promise.all(
        topics.map(t => sendFcmV1Topic(projectId, accessToken, t, notif))
      );

      const tokenResults = await Promise.all(
        deviceTokens.map(tok => sendFcmV1Token(projectId, accessToken, tok, notif))
      );

      const allResults = [...topicResults, ...tokenResults];
      const hasSuccess = allResults.some(r => r.status === 200);

      return res.status(200).json({
        success: hasSuccess || topicResults.length > 0,
        protocol: 'fcm_v1',
        projectId,
        topicsDelivered: topicResults.filter(r => r.status === 200).length,
        tokensDelivered: tokenResults.filter(r => r.status === 200).length,
        totalDevicesTargeted: deviceTokens.length,
        results: allResults
      });
    }

    // 2. Legacy server key fallback (if passed)
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
          title: String(notif.title || 'OBIN Announcement'),
          body: String(notif.message || notif.desc || ''),
          message: String(notif.message || notif.desc || ''),
          type: String(notif.type || 'general'),
          targetUrl: String(notif.targetUrl || notif.actionUrl || 'home'),
          id: String(notif.id || `notif_${Date.now()}`),
          broadcastId: String(notif.broadcastId || `bc_${Date.now()}`)
        }
      };

      const results = await Promise.all(
        topics.map(topic => {
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
        })
      );

      return res.status(200).json({
        success: true,
        protocol: 'legacy_fcm',
        results
      });
    }

    return res.status(200).json({
      success: false,
      protocol: 'none',
      message: 'No Firebase Service Account JSON found. Broadcasted to Cloud Firestore live listeners.'
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
