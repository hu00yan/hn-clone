// This is a simple proxy function for Cloudflare Pages
// It proxies requests to the Hono.js API deployed to Cloudflare Workers

export async function onRequest({ request, env }: any) {
  // Get the URL path and query parameters
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', ''); // Remove /api prefix
  const queryString = url.search; // Preserve query parameters
  
  // Construct the target URL for the Hono.js API
  // In production, this should be your actual API URL
  const apiUrl = `https://hn-clone-api.hacker-news-roo.workers.dev${path}${queryString}`;
  
  // Create a new request with the target URL
  const apiRequest = new Request(apiUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow'
  });
  
  // Forward the request to the Hono.js API
  const response = await fetch(apiRequest);
  
  // Return the response from the Hono.js API
  return response;
}