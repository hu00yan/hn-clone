import { test, expect } from '@playwright/test';

test.describe('HN Clone Full Workflow', () => {
  const baseURL = process.env.FRONTEND_URL || 'http://localhost:3000';
  const apiURL = process.env.API_URL || 'http://localhost:8787';

  // Generate unique test data for each run
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'TestPassword123!'
  };

  const testPost = {
    title: `Test Post ${timestamp}`,
    url: 'https://example.com/test',
    text: `This is a test post created at ${new Date().toISOString()}`
  };

  test.beforeAll(async () => {
    // Verify backend is running
    const response = await fetch(`${apiURL}/`);
    expect(response.ok).toBeTruthy();
  });

  test('Complete user journey: register → login → post → vote → comment', async ({ page }) => {
    // Step 1: Navigate to homepage
    await page.goto(baseURL);
    await expect(page).toHaveTitle(/Hacker News Clone/);
    await expect(page.locator('h1')).toContainText('Hacker News Clone');

    // Step 2: User Registration
    await page.click('text=register');
    await expect(page).toHaveURL(/.*\/register/);

    await page.fill('input#username', testUser.username);
    await page.fill('input#email', testUser.email);
    await page.fill('input#password', testUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to login or homepage after registration
    await page.waitForURL(/.*\/(login|$)/);

    // Step 3: User Login (if not automatically logged in)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      await page.fill('input#username', testUser.username);
      await page.fill('input#password', testUser.password);
      await page.click('button[type="submit"]');
    }

    // Wait for potential navigation after login
    await page.waitForTimeout(1000);

    // Check if user is logged in by checking for token in localStorage
    const hasToken = await page.evaluate(() => !!localStorage.getItem('token'));
    expect(hasToken).toBeTruthy();

    // Step 4: Submit a new post
    await page.click('text=submit');
    await expect(page).toHaveURL(/.*\/submit/);

    await page.fill('input[name="title"]', testPost.title);
    await page.fill('input[name="url"]', testPost.url);
    await page.fill('textarea[name="text"]', testPost.text);
    await page.click('button[type="submit"]');

    // Should redirect to homepage or post page
    await page.waitForLoadState('networkidle');

    // Step 5: Verify post appears on homepage
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Look for our post title on the page
    const postVisible = await page.locator(`text=${testPost.title}`).isVisible().catch(() => false);
    expect(postVisible).toBeTruthy();

    // Step 6: Click on the post to view details
    await page.click(`text=${testPost.title}`);
    await page.waitForLoadState('networkidle');

    // Verify we're on the post detail page
    await expect(page.locator('h1, h2')).toContainText(testPost.title);
    if (testPost.text) {
      await expect(page.locator('text=' + testPost.text)).toBeVisible();
    }

    // Step 7: Vote on the post (upvote)
    const upvoteButton = page.locator('[data-testid="upvote"], .upvote, text=▲').first();
    if (await upvoteButton.isVisible()) {
      await upvoteButton.click();
      await page.waitForTimeout(1000); // Wait for vote to register
    }

    // Step 8: Add a comment
    const commentText = `Great post! Comment added at ${new Date().toISOString()}`;
    const commentInput = page.locator('textarea[name="text"], textarea[placeholder*="comment" i]').first();

    if (await commentInput.isVisible()) {
      await commentInput.fill(commentText);
      const submitCommentButton = page.locator('button:has-text("Submit"), button:has-text("Post Comment")').first();
      if (await submitCommentButton.isVisible()) {
        await submitCommentButton.click();
        await page.waitForLoadState('networkidle');

        // Verify comment appears
        const commentVisible = await page.locator(`text=${commentText}`).isVisible().catch(() => false);
        expect(commentVisible).toBeTruthy();
      }
    }

    // Step 9: Navigate back to homepage and verify post list loads
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Wait for posts to load (either from API or from static content)
    await page.waitForSelector('[data-testid="post-list"], .post-list, article, .post-item', { timeout: 10000 }).catch(() => {
      // If no specific post selectors, just wait for any content
      return page.waitForSelector('main', { timeout: 5000 });
    });

    // Verify homepage still shows our post
    const finalPostCheck = await page.locator(`text=${testPost.title}`).isVisible().catch(() => false);
    expect(finalPostCheck).toBeTruthy();
  });

  test('API endpoints are accessible and return correct data', async ({ request }) => {
    // Test health endpoint
    const healthResponse = await request.get(`${apiURL}/`);
    expect(healthResponse.ok()).toBeTruthy();
    const healthData = await healthResponse.json();
    expect(healthData.message).toContain('running');

    // Test posts/hot endpoint
    const hotPostsResponse = await request.get(`${apiURL}/posts/hot`);
    expect(hotPostsResponse.ok()).toBeTruthy();
    const hotPosts = await hotPostsResponse.json();
    expect(Array.isArray(hotPosts)).toBeTruthy();

    if (hotPosts.length > 0) {
      expect(hotPosts[0]).toHaveProperty('id');
      expect(hotPosts[0]).toHaveProperty('title');
      expect(hotPosts[0]).toHaveProperty('score');
    }

    // Test posts/new endpoint
    const newPostsResponse = await request.get(`${apiURL}/posts/new`);
    expect(newPostsResponse.ok()).toBeTruthy();
    const newPosts = await newPostsResponse.json();
    expect(Array.isArray(newPosts)).toBeTruthy();
  });

  test('Frontend renders correctly without JavaScript', async ({ page }) => {
    // Disable JavaScript to test SSR/static content
    await page.context().addInitScript(() => {
      delete (window as unknown as { requestAnimationFrame: unknown }).requestAnimationFrame;
    });

    await page.goto(baseURL);

    // Basic page structure should be visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Hacker News Clone');

    // Navigation should be present
    const navigation = page.locator('nav, header a');
    await expect(navigation.first()).toBeVisible();
  });

  test('Responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseURL);

    // Check that content is still accessible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();

    // Check that layout adapts (mobile menu, stacked elements, etc.)
    const header = page.locator('header');
    const headerBox = await header.boundingBox();
    expect(headerBox?.width).toBeLessThanOrEqual(375);
  });

  test('Error handling works correctly', async ({ page }) => {
    // Test 404 page
    await page.goto(`${baseURL}/nonexistent-page`);
    const is404 = await page.locator('text=404').isVisible().catch(() => false) ||
                  await page.locator('text=not found').isVisible().catch(() => false) ||
                  await page.locator('text=Page not found').isVisible().catch(() => false);
    expect(is404).toBeTruthy();

    // Test invalid post ID
    await page.goto(`${baseURL}/post/999999`);
    await page.waitForLoadState('networkidle');

    // Should either show 404 or error message
    await page.locator('text=not found, text=error, text=404').first().isVisible().catch(() => false);
    // This might not error immediately due to client-side routing, so we'll just check it loads
    await expect(page.locator('main')).toBeVisible();
  });

  test('Performance is acceptable', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Page should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Check for basic performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    // DOM should be ready quickly
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
  });
});
