# Hacker News Clone

A Hacker News clone built with:
- **Backend**: Hono.js + Cloudflare Workers + D1 (SQLite) + Drizzle ORM
- **Frontend**: Next.js 15+ App Router + TypeScript + Tailwind CSS

## Features

- User authentication (JWT-based)
- Posting news items
- Upvoting/downvoting posts
- Commenting on posts
- Homepage with sorted hot items
- Client-side data fetching for real-time updates
- Static export support for CDN deployment
- Comprehensive testing and deployment automation

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
│   ├── scripts/             # Deployment and testing scripts
│   │   ├── smoke-test.sh    # API connectivity verification
│   │   └── pre-deploy-check.sh # Comprehensive deployment checks
│   ├── functions/           # Cloudflare Pages functions
│   └── next.config.ts       # Next.js config
├── scripts/                 # Project-wide automation
│   └── demo-deployment.sh   # Deployment workflow demonstration
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

### Environment Configuration

The frontend requires environment configuration to connect to the backend:

```bash
# Create frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8787
```

**Why NEXT_PUBLIC_API_URL?**
- The `NEXT_PUBLIC_` prefix makes this variable available in the browser
- Client-side components fetch data dynamically to prevent build-time data bundling
- This enables real-time data and deployment flexibility across environments

## Pre-Deploy Testing

### Automated Testing Scripts

Before deploying, ensure everything works with our testing automation:

1. **Quick API Health Check**:
   ```bash
   # Test local backend
   cd frontend
   NEXT_PUBLIC_API_URL=http://localhost:8787 ./scripts/smoke-test.sh
   
   # Test production backend
   NEXT_PUBLIC_API_URL=https://your-api.example.com ./scripts/smoke-test.sh
   ```

2. **Comprehensive Pre-Deploy Checklist**:
   ```bash
   cd frontend
   ./scripts/pre-deploy-check.sh
   ```
   
   This script validates:
   - ✅ Backend dependencies and compilation
   - ✅ Backend API connectivity and responses
   - ✅ Frontend dependencies and TypeScript compilation
   - ✅ Environment configuration
   - ✅ Build processes (both SSR and static export)
   - ✅ Code quality and security checks

3. **Manual Testing Checklist**:
   - [ ] Backend running: `curl http://localhost:8787/posts/hot | jq length`
   - [ ] Frontend development: `cd frontend && pnpm dev`
   - [ ] Pages load correctly and display live data
   - [ ] Navigation between pages works
   - [ ] Static export works: `cd frontend && pnpm export`

### Static Export Support

The frontend supports static export for CDN deployment:

```bash
cd frontend
pnpm export  # Creates static files in ./out directory
npx serve out -l 3000  # Test the static build locally
```

**Static Export Features:**
- ✅ All static pages pre-rendered
- ✅ Dynamic routes (posts/[id]) support runtime data fetching
- ✅ Client-side routing and data fetching preserved
- ✅ Compatible with any CDN or static hosting provider

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
   
   **Option A: SSR Deployment**
   - Connect your Git repository to Cloudflare Pages
   - Set the build command to `pnpm --filter frontend build`
   - Set the build output directory to `frontend/.next`
   
   **Option B: Static Export Deployment**
   - Set the build command to `cd frontend && pnpm install && pnpm export`
   - Set the build output directory to `frontend/out`
   - Add environment variable: `NEXT_PUBLIC_API_URL=https://your-api.workers.dev`

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

### Automated Testing

1. **Backend Tests**:
   ```bash
   pnpm --filter backend test
   ```

2. **Frontend Tests**:
   ```bash
   pnpm --filter frontend test
   ```

3. **Integration Testing**:
   ```bash
   # Run pre-deploy checks (includes integration tests)
   cd frontend && ./scripts/pre-deploy-check.sh
   
   # Quick smoke test
   NEXT_PUBLIC_API_URL=http://localhost:8787 ./scripts/smoke-test.sh
   ```

4. **End-to-End Workflow Demo**:
   ```bash
   ./scripts/demo-deployment.sh
   ```

### Manual Testing Checklist

Before every deployment, verify:
- [ ] Backend is running and accessible
- [ ] Frontend connects to backend successfully
- [ ] All pages load and display data
- [ ] User interactions work (posting, voting, commenting)
- [ ] Build processes complete without errors
- [ ] Static export works (if using CDN deployment)

## Performance & Quality Metrics

### Automated Quality Assurance

Our deployment scripts enforce quality standards:
- **Build Success Rate**: 100% (builds must pass to deploy)
- **Type Safety**: Full TypeScript coverage with strict mode
- **Code Quality**: ESLint validation with zero warnings policy
- **API Health**: Automated endpoint testing before each deploy

### Performance Targets

- **API Response Time**: <100ms for 95% of requests
- **Page Load Time**: <2s for homepage (measured with Lighthouse)
- **Code Coverage**: >80% for both frontend and backend
- **Build Time**: <30s for frontend, <10s for backend

### Performance Monitoring

1. **Automated Performance Checks**:
   ```bash
   # Frontend build and performance validation
   cd frontend && pnpm build && pnpm export
   
   # Backend compilation and response time testing
   cd frontend && ./scripts/smoke-test.sh
   ```

2. **Manual Performance Testing**:
   ```bash
   # Lighthouse audit
   npx lighthouse http://localhost:3000
   
   # API performance testing
   curl -w "@curl-format.txt" -o /dev/null http://localhost:8787/posts/hot
   ```

3. **Production Monitoring**:
   - Cloudflare Workers Analytics
   - Real User Monitoring (RUM)
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

7. **Cloudflare Pages/Workers**: Provides a globally distributed, serverless deployment platform with excellent performance and a generous free tier.

## Quick Start Guide

### For Local Development
```bash
# 1. Clone and setup
git clone <repository-url>
cd hn-clone
pnpm install

# 2. Start backend
cd backend && wrangler dev src/index.ts &

# 3. Configure frontend
cd frontend
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8787

# 4. Start frontend  
pnpm dev

# 5. Run tests
./scripts/pre-deploy-check.sh
```

### For Production Deployment
```bash
# 1. Comprehensive pre-deploy validation
cd frontend && ./scripts/pre-deploy-check.sh

# 2. Deploy backend
cd backend && wrangler deploy --minify src/index.ts

# 3. Update frontend config for production
# Set NEXT_PUBLIC_API_URL to your production API

# 4. Deploy frontend (choose one):
cd frontend && pnpm export  # For static hosting
# OR
cd frontend && pnpm build  # For SSR hosting

# 5. Post-deploy verification
NEXT_PUBLIC_API_URL=https://your-api.example.com ./scripts/smoke-test.sh
```

## Documentation

- **Frontend Setup & Deployment**: [frontend/README.md](frontend/README.md)
- **API Documentation**: Explore endpoints in [backend/src/index.ts](backend/src/index.ts)
- **Database Schema**: [backend/src/db/schema.ts](backend/src/db/schema.ts)
- **Testing Scripts**: [frontend/scripts/](frontend/scripts/)

## Contributing

1. Follow the pre-deploy checklist before submitting PRs
2. Ensure all automated tests pass
3. Verify both SSR build and static export work
4. Test with local backend before deploying
5. Run `./scripts/demo-deployment.sh` to understand the workflow
