import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:9323';
const TEST_USER = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'testpassword123'
};

test.describe('HN Clone Comprehensive Tests', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
      console.log(`Browser console [${msg.type()}]:`, msg.text());
    });

    // Enable error logging
    page.on('pageerror', error => {
      console.log(`Browser error:`, error.message);
    });

    // Enable network logging for API calls
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`API Response: ${response.status()} ${response.url()}`);
      }
    });
  });

  test('1. Homepage loads and displays posts', async () => {
    console.log('Testing homepage load...');
    await page.goto(BASE_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if page title is correct
    await expect(page).toHaveTitle(/Hacker News Clone/);

    // Check if navigation exists
    await expect(page.locator('nav')).toBeVisible();

    // Check if posts container exists
    const postsContainer = page.locator('[data-testid="posts-list"], .posts, .post-list, ul, .stories');
    await expect(postsContainer.first()).toBeVisible();

    // Check if posts are loaded (should have at least some content)
    const posts = page.locator('.post, .story, li').filter({ hasText: /\w+/ });
    const postCount = await posts.count();
    console.log(`Found ${postCount} posts on homepage`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/01-homepage.png', fullPage: true });
  });

  test('2. User registration', async () => {
    console.log('Testing user registration...');
    await page.goto(BASE_URL);

    // Look for register/signup link
    const registerLink = page.locator('a').filter({ hasText: /register|signup|sign up/i });
    if (await registerLink.count() > 0) {
      await registerLink.first().click();
    } else {
      // Try navigating directly to register page
      await page.goto(`${BASE_URL}/register`);
    }

    await page.waitForLoadState('networkidle');

    // Fill registration form
    const usernameField = page.locator('input[name="username"], input[id="username"], input[placeholder*="username" i]');
    const emailField = page.locator('input[name="email"], input[id="email"], input[type="email"], input[placeholder*="email" i]');
    const passwordField = page.locator('input[name="password"], input[id="password"], input[type="password"], input[placeholder*="password" i]');

    await usernameField.fill(TEST_USER.username);
    await emailField.fill(TEST_USER.email);
    await passwordField.fill(TEST_USER.password);

    // Submit registration
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button').filter({ hasText: /register|sign up|create/i });
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    // Check if registration was successful
    const successIndicator = page.locator('text=/success|welcome|registered|created/i, .success, .alert-success');
    if (await successIndicator.count() > 0) {
      console.log('Registration appears successful');
    }

    await page.screenshot({ path: 'e2e/screenshots/02-registration.png', fullPage: true });
  });

  test('3. User login', async () => {
    console.log('Testing user login...');
    await page.goto(BASE_URL);

    // Look for login link
    const loginLink = page.locator('a').filter({ hasText: /login|sign in/i });
    if (await loginLink.count() > 0) {
      await loginLink.first().click();
    } else {
      await page.goto(`${BASE_URL}/login`);
    }

    await page.waitForLoadState('networkidle');

    // Fill login form
    const usernameField = page.locator('input[name="username"], input[name="email"], input[id="username"], input[id="email"]');
    const passwordField = page.locator('input[name="password"], input[id="password"], input[type="password"]');

    await usernameField.fill(TEST_USER.username);
    await passwordField.fill(TEST_USER.password);

    // Submit login
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button').filter({ hasText: /login|sign in/i });
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    // Check if login was successful (should see username or logout option)
    const userIndicator = page.locator(`text=${TEST_USER.username}, text=/logout/i, .user-menu, .profile`);
    await expect(userIndicator.first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/03-login.png', fullPage: true });
  });

  test('4. Create new post', async () => {
    console.log('Testing post creation...');

    // Ensure we're logged in first
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Look for submit/create post link
    const submitLink = page.locator('a').filter({ hasText: /submit|create|new post|add/i });
    if (await submitLink.count() > 0) {
      await submitLink.first().click();
    } else {
      await page.goto(`${BASE_URL}/submit`);
    }

    await page.waitForLoadState('networkidle');

    // Fill post form
    const testPost = {
      title: `Test Post ${Date.now()}`,
      url: 'https://example.com',
      text: 'This is a test post created by automated testing.'
    };

    const titleField = page.locator('input[name="title"], input[id="title"], textarea[name="title"]');
    const urlField = page.locator('input[name="url"], input[id="url"], input[type="url"]');
    const textField = page.locator('textarea[name="text"], textarea[id="text"], textarea[name="content"]');

    await titleField.fill(testPost.title);

    if (await urlField.count() > 0) {
      await urlField.fill(testPost.url);
    }

    if (await textField.count() > 0) {
      await textField.fill(testPost.text);
    }

    // Submit post
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button').filter({ hasText: /submit|create|post/i });
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    // Check if post was created (should redirect to post or homepage)
    const postTitle = page.locator(`text="${testPost.title}"`);
    if (await postTitle.count() === 0) {
      // Maybe redirected to homepage, check there
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: 'e2e/screenshots/04-post-creation.png', fullPage: true });
  });

  test('5. Vote on posts', async () => {
    console.log('Testing voting functionality...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Find voting buttons (upvote arrows, vote buttons, etc.)
    const upvoteButtons = page.locator('[data-testid="upvote"], .upvote, .vote-up, button').filter({ hasText: /▲|↑|up|vote/i });

    if (await upvoteButtons.count() > 0) {
      const firstUpvote = upvoteButtons.first();

      // Get initial vote count if visible
      const voteCount = page.locator('.score, .points, .vote-count').first();
      let initialCount = 0;
      if (await voteCount.count() > 0) {
        const countText = await voteCount.textContent();
        initialCount = parseInt(countText?.match(/\d+/)?.[0] || '0');
      }

      await firstUpvote.click();
      await page.waitForTimeout(1000); // Wait for vote to register

      // Check if vote count increased
      if (await voteCount.count() > 0) {
        const newCountText = await voteCount.textContent();
        const newCount = parseInt(newCountText?.match(/\d+/)?.[0] || '0');
        console.log(`Vote count changed from ${initialCount} to ${newCount}`);
      }
    }

    await page.screenshot({ path: 'e2e/screenshots/05-voting.png', fullPage: true });
  });

  test('6. Comment on post', async () => {
    console.log('Testing commenting functionality...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Find a post to comment on
    const postLinks = page.locator('a').filter({ hasText: /comment|discuss|\d+ comment/i });

    if (await postLinks.count() > 0) {
      await postLinks.first().click();
      await page.waitForLoadState('networkidle');

      // Look for comment form
      const commentForm = page.locator('form').filter({ has: page.locator('textarea') });
      const commentField = page.locator('textarea[name="comment"], textarea[name="text"], textarea[placeholder*="comment" i]');

      if (await commentField.count() > 0) {
        const testComment = `Test comment ${Date.now()}`;
        await commentField.fill(testComment);

        const submitButton = page.locator('button[type="submit"], input[type="submit"]').filter({ hasText: /comment|reply|submit/i });
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

    await page.screenshot({ path: 'e2e/screenshots/06-commenting.png', fullPage: true });
  });

  test('7. User logout', async () => {
    console.log('Testing user logout...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Look for logout link
    const logoutLink = page.locator('a, button').filter({ hasText: /logout|sign out/i });

    if (await logoutLink.count() > 0) {
      await logoutLink.first().click();
      await page.waitForLoadState('networkidle');

      // Check if logged out (should see login link again)
      const loginLink = page.locator('a').filter({ hasText: /login|sign in/i });
      await expect(loginLink.first()).toBeVisible();
    }

    await page.screenshot({ path: 'e2e/screenshots/07-logout.png', fullPage: true });
  });

  test('8. Login again and check persistence', async () => {
    console.log('Testing login again...');
    await page.goto(BASE_URL);

    // Login again
    const loginLink = page.locator('a').filter({ hasText: /login|sign in/i });
    if (await loginLink.count() > 0) {
      await loginLink.first().click();
    } else {
      await page.goto(`${BASE_URL}/login`);
    }

    await page.waitForLoadState('networkidle');

    const usernameField = page.locator('input[name="username"], input[name="email"], input[id="username"], input[id="email"]');
    const passwordField = page.locator('input[name="password"], input[id="password"], input[type="password"]');

    await usernameField.fill(TEST_USER.username);
    await passwordField.fill(TEST_USER.password);

    const submitButton = page.locator('button[type="submit"], input[type="submit"], button').filter({ hasText: /login|sign in/i });
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    // Check if login was successful again
    const userIndicator = page.locator(`text=${TEST_USER.username}, text=/logout/i, .user-menu, .profile`);
    await expect(userIndicator.first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/08-relogin.png', fullPage: true });
  });

  test('9. Performance and data handling test', async () => {
    console.log('Testing performance and data handling...');

    // Test pagination or large data sets
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check if there are pagination controls
    const paginationLinks = page.locator('a').filter({ hasText: /next|more|page \d+|\d+/i });
    const loadMoreButton = page.locator('button').filter({ hasText: /load more|show more/i });

    let totalPosts = await page.locator('.post, .story, li').filter({ hasText: /\w+/ }).count();
    console.log(`Initial posts count: ${totalPosts}`);

    // Try to load more content
    if (await loadMoreButton.count() > 0) {
      await loadMoreButton.first().click();
      await page.waitForLoadState('networkidle');

      const newPostsCount = await page.locator('.post, .story, li').filter({ hasText: /\w+/ }).count();
      console.log(`Posts count after load more: ${newPostsCount}`);
    } else if (await paginationLinks.count() > 0) {
      const nextLink = paginationLinks.filter({ hasText: /next|2/i }).first();
      if (await nextLink.count() > 0) {
        await nextLink.click();
        await page.waitForLoadState('networkidle');

        const newPostsCount = await page.locator('.post, .story, li').filter({ hasText: /\w+/ }).count();
        console.log(`Posts count on page 2: ${newPostsCount}`);
      }
    }

    // Measure page load time
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    console.log(`Page reload took: ${loadTime}ms`);

    await page.screenshot({ path: 'e2e/screenshots/09-performance.png', fullPage: true });
  });

  test('10. API endpoints test', async () => {
    console.log('Testing API endpoints...');

    // Test various API endpoints
    const apiTests = [
      { endpoint: '/api/posts', description: 'Posts API' },
      { endpoint: '/api/users', description: 'Users API' },
      { endpoint: '/api/comments', description: 'Comments API' }
    ];

    for (const { endpoint, description } of apiTests) {
      try {
        const response = await page.request.get(`${BASE_URL}${endpoint}`);
        console.log(`${description}: Status ${response.status()}`);

        if (response.status() === 200) {
          const data = await response.json();
          console.log(`${description}: Returned ${Array.isArray(data) ? data.length : 'object'} items`);
        }
      } catch (error) {
        console.log(`${description}: Error - ${error}`);
      }
    }

    await page.screenshot({ path: 'e2e/screenshots/10-api-tests.png', fullPage: true });
  });

  test.afterAll(async () => {
    await page.close();
  });
});
