import { Page } from '@playwright/test';

/**
 * Navigate to page and wait for it to be ready
 * Uses networkidle to wait for all JS to load and execute
 */
export async function gotoAndWait(page: Page, url: string): Promise<void> {
  // Navigate and wait for network to be idle (all JS loaded)
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Wait for visible content in root (not just style tags)
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    if (!root) return false;
    // Check for visible elements (div, button, h1, etc. - not style tags)
    const visibleElements = root.querySelectorAll('div, button, h1, h2, h3, h4, p, span, a, main, section, article');
    return visibleElements.length > 0;
  }, { timeout: 10000 });
  
  // Additional delay for MSW to initialize
  await page.waitForTimeout(1000);
}
