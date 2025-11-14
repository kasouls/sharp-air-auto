const { chromium } = require("playwright");

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const LOGIN_URL = "https://cocoromembers.jp.sharp/sic-front/member/A050101ViewAction.do";
  console.log("Opening:", LOGIN_URL);

  await page.goto(LOGIN_URL, {
    waitUntil: "networkidle",
    timeout: 60000
  });

  console.log("Waiting for email field...");

  await page.waitForSelector('input#loginId', { timeout: 30000 });
  await page.fill('input#loginId', process.env.SHARP_EMAIL);

  console.log("Filling password...");
  await page.fill('input#password', process.env.SHARP_PW);

  console.log("Clicking login...");
  await page.click('#loginBtn');

  // 等待登录完成
  await page.waitForNavigation({
    waitUntil: "networkidle",
    timeout: 60000
  });

  console.log("Logged in. Navigating to device list...");

  await page.goto("https://cocoromembers.jp.sharp/cmc-front/air/airList", {
    waitUntil: "networkidle"
  });

  console.log("Waiting for device card...");

  await page.waitForSelector(".css-18t9a0r", { timeout: 30000 });

  const firstDevice = await page.$(".css-18t9a0r");
  if (!firstDevice) {
    console.log("❌ 没找到设备卡片！");
    await browser.close();
    return;
  }

  console.log("Opening device page...");
  await firstDevice.click();

  console.log("Waiting for power button...");
  await page.waitForSelector('div[role="button"]', { timeout: 30000 });

  console.log("Toggling power...");
  await page.click('div[role="button"]');

  console.log("✔ Done!");

  await browser.close();
})();
