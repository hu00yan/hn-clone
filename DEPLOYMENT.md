# Deployment Guide - Option 1: Cloudflare Workers + Cloudflare Pages

This guide will walk you through deploying the Hacker News clone using Cloudflare Workers for the backend API and Cloudflare Pages for the frontend.

## Prerequisites

1. Cloudflare account
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Logged into Wrangler (`wrangler login`)
4. pnpm installed

## Step 1: Deploy the Backend (Cloudflare Workers)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a D1 database:
   ```bash
   wrangler d1 create hn-clone-db
   ```
   Note the database ID from the output.

3. Update `wrangler.toml` with your database ID:
   ```toml
   database_id = "your-actual-database-id"
   ```

4. Generate database migrations:
   ```bash
   npx drizzle-kit generate:sqlite
   ```

5. Apply migrations to your D1 database:
   ```bash
   wrangler d1 migrations apply hn-clone-db
   ```

6. Deploy the worker:
   ```bash
   pnpm deploy
   ```
   Note the URL of your deployed worker.

## Step 2: Update Frontend API Configuration

1. Update the frontend API service to use your deployed worker URL in production:
   ```typescript
   // In frontend/src/services/api.ts
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-worker-url.your-subdomain.workers.dev' 
     : '/api';
   ```

## Step 3: Deploy the Frontend (Cloudflare Pages)

1. Push your code to a Git repository (GitHub, GitLab, etc.)

2. Connect your repository to Cloudflare Pages:
   - Go to the Cloudflare dashboard
   - Select your account
   - Go to Pages
   - Click "Create a project"
   - Connect to your Git provider
   - Select your repository

3. Configure the build settings:
   - Build command: `pnpm --filter frontend build`
   - Build output directory: `frontend/.next`
   - Root directory: `/`

4. Add environment variables (if needed):
   - No environment variables are required for the frontend

5. Deploy:
   - Click "Save and Deploy"
   - Wait for the deployment to complete

## Step 4: Update CORS Configuration (if needed)

If you experience CORS issues, update the CORS configuration in your backend `src/index.ts`:

```typescript
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://your-frontend-url.pages.dev'], // Add your frontend URL
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  })
);
```

Then redeploy the backend:
```bash
pnpm --filter backend deploy
```

## Monitoring and Maintenance

1. Monitor your Worker's performance in the Cloudflare dashboard
2. Check D1 database metrics
3. Review logs for any errors
4. Set up alerts for critical issues

## Updating the Application

To deploy updates:

1. Backend updates:
   ```bash
   cd backend
   pnpm deploy
   ```

2. Frontend updates:
   - Push changes to your Git repository
   - Cloudflare Pages will automatically deploy the new version