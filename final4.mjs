import { chromium } from 'playwright';
const base = 'http://localhost:5180';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(base + '/login');
await page.fill('input[name=password]', 'admin123');
await page.click('button:has-text("Sign in")');
await page.waitForURL(base + '/', { timeout: 20000 });
await page.waitForTimeout(300);

const menuBtn = page.locator('button[aria-label="Open lists"]');
console.log('menu visible:', await menuBtn.isVisible());
await menuBtn.click();
await page.waitForTimeout(300);
console.log('drawer sidebar visible:', await page.locator('text=Lists').first().isVisible());
console.log('close btn visible:', await page.locator('button[aria-label="Close lists"]').isVisible());

await page.locator('nav a').first().click();
await page.waitForTimeout(400);
console.log('url after nav:', page.url());
console.log('menu icon back (drawer closed):', await page.locator('button[aria-label="Open lists"]').isVisible());

console.log('ERRORS:', JSON.stringify(errors));
await browser.close();
