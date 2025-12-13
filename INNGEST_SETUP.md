# Inngest Setup Guide

## 🎯 Overview

Inngest is used to orchestrate AI-powered review generation workflows. The system generates platform-specific reviews from user prompts and saves them to the database.

## 📋 Architecture

```
User enters prompt → API endpoint → Inngest Event
     ↓
Inngest Function 1: Generate platform-specific reviews (AI)
     ↓
Inngest Function 2: Save reviews to database
     ↓
Drafts updated in Supabase
```

## 🚀 Setup Steps

### 1. Install Dependencies

Already installed via `npm install inngest`

### 2. Create Inngest Account

1. Go to [https://www.inngest.com](https://www.inngest.com)
2. Sign up for free account
3. Create a new app
4. Copy your **App ID** and **Signing Key**

### 3. Environment Variables

Add to `.env.local`:

```env
# Inngest Configuration
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
INNGEST_APP_ID=your_app_id_here

# OpenAI API Key (for AI generation)
OPENAI_API_KEY=sk-your-openai-key-here
```

### 4. Run Inngest Dev Server (Local Development)

**For local development, use Inngest's dev server - no ngrok needed!**

1. **Start Inngest Dev Server** (in a separate terminal):

   ```bash
   npm run dev:inngest
   ```

   Or directly:

   ```bash
   npx inngest-cli@latest dev
   ```

2. **Start your Next.js app** (in another terminal):
   ```bash
   npm run dev
   ```

The Inngest dev server will:

- ✅ Automatically discover your functions at `http://localhost:3000/api/inngest`
- ✅ Provide local dashboard at `http://localhost:8288`
- ✅ Work completely offline - no external services needed
- ✅ No ngrok or tunneling required!

### 5. Production Deployment

**Only configure Inngest cloud for production:**

1. Go to [Inngest Dashboard](https://app.inngest.com) → Settings → Apps
2. Set **Serving URL** to: `https://your-production-domain.com/api/inngest`
3. Functions will automatically sync when deployed

## 🔧 How It Works

### Workflow Steps

1. **User triggers AI fill** (`ReviewEditor` component)

   - User enters business prompt
   - Clicks "AI Fill" button
   - Calls `/api/review/ai-generate`

2. **API endpoint** (`/api/review/ai-generate`)

   - Validates user authentication
   - Validates input (prompt, platforms)
   - Sends Inngest event: `review/ai.generate`

3. **Generate Reviews Function** (`generate-platform-reviews`)

   - Receives event with user prompt and platforms
   - For each platform:
     - Builds platform-specific AI prompt
     - Calls OpenAI API
     - Parses AI response
     - Maps to platform-specific review structure
   - Sends event: `review/ai.save`

4. **Save Reviews Function** (`save-reviews-to-database`)
   - Receives generated reviews
   - Creates/updates drafts in Supabase
   - One draft per platform
   - Returns success status

## 📝 API Usage

### Trigger AI Generation

```typescript
POST /api/review/ai-generate
Content-Type: application/json

{
  "userPrompt": "A cozy coffee shop in downtown Seattle, known for artisanal coffee and friendly staff",
  "platforms": ["google", "amazon", "trustpilot"],
  "draftId": "optional-existing-draft-id"
}
```

**Response:**

```json
{
  "success": true,
  "eventId": "event-123",
  "message": "AI review generation started"
}
```

## 🎨 UI Integration

The `ReviewEditor` component now includes:

- **AI Fill Input**: Text field for business prompt
- **AI Fill Button**: Triggers generation workflow
- **Loading State**: Shows "Generating..." while processing
- **Toast Notifications**: Success/error feedback

## 🔍 Monitoring

**Local Development:**

- Local dashboard: `http://localhost:8288`
- See function runs, logs, errors in real-time
- Debug workflow execution locally

**Production:**

- Inngest Dashboard: [https://app.inngest.com](https://app.inngest.com)
- See function runs, logs, errors
- Monitor production workflows

## 🐛 Troubleshooting

### Functions not triggering?

**Local Development:**

1. Make sure Inngest dev server is running (`npm run dev:inngest`)
2. Make sure Next.js dev server is running (`npm run dev`)
3. Check local Inngest dashboard: `http://localhost:8288`
4. Verify `/api/inngest` endpoint is accessible at `http://localhost:3000/api/inngest`

**Production:**

1. Check Inngest dashboard for errors
2. Verify serving URL is correct in Inngest dashboard
3. Check environment variables are set
4. Verify `/api/inngest` endpoint is accessible

### AI generation failing?

1. Check `OPENAI_API_KEY` is set
2. Verify API key has credits
3. Check OpenAI API status
4. Review function logs in Inngest dashboard

### Reviews not saving?

1. Check Supabase connection
2. Verify user authentication
3. Check database permissions
4. Review function logs

## 📚 Next Steps

- [ ] Add real-time updates (SSE/WebSocket) for generation progress
- [ ] Add retry logic for failed AI calls
- [ ] Add batch generation for multiple platforms
- [ ] Add review quality scoring
- [ ] Add user feedback mechanism

## 🔗 Resources

- [Inngest Docs](https://www.inngest.com/docs)
- [Inngest Next.js Guide](https://www.inngest.com/docs/quick-start/nextjs)
- [OpenAI API Docs](https://platform.openai.com/docs)
