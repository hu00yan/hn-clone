import { test, expect, Page } from "@playwright/test";

const BASE_URL = "http://localhost:3000";
const TEST_USER = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: "testpassword123"
};

test.describe("HN Clone Comprehensive Tests", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test("1. Homepage loads and displays posts", async () => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/Hacker News/);
    await expect(page.locator("nav")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/01-homepage.png", fullPage: true });
  });

  test("2. User registration", async () => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("networkidle");
    
    await page.fill("input[name=\\"username\\"]", TEST_USER.username);
    await page.fill("input[name=\\"email\\"]", TEST_USER.email);
    await page.fill("input[name=\\"password\\"]", TEST_USER.password);
    
    await page.click("button[type=\\"submit\\"]");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({ path: "e2e/screenshots/02-registration.png", fullPage: true });
  });

  test("3. User login", async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");
    
    await page.fill("input[name=\\"email\\"]", TEST_USER.email);
    await page.fill("input[name=\\"password\\"]", TEST_USER.password);
    
    await page.click("button[type=\\"submit\\"]");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("nav")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/03-login.png", fullPage: true });
  });

  test("4. Create new post", async () => {
    await page.goto(`${BASE_URL}/submit`);
    await page.waitForLoadState("networkidle");
    
    const testPost = {
      title: `Test Post ${Date.now()}`,
      url: "https://example.com",
      text: "This is a test post created by automated testing."
    };

    await page.fill("input[name=\\"title\\"]", testPost.title);
    await page.fill("input[name=\\"url\\"]", testPost.url);
    await page.fill("textarea[name=\\"text\\"]", testPost.text);
    
    await page.click("button[type=\\"submit\\"]");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({ path: "e2e/screenshots/04-post-creation.png", fullPage: true });
  });

  test("5. Vote on posts", async () => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    
    const upvoteButton = page.locator("button").filter({ hasText: /▲|↑|up/i }).first();
    if (await upvoteButton.isVisible()) {
      await upvoteButton.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: "e2e/screenshots/05-voting.png", fullPage: true });
  });

  test("6. Comment on post", async () => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    
    const firstPost = page.locator(".post, .story").first();
    await firstPost.click();
    await page.waitForLoadState("networkidle");
    
    const commentField = page.locator("textarea[name=\\"comment\\"], textarea[name=\\"text\\"]");
    if (await commentField.isVisible()) {
      await commentField.fill("Test comment from E2E test");
      await page.click("button").filter({ hasText: /comment|reply/i });
      await page.waitForLoadState("networkidle");
    }
    
    await page.screenshot({ path: "e2e/screenshots/06-commenting.png", fullPage: true });
  });

  test("7. User logout", async () => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    
    const logoutButton = page.locator("button").filter({ hasText: /logout|sign out/i }).first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForLoadState("networkidle");
    }
    
    await page.screenshot({ path: "e2e/screenshots/07-logout.png", fullPage: true });
  });

  test("8. Verify post appears after logout", async () => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    
    const postTitle = page.locator("text=" + `Test Post ${Date.now()}`);
    await expect(postTitle.first()).toBeVisible();
    
    await page.screenshot({ path: "e2e/screenshots/08-post-verification.png", fullPage: true });
  });

  test.afterAll(async () => {
    await page.close();
  });
});
