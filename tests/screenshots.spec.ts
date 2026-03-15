/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test';

// Extend base test to include blue-ring removal
export const test = base.extend({
    page: async ({ page }, use) => {
        // Add custom style to remove blue focus outline during screenshots
        await page.addInitScript(() => {
            const style = document.createElement('style');
            style.innerHTML = `
        *:focus, *:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
      `;
            document.head.appendChild(style);
        });
        await use(page);
    },
});

export { expect };

test('capture-home-screenshot', async ({ page }) => {
    await page.goto('/');
    // Wait for fonts/images
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'docs/screenshots/home.png', fullPage: true });
});
