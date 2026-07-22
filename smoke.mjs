import { chromium } from 'playwright';

const base = 'http://localhost:5180';
const shots = 'C:\\Users\\Shoorba\\AppData\\Local\\Temp\\claude\\c--Users-Shoorba-Desktop-yousuf-ticktick\\b22182b5-4773-46f4-b06d-a846dae0302c\\scratchpad\\shots';
const fs = await import('node:fs');
fs.mkdirSync(shots, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

async function shot(name) {
	await page.screenshot({ path: `${shots}\\${name}.png` });
}

// 1. Redirect to login
await page.goto(base + '/');
await page.waitForSelector('text=Sign in');
await shot('01-login');

// 2. Wrong password
await page.fill('input[name=password]', 'wrongpass');
await page.click('button:has-text("Sign in")');
await page.waitForSelector('text=Incorrect password');
await shot('02-login-error');

// 3. Correct password
await page.fill('input[name=password]', 'admin123');
await page.click('button:has-text("Sign in")');
await page.waitForURL(base + '/');
await shot('03-after-login-desktop');

// 4. Create a list
await page.fill('input[name=name]', 'Work');
await page.click('button:has-text("Add")');
await page.waitForSelector('a:has-text("Work")');
await page.fill('input[name=name]', 'Personal');
await page.click('button:has-text("Add")');
await page.waitForSelector('a:has-text("Personal")');
await shot('04-two-lists');

// 5. Open Work list, add todos
await page.click('a:has-text("Work")');
await page.waitForSelector('input[name=title]');
await page.fill('input[name=title]', 'Write report');
await page.click('button:has-text("Add"):near(input[name=title])').catch(async () => {
	await page.press('input[name=title]', 'Enter');
});
await page.waitForSelector('text=Write report');
await page.fill('input[name=title]', 'Review PR');
await page.press('input[name=title]', 'Enter');
await page.waitForSelector('text=Review PR');
await shot('05-todos-in-work');

// 6. Complete a todo
await page.click('button[aria-label="Mark complete"] >> nth=0');
await page.waitForSelector('text=Completed');
await shot('06-completed-section');

// 7. Move a todo to Personal
await page.click('summary:has-text("Move to…") >> nth=0');
await page.click('button:has-text("Personal")');
await page.waitForTimeout(500);
await shot('07-after-move');

// 8. Verify it landed in Personal
await page.click('a:has-text("Personal")');
await page.waitForTimeout(300);
await shot('08-personal-list');

// 9. Mobile responsive check
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + '/');
await page.waitForTimeout(300);
await shot('09-mobile-list-picker');
await page.click('a:has-text("Work")');
await page.waitForTimeout(300);
await shot('10-mobile-detail');

console.log('ERRORS:', JSON.stringify(errors, null, 2));

await browser.close();
