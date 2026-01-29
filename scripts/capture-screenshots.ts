#!/usr/bin/env node
/**
 * Puppeteer Screenshot Capture Script for Clips
 *
 * Captures all demo assets for marketing, documentation, and social media.
 * Assumes dev server is running at localhost:3000 and user is authenticated.
 *
 * Usage:
 *   npx ts-node scripts/capture-screenshots.ts
 *
 * Prerequisites:
 *   - Dev server running: npm run dev
 *   - Test user logged in
 *   - Valid test transaction hashes available
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  capturesDir: './captures',
  headless: true,
  waitTimeout: 10000,
  actionDelay: 200, // ms delay between actions
  testData: {
    buyHash: '5DAEm27ip97x3zjMjQg2KBU1EKZhESdnrsPVZLSUmjax6GVfphKEc2AiN9yA5nffBTojB4hZLJppcLxod5WwyShm',
    sellHash: '62rB35gdWsfrWvrLSHURYhNJnc9ARpZhyGN6xrVbXZpcaPWsRRTwQpRvKe7DdFhVgnrTkkf436dm6AqniWxBAQWN',
  },
  timeframe: '15m',
};

// Directory structure
const DIRS = {
  root: CONFIG.capturesDir,
  screenshots: path.join(CONFIG.capturesDir, 'screenshots'),
  recordings: path.join(CONFIG.capturesDir, 'recordings'),
  ogImages: path.join(CONFIG.capturesDir, 'og-images'),
};

/**
 * Initialize directories
 */
function ensureDirectories() {
  Object.values(DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
}

/**
 * Delay utility for action sequencing
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Set chart timeframe to 15m after chart loads
 */
async function setTimeframeTo15m(page: Page): Promise<void> {
  try {
    // Try common selector patterns for timeframe buttons
    const set = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent?.trim() === '15m');
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (set) {
      await delay(1000); // Wait for chart to update
      console.log('   → Timeframe set to 15m');
    }
  } catch {
    console.warn('   ⚠ Could not set timeframe to 15m');
  }
}

/**
 * Screenshot specification type
 */
interface ScreenshotSpec {
  name: string;
  filename: string;
  url: string;
  viewport: { width: number; height: number };
  waitFor?: string | string[];
  actions?: (page: Page) => Promise<void>;
  scroll?: boolean;
  scrollTarget?: string;
  fullPage?: boolean;
  description: string;
}

/**
 * All screenshots to capture
 */
const SCREENSHOTS: ScreenshotSpec[] = [
  // Landing page - hero
  {
    name: 'Landing Hero (Desktop)',
    filename: 'landing-hero-desktop.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    waitFor: ['h1', '[data-testid="hero-section"]'],
    description: 'Landing page hero section above the fold',
  },

  // Landing page - mobile hero
  {
    name: 'Landing Hero (Mobile)',
    filename: 'landing-hero-mobile.png',
    url: '/',
    viewport: { width: 375, height: 812 },
    waitFor: ['h1', '[data-testid="hero-section"]'],
    description: 'Landing page hero on mobile viewport',
  },

  // Landing page - how it works section
  {
    name: 'Landing How It Works',
    filename: 'landing-how-it-works.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="how-it-works-section"]',
    scrollTarget: '[data-testid="how-it-works-section"]',
    scroll: true,
    description: 'How It Works section with steps 1-6',
  },

  // Landing page - pricing
  {
    name: 'Landing Pricing',
    filename: 'landing-pricing.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="pricing-section"]',
    scrollTarget: '[data-testid="pricing-section"]',
    scroll: true,
    description: 'Pricing section showing free vs pro tiers',
  },

  // Landing page - FAQ
  {
    name: 'Landing FAQ',
    filename: 'landing-faq.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="faq-section"]',
    scrollTarget: '[data-testid="faq-section"]',
    scroll: true,
    description: 'FAQ section with closed accordions',
  },

  // Landing page - CTA
  {
    name: 'Landing CTA',
    filename: 'landing-cta.png',
    url: '/',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="cta-section"]',
    scrollTarget: '[data-testid="cta-section"]',
    scroll: true,
    description: 'Bottom CTA section before footer',
  },

  // Dashboard - empty state
  {
    name: 'Dashboard Empty',
    filename: 'dashboard-empty.png',
    url: '/dashboard',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="transaction-input"]',
    description: 'Dashboard empty state with input form',
  },

  // Dashboard - loading state
  {
    name: 'Dashboard Loading',
    filename: 'dashboard-loading.png',
    url: '/dashboard',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="transaction-input"]',
    actions: async (page) => {
      // Fill in hashes
      const entryInput = await page.$('[data-testid="entry-hash-input"]');
      const exitInput = await page.$('[data-testid="exit-hash-input"]');

      if (entryInput && exitInput) {
        await entryInput.type(CONFIG.testData.buyHash, { delay: 10 });
        await delay(CONFIG.actionDelay);
        await exitInput.type(CONFIG.testData.sellHash, { delay: 10 });
        await delay(CONFIG.actionDelay);

        // Click submit button
        const submitBtn = await page.$('[data-testid="fetch-button"]');
        if (submitBtn) {
          await submitBtn.click();
          // Take screenshot during loading state (before waitForSelector)
          await delay(300); // Give loading indicator time to appear
        }
      }
    },
    description: 'Dashboard with API call in progress (loading state)',
  },

  // Dashboard - chart loaded
  {
    name: 'Dashboard Chart Loaded (15m)',
    filename: 'dashboard-chart-loaded.png',
    url: '/dashboard',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="chart-container"]',
    actions: async (page) => {
      // Fill in hashes and wait for chart
      const entryInput = await page.$('[data-testid="entry-hash-input"]');
      const exitInput = await page.$('[data-testid="exit-hash-input"]');

      if (entryInput && exitInput) {
        await entryInput.type(CONFIG.testData.buyHash, { delay: 10 });
        await delay(CONFIG.actionDelay);
        await exitInput.type(CONFIG.testData.sellHash, { delay: 10 });
        await delay(CONFIG.actionDelay);

        const submitBtn = await page.$('[data-testid="fetch-button"]');
        if (submitBtn) {
          await submitBtn.click();
          // Wait for chart to load
          await page.waitForSelector('[data-testid="chart-container"]', {
            timeout: CONFIG.waitTimeout,
          });
          await delay(500); // Extra delay for chart rendering
          // Set timeframe to 15m as required
          await setTimeframeTo15m(page);
        }
      }
    },
    description: 'Chart fully loaded with entry and exit markers on 15m timeframe',
  },

  // Dashboard - token info
  {
    name: 'Dashboard Token Info',
    filename: 'dashboard-token-info.png',
    url: '/dashboard',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="token-info-card"]',
    actions: async (page) => {
      // Load chart first
      const entryInput = await page.$('[data-testid="entry-hash-input"]');
      if (entryInput) {
        await entryInput.type(CONFIG.testData.buyHash, { delay: 10 });
        const exitInput = await page.$('[data-testid="exit-hash-input"]');
        if (exitInput) {
          await exitInput.type(CONFIG.testData.sellHash, { delay: 10 });
          const submitBtn = await page.$('[data-testid="fetch-button"]');
          if (submitBtn) {
            await submitBtn.click();
            await page.waitForSelector('[data-testid="token-info-card"]', {
              timeout: CONFIG.waitTimeout,
            });
            await delay(500);
          }
        }
      }
    },
    description: 'Token information card showing name, symbol, address',
  },

  // Dashboard - trade info banner
  {
    name: 'Dashboard Trade Info',
    filename: 'dashboard-trade-info-summary.png',
    url: '/dashboard',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="trade-info-banner"]',
    actions: async (page) => {
      // Load chart with trade data
      const entryInput = await page.$('[data-testid="entry-hash-input"]');
      if (entryInput) {
        await entryInput.type(CONFIG.testData.buyHash, { delay: 10 });
        const exitInput = await page.$('[data-testid="exit-hash-input"]');
        if (exitInput) {
          await exitInput.type(CONFIG.testData.sellHash, { delay: 10 });
          const submitBtn = await page.$('[data-testid="fetch-button"]');
          if (submitBtn) {
            await submitBtn.click();
            await page.waitForSelector('[data-testid="trade-info-banner"]', {
              timeout: CONFIG.waitTimeout,
            });
            await delay(500);
          }
        }
      }
    },
    description: 'Trade info banner with entry/exit times and P&L',
  },

  // Dashboard - playback controls
  {
    name: 'Dashboard Playback Controls',
    filename: 'dashboard-playback-controls.png',
    url: '/dashboard',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="playback-controls"]',
    actions: async (page) => {
      // Load chart
      const entryInput = await page.$('[data-testid="entry-hash-input"]');
      if (entryInput) {
        await entryInput.type(CONFIG.testData.buyHash, { delay: 10 });
        const exitInput = await page.$('[data-testid="exit-hash-input"]');
        if (exitInput) {
          await exitInput.type(CONFIG.testData.sellHash, { delay: 10 });
          const submitBtn = await page.$('[data-testid="fetch-button"]');
          if (submitBtn) {
            await submitBtn.click();
            await page.waitForSelector('[data-testid="playback-controls"]', {
              timeout: CONFIG.waitTimeout,
            });
            await delay(500);
          }
        }
      }
    },
    description: 'Playback control buttons (play, speed, fullscreen)',
  },

  // Dashboard - fullscreen mode
  {
    name: 'Dashboard Fullscreen',
    filename: 'dashboard-fullscreen.png',
    url: '/dashboard',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="chart-container"]',
    actions: async (page) => {
      // Load chart
      const entryInput = await page.$('[data-testid="entry-hash-input"]');
      if (entryInput) {
        await entryInput.type(CONFIG.testData.buyHash, { delay: 10 });
        const exitInput = await page.$('[data-testid="exit-hash-input"]');
        if (exitInput) {
          await exitInput.type(CONFIG.testData.sellHash, { delay: 10 });
          const submitBtn = await page.$('[data-testid="fetch-button"]');
          if (submitBtn) {
            await submitBtn.click();
            await page.waitForSelector('[data-testid="chart-container"]', {
              timeout: CONFIG.waitTimeout,
            });
            await delay(500);

            // Click fullscreen button
            const fullscreenBtn = await page.$('[data-testid="fullscreen-button"]');
            if (fullscreenBtn) {
              await fullscreenBtn.click();
              await delay(300);
            }
          }
        }
      }
    },
    description: 'Chart in fullscreen/theater mode',
  },

  // Dashboard - speed selector
  {
    name: 'Dashboard Speed Selector',
    filename: 'dashboard-speed-selector.png',
    url: '/dashboard',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="speed-selector"]',
    actions: async (page) => {
      // Load chart
      const entryInput = await page.$('[data-testid="entry-hash-input"]');
      if (entryInput) {
        await entryInput.type(CONFIG.testData.buyHash, { delay: 10 });
        const exitInput = await page.$('[data-testid="exit-hash-input"]');
        if (exitInput) {
          await exitInput.type(CONFIG.testData.sellHash, { delay: 10 });
          const submitBtn = await page.$('[data-testid="fetch-button"]');
          if (submitBtn) {
            await submitBtn.click();
            await page.waitForSelector('[data-testid="speed-selector"]', {
              timeout: CONFIG.waitTimeout,
            });
            await delay(500);

            // Click speed selector to expand
            const speedSelector = await page.$('[data-testid="speed-selector"]');
            if (speedSelector) {
              await speedSelector.click();
              await delay(300);
            }
          }
        }
      }
    },
    description: 'Speed selector dropdown showing playback speed options',
  },

  // Dashboard - save trade modal
  {
    name: 'Dashboard Save Trade Modal',
    filename: 'dashboard-save-trade-modal.png',
    url: '/dashboard',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="save-trade-modal"]',
    actions: async (page) => {
      // Load chart
      const entryInput = await page.$('[data-testid="entry-hash-input"]');
      if (entryInput) {
        await entryInput.type(CONFIG.testData.buyHash, { delay: 10 });
        const exitInput = await page.$('[data-testid="exit-hash-input"]');
        if (exitInput) {
          await exitInput.type(CONFIG.testData.sellHash, { delay: 10 });
          const submitBtn = await page.$('[data-testid="fetch-button"]');
          if (submitBtn) {
            await submitBtn.click();
            await page.waitForSelector('[data-testid="trade-info-banner"]', {
              timeout: CONFIG.waitTimeout,
            });
            await delay(500);

            // Click save trade button
            const saveBtn = await page.$('[data-testid="save-trade-button"]');
            if (saveBtn) {
              await saveBtn.click();
              await page.waitForSelector('[data-testid="save-trade-modal"]', {
                timeout: CONFIG.waitTimeout,
              });
              await delay(300);
            }
          }
        }
      }
    },
    description: 'Save Trade modal dialog open and ready for input',
  },

  // Dashboard - tablet responsive
  {
    name: 'Dashboard Tablet',
    filename: 'dashboard-tablet.png',
    url: '/dashboard',
    viewport: { width: 768, height: 1024 },
    waitFor: '[data-testid="transaction-input"]',
    description: 'Dashboard on tablet viewport (768x1024)',
  },

  // Dashboard - mobile responsive
  {
    name: 'Dashboard Mobile',
    filename: 'dashboard-mobile.png',
    url: '/dashboard',
    viewport: { width: 375, height: 812 },
    waitFor: '[data-testid="transaction-input"]',
    description: 'Dashboard on mobile viewport (375x812)',
  },

  // Leaderboard
  {
    name: 'Leaderboard Page',
    filename: 'leaderboard-main.png',
    url: '/leaderboard',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="leaderboard-table"]',
    description: 'Public leaderboard with top trades ranked by P&L',
  },

  // My Trades
  {
    name: 'My Trades Page',
    filename: 'my-trades-page.png',
    url: '/trades',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="trades-list"]',
    description: 'User\'s saved trades list/dashboard',
  },
];

/**
 * Main capture function
 */
async function captureScreenshots() {
  let browser: Browser | null = null;

  try {
    console.log('🚀 Starting screenshot capture...\n');
    ensureDirectories();

    // Launch browser
    browser = await puppeteer.launch({
      headless: CONFIG.headless as boolean,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('✓ Browser launched\n');

    // Capture each screenshot
    for (const spec of SCREENSHOTS) {
      try {
        console.log(`📸 Capturing: ${spec.name}`);
        const page = await browser.newPage();

        // Set viewport
        await page.setViewport(spec.viewport);

        // Navigate to URL
        const fullUrl = `${CONFIG.baseUrl}${spec.url}`;
        console.log(`   → Navigating to ${fullUrl}`);

        try {
          await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        } catch (err) {
          console.warn(`   ⚠ Navigation timeout, proceeding anyway`);
        }

        // Wait for element to be ready
        if (spec.waitFor) {
          const selectors = Array.isArray(spec.waitFor) ? spec.waitFor : [spec.waitFor];
          for (const selector of selectors) {
            try {
              await page.waitForSelector(selector, { timeout: CONFIG.waitTimeout });
              break; // Success, exit loop
            } catch (e) {
              // Try next selector
            }
          }
        }

        // Perform custom actions
        if (spec.actions) {
          console.log(`   → Performing actions...`);
          try {
            await spec.actions(page);
          } catch (err) {
            console.warn(`   ⚠ Action failed: ${(err as Error).message}`);
          }
        }

        // Scroll if needed
        if (spec.scroll && spec.scrollTarget) {
          console.log(`   → Scrolling to target element...`);
          try {
            await page.evaluate((selector) => {
              const element = document.querySelector(selector);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, spec.scrollTarget);
            await delay(500); // Wait for scroll animation
          } catch (err) {
            console.warn(`   ⚠ Scroll failed: ${(err as Error).message}`);
          }
        }

        // Take screenshot
        const screenshotPath = path.join(DIRS.screenshots, spec.filename);
        await page.screenshot({
          path: screenshotPath,
          fullPage: spec.fullPage ?? false,
        });

        console.log(`   ✓ Saved to: ${screenshotPath}\n`);

        await page.close();
      } catch (err) {
        console.error(`   ✗ Failed: ${(err as Error).message}\n`);
      }
    }

    console.log('✅ Screenshot capture complete!');
    console.log(`📁 All screenshots saved to: ${DIRS.screenshots}\n`);
  } catch (err) {
    console.error('❌ Fatal error:', (err as Error).message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Alternative: Record screen video using Puppeteer
 * This is a placeholder for recording flows that need video capture
 */
async function recordingExample() {
  let browser: Browser | null = null;

  try {
    console.log('🎥 Starting video recording example...\n');

    browser = await puppeteer.launch({
      headless: CONFIG.headless as boolean,
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate and perform complete flow
    await page.goto(`${CONFIG.baseUrl}/dashboard`, { waitUntil: 'networkidle2' });
    console.log('✓ Dashboard loaded');

    // Example flow (user would implement full recording logic with actual recording library)
    await delay(1000);
    console.log('Note: Full video recording requires additional library (e.g., puppeteer-screen-recorder)');

    await page.close();
  } finally {
    if (browser) await browser.close();
  }
}

// Run if executed directly
if (require.main === module) {
  captureScreenshots().catch(console.error);
}

export { captureScreenshots, recordingExample, SCREENSHOTS, DIRS };
