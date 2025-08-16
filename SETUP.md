# Installation and Setup Guide

## Prerequisites

- Node.js (version 18 or higher)
- pnpm (version 8 or higher)
- Cloudflare account (for deployment)

## Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd hn-clone
   ```

2. Install pnpm if you haven't already:
   ```bash
   npm install -g pnpm
   ```

3. Install dependencies for both frontend and backend:
   ```bash
   pnpm install
   ```

## Database Setup

1. Create a Cloudflare D1 database:
   ```bash
   pnpm --filter backend wrangler d1 create hn-clone-db
   ```

2. Update the `backend/wrangler.toml` file with your database ID:
   ```toml
   [[ d1_databases ]]
   binding = "DB"
   database_name = "hn-clone-db"
   database_id = "your-actual-database-id"
   ```

3. Generate database migrations:
   ```bash
   pnpm --filter backend drizzle-kit generate:sqlite
   ```

4. Apply migrations to your D1 database:
   ```bash
   pnpm --filter backend wrangler d1 migrations apply hn-clone-db
   ```

## Development

### Running the Backend

1. Start the Hono.js development server:
   ```bash
   pnpm --filter backend dev
   ```
   The API will be available at http://localhost:8787

### Running the Frontend

1. Start the Next.js development server:
   ```bash
   pnpm --filter frontend dev
   ```
   The frontend will be available at http://localhost:3000

### Running Both Services

You can run both services simultaneously using the root script:
```bash
pnpm dev
```

## Testing

### Backend Tests

```bash
pnpm --filter backend test
```

### Frontend Tests

```bash
pnpm --filter frontend test
```

## Deployment

### Cloudflare Workers + Cloudflare Pages (Recommended)

1. Deploy the backend API:
   ```bash
   pnpm --filter backend deploy
   ```

2. Deploy the frontend:
   - Connect your Git repository to Cloudflare Pages
   - Set the build command to `pnpm --filter frontend build`
   - Set the build output directory to `frontend/.next`

### All-in-one Cloudflare Pages Deployment

1. Move your Hono.js API code to the `frontend/functions/api` directory
2. Deploy to Cloudflare Pages:
   - Connect your Git repository to Cloudflare Pages
   - The platform will automatically detect and deploy both the frontend and API functions

### Cloudflare Workers + Vercel

1. Deploy the backend API:
   ```bash
   pnpm --filter backend deploy
   ```

2. Deploy the frontend to Vercel:
   - Connect your Git repository to Vercel
   - Set the root directory to `/`
   - Set the build command to `pnpm --filter frontend build`
   - Set the output directory to `frontend/.next`

## Environment Variables

### Backend

Set these in your `backend/wrangler.toml` file:
```toml
[vars]
JWT_SECRET = "your-super-secret-jwt-key-change-in-production"
```

### Frontend

The frontend proxies API requests to the backend in development, so no additional configuration is needed for local development.