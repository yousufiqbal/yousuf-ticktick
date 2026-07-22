import { chromium } from 'playwright';
const base = 'http://localhost:5180';
const shots = '/c/c/Users/Shoorba/AppData/Local/Temp/claude/c--Users-Shoorba-Desktop-yousuf-ticktick/b22182b5-4773-46f4-b06d-a846dae0302c/scratchpad/shots2';
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
await page.screenshot({ path: `${shots}/01-sidebar.png` });

// hover a list row, check no shift (visual only, screenshot suffices)
const firstList = page.locator('nav a').first();
await firstList.hover();
await page.waitForTimeout(150);
await page.screenshot({ path: `${shots}/02-hover.png` });

// create a new list via header "+"
await page.click('button[title="New list"]');
await page.waitForSelector('text=New list');
await page.fill('input[name=name]', 'Groceries');
await page.click('button:has-text("Add")');
await page.waitForTimeout(300);
await page.screenshot({ path: `${shots}/03-new-list-modal-then-added.png` });

// open Groceries list
await page.click('a:has-text("Groceries")');
await page.waitForTimeout(300);
await page.screenshot({ path: `${shots}/04-list-detail-empty.png` });

// add todos - should appear instantly
await page.fill('input[name=title]', 'Buy milk');
await page.press('input[name=title]', 'Enter');
await page.waitForTimeout(100);
await page.screenshot({ path: `${shots}/05-instant-add.png` });
await page.fill('input[name=title]', 'Buy eggs');
await page.press('input[name=title]', 'Enter');
await page.waitForTimeout(600);
await page.screenshot({ path: `${shots}/06-two-todos.png` });

// toggle complete - should animate instantly
await page.click('button[aria-label="Mark complete"] >> nth=0');
await page.waitForTimeout(400);
await page.screenshot({ path: `${shots}/07-completed-instant.png` });

// delete a todo
await page.click('button[aria-label="Delete todo"] >> nth=0');
await page.waitForTimeout(400);
await page.screenshot({ path: `${shots}/08-after-delete.png` });

console.log('ERRORS:', JSON.stringify(errors, null, 2));
await browser.close();
