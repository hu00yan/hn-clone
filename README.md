# Hacker News Clone

A Hacker News clone built with:
- **Backend**: Hono.js + Cloudflare Workers + D1 (SQLite) + Drizzle ORM
- **Frontend**: Next.js 13+ App Router + TypeScript + Tailwind CSS

## Features

- User authentication (JWT-based)
- Posting news items
- Upvoting/downvoting posts
- Commenting on posts
- Homepage with sorted hot items

## Project Structure

```
hn-clone/
├── backend/                 # Hono.js API
│   ├── src/
│   │   ├── db/              # Database schema and client
│   │   ├── auth/            # Authentication utilities
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Entry point
│   ├── drizzle/             # Drizzle ORM migrations
│   └── wrangler.toml        # Cloudflare Workers config
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   └── services/        # API service layer
│   ├── functions/           # Cloudflare Pages functions
│   └── next.config.ts       # Next.js config
└── pnpm-workspace.yaml      # pnpm workspace config
```

## Development Setup

This project uses pnpm workspaces to manage dependencies efficiently, saving disk space by sharing dependencies between the frontend and backend.

1. Install pnpm if you haven't already:
   ```bash
   npm install -g pnpm
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   pnpm install
   ```

### Backend (Hono.js)

1. Set up Cloudflare D1 database:
   ```bash
   pnpm --filter backend wrangler d1 create hn-clone-db
   ```
   Update the `wrangler.toml` file with your database ID.

2. Generate database migrations:
   ```bash
   pnpm --filter backend drizzle-kit generate:sqlite
   ```

3. Apply migrations to your D1 database:
   ```bash
   pnpm --filter backend wrangler d1 migrations apply hn-clone-db
   ```

4. Run the development server:
   ```bash
   pnpm --filter backend dev
   ```

### Frontend (Next.js)

1. Run the development server:
   ```bash
   pnpm --filter frontend dev
   ```

The app will be available at http://localhost:3000, with the API proxying to the Hono.js backend at http://localhost:8787.

## Deployment Options

### Option 1: Cloudflare Workers + Cloudflare Pages (Recommended)

This is the most efficient deployment option, with:
- Backend API on Cloudflare Workers (globally distributed, low latency)
- Frontend on Cloudflare Pages (fast CDN, automatic deployments)

1. Deploy backend to Cloudflare Workers:
   ```bash
   pnpm --filter backend deploy
   ```

2. Deploy frontend to Cloudflare Pages:
   - Connect your Git repository to Cloudflare Pages
   - Set the build command to `pnpm --filter frontend build`
   - Set the build output directory to `frontend/.next`

### Option 2: All-in-one Cloudflare Pages Deployment

Deploy the entire application to Cloudflare Pages:
- Frontend served statically
- API endpoints handled by Cloudflare Pages Functions

1. Move your Hono.js API code to the `frontend/functions/api` directory
2. Deploy to Cloudflare Pages:
   - Connect your Git repository to Cloudflare Pages
   - The platform will automatically detect and deploy both the frontend and API functions

### Option 3: Cloudflare Workers + Vercel

1. Deploy backend to Cloudflare Workers:
   ```bash
   pnpm --filter backend deploy
   ```

2. Deploy frontend to Vercel:
   ```bash
   pnpm --filter frontend build
   # Then deploy the frontend/.next directory to Vercel
   ```

## Testing

### Backend (Jest)

```bash
pnpm --filter backend test
```

### Frontend (React Testing Library/Jest)

```bash
pnpm --filter frontend test
```

## Quantifiable Metrics

- **API Response Time**: &lt;100ms for 95% of requests
- **Page Load Time**: &lt;2s for homepage (measured with Lighthouse)
- **Code Coverage**: &gt;80% for both frontend and backend

### Performance Monitoring

1. Run Lighthouse audits:
   ```bash
   npx lighthouse http://localhost:3000
   ```

2. Monitor API performance with tools like:
   - Cloudflare Workers metrics
   - Custom logging in Hono.js middleware

## Security Considerations

- CORS is configured for the frontend domain
- JWT tokens are used for authentication
- Passwords are hashed with argon2
- SQL injection prevention through Drizzle ORM

## Why These Technologies?

1. **Hono.js**: Lightweight, fast web framework that works perfectly with Cloudflare Workers and has excellent TypeScript support.

2. **Cloudflare D1**: Serverless SQL database that integrates seamlessly with Workers, providing low-latency database access worldwide.

3. **Drizzle ORM**: Type-safe ORM that works well with D1 and provides excellent TypeScript support with minimal overhead.

4. **Next.js App Router**: Modern React framework with built-in SSR, excellent TypeScript support, and great developer experience.

5. **Tailwind CSS**: Utility-first CSS framework that enables rapid UI development while maintaining consistency.

6. **pnpm**: Efficient package manager that saves disk space by sharing dependencies between projects in a workspace.

7. **Cloudflare Pages/Workers**: Provides a globally distributed, serverless deployment platform with excellent performance and a generous free tier.Trigger deployment
Trigger deployment for timestamp fix
