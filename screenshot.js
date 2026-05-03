const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const routes = [
  '/',
  '/about',
  '/auth',
  '/chat',
  '/dashboard',
  '/garage-profile',
  '/login',
  '/map',
  '/register',
  '/services'
];

async function takeScreenshots() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const route of routes) {
    const url = `http://localhost:3000${route}`;
    console.log(`Taking screenshot of ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Wait an extra 2 seconds for any animations or dynamic content
      await new Promise(r => setTimeout(r, 2000));
      
      const fileName = route === '/' ? 'home' : route.replace(/\//g, '_').substring(1);
      const filePath = path.join(screenshotsDir, `${fileName}.png`);
      
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved screenshot to ${filePath}`);
    } catch (e) {
      console.error(`Failed to take screenshot of ${url}:`, e.message);
    }
  }

  await browser.close();
}

takeScreenshots();
