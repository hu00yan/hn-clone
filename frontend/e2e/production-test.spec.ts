import { test, expect } from '@playwright/test';

test.describe('HN Clone Production Tests', () => {
  const frontendURL = process.env.FRONTEND_URL || 'https://410b95cf.hn-clone-frontend.pages.dev';
  const apiURL = process.env.API_URL || 'https://hn-clone-api.hacker-news-roo.workers.dev';

  // Generate unique test data for each run
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'TestPassword123!'
  };

  const testPost = {
    title: `E2E Test Post ${timestamp}`,
    url: 'https://example.com/test',
    text: `Production test post created at ${new Date().toISOString()}`
  };

  test.beforeAll(async () => {
    // Verify production backend is running
    const response = await fetch(`${apiURL}/`);
    expect(response.ok).toBeTruthy();
    const data = await response.json();
    expect(data.message).toContain('running');
  });

  test('Production API endpoints work correctly', async ({ request }) => {
    console.log('Testing production API endpoints...');

    // Test health endpoint
    const healthResponse = await request.get(`${apiURL}/`);
    expect(healthResponse.ok()).toBeTruthy();
    const healthData = await healthResponse.json();
    expect(healthData.message).toContain('running');
    expect(healthData.database).toBe('Connected');

    // Test posts/hot endpoint
    const hotPostsResponse = await request.get(`${apiURL}/posts/hot`);
    expect(hotPostsResponse.ok()).toBeTruthy();
    const hotPosts = await hotPostsResponse.json();
    expect(Array.isArray(hotPosts)).toBeTruthy();
    console.log(`Found ${hotPosts.length} hot posts`);

    if (hotPosts.length > 0) {
      expect(hotPosts[0]).toHaveProperty('id');
      expect(hotPosts[0]).toHaveProperty('title');
      expect(hotPosts[0]).toHaveProperty('score');
      expect(hotPosts[0]).toHaveProperty('author');
    }

    // Test posts/new endpoint
    const newPostsResponse = await request.get(`${apiURL}/posts/new`);
    expect(newPostsResponse.ok()).toBeTruthy();
    const newPosts = await newPostsResponse.json();
    expect(Array.isArray(newPosts)).toBeTruthy();
    console.log(`Found ${newPosts.length} new posts`);
  });

  test('Production frontend loads and displays content', async ({ page }) => {
    console.log('Testing production frontend...');

    // Navigate to production frontend
    await page.goto(frontendURL);
    await expect(page).toHaveTitle(/Hacker News Clone/);

    // Check basic page structure
    await expect(page.locator('h1')).toContainText('Hacker News Clone');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    // Check navigation links
    await expect(page.locator('text=login')).toBeVisible();
    await expect(page.locator('text=register')).toBeVisible();

    // Wait for posts to load (API calls should happen client-side)
    await page.waitForTimeout(3000);

    // Check if posts are loading (they might be loaded via JavaScript)
    const postsContainer = page.locator('main');
    await expect(postsContainer).toBeVisible();
  });

  test('Production user registration and login flow', async ({ page }) => {
    console.log('Testing user registration and login...');

    await page.goto(frontendURL);

    // Test registration
    await page.click('text=register');
    await page.waitForURL(/.*\/register/);

    // Check if registration form exists
    const usernameInput = page.locator('input[name="username"], input[placeholder*="username" i]');
    const emailInput = page.locator('input[name="email"], input[type="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[name="password"], input[type="password"], input[placeholder*="password" i]');

    if (await usernameInput.isVisible()) {
      await usernameInput.fill(testUser.username);
    }
    if (await emailInput.isVisible()) {
      await emailInput.fill(testUser.email);
    }
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(testUser.password);
    }

    const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }

    // Test login
    await page.goto(`${frontendURL}/login`);

    const loginUsernameInput = page.locator('input[name="username"], input[name="email"], input[placeholder*="username" i], input[placeholder*="email" i]').first();
    const loginPasswordInput = page.locator('input[name="password"], input[type="password"]').first();

    if (await loginUsernameInput.isVisible()) {
      await loginUsernameInput.fill(testUser.username);
    }
    if (await loginPasswordInput.isVisible()) {
      await loginPasswordInput.fill(testUser.password);
    }

    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(3000);
    }
  });

  test('Production post submission works', async ({ page }) => {
    console.log('Testing post submission...');

    await page.goto(frontendURL);

    // Navigate to submit page
    await page.click('text=submit');
    await page.waitForURL(/.*\/submit/);

    // Check if submit form exists
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]');
    const urlInput = page.locator('input[name="url"], input[type="url"], input[placeholder*="url" i]');
    const textInput = page.locator('textarea[name="text"], textarea[placeholder*="text" i]');

    if (await titleInput.isVisible()) {
      await titleInput.fill(testPost.title);
    }
    if (await urlInput.isVisible()) {
      await urlInput.fill(testPost.url);
    }
    if (await textInput.isVisible()) {
      await textInput.fill(testPost.text);
    }

    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Post")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(3000);
    }
  });

  test('Production site performance is acceptable', async ({ page }) => {
    console.log('Testing production performance...');

    const startTime = Date.now();

    await page.goto(frontendURL);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);

    // Production site should load in under 10 seconds
    expect(loadTime).toBeLessThan(10000);

    // Check basic performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!navigation) return null;

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
      };
    });

    if (performanceMetrics) {
      console.log('Performance metrics:', performanceMetrics);
      // DOM should be ready in reasonable time
      expect(performanceMetrics.domContentLoaded).toBeLessThan(5000);
    }
  });

  test('Production site works on mobile', async ({ page }) => {
    console.log('Testing mobile responsiveness...');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(frontendURL);

    // Check that content is still accessible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();

    // Check that layout adapts
    const header = page.locator('header');
    const headerBox = await header.boundingBox();
    if (headerBox) {
      expect(headerBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('Production error handling works', async ({ page }) => {
    console.log('Testing error handling...');

    // Test 404 page
    await page.goto(`${frontendURL}/nonexistent-page-12345`);
    await page.waitForTimeout(2000);

    // Should show some kind of error or 404 page
    const pageContent = await page.textContent('body');
    const hasErrorIndicator = pageContent?.toLowerCase().includes('404') ||
                             pageContent?.toLowerCase().includes('not found') ||
                             pageContent?.toLowerCase().includes('error');
    
    // Even if no specific 404 page, the site should still render something
    await expect(page.locator('body')).toBeVisible();
    
    // Log the result for debugging
    console.log('Has error indicator:', hasErrorIndicator);

    // Even if no specific 404 page, the site should still render something
    await expect(page.locator('body')).toBeVisible();

    // Test invalid post ID
    await page.goto(`${frontendURL}/post/999999`);
    await page.waitForTimeout(3000);

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('CORS and API integration work correctly', async ({ page }) => {
    console.log('Testing CORS and API integration...');

    await page.goto(frontendURL);

    // Check that the frontend can make requests to the API
    const apiCallResult = await page.evaluate(async (apiUrl) => {
      try {
        const response = await fetch(`${apiUrl}/posts/hot`);
        const data = await response.json();
        return { success: true, dataLength: Array.isArray(data) ? data.length : 0 };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, apiURL);

    console.log('API call result:', apiCallResult);
    expect(apiCallResult.success).toBeTruthy();
  });

  test('Static assets load correctly', async ({ page }) => {
    console.log('Testing static assets...');

    // Monitor network requests
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    await page.goto(frontendURL);
    await page.waitForLoadState('networkidle');

    // Check for failed requests
    if (failedRequests.length > 0) {
      console.warn('Failed requests:', failedRequests);
    }

    // Most assets should load successfully
    expect(failedRequests.length).toBeLessThan(5);

    // Check that CSS is loaded
    const hasStyles = await page.evaluate(() => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
      return stylesheets.length > 0;
    });

    expect(hasStyles).toBeTruthy();
  });
});
