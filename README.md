# 🎮 Mobin X — Master Admin Control Console

Standalone Cloud-Connected SaaS Admin Dashboard for the Mobin X Gaming Ecosystem.

---

## ⚡ Key Features

- **🏆 Live Tournament Manager**: Schedule tournaments, manage player slots, inspect registered players (Name, Free Fire UID, Phone), and **Release Custom Room ID & Password live in real time**.
- **📥 APK Downloads Catalog**: Publish gaming tools, APK updates, YouTube gameplay tutorials, and dynamic action buttons (Direct APK Download, WhatsApp, Telegram VIP).
- **⚡ Flash Diamond Deals**: Update diamond packages, discounts, bonus amounts, and BDT pricing.
- **🖼️ Hero 16:9 Banners**: Add and manage promotional sliders with live previews.
- **📢 Real-Time Notice Ticker**: Push instant live announcement tickers to the top of the mobile app.
- **🌐 System URLs & Gateways**: Configure Diamond Top-Up portal URL, WhatsApp support number, Telegram channel, and YouTube link.
- **👥 Players & Wallets**: Manage player balances (+৳100 injection), roles (Admin/VIP/Member), and account status.
- **🔄 Real-Time Cloud Sync**: Connected to **Firebase Firestore** + instant cross-bus sync. Changes appear in the Mobin X App in milliseconds!

---

## 🚀 How to Run Locally

To test the Admin Website locally:

```bash
# In the admin-website folder:
node server.js
```

Then open in your browser:
- **Local PC**: [http://localhost:5174/](http://localhost:5174/)
- **Mobile Phone (same WiFi)**: [http://192.168.16.229:5174/](http://192.168.16.229:5174/)

---

## 🌐 Deploy to Vercel (Step-by-Step Guide)

You can push this standalone directory to **GitHub** and deploy on **Vercel** with zero configuration!

### Step 1: Create a GitHub Repository for Admin
1. Open terminal inside the `admin-website` folder:
   ```bash
   cd "c:\wabsite\anti 2\admin-website"
   git init
   git add .
   git commit -m "Initial commit of Mobin X Admin Website"
   ```
2. Create a new repository on [GitHub.com](https://github.com/new) (e.g. `mobinx-admin-console`).
3. Link and push your repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/mobinx-admin-console.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel in 1 Click
1. Go to [Vercel.com](https://vercel.com/) and click **"Add New..."** -> **"Project"**.
2. Select your newly created `mobinx-admin-console` repository.
3. Keep default settings (Framework Preset: **Other**, Root Directory: `./`).
4. Click **"Deploy"**!
5. In less than 15 seconds, your Admin Website will be live on a fast global URL like:
   `https://mobinx-admin-console.vercel.app`

---

## 🔑 Firebase Cloud Configuration

The Firebase configuration is located in:
`js/firebaseConfig.js`

You can update this file with your own Firebase project credentials at any time. The Firestore rules should allow reads and writes to collections:
- `tournaments`
- `downloads`
- `banners`
- `flashDeals`
- `config`
- `users`
