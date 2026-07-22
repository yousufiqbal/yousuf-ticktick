import { chromium } from 'playwright';
const base = 'http://localhost:5180';
const shots = '/c/Users/Shoorba/Desktop/yousuf-ticktick/shots3';
import fs from 'node:fs';
fs.mkdirSync(shots, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(base + '/login');
await page.fill('input[name=password]', 'admin123');
await page.click('button:has-text("Sign in")');
await page.waitForURL(base + '/');
await page.waitForTimeout(300);

// open first list with existing todos/completed
const links = await page.locator('nav a').allTextContents();
console.log('lists:', links);
await page.locator('nav a').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${shots}/detail.png` });

console.log('ERRORS:', JSON.stringify(errors));
await browser.close();
