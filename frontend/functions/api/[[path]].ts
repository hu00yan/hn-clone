// This is a simple proxy function for Cloudflare Pages
// In a production environment, you would either:
// 1. Use the same Hono.js API deployed to Cloudflare Workers
// 2. Move the Hono.js API code here to run on Cloudflare Pages Functions

export async function onRequest(context) {
  // For now, we'll return a simple response
  // In a real implementation, this would proxy to your API
  return new Response(
    JSON.stringify({ message: 'API proxy for Cloudflare Pages' }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}