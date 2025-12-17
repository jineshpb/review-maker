# Traefik Reverse Proxy Setup for Razorpay Webhooks

## 🎯 Overview

This guide helps you expose your localhost Next.js server through Traefik so Razorpay can send webhooks to your development environment.

## 📋 Prerequisites

- Traefik running on your home server
- Domain/subdomain pointing to your server
- SSL certificate configured (Let's Encrypt recommended)
- Next.js dev server running on localhost:3000

## 🔧 Traefik Configuration

### Option 1: Docker Compose Labels (Recommended)

If your Next.js app runs in Docker:

```yaml
version: "3.8"

services:
  nextjs-app:
    image: your-nextjs-image
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nextjs.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.nextjs.entrypoints=websecure"
      - "traefik.http.routers.nextjs.tls.certresolver=letsencrypt"
      - "traefik.http.services.nextjs.loadbalancer.server.port=3000"
      # Webhook endpoint (optional separate router)
      - "traefik.http.routers.webhook.rule=Host(`your-domain.com`) && PathPrefix(`/api/webhooks/razorpay`)"
      - "traefik.http.routers.webhook.entrypoints=websecure"
      - "traefik.http.routers.webhook.tls.certresolver=letsencrypt"
      - "traefik.http.services.webhook.loadbalancer.server.port=3000"
```

### Option 2: Traefik Dynamic Configuration File

Create or update `traefik.yml` or `dynamic.yml`:

```yaml
http:
  routers:
    # Main app router
    nextjs:
      rule: "Host(`your-domain.com`)"
      entryPoints:
        - websecure
      service: nextjs-service
      tls:
        certResolver: letsencrypt

    # Webhook router (optional - can use same as main)
    webhook:
      rule: "Host(`your-domain.com`) && PathPrefix(`/api/webhooks/razorpay`)"
      entryPoints:
        - websecure
      service: nextjs-service
      tls:
        certResolver: letsencrypt

  services:
    nextjs-service:
      loadBalancer:
        servers:
          - url: "http://localhost:3000" # Or your server IP: 10.0.0.9:3000
```

### Option 3: File Provider (Static Config)

If using file provider, create `nextjs.yml`:

```yaml
http:
  routers:
    nextjs:
      rule: "Host(`your-domain.com`)"
      entryPoints:
        - websecure
      service: nextjs-service
      tls:
        certResolver: letsencrypt

  services:
    nextjs-service:
      loadBalancer:
        servers:
          - url: "http://10.0.0.9:3000" # Your server IP
```

## 🌐 DNS Configuration

### 1. Point Domain to Your Server

In your DNS provider (Cloudflare, etc.):

```
Type: A
Name: your-domain.com (or webhook.your-domain.com)
Value: YOUR_PUBLIC_IP
Proxy: Enabled (if using Cloudflare)
```

### 2. Cloudflare Considerations

If using Cloudflare proxy:

- ✅ Webhooks will work through Cloudflare proxy
- ⚠️ Make sure Cloudflare SSL is set to "Full" or "Full (strict)"
- ⚠️ Traefik should handle SSL termination

## 🔐 SSL Certificate Setup

### Let's Encrypt with Traefik

In your Traefik configuration:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

Or DNS challenge (if using Cloudflare proxy):

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /letsencrypt/acme.json
      dnsChallenge:
        provider: cloudflare
        # Add Cloudflare API token/credentials
```

## 🚀 Step-by-Step Setup

### 1. Configure Traefik Router

Add router for your Next.js app:

```yaml
# In traefik.yml or docker-compose.yml
labels:
  - "traefik.http.routers.nextjs.rule=Host(`webhook.your-domain.com`)"
  - "traefik.http.routers.nextjs.entrypoints=websecure"
  - "traefik.http.routers.nextjs.tls.certresolver=letsencrypt"
  - "traefik.http.services.nextjs.loadbalancer.server.port=3000"
```

### 2. Start Next.js Dev Server

```bash
cd "screenshot app"
npm run dev
# Server runs on localhost:3000
```

### 3. Configure Traefik to Forward to Localhost

If Traefik is on same machine:

- Use `http://localhost:3000` or `http://127.0.0.1:3000`

If Traefik is on different machine:

- Use `http://10.0.0.9:3000` (your server IP)
- Make sure port 3000 is accessible from Traefik

### 4. Test Webhook URL

Test if webhook endpoint is accessible:

```bash
# From external machine or use curl
curl https://your-domain.com/api/webhooks/razorpay

# Should return 400 (missing signature) or 405 (method not allowed)
# This confirms endpoint is reachable
```

### 5. Configure Razorpay Webhook

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **Webhooks**
3. Click **Add New Webhook**
4. Enter URL: `https://your-domain.com/api/webhooks/razorpay`
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

## 🔍 Troubleshooting

### Webhook Not Receiving Events

1. **Check Traefik Logs:**

   ```bash
   docker logs traefik
   # or
   journalctl -u traefik -f
   ```

2. **Check Next.js Logs:**

   ```bash
   # In your Next.js terminal
   # Look for webhook requests
   ```

3. **Test Webhook Endpoint:**

   ```bash
   curl -X POST https://your-domain.com/api/webhooks/razorpay \
     -H "Content-Type: application/json" \
     -H "x-razorpay-signature: test" \
     -d '{"event":"test"}'
   ```

4. **Check Firewall:**
   - Ensure port 443 (HTTPS) is open
   - Ensure Traefik can reach localhost:3000

### SSL Certificate Issues

1. **Check Certificate Status:**

   ```bash
   # Check Traefik logs for ACME challenges
   docker logs traefik | grep acme
   ```

2. **Verify DNS:**

   ```bash
   dig your-domain.com
   # Should point to your server IP
   ```

3. **Test SSL:**
   ```bash
   curl -v https://your-domain.com
   # Check SSL certificate details
   ```

### Cloudflare Proxy Issues

If using Cloudflare:

- Make sure SSL mode is "Full" or "Full (strict)"
- Disable Cloudflare caching for `/api/webhooks/*` paths
- Add Page Rule:
  ```
  URL: *your-domain.com/api/webhooks/*
  Settings:
    - Cache Level: Bypass
    - SSL: Full
  ```

## 📝 Example Traefik Docker Compose

Complete example:

```yaml
version: "3.8"

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/traefik.yml:ro
      - ./letsencrypt:/letsencrypt
    command:
      - --api.insecure=true
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
      - --certificatesresolvers.letsencrypt.acme.email=your-email@example.com
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json

  nextjs-dev:
    # Your Next.js dev server
    # Or use file provider to point to localhost:3000
```

## ✅ Verification Checklist

- [ ] Traefik router configured for your domain
- [ ] SSL certificate issued (Let's Encrypt)
- [ ] DNS pointing to your server
- [ ] Next.js dev server running on port 3000
- [ ] Traefik can reach Next.js server (localhost or IP)
- [ ] Webhook endpoint accessible: `https://your-domain.com/api/webhooks/razorpay`
- [ ] Razorpay webhook configured with your URL
- [ ] `RAZORPAY_WEBHOOK_SECRET` added to `.env.local`
- [ ] Test webhook event received successfully

## 🔗 Useful Commands

```bash
# Check Traefik configuration
docker exec traefik traefik version

# View Traefik dashboard (if enabled)
# http://your-server-ip:8080

# Test webhook endpoint
curl -X POST https://your-domain.com/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: test" \
  -d '{"event":"test"}'

# Check Next.js logs
# Look in terminal where you ran `npm run dev`
```

## 📚 Additional Resources

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Traefik Docker Provider](https://doc.traefik.io/traefik/providers/docker/)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)
