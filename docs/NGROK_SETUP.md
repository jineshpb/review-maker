# Ngrok Setup for Razorpay Webhooks (Easiest Option!)

## 🎯 Why Ngrok?

- ✅ **No firewall configuration needed**
- ✅ **No port forwarding required**
- ✅ **Automatic HTTPS**
- ✅ **Works immediately**
- ✅ **Perfect for development**

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Ngrok

**Windows:**

1. Download from: https://ngrok.com/download
2. Extract `ngrok.exe` to a folder (e.g., `C:\ngrok\`)
3. Add to PATH (optional but recommended)

**Or use Chocolatey:**

```powershell
choco install ngrok
```

**Or use npm (global):**

```bash
npm install -g ngrok
```

### Step 2: Sign Up & Get Auth Token

1. Go to https://dashboard.ngrok.com/signup
2. Sign up (free account works!)
3. Copy your **authtoken** from dashboard
4. Authenticate:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Step 3: Start Next.js Dev Server

```bash
cd "screenshot app"
npm run dev
# Server runs on localhost:3000
```

### Step 4: Start Ngrok Tunnel

**In a new terminal:**

```bash
ngrok http 3000
```

You'll see output like:

```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### Step 5: Configure Razorpay Webhook

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **Webhooks**
3. Click **Add New Webhook**
4. Enter URL: `https://abc123.ngrok-free.app/api/webhooks/razorpay`
   (Replace `abc123.ngrok-free.app` with your ngrok URL)
5. Select events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.updated`
   - `subscription.cancelled`
   - `subscription.paused`
   - `subscription.resumed`
   - `payment.failed`
6. Copy **Webhook Secret** and add to `.env.local`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### Step 6: Test Webhook

```bash
# Test webhook endpoint
curl https://abc123.ngrok-free.app/api/webhooks/razorpay

# Should return 400 (missing signature) - this confirms it's working!
```

## 🔄 Ngrok URL Changes Every Time?

**Free Plan:** URL changes every time you restart ngrok
**Solution:** Use ngrok config file for static domain (paid) OR update Razorpay webhook URL each time

### Option 1: Update Razorpay Webhook Each Time (Free)

Just update the webhook URL in Razorpay dashboard when ngrok restarts.

### Option 2: Static Domain (Paid - $8/month)

1. Buy static domain from ngrok: https://dashboard.ngrok.com/domains
2. Use static domain:
   ```bash
   ngrok http 3000 --domain=your-static-domain.ngrok-free.app
   ```

## 📝 Daily Workflow

### Start Development Session:

1. **Terminal 1:** Start Next.js

   ```bash
   cd "screenshot app"
   npm run dev
   ```

2. **Terminal 2:** Start ngrok

   ```bash
   ngrok http 3000
   ```

3. **Copy ngrok URL** and update Razorpay webhook if needed

4. **Done!** Your webhook is accessible at `https://your-ngrok-url.ngrok-free.app/api/webhooks/razorpay`

## 🎨 Ngrok Dashboard (Optional)

1. Go to https://dashboard.ngrok.com
2. See all your tunnels
3. View request logs
4. Replay requests for testing

## 🔍 Testing Webhooks

### Test 1: Check Endpoint is Reachable

```bash
curl https://your-ngrok-url.ngrok-free.app/api/webhooks/razorpay
# Should return 400 (missing signature) - endpoint is working!
```

### Test 2: View Requests in Ngrok Dashboard

1. Go to https://dashboard.ngrok.com
2. Click on your tunnel
3. See all incoming requests
4. View request/response details

### Test 3: Test from Razorpay

1. In Razorpay Dashboard → Webhooks
2. Click on your webhook
3. Click **Send Test Event**
4. Check ngrok dashboard to see the request
5. Check your Next.js terminal for logs

## ⚙️ Advanced: Ngrok Config File

Create `ngrok.yml` in your home directory:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  nextjs:
    addr: 3000
    proto: http
    inspect: true # Enable web interface
```

Then run:

```bash
ngrok start nextjs
```

## 🆚 Ngrok vs Traefik

| Feature         | Ngrok         | Traefik     |
| --------------- | ------------- | ----------- |
| Setup Time      | 5 minutes     | 30+ minutes |
| Firewall Config | ❌ Not needed | ✅ Required |
| Port Forwarding | ❌ Not needed | ✅ Required |
| Static URL      | 💰 Paid       | ✅ Free     |
| Best For        | Development   | Production  |

## ✅ Advantages of Ngrok

- ✅ **Zero configuration** - works immediately
- ✅ **Automatic HTTPS** - no SSL setup needed
- ✅ **Request inspection** - see all webhook requests
- ✅ **No firewall changes** - perfect for development
- ✅ **Free tier available** - good for testing

## ⚠️ Limitations

- ⚠️ **Free plan:** URL changes on restart
- ⚠️ **Free plan:** Limited requests per month
- ⚠️ **Not for production** - use Traefik/real domain for production

## 🚀 Quick Start Script

Create `start-dev.bat` (Windows) or `start-dev.sh` (Linux/Mac):

**Windows (`start-dev.bat`):**

```batch
@echo off
echo Starting Next.js dev server...
start cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3
echo Starting ngrok tunnel...
start cmd /k "ngrok http 3000"
echo Done! Check ngrok output for your URL.
pause
```

**Linux/Mac (`start-dev.sh`):**

```bash
#!/bin/bash
echo "Starting Next.js dev server..."
npm run dev &
sleep 3
echo "Starting ngrok tunnel..."
ngrok http 3000
```

## 📚 Resources

- [Ngrok Documentation](https://ngrok.com/docs)
- [Ngrok Dashboard](https://dashboard.ngrok.com)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)

## 🎯 Summary

**For Development:** Use ngrok - it's the easiest!
**For Production:** Use Traefik with your domain

**Next Steps:**

1. ✅ Install ngrok
2. ✅ Get auth token
3. ✅ Start Next.js: `npm run dev`
4. ✅ Start ngrok: `ngrok http 3000`
5. ✅ Copy URL and configure Razorpay webhook
6. ✅ Done!
